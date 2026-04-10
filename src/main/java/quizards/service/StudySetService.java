package quizards.service;

import quizards.domain.Visibility;
import quizards.exception.AccessDeniedException;
import quizards.model.Flashcard;
import quizards.model.StudySet;
import quizards.model.TextFlashcard;
import quizards.persistence.AppUserEntity;
import quizards.persistence.FlashcardEntity;
import quizards.persistence.StudySetEntity;
import quizards.repository.StudySetRepository;
import quizards.validation.InputValidator;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class StudySetService {

    private final StudySetRepository studySetRepository;
    private final InputValidator inputValidator;

    public StudySetService(StudySetRepository studySetRepository, InputValidator inputValidator) {
        this.studySetRepository = studySetRepository;
        this.inputValidator = inputValidator;
    }

    public List<StudySet> findPublicStudySets() {
        return studySetRepository.findByVisibilityOrderByTitleAsc(Visibility.PUBLIC).stream()
                .map(this::toModel)
                .toList();
    }

    public List<StudySet> findStudySetsForOwner(long ownerId) {
        return studySetRepository.findByOwnerIdOrderByTitleAsc(ownerId).stream()
                .map(this::toModel)
                .toList();
    }

    public Optional<StudySet> findById(UUID studySetId) {
        return studySetRepository.findById(studySetId).map(this::toModel);
    }

    public StudySet createStudySet(AppUserEntity owner, String title, String description, Visibility visibility) {
        inputValidator.requireNonBlank(title, "title");
        inputValidator.requireNonBlank(description, "description");

        StudySetEntity studySet = new StudySetEntity(title, description, visibility, owner);
        return toModel(studySetRepository.save(studySet));
    }

    public StudySet createStudySet(AppUserEntity owner, String title, String description, Visibility visibility, List<Flashcard> flashcards) {
        inputValidator.requireNonBlank(title, "title");
        inputValidator.requireNonBlank(description, "description");

        StudySetEntity studySet = new StudySetEntity(title, description, visibility, owner);
        flashcards.forEach(flashcard -> studySet.addFlashcard(new FlashcardEntity(
                flashcard.getPrompt(),
                flashcard.getAnswer(),
                flashcard.getType(),
                flashcard.getMasteryLevel(),
                flashcard.getNextReviewAt()
        )));
        return toModel(studySetRepository.save(studySet));
    }

    public StudySet createStudySetFromDraft(AppUserEntity owner, String title, String description, Visibility visibility, List<TextFlashcard> flashcards) {
        return createStudySet(owner, title, description, visibility, flashcards.stream()
                .map(Flashcard.class::cast)
                .collect(Collectors.toList()));
    }

    public StudySet getAccessibleStudySet(UUID studySetId, long userId) {
        StudySet studySet = findById(studySetId)
                .orElseThrow(() -> new IllegalArgumentException("Study set not found."));
        if (!studySet.canBeViewedBy(userId) && studySet.getVisibility() != Visibility.PUBLIC) {
            throw new AccessDeniedException("You do not have access to this study set.");
        }
        return studySet;
    }

    private StudySet toModel(StudySetEntity entity) {
        StudySet studySet = new StudySet(
                entity.getId(),
                entity.getOwner().getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getVisibility()
        );
        entity.getFlashcards().stream()
                .sorted(Comparator.comparing(FlashcardEntity::getNextReviewAt))
                .forEach(card -> {
                    TextFlashcard flashcard = new TextFlashcard(card.getId(), card.getPrompt(), card.getAnswer());
                    flashcard.setMasteryLevel(card.getMasteryLevel());
                    flashcard.setNextReviewAt(card.getNextReviewAt());
                    studySet.addCard(flashcard);
                });
        return studySet;
    }
}
