package mg.itu.repository;

import mg.itu.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUserEmail(String email);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.fcmToken = :fcmToken WHERE u.id = :userId")
    int updateFcmToken(Long userId, String fcmToken);
}