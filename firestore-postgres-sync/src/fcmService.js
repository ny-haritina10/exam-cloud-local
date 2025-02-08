const admin = require('firebase-admin'); // Already initialized in firebase.config.js
const express = require('express');
const cors = require('cors');  // Import CORS
const pg = require('pg');

const postgresConfig = require('./config/postgres.config.js');
const firebaseConfig = require('./config/firebase.config'); // Assuming you still need this for other reasons

const { Pool } = pg;

// PostgreSQL connection
const pool = new Pool(postgresConfig);

// Function to send FCM notification
async function sendNotification(userId, title, body) {
  console.log('Starting sendNotification for userId:', userId);
  try {
    const result = await pool.query(
      'SELECT fcm_token FROM users WHERE id = $1',
      [userId]
    );
    console.log('Database query result:', result.rows);

    if (result.rows.length > 0 && result.rows[0].fcm_token) {
      const message = {
        notification: {
          title,
          body,
        },
        token: result.rows[0].fcm_token,
      };
      console.log('Preparing to send FCM message:', message);

      await admin.messaging().send(message);
      console.log('FCM message sent successfully');
    } else {
      console.log('No FCM token found for userId:', userId);
    }
  } catch (error) {
    console.error('Detailed error in sendNotification:', error);
    throw error;
  }
}

// Express server
const app = express();

// Enable CORS for frontend communication
app.use(cors({
  origin: 'http://localhost:5173', // Allow your Vue.js app
  methods: 'GET,POST',             // Allow specific methods
  credentials: true                // Allow cookies if needed
}));

app.use(express.json()); // Add middleware to parse JSON

// Notification endpoint
app.post('/notify', async (req, res) => {
  console.log('Received notification request:', req.body);
  const { userId } = req.body;
  try {
    // Log before sending
    console.log('Attempting to send notification for userId:', userId);
    await sendNotification(
      userId,
      'Transaction Validated',
      'Your transaction has been validated successfully!'
    );
    console.log('Notification processed successfully for userId:', userId);
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Detailed error in /notify endpoint:', error);
    res.status(500).json({ error: `Failed to send notification: ${error.message}` });
  }
});

// Start server
app.listen(3000, () => console.log('Server running on port 3000'));

// Listen for Firestore transaction updates
const db = admin.firestore(); // Use the initialized admin SDK for Firestore

db.collection('transactions').onSnapshot(async (snapshot) => {
  snapshot.docChanges().forEach(async (change) => {
    if (change.type === 'modified') {
      const transaction = change.doc.data();

      // If transaction was just validated
      if (transaction.validated_at && !transaction.notification_sent) {
        try {
          // Send notification to user
          await sendNotification(
            transaction.id_user,
            'Transaction Validated',
            `Your ${transaction.deposit > 0 ? 'deposit' : 'withdrawal'} of ${
              transaction.deposit || transaction.withdrawal
            }€ has been validated.` 
          );

          // Mark notification as sent in Firestore
          await change.doc.ref.update({ notification_sent: true });
        } catch (error) {
          console.error('Error processing transaction notification:', error);
        }
      }
    }
  });
});

module.exports = { sendNotification };