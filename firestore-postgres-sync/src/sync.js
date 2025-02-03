
const { initializeApp } = require('firebase/app');
const { Timestamp,getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } = require('firebase/firestore');
const { Pool } = require('pg');
const firebaseConfig = require('./config/firebase.config');
const postgresConfig = require('./config/postgres.config');
const convertValue = require('./utils');

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialiser PostgreSQL
const pool = new Pool(postgresConfig);

// Variable pour éviter les boucles infinies
let isSyncingFromFirestore = false;
let isSyncingFromPostgres = false;


async function syncCollectionToPostgres(firestoreCollectionName, tableName, fields) {
  const firestoreCollection = collection(db, firestoreCollectionName);

  // Écouter les changements dans Firestore
  onSnapshot(firestoreCollection, async (snapshot) => {
    if (isSyncingFromPostgres) return;
    isSyncingFromFirestore = true;

    for (const change of snapshot.docChanges()) {
      const docId = change.doc.id;

      try {
        const docData = change.doc.data();
        const columnValues = fields.map(field => convertValue(docData[field])); // Conversion des données ici

        if (change.type === 'removed') {
          await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [docId]);
          console.log(`Document ${docId} supprimé de PostgreSQL`);
        } else {
          const columns = fields.join(', ');
          const values = columnValues.map((_, index) => `$${index + 2}`).join(', ');
          const query = `
            INSERT INTO ${tableName} (id, ${columns})
            VALUES ($1, ${values})
            ON CONFLICT (id) DO UPDATE
            SET ${fields.map(field => `${field} = EXCLUDED.${field}`).join(', ')}
          `;
          await pool.query(query, [docId, ...columnValues]);
          console.log(`Document ${docId} synchronisé avec PostgreSQL`);
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation Firestore -> PostgreSQL:', error);
      }
    }
    isSyncingFromFirestore = false;
  });
}

// Fonction pour écouter les changements dans PostgreSQL
async function listenToPostgresChanges() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE OR REPLACE FUNCTION notify_data_change()
      RETURNS trigger AS $$
      BEGIN
        IF TG_OP = 'DELETE' THEN
          PERFORM pg_notify('data_changes', json_build_object('operation', TG_OP, 'id', OLD.id)::text);
        ELSE
          PERFORM pg_notify('data_changes', json_build_object('operation', TG_OP, 'id', NEW.id, 'name', NEW.name, 'email', NEW.email)::text);
        END IF;
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS data_change_trigger ON firestore_data;
      
      CREATE TRIGGER data_change_trigger
      AFTER INSERT OR UPDATE OR DELETE ON firestore_data
      FOR EACH ROW EXECUTE FUNCTION notify_data_change();
    `);

    await client.query('LISTEN data_changes');

    client.on('notification', async (notification) => {
      if (isSyncingFromFirestore) return;
      isSyncingFromPostgres = true;

      const payload = JSON.parse(notification.payload);
      const docRef = doc(db, 'firebase_data', payload.id);

      try {
        if (payload.operation === 'DELETE') {
          await deleteDoc(docRef);
          console.log(`Document ${payload.id} supprimé de Firestore`);
        } else {
          await setDoc(docRef, {
            name: payload.name,
            email: payload.email
          });
          console.log(`Document ${payload.id} synchronisé avec Firestore`);
        }
      } catch (error) {
        console.error('Erreur lors de la synchronisation PostgreSQL -> Firestore:', error);
      }

      isSyncingFromPostgres = false;
    });

  } catch (error) {
    console.error('Erreur lors de la configuration des notifications PostgreSQL:', error);
    client.release();
  }
}

// Configuration des collections et tables à synchroniser
const collectionsAndTables = [
  { firestoreCollectionName: 'firebase_data', tableName: 'firestore_data', fields: ['name', 'email','created_at'] },
  { firestoreCollectionName: 'users', tableName: 'users', fields: ['name', 'email'] },
];

async function startSync() {
  try {
    collectionsAndTables.forEach(({ firestoreCollectionName, tableName, fields }) => {
      syncCollectionToPostgres(firestoreCollectionName, tableName, fields);
    });

    await listenToPostgresChanges();
    console.log('Synchronisation bidirectionnelle Firestore-PostgreSQL démarrée...');
  } catch (error) {
    console.error('Erreur lors du démarrage de la synchronisation:', error);
    process.exit(1);
  }
}

startSync();

console.log('Synchronisation bidirectionnelle Firestore-PostgreSQL démarrée...');