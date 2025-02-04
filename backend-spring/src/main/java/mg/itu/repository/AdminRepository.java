package mg.itu.repository;

import mg.itu.model.AdminCredentials;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<AdminCredentials, Long> {
}