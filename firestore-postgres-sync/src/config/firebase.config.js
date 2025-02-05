const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-credentials.json');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = {
  apiKey: serviceAccount.private_key,
  authDomain: `${serviceAccount.project_id}.firebaseapp.com`,
  projectId: serviceAccount.project_id,
  appId: process.env.FIREBASE_APP_ID,
  messagingSenderId:process.env.FIREBASE_MESSAGING_SENDER_ID
};
