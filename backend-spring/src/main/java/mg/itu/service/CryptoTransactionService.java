package mg.itu.service;

import mg.itu.model.Crypto;
import mg.itu.model.CryptoTransaction;
import mg.itu.repository.CryptoTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CryptoTransactionService {

    @Autowired
    private CryptoTransactionRepository transactionRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;


    public CryptoTransaction saveTransaction(CryptoTransaction transaction) {
        return transactionRepository.save(transaction);
    }

    @SuppressWarnings("deprecation")
    public Double getUserSolde(Long userId) {
        String sql = "SELECT current_solde FROM v_user_current_solde WHERE user_id = ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{userId}, Double.class);
    }

    public List<Crypto> getUserCryptoHoldings(Long userId) {
        return transactionRepository.findUserHoldings(userId); 
    }

    public List<Long> getUsersWhoFavorited(Long cryptoId) {
        return jdbcTemplate.queryForList("SELECT id_user FROM favori WHERE id_crypto = ?", Long.class, cryptoId);
    }
}