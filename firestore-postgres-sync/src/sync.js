const { initializeApp } = require('firebase/app');
const { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } = require('firebase/firestore');
const { Pool } = require('pg');
const firebaseConfig = require('./config/firebase.config');
const postgresConfig = require('./config/postgres.config');

function convertValue(value) {
  if (value === undefined) return null;
  return value;
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const pool = new Pool(postgresConfig);

let isSyncingFromFirestore = false;
let isSyncingFromPostgres = false;

async function getPrimaryKeyColumn(tableName) {
  const primaryKeyQuery = `
    SELECT a.attname AS column_name
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    WHERE i.indrelid = $1::regclass AND i.indisprimary
  `;

  try {
    const result = await pool.query(primaryKeyQuery, [tableName]);
    return result.rows[0]?.column_name || 'id';
  } catch (error) {
    console.error(`Error getting primary key for ${tableName}:`, error);
    return 'id';
  }
}

async function syncCollectionToPostgres(firestoreCollectionName, tableName,fields)  {
  const primaryKeyColumn = await getPrimaryKeyColumn(tableName);
  const firestoreCollection = collection(db, firestoreCollectionName);

  onSnapshot(firestoreCollection, async (snapshot) => {
    if (isSyncingFromPostgres) return;
    isSyncingFromFirestore = true;

    for (const change of snapshot.docChanges()) {
      const docData = change.doc.data();
      const docId = docData[fields[0]];

      try {
        const columnValues = fields.map(field => convertValue(docData[field]));

        if (change.type === 'removed') {
          await pool.query(`DELETE FROM ${tableName} WHERE ${primaryKeyColumn} = $1`, [docId]);
          console.log(`Document ${docId} supprimé de PostgreSQL`);
        } else {
          const columns = fields.filter(field => field !== fields[0]).join(', ');
          const values = columnValues
            .filter((_, index) => fields[index] !== fields[0])
            .map((_, index) => `$${index + 2}`).join(', ');
          
          const query = `
            INSERT INTO ${tableName} (${primaryKeyColumn}, ${columns})
            VALUES ($1, ${values})
            ON CONFLICT (${primaryKeyColumn}) DO UPDATE
            SET ${fields
              .filter(field => field !== fields[0])
              .map(field => `${field} = EXCLUDED.${field}`).join(', ')}
          `;
          
          const filteredColumnValues = columnValues
            .filter((_, index) => fields[index] !== fields[0]);
          
          await pool.query(query, [docId, ...filteredColumnValues]);
          console.log(`Document ${docId} synchronisé avec PostgreSQL`);
        }
      } catch (error) {
        console.error(`Erreur lors de la synchronisation Firestore -> PostgreSQL (${tableName}):`, error);
      }
    }
    isSyncingFromFirestore = false;
  });
}

async function createNotificationFunction(client) {
  await client.query(`
    CREATE OR REPLACE FUNCTION notify_data_change()
    RETURNS TRIGGER AS $$
    DECLARE
      primary_key_name TEXT;
      primary_key_value TEXT;
    BEGIN
      EXECUTE format('
        SELECT a.attname 
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary
      ') USING TG_TABLE_NAME INTO primary_key_name;

      EXECUTE format('SELECT $1.%I::TEXT', primary_key_name)
      USING (CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END)
      INTO primary_key_value;

      IF TG_OP = 'DELETE' THEN
        PERFORM pg_notify('data_changes', 
          json_build_object(
            'operation', TG_OP, 
            'id', primary_key_value, 
            'table_name', TG_TABLE_NAME
          )::text
        );
      ELSE
        PERFORM pg_notify('data_changes', 
          json_build_object(
            'operation', TG_OP, 
            'id', primary_key_value, 
            'table_name', TG_TABLE_NAME, 
            'data', row_to_json(NEW)
          )::text
        );
      END IF;
      
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;
  `);
}

async function listenToPostgresChanges(collectionsAndTables) {
  const client = await pool.connect();
  try {
    await createNotificationFunction(client);

    for (const { tableName } of collectionsAndTables) {
      await client.query(`
        DROP TRIGGER IF EXISTS ${tableName}_change_trigger ON ${tableName};
        
        CREATE TRIGGER ${tableName}_change_trigger
        AFTER INSERT OR UPDATE OR DELETE ON ${tableName}
        FOR EACH ROW EXECUTE FUNCTION notify_data_change();
      `);
    }

    await client.query('LISTEN data_changes');

    client.on('notification', async (notification) => {
      if (isSyncingFromFirestore) return;
      isSyncingFromPostgres = true;

      const payload = JSON.parse(notification.payload);
      const matchingCollection = collectionsAndTables.find(
        collection => collection.tableName === payload.table_name
      );

      if (!matchingCollection) {
        console.error(`No matching collection found for table: ${payload.table_name}`);
        isSyncingFromPostgres = false;
        return;
      }

      const docRef = doc(db, matchingCollection.firestoreCollectionName, payload.id);

      try {
        if (payload.operation === 'DELETE') {
          await deleteDoc(docRef);
          console.log(`Document ${payload.id} supprimé de Firestore`);
        } else {
          const dataToSync = payload.data;
          const syncData = Object.fromEntries(
            Object.entries(dataToSync).filter(([key]) => 
              matchingCollection.fields.includes(key) && 
              key !== matchingCollection.fields[0]
            )
          );

          syncData[matchingCollection.fields[0]] = payload.id;

          await setDoc(docRef, syncData);
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

const collectionsAndTables = [
  { firestoreCollectionName: 'users', tableName: 'users', fields: ['id',
    'user_name', 'user_email', 'user_password', 'user_birthday',
    'token_last_used_at', 'token_expires_at', 'token',
    'email_verification_code', 'verification_code_expires_at',
    'email_verified_at', 'login_attempts', 'last_login_attempt_at',
    'reset_attempts_token', 'reset_attempts_token_expires_at',
    'verification_attempts', 'last_verification_attempt_at',
    'reset_verification_attempts_token', 'reset_verification_attempts_token_expires_at', 'role'
  ]},
  { firestoreCollectionName: 'admin_credentials', tableName: 'admin_credentials', fields: ['id','admin_email', 'admin_password', 'token', 'token_expires_at', 'token_last_used_at'] },
  { firestoreCollectionName: 'commission', tableName: 'commission', fields: ['id','percentage_sell', 'percentage_buy', 'date_reference'] },
  { firestoreCollectionName: 'crypto', tableName: 'crypto', fields: ['id','label'] },
  { firestoreCollectionName: 'transactions', tableName: 'transactions', fields: ['id','date_transaction', 'deposit', 'id_user', 'withdrawal', 'validated_at', 'approved_by_admin'] },
  { firestoreCollectionName: 'crypto_cours', tableName: 'crypto_cours', fields: ['id','id_crypto', 'cours', 'date_cours'] },
  { firestoreCollectionName: 'crypto_transactions', tableName: 'crypto_transactions', fields: ['id','id_user', 'id_crypto', 'is_sale', 'is_purchase', 'quantity', 'date_transaction'] }
];

async function startSync() {
  try {
    collectionsAndTables.forEach(({ firestoreCollectionName, tableName,fields }) => {
      syncCollectionToPostgres(firestoreCollectionName, tableName,fields);
    });

    await listenToPostgresChanges(collectionsAndTables);
    console.log('Synchronisation bidirectionnelle Firestore-PostgreSQL démarrée...');
  } catch (error) {
    console.error('Erreur lors du démarrage de la synchronisation:', error);
    process.exit(1);
  }
}

startSync();