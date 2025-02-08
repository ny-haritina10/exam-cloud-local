package mg.itu.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

import mg.itu.model.AdminCredentials;
import mg.itu.model.Transaction;
import mg.itu.repository.AdminRepository;
import mg.itu.repository.TransactionRepository;
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AdminRepository adminRepository;

    @Autowired
    public TransactionService(TransactionRepository transactionRepository, AdminRepository adminRepository) {
        this.transactionRepository = transactionRepository;
        this.adminRepository = adminRepository;
    }

    public Transaction saveTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    public Transaction approveTransaction(Long transactionId, Long adminId) {
        // Check if admin exists
        AdminCredentials admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));

        Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (transaction.isApprovedByAdmin()) {
            throw new RuntimeException("Transaction already approved");
        }

        transaction.setApprovedByAdmin(true);
        transaction.setValidatedAt(LocalDateTime.now());

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}