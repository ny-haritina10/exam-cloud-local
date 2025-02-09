package mg.itu.controller;


import mg.itu.service.FirebaseService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")  
public class NotificationController {

    private final FirebaseService firebaseService;

    public NotificationController(FirebaseService firebaseService) {
        this.firebaseService = firebaseService;
    }

    @PostMapping("/send/{userId}")
    public String sendNotification(@PathVariable String userId) {
        try {
            String fcmToken = firebaseService.getUserFcmToken(userId);
            if (fcmToken == null) {
                return "User FCM token not found";
            }
            return firebaseService.sendNotification(fcmToken, "Test Title", "This is a test notification");
        } catch (Exception e) {
            return "Error sending notification: " + e.getMessage();
        }
    }
}