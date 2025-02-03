const admin = require('firebase-admin');
const serviceAccount = require('../../firebase-credentials.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = {
  apiKey: serviceAccount.private_key,
  authDomain: `${serviceAccount.project_id}.firebaseapp.com`,
  projectId: serviceAccount.project_id
};
