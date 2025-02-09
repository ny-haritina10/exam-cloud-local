package mg.itu.controller;

import mg.itu.request.FcmTokenRequest;
import mg.itu.service.CryptoTransactionService;
import mg.itu.service.UserTransactionService;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;


@RestController
@RequestMapping("/front-office/api/users")
@CrossOrigin(origins = "*")  
public class UserController {

    @Autowired
    private CryptoTransactionService transactionService;

    @Autowired
    private UserTransactionService userService;

    private final String cloudName = "dusy7wuv7";
    private final String cloudinaryAuth = "635563665527585:pc_ZWhMK3jRCGVvqBn-mQ8o_fvE";


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

    @SuppressWarnings({ "unchecked", "rawtypes" })
    @GetMapping("/{userId}/profile-image")
    public ResponseEntity<?> getUserProfileImage(@PathVariable String userId) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString(cloudinaryAuth.getBytes()));

            HttpEntity<String> entity = new HttpEntity<>(headers);
            String url = "https://api.cloudinary.com/v1_1/" + cloudName + "/resources/image";

            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                Map.class
            );

            List<Map<String, Object>> resources = (List<Map<String, Object>>) response.getBody().get("resources");
            
            // Filter and sort images for the specific user
            Optional<String> imageUrl = resources.stream()
                .filter(image -> {
                    String publicId = (String) image.get("public_id");
                    String fileNamePrefix = publicId.split("_")[0];
                    return fileNamePrefix.equals(userId);
                })
                .sorted((a, b) -> {
                    String dateB = (String) b.get("created_at");
                    String dateA = (String) a.get("created_at");
                    return dateB.compareTo(dateA);
                })
                .map(image -> (String) image.get("secure_url"))
                .findFirst();

            if (imageUrl.isPresent()) {
                Map<String, String> result = new HashMap<>();
                result.put("imageUrl", imageUrl.get());
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.ok(Collections.singletonMap("imageUrl", null));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}