const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const firebaseConfig = require('./config/firebase.config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection structure definition
const collectionsAndTables = [
  {
    firestoreCollectionName: 'users',
    fields: [
      'id', 'user_name', 'user_email', 'user_password', 'user_birthday',
      'token_last_used_at', 'token_expires_at', 'token',
      'email_verification_code', 'verification_code_expires_at',
      'email_verified_at', 'login_attempts', 'last_login_attempt_at',
      'reset_attempts_token', 'reset_attempts_token_expires_at',
      'verification_attempts', 'last_verification_attempt_at',
      'reset_verification_attempts_token', 'reset_verification_attempts_token_expires_at', 'role'
    ]
  },
  {
    firestoreCollectionName: 'admin_credentials',
    fields: ['id', 'admin_email', 'admin_password', 'token', 'token_expires_at', 'token_last_used_at']
  },
  {
    firestoreCollectionName: 'commission',
    fields: ['id', 'percentage_sell', 'percentage_buy', 'date_reference']
  },
  {
    firestoreCollectionName: 'crypto',
    fields: ['id', 'label']
  },
  {
    firestoreCollectionName: 'transactions',
    fields: ['id', 'date_transaction', 'deposit', 'id_user', 'withdrawal', 'validated_at', 'approved_by_admin']
  },
  {
    firestoreCollectionName: 'crypto_cours',
    fields: ['id', 'id_crypto', 'cours', 'date_cours']
  },
  {
    firestoreCollectionName: 'crypto_transactions',
    fields: ['id', 'id_user', 'id_crypto', 'is_sale', 'is_purchase', 'quantity', 'date_transaction']
  }
];

// Function to create a sample document with all fields as strings
function createSampleDocument(fields) {
  const doc = {};
  fields.forEach(field => {
    switch (field) {
      case 'id':
        doc[field] = `doc-${Math.random().toString(36).substr(2, 9)}`;
        break;
      case 'user_name':
      case 'admin_email':
        doc[field] = 'user@example.com';
        break;
      case 'user_password':
      case 'admin_password':
        doc[field] = 'hashedPassword123';
        break;
      case 'user_birthday':
      case 'date_transaction':
      case 'date_reference':
      case 'date_cours':
        doc[field] = new Date().toISOString();
        break;
      case 'token':
        doc[field] = `token-${Math.random().toString(36).substr(2, 16)}`;
        break;
      case 'token_expires_at':
      case 'token_last_used_at':
      case 'verification_code_expires_at':
      case 'email_verified_at':
      case 'last_login_attempt_at':
      case 'last_verification_attempt_at':
      case 'validated_at':
        doc[field] = new Date().toISOString();
        break;
      case 'percentage_sell':
      case 'percentage_buy':
        doc[field] = (Math.random() * 10).toString();
        break;
      case 'login_attempts':
      case 'verification_attempts':
        doc[field] = '0';
        break;
      case 'deposit':
      case 'withdrawal':
      case 'cours':
      case 'quantity':
        doc[field] = Math.floor(Math.random() * 1000).toString();
        break;
      case 'is_sale':
      case 'is_purchase':
      case 'approved_by_admin':
        doc[field] = 'false';
        break;
      case 'label':
        doc[field] = 'BTC';
        break;
      case 'id_user':
      case 'id_crypto':
        doc[field] = `ref-${Math.random().toString(36).substr(2, 9)}`;
        break;
      case 'role':
        doc[field] = 'user';
        break;
      case 'email_verification_code':
        doc[field] = Math.floor(100000 + Math.random() * 900000).toString();
        break;
      case 'reset_attempts_token':
      case 'reset_verification_attempts_token':
        doc[field] = `reset-${Math.random().toString(36).substr(2, 16)}`;
        break;
      default:
        doc[field] = `sample-${field}-value`;
    }
  });
  return doc;
}

// Function to initialize collections with sample documents
async function initializeCollections() {
  try {
    for (const collectionConfig of collectionsAndTables) {
      const { firestoreCollectionName, fields } = collectionConfig;
      console.log(`Initializing collection: ${firestoreCollectionName}`);

      // Create a sample document in each collection
      const sampleDoc = createSampleDocument(fields);
      const docRef = doc(collection(db, firestoreCollectionName));
      await setDoc(docRef, sampleDoc);

      console.log(`Created sample document in ${firestoreCollectionName}`);
    }
    console.log('All collections initialized successfully');
  } catch (error) {
    console.error('Error initializing collections:', error);
    throw error;
  }
}

// Execute the initialization
initializeCollections()
  .then(() => {
    console.log('Initialization completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Initialization failed:', error);
    process.exit(1);
  });