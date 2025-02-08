const { initializeApp } = require('firebase/app');
const { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, getDocs, writeBatch } = require('firebase/firestore'); // Added writeBatch
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

async function syncCollectionToPostgres(firestoreCollectionName, tableName, syncConfig) {
  const primaryKeyColumn = await getPrimaryKeyColumn(tableName);
  const firestoreCollection = collection(db, firestoreCollectionName);

  onSnapshot(firestoreCollection, async (snapshot) => {
    if (isSyncingFromPostgres) return;
    isSyncingFromFirestore = true;

    for (const change of snapshot.docChanges()) {
      const docData = change.doc.data();
      const docId = docData[syncConfig.fields[0]];

      try {
        const columnValues = syncConfig.fields.map(field => convertValue(docData[field]));

        if (change.type === 'removed') {
          await pool.query(`DELETE FROM ${tableName} WHERE ${primaryKeyColumn} = $1`, [docId]);
          console.log(`Document ${docId} deleted from PostgreSQL`);
        } else if (change.type === 'added') {
          const columns = syncConfig.fields.join(', ');
          const values = columnValues.map((_, index) => `$${index + 1}`).join(', ');

          const query = `
            INSERT INTO ${tableName} (${columns})
            VALUES (${values})
            ON CONFLICT (${primaryKeyColumn}) DO UPDATE SET
            ${syncConfig.fields.filter(field => field !== primaryKeyColumn)
              .map((field, index) => `${field} = EXCLUDED.${field}`).join(', ')}
          `;

          await pool.query(query, columnValues);
          console.log(`Document ${docId} added to PostgreSQL`);
        } else if (change.type === 'modified') {
          const updateFields = syncConfig.fields
            .filter(field => field !== primaryKeyColumn)
            .map((field, index) => `${field} = $${index + 2}`)
            .join(', ');

          const query = `
            UPDATE ${tableName}
            SET ${updateFields}
            WHERE ${primaryKeyColumn} = $1
          `;

          await pool.query(query, [docId, ...columnValues.filter((_, index) => syncConfig.fields[index] !== primaryKeyColumn)]);
          console.log(`Document ${docId} updated in PostgreSQL`);
        }
      } catch (error) {
        console.error(`Error syncing Firestore -> PostgreSQL (${tableName}):`, error);
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

    for (const { tableName, syncConfig } of collectionsAndTables) {
      if (syncConfig.syncOperations.update || syncConfig.syncOperations.delete || syncConfig.syncOperations.insert) {
        await client.query(`
          DROP TRIGGER IF EXISTS ${tableName}_change_trigger ON ${tableName};
          
          CREATE TRIGGER ${tableName}_change_trigger
          AFTER INSERT OR UPDATE OR DELETE ON ${tableName}
          FOR EACH ROW EXECUTE FUNCTION notify_data_change();
        `);
      }
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
        isSyncingFromPostgres = false;
        return;
      }

      // Vérifier l'opération en fonction de la configuration
      const operation = payload.operation.toLowerCase();
      if (!matchingCollection.syncConfig.syncOperations[operation === 'insert' ? 'insert' : operation === 'update' ? 'update' : 'delete']) {
        console.log(`Operation ${operation} disabled for ${payload.table_name}, skipping sync to Firestore`);
        isSyncingFromPostgres = false;
        return;
      }

      const docRef = doc(db, matchingCollection.firestoreCollectionName, payload.id);

      try {
        if (payload.operation === 'DELETE') {
          await deleteDoc(docRef);
          console.log(`Document ${payload.id} deleted from Firestore`);
        } else {
          const dataToSync = payload.data;
          const syncData = Object.fromEntries(
            Object.entries(dataToSync).filter(([key]) => 
              matchingCollection.syncConfig.fields.includes(key)
            )
          );

          await setDoc(docRef, syncData);
          console.log(`Document ${payload.id} synced with Firestore (${payload.operation})`);
        }
      } catch (error) {
        console.error('Error syncing PostgreSQL -> Firestore:', error);
      }

      isSyncingFromPostgres = false;
    });

  } catch (error) {
    console.error('Error configuring PostgreSQL notifications:', error);
    client.release();
  }
}

const collectionsAndTables = [
  { 
    firestoreCollectionName: 'users', 
    tableName: 'users', 
    syncConfig: {
      fields: ['id', 'user_name', 'user_email', 'user_password', 'user_birthday',
        'token_last_used_at', 'token_expires_at', 'token',
        'email_verification_code', 'verification_code_expires_at',
        'email_verified_at', 'login_attempts', 'last_login_attempt_at',
        'reset_attempts_token', 'reset_attempts_token_expires_at',
        'verification_attempts', 'last_verification_attempt_at',
        'reset_verification_attempts_token', 'reset_verification_attempts_token_expires_at', 'role',
        'fcm_token'
      ],
      syncOperations: { insert: true, update: true, delete: true }
    }
  },
  { 
    firestoreCollectionName: 'admin_credentials', 
    tableName: 'admin_credentials', 
    syncConfig: {
      fields: ['id', 'admin_email', 'admin_password', 'token', 'token_expires_at', 'token_last_used_at'],
      syncOperations: { insert: true, update: true, delete: true }
    }
  },
  { 
    firestoreCollectionName: 'commission', 
    tableName: 'commission', 
    syncConfig: {
      fields: ['id', 'percentage_sell', 'percentage_buy', 'date_reference'],
      syncOperations: { insert: true, update: true, delete: true }
    }
  },
  { 
    firestoreCollectionName: 'crypto', 
    tableName: 'crypto', 
    syncConfig: {
      fields: ['id', 'label'],
      syncOperations: { insert: true, update: true, delete: true }
    }
  },
  { 
    firestoreCollectionName: 'transactions', 
    tableName: 'transactions', 
    syncConfig: {
      fields: ['id', 'date_transaction', 'deposit', 'id_user', 'withdrawal', 'validated_at', 'approved_by_admin', 'notification_sent', 'notification_seen'],
      syncOperations: { insert: true, update: true, delete: true }
    }
  },
  { 
    firestoreCollectionName: 'crypto_cours', 
    tableName: 'crypto_cours', 
    syncConfig: {
      fields: ['id', 'id_crypto', 'cours', 'date_cours'],
      syncOperations: { insert: true, update: true, delete: true }
    }
  },
  { 
    firestoreCollectionName: 'crypto_transactions', 
    tableName: 'crypto_transactions', 
    syncConfig: {
      fields: ['id', 'id_user', 'id_crypto', 'is_sale', 'is_purchase', 'quantity', 'date_transaction'],
      syncOperations: { insert: true, update: true, delete: true }
    }
  },
  { 
    firestoreCollectionName: 'favori', 
    tableName: 'favori', 
    syncConfig: {
      fields: ['id', 'id_user', 'id_crypto'],
      syncOperations: { insert: true, update: true, delete: true }
    }
  }
];

async function deleteFirestoreCollections() {
  try {
    for (const { firestoreCollectionName } of collectionsAndTables) {
      const collectionRef = collection(db, firestoreCollectionName);
      const snapshot = await getDocs(collectionRef);

      if (!snapshot.empty) {
        console.log(`Deleting Firestore collection: ${firestoreCollectionName}`);
        
        const batch = writeBatch(db); // Correct usage of writeBatch
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Firestore collection ${firestoreCollectionName} deleted.`);
      }
    }
  } catch (error) {
    console.error('Error deleting Firestore collections:', error);
  }
}

async function createFirestoreCollections() {
  try {
    await deleteFirestoreCollections();

    for (const { firestoreCollectionName } of collectionsAndTables) {
      const collectionRef = collection(db, firestoreCollectionName);
      console.log(`Creating Firestore collection: ${firestoreCollectionName}`);
      // Create the collection without adding a document
      await collectionRef; // This line is sufficient to create the collection without a document
      console.log(`Firestore collection ${firestoreCollectionName} created.`);
    }
  } catch (error) {
    console.error('Error creating Firestore collections:', error);
  }
}

async function startSync() {
  try {
    await createFirestoreCollections();

    collectionsAndTables.forEach(({ firestoreCollectionName, tableName, syncConfig }) => {
      syncCollectionToPostgres(firestoreCollectionName, tableName, syncConfig);
    });

    await listenToPostgresChanges(collectionsAndTables);
    console.log('Synchronization started with custom operation configuration...');
  } catch (error) {
    console.error('Error starting synchronization:', error);
    process.exit(1);
  }
}

startSync();