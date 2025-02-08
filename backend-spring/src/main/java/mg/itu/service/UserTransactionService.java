package mg.itu.service;

import mg.itu.model.User;
import mg.itu.repository.UserRepository;
import mg.itu.repository.UserTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class UserTransactionService {

    private final UserTransactionRepository repository;
    private final UserRepository userRepository;

    public UserTransactionService(UserTransactionRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getUserTransactions(String dateMin, String dateMax) {
        return repository.getUserTransactionSummary(dateMin, dateMax);
    }

    @Transactional
    public void updateFcmToken(Long userId, String fcmToken) {
        int updatedRows = userRepository.updateFcmToken(userId, fcmToken);

        if (updatedRows == 0) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
    }
}