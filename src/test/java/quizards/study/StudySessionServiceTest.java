package quizards.study;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import quizards.domain.StudyMode;
import quizards.domain.Visibility;
import quizards.exception.EmptyDeckException;
import quizards.model.StudySet;
import quizards.model.TextFlashcard;
import quizards.service.StudySessionService;

class StudySessionServiceTest {

    private final StudySessionService studySessionService = new StudySessionService();

    @Test
    void defaultsToRepetitionModeWhenModeIsNull() {
        StudySet studySet = createStudySetWithOneCard();

        StudySession session = studySessionService.startSession(studySet, null);

        assertEquals(StudyMode.REPETITION, session.mode());
        assertEquals(Duration.ZERO, session.timeLimit());
        assertEquals(1, session.queue().size());
        assertEquals(0, session.currentIndex());
        assertEquals(0, session.correctAnswers());
    }

    @Test
    void startsTimedQuizWithDefaultLimitWhenNoCustomLimitIsProvided() {
        StudySet studySet = createStudySetWithOneCard();

        StudySession session = studySessionService.startSession(studySet, StudyMode.TIMED_QUIZ);

        assertEquals(StudyMode.TIMED_QUIZ, session.mode());
        assertEquals(TimedQuizEngine.DEFAULT_TIME_LIMIT, session.timeLimit());
        assertEquals(1, session.queue().size());
    }

    @Test
    void startsTimedQuizWithCustomLimitWhenMinutesAreValid() {
        StudySet studySet = createStudySetWithOneCard();

        StudySession session = studySessionService.startSession(studySet, StudyMode.TIMED_QUIZ, 25);

        assertEquals(StudyMode.TIMED_QUIZ, session.mode());
        assertEquals(Duration.ofMinutes(25), session.timeLimit());
    }

    @Test
    void rejectsTimedQuizLengthBelowMinimum() {
        StudySet studySet = createStudySetWithOneCard();

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> studySessionService.startSession(studySet, StudyMode.TIMED_QUIZ, 0)
        );

        assertEquals("Timed quiz length must be between 1 and 180 minutes.", exception.getMessage());
    }

    @Test
    void rejectsTimedQuizLengthAboveMaximum() {
        StudySet studySet = createStudySetWithOneCard();

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> studySessionService.startSession(studySet, StudyMode.TIMED_QUIZ, 181)
        );

        assertEquals("Timed quiz length must be between 1 and 180 minutes.", exception.getMessage());
    }

    @Test
    void startsStreakSessionWithoutTimeLimit() {
        StudySet studySet = createStudySetWithOneCard();

        StudySession session = studySessionService.startSession(studySet, StudyMode.STREAK);

        assertEquals(StudyMode.STREAK, session.mode());
        assertEquals(Duration.ZERO, session.timeLimit());
        assertEquals(1, session.queue().size());
    }

    @Test
    void throwsWhenStartingAnyModeWithAnEmptyDeck() {
        StudySet emptyStudySet = new StudySet(UUID.randomUUID(), "Empty", "No cards yet", Visibility.PRIVATE);

        assertThrows(EmptyDeckException.class, () -> studySessionService.startSession(emptyStudySet, StudyMode.REPETITION));
        assertThrows(EmptyDeckException.class, () -> studySessionService.startSession(emptyStudySet, StudyMode.TIMED_QUIZ));
        assertThrows(EmptyDeckException.class, () -> studySessionService.startSession(emptyStudySet, StudyMode.STREAK));
    }

    @Test
    void sessionQueuePreservesDeckCardOrder() {
        StudySet studySet = new StudySet(UUID.randomUUID(), "History", "Key events", Visibility.PUBLIC);
        TextFlashcard firstCard = new TextFlashcard(UUID.randomUUID(), "Q1", "A1");
        TextFlashcard secondCard = new TextFlashcard(UUID.randomUUID(), "Q2", "A2");
        studySet.addCard(firstCard);
        studySet.addCard(secondCard);

        StudySession session = studySessionService.startSession(studySet, StudyMode.REPETITION);

        assertEquals(2, session.queue().size());
        assertEquals(firstCard.getId(), session.queue().get(0).getId());
        assertEquals(secondCard.getId(), session.queue().get(1).getId());
        assertTrue(session.queue().contains(firstCard));
        assertTrue(session.queue().contains(secondCard));
    }

    private StudySet createStudySetWithOneCard() {
        StudySet studySet = new StudySet(UUID.randomUUID(), "Biology", "Cells", Visibility.PUBLIC);
        studySet.addCard(new TextFlashcard(UUID.randomUUID(), "What is ATP?", "Cellular energy"));
        return studySet;
    }
}
