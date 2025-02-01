package mg.itu.service;

import mg.itu.repository.UserTransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserTransactionService {

    private final UserTransactionRepository repository;

    public UserTransactionService(UserTransactionRepository repository) {
        this.repository = repository;
    }

    public List<Map<String, Object>> getUserTransactions(String dateMin, String dateMax) {
        return repository.getUserTransactionSummary(dateMin, dateMax);
    }
}