package quizards.service;

import quizards.domain.Visibility;
import quizards.exception.AccessDeniedException;
import quizards.model.Flashcard;
import quizards.model.QuizFlashcard;
import quizards.model.StudySet;
import quizards.model.TextFlashcard;
import quizards.persistence.AppUserEntity;
import quizards.persistence.FlashcardEntity;
import quizards.persistence.StudySetEntity;
import quizards.repository.StudySetRepository;
import quizards.validation.InputValidator;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
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
        return prepareSortedStudySets(studySetRepository.findByVisibility(Visibility.PUBLIC)).stream()
                .map(this::toModel)
                .toList();
    }

    public List<StudySet> findRandomPublicStudySets(int limit) {
        int normalizedLimit = Math.max(1, limit);
        List<StudySetEntity> publicStudySets = new ArrayList<>(prepareSortedStudySets(studySetRepository.findByVisibility(Visibility.PUBLIC)));
        Collections.shuffle(publicStudySets);
        return publicStudySets.stream()
                .limit(normalizedLimit)
                .map(this::toModel)
                .toList();
    }

    public List<StudySet> findStudySetsForOwner(long ownerId) {
        return prepareSortedStudySets(studySetRepository.findByOwnerId(ownerId)).stream()
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
                serializeChoices(flashcard),
                flashcard.getType()
        )));
        return toModel(studySetRepository.save(studySet));
    }

    public StudySet createStudySetFromDraft(AppUserEntity owner, String title, String description, Visibility visibility, List<TextFlashcard> flashcards) {
        return createStudySet(owner, title, description, visibility, flashcards.stream()
                .map(Flashcard.class::cast)
                .collect(Collectors.toList()));
    }

    public StudySet getAccessibleStudySet(UUID studySetId, long userId) {
        StudySetEntity studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new IllegalArgumentException("Study set not found."));

        boolean isPublic = studySet.getVisibility() == Visibility.PUBLIC;
        boolean isOwner = userId > 0 && studySet.getOwner().getId() == userId;

        if (!isPublic && !isOwner) {
            throw new AccessDeniedException("You do not have access to this study set.");
        }

        return toModel(studySet);
    }

    public void deleteStudySet(UUID studySetId, long ownerId) {
        StudySetEntity studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new IllegalArgumentException("Study set not found."));
        if (studySet.getOwner().getId() != ownerId) {
            throw new AccessDeniedException("You do not have access to this study set.");
        }
        studySetRepository.delete(studySet);
    }

    public StudySet updateVisibility(UUID studySetId, long ownerId, Visibility visibility) {
        StudySetEntity studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new IllegalArgumentException("Study set not found."));
        if (studySet.getOwner().getId() != ownerId) {
            throw new AccessDeniedException("You do not have access to this study set.");
        }
        studySet.setVisibility(visibility);
        return toModel(studySetRepository.save(studySet));
    }

    public StudySet updateStudySet(
            UUID studySetId,
            long ownerId,
            String title,
            String description,
            Visibility visibility,
            List<Flashcard> flashcards
    ) {
        inputValidator.requireNonBlank(title, "title");
        inputValidator.requireNonBlank(description, "description");

        StudySetEntity studySet = studySetRepository.findById(studySetId)
                .orElseThrow(() -> new IllegalArgumentException("Study set not found."));
        if (studySet.getOwner().getId() != ownerId) {
            throw new AccessDeniedException("You do not have access to this study set.");
        }

        studySet.setTitle(title);
        studySet.setDescription(description);
        studySet.setVisibility(visibility);
        studySet.clearFlashcards();
        flashcards.forEach(flashcard -> studySet.addFlashcard(new FlashcardEntity(
                flashcard.getPrompt(),
                flashcard.getAnswer(),
                serializeChoices(flashcard),
                flashcard.getType()
        )));

        return toModel(studySetRepository.save(studySet));
    }

    private List<StudySetEntity> prepareSortedStudySets(List<StudySetEntity> studySets) {
        List<StudySetEntity> missingCreatedAt = studySets.stream()
                .filter(studySet -> studySet.getCreatedAt() == null)
                .toList();
        if (!missingCreatedAt.isEmpty()) {
            LocalDateTime fallbackTime = LocalDateTime.now();
            missingCreatedAt.forEach(studySet -> studySet.setCreatedAt(fallbackTime));
            studySetRepository.saveAll(missingCreatedAt);
        }

        return studySets.stream()
                .sorted(Comparator
                        .comparing(StudySetEntity::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(StudySetEntity::getTitle, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private StudySet toModel(StudySetEntity entity) {
        StudySet studySet = new StudySet(
                entity.getId(),
                entity.getOwner().getId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getVisibility()
        );
        entity.getFlashcards().forEach(card -> {
                    Flashcard flashcard;
                    if (card.getType() == quizards.domain.FlashcardType.QUIZ) {
                        flashcard = new QuizFlashcard(
                                card.getId(),
                                card.getPrompt(),
                                card.getAnswer(),
                                deserializeChoices(card.getChoicesData())
                        );
                    } else {
                        flashcard = new TextFlashcard(card.getId(), card.getPrompt(), card.getAnswer());
                    }
                    studySet.addCard(flashcard);
                });
        return studySet;
    }

    private String serializeChoices(Flashcard flashcard) {
        if (flashcard instanceof QuizFlashcard quizFlashcard) {
            return String.join("\n", quizFlashcard.getChoices());
        }
        return null;
    }

    private List<String> deserializeChoices(String choicesData) {
        if (choicesData == null || choicesData.isBlank()) {
            return List.of();
        }

        List<String> choices = new ArrayList<>();
        for (String choice : choicesData.split("\\n")) {
            if (!choice.isBlank()) {
                choices.add(choice);
            }
        }
        return List.copyOf(choices);
    }
}
