package quizards.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import quizards.persistence.AppUserEntity;

public interface AppUserRepository extends JpaRepository<AppUserEntity, Long> {

    Optional<AppUserEntity> findByUsername(String username);

    boolean existsByUsername(String username);
}
