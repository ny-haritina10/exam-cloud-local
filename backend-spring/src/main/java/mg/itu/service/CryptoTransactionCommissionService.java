package mg.itu.service;

import mg.itu.model.CryptoTransactionCommission;
import mg.itu.repository.CryptoTransactionCommissionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CryptoTransactionCommissionService {

    private final CryptoTransactionCommissionRepository repository;

    public CryptoTransactionCommissionService(CryptoTransactionCommissionRepository repository) {
        this.repository = repository;
    }

    public List<CryptoTransactionCommission> getAllCommissions() {
        return repository.findAll();
    }
}