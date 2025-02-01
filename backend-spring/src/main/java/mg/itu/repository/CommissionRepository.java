package mg.itu.repository;

import mg.itu.model.Commission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommissionRepository extends JpaRepository<Commission, Long> {
}