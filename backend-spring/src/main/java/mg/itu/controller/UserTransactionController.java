package mg.itu.controller;

import mg.itu.service.UserTransactionService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")  
public class UserTransactionController {

    private final UserTransactionService service;

    public UserTransactionController(UserTransactionService service) {
        this.service = service;
    }

    @GetMapping("/api/transactions")
    public List<Map<String, Object>> getTransactions(
        @RequestParam String dateMin,
        @RequestParam String dateMax
    ) {
        return service.getUserTransactions(dateMin, dateMax);
    }
}
