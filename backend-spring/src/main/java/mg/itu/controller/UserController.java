package mg.itu.controller;

import mg.itu.request.FcmTokenRequest;
import mg.itu.service.CryptoTransactionService;
import mg.itu.service.UserTransactionService;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/front-office/api/users")
@CrossOrigin(origins = "*")  
public class UserController {

    @Autowired
    private CryptoTransactionService transactionService;

    @Autowired
    private UserTransactionService userService;

    @GetMapping("/{userId}/solde")
    public ResponseEntity<Map<String, Object>> getUserSolde(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Double solde = transactionService.getUserSolde(userId);
            response.put("status", "success");
            response.put("message", "User solde retrieved successfully.");
            response.put("solde", solde);
            return ResponseEntity.ok(response);
        } 
        
        catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Failed to retrieve user solde.");
            response.put("solde", null);
            return ResponseEntity.status(500).body(response);
        }
    }

    @PostMapping("/fcm-token")
    public ResponseEntity<?> updateFcmToken(@RequestBody FcmTokenRequest request) {
        userService.updateFcmToken(request.getUserId(), request.getFcmToken());
        return ResponseEntity.ok().build();
    }
}