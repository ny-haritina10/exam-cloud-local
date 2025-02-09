package mg.itu.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseService {

    @PostConstruct
    public void initializeFirebase() throws IOException {
        FileInputStream serviceAccount = new FileInputStream("firebase-credentials.json");

        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }

    public String getUserFcmToken(String userId) throws ExecutionException, InterruptedException {
        Firestore db = FirestoreClient.getFirestore();
        return db.collection("users").document(userId)
                .get()
                .get()
                .getString("fcm_token");
    }

    public String sendNotification(String fcmToken, String title, String body) 
        throws Exception 
    {
        try {
            Message message = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .build();
        
            System.out.println("Sending notification from Firebase Service to token: " + fcmToken);
        
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Firebase response: " + response); 
        
            return response;
        } 
        
        catch (Exception e) {
            System.err.println("Error sending notification: " + e.getMessage());
            return null;
        }
    }    
}
