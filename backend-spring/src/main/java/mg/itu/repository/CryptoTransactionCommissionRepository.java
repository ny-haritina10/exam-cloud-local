package mg.itu.repository;


import mg.itu.model.CryptoTransactionCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CryptoTransactionCommissionRepository extends JpaRepository<CryptoTransactionCommission, Long> 
{ }