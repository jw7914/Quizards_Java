package quizards.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import quizards.domain.FlashcardType;
import quizards.domain.Visibility;
import quizards.exception.AccessDeniedException;
import quizards.exception.EmptyCardException;
import quizards.exception.ValidationException;
import quizards.model.Flashcard;
import quizards.model.QuizFlashcard;
import quizards.model.StudySet;
import quizards.model.TextFlashcard;
import quizards.persistence.AppUserEntity;
import quizards.persistence.FlashcardEntity;
import quizards.persistence.StudySetEntity;
import quizards.repository.StudySetRepository;
import quizards.validation.InputValidator;

@ExtendWith(MockitoExtension.class)
class StudySetServiceTest {

    @Mock
    private StudySetRepository studySetRepository;

    private InputValidator inputValidator;

    private StudySetService studySetService;

    @BeforeEach
    void setUp() {
        inputValidator = new InputValidator();
        studySetService = new StudySetService(studySetRepository, inputValidator);
    }

    @Test
    void findPublicStudySetsSortsByNewestCreatedAtThenTitleAndBackfillsMissingDates() {
        StudySetEntity missingCreatedAt = studySetEntity(
                UUID.randomUUID(),
                "Algebra",
                "Numbers",
                Visibility.PUBLIC,
                10L,
                null,
                true
        );
        StudySetEntity older = studySetEntity(
                UUID.randomUUID(),
                "History",
                "Past",
                Visibility.PUBLIC,
                11L,
                LocalDateTime.of(2025, 4, 1, 9, 0),
                false
        );
        StudySetEntity newerB = studySetEntity(
                UUID.randomUUID(),
                "zoology",
                "Animals",
                Visibility.PUBLIC,
                12L,
                LocalDateTime.of(2026, 4, 1, 9, 0),
                true
        );
        StudySetEntity newerA = studySetEntity(
                UUID.randomUUID(),
                "Astronomy",
                "Stars",
                Visibility.PUBLIC,
                13L,
                LocalDateTime.of(2026, 4, 1, 9, 0),
                false
        );

        when(studySetRepository.findByVisibility(Visibility.PUBLIC))
                .thenReturn(List.of(older, missingCreatedAt, newerB, newerA));
        when(studySetRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<StudySet> result = studySetService.findPublicStudySets();

        assertEquals(4, result.size());
        assertEquals("Algebra", result.get(0).getTitle());
        assertEquals("Astronomy", result.get(1).getTitle());
        assertEquals("zoology", result.get(2).getTitle());
        assertEquals("History", result.get(3).getTitle());
        assertTrue(missingCreatedAt.getCreatedAt() != null);
        verify(studySetRepository).saveAll(List.of(missingCreatedAt));
    }

    @Test
    void findPublicStudySetsDoesNotBackfillWhenAllCreatedAtValuesExist() {
        StudySetEntity studySet = studySetEntity(
                UUID.randomUUID(),
                "Algebra",
                "Numbers",
                Visibility.PUBLIC,
                10L,
                LocalDateTime.of(2026, 1, 1, 12, 0),
                true
        );
        when(studySetRepository.findByVisibility(Visibility.PUBLIC)).thenReturn(List.of(studySet));

        studySetService.findPublicStudySets();

        verify(studySetRepository, never()).saveAll(any());
    }

    @Test
    void getAccessibleStudySetAllowsPublicDeckForNonOwner() {
        UUID studySetId = UUID.randomUUID();
        when(studySetRepository.findById(studySetId))
                .thenReturn(Optional.of(studySetEntity(studySetId, "Public", "Shared", Visibility.PUBLIC, 4L, LocalDateTime.now(), true)));

        StudySet result = studySetService.getAccessibleStudySet(studySetId, 99L);

        assertEquals(studySetId, result.getId());
        assertEquals(4L, result.getOwnerUserId());
    }

    @Test
    void getAccessibleStudySetAllowsPrivateDeckForOwner() {
        UUID studySetId = UUID.randomUUID();
        when(studySetRepository.findById(studySetId))
                .thenReturn(Optional.of(studySetEntity(studySetId, "Private", "Owner only", Visibility.PRIVATE, 7L, LocalDateTime.now(), false)));

        StudySet result = studySetService.getAccessibleStudySet(studySetId, 7L);

        assertEquals("Private", result.getTitle());
        assertFalse(result.isCreatedByAi());
    }

    @Test
    void getAccessibleStudySetRejectsPrivateDeckForNonOwner() {
        UUID studySetId = UUID.randomUUID();
        when(studySetRepository.findById(studySetId))
                .thenReturn(Optional.of(studySetEntity(studySetId, "Private", "Owner only", Visibility.PRIVATE, 7L, LocalDateTime.now(), false)));

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> studySetService.getAccessibleStudySet(studySetId, 99L)
        );

        assertEquals("You do not have access to this study set.", exception.getMessage());
    }

    @Test
    void createAiStudySetWithFlashcardsPersistsSerializedChoicesAndAiFlag() {
        AppUserEntity owner = appUser(21L, "alice");
        QuizFlashcard quizFlashcard = new QuizFlashcard(
                UUID.randomUUID(),
                "2 + 2?",
                "4",
                List.of("3", "4", "5", "6")
        );

        when(studySetRepository.save(any())).thenAnswer(invocation -> {
            StudySetEntity entity = invocation.getArgument(0);
            return assignIds(entity);
        });

        StudySet result = studySetService.createAiStudySet(
                owner,
                "Math",
                "Practice arithmetic",
                Visibility.PUBLIC,
                List.of(quizFlashcard)
        );

        ArgumentCaptor<StudySetEntity> captor = ArgumentCaptor.forClass(StudySetEntity.class);
        verify(studySetRepository).save(captor.capture());
        StudySetEntity savedEntity = captor.getValue();

        assertTrue(savedEntity.isCreatedByAi());
        assertEquals(1, savedEntity.getFlashcards().size());
        assertEquals("3\n4\n5\n6", savedEntity.getFlashcards().get(0).getChoicesData());
        assertEquals(FlashcardType.QUIZ, savedEntity.getFlashcards().get(0).getType());
        assertTrue(result.isCreatedByAi());
        assertTrue(result.isQuizDeck());
    }

    @Test
    void createAiStudySetRejectsBlankFlashcards() {
        StudySetService validatingService = new StudySetService(studySetRepository, new InputValidator());
        AppUserEntity owner = appUser(21L, "alice");

        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> validatingService.createAiStudySet(
                        owner,
                        "Math",
                        "Practice arithmetic",
                        Visibility.PUBLIC,
                        List.of(new TextFlashcard(UUID.randomUUID(), "", "Filled answer"))
                )
        );

        assertEquals("flashcards[0].prompt must not be blank.", exception.getMessage());
        verify(studySetRepository, never()).save(any());
    }

    @Test
    void createAiStudySetRejectsEmptyFlashcards() {
        StudySetService validatingService = new StudySetService(studySetRepository, new InputValidator());
        AppUserEntity owner = appUser(21L, "alice");

        EmptyCardException exception = assertThrows(
                EmptyCardException.class,
                () -> validatingService.createAiStudySet(
                        owner,
                        "Math",
                        "Practice arithmetic",
                        Visibility.PUBLIC,
                        List.of(new TextFlashcard(UUID.randomUUID(), "", ""))
                )
        );

        assertEquals("flashcards[0] must not be empty.", exception.getMessage());
        verify(studySetRepository, never()).save(any());
    }

    @Test
    void updateStudySetReplacesExistingCardsAndMapsQuizChoicesBackToModel() {
        UUID studySetId = UUID.randomUUID();
        StudySetEntity existing = studySetEntity(
                studySetId,
                "Old title",
                "Old description",
                Visibility.PRIVATE,
                21L,
                LocalDateTime.now(),
                false
        );
        existing.addFlashcard(new FlashcardEntity("Old prompt", "Old answer", null, FlashcardType.TEXT));

        when(studySetRepository.findById(studySetId)).thenReturn(Optional.of(existing));
        when(studySetRepository.save(any())).thenAnswer(invocation -> assignIds(invocation.getArgument(0)));

        List<Flashcard> flashcards = List.of(
                new TextFlashcard(UUID.randomUUID(), "New prompt", "New answer"),
                new QuizFlashcard(UUID.randomUUID(), "2 + 2?", "4", List.of("3", "4", "5", "6"))
        );

        StudySet updated = studySetService.updateStudySet(
                studySetId,
                21L,
                "Updated title",
                "Updated description",
                Visibility.PUBLIC,
                flashcards
        );

        assertEquals("Updated title", updated.getTitle());
        assertEquals("Updated description", updated.getDescription());
        assertEquals(Visibility.PUBLIC, updated.getVisibility());
        assertEquals(2, updated.getCards().size());
        assertInstanceOf(TextFlashcard.class, updated.getCards().get(0));
        assertInstanceOf(QuizFlashcard.class, updated.getCards().get(1));
        assertEquals(List.of("3", "4", "5", "6"), ((QuizFlashcard) updated.getCards().get(1)).getChoices());
    }

    private StudySetEntity studySetEntity(
            UUID id,
            String title,
            String description,
            Visibility visibility,
            long ownerId,
            LocalDateTime createdAt,
            boolean createdByAi
    ) {
        StudySetEntity entity = new StudySetEntity(title, description, visibility, appUser(ownerId, "user" + ownerId));
        ReflectionTestUtils.setField(entity, "id", id);
        entity.setCreatedAt(createdAt);
        entity.setCreatedByAi(createdByAi);
        return entity;
    }

    private AppUserEntity appUser(long id, String username) {
        AppUserEntity owner = new AppUserEntity(username, "hash");
        ReflectionTestUtils.setField(owner, "id", id);
        return owner;
    }

    private StudySetEntity assignIds(StudySetEntity entity) {
        if (entity.getId() == null) {
            ReflectionTestUtils.setField(entity, "id", UUID.randomUUID());
        }
        entity.getFlashcards().forEach(flashcard -> {
            if (flashcard.getId() == null) {
                ReflectionTestUtils.setField(flashcard, "id", UUID.randomUUID());
            }
        });
        return entity;
    }
}
