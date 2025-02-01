package mg.itu.repository;

import mg.itu.model.Crypto;
import mg.itu.model.CryptoTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CryptoTransactionRepository extends JpaRepository<CryptoTransaction, Long> 
{ 
    @Query(value = "SELECT c.id, c.label " +
               "FROM v_user_crypto_holdings v " +
               "JOIN crypto c ON v.crypto_label = c.label " +
               "WHERE v.user_id = :userId AND v.current_quantity > 0", 
       nativeQuery = true)
    List<Crypto> findUserHoldings(@Param("userId") Long userId);
}