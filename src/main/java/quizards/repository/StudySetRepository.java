package quizards.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import quizards.domain.Visibility;
import quizards.persistence.StudySetEntity;

public interface StudySetRepository extends JpaRepository<StudySetEntity, UUID> {

    @EntityGraph(attributePaths = {"owner", "flashcards"})
    List<StudySetEntity> findByVisibilityOrderByTitleAsc(Visibility visibility);

    @EntityGraph(attributePaths = {"owner", "flashcards"})
    List<StudySetEntity> findByOwnerIdOrderByTitleAsc(Long ownerId);

    @Override
    @EntityGraph(attributePaths = {"owner", "flashcards"})
    Optional<StudySetEntity> findById(UUID id);
}
