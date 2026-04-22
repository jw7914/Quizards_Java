package quizards.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import quizards.domain.FlashcardType;
import quizards.domain.Visibility;

class StudySetTest {

    @Test
    void emptyDeckDefaultsToTextType() {
        StudySet studySet = new StudySet(UUID.randomUUID(), 11L, false, "Empty", "No cards", Visibility.PRIVATE);

        assertEquals(FlashcardType.TEXT, studySet.getDeckCardType());
        assertFalse(studySet.isQuizDeck());
    }

    @Test
    void allQuizCardsProduceQuizDeckType() {
        StudySet studySet = new StudySet(UUID.randomUUID(), 11L, false, "Quiz", "Quiz deck", Visibility.PRIVATE);
        studySet.addCard(new QuizFlashcard(UUID.randomUUID(), "2 + 2?", "4", java.util.List.of("3", "4", "5", "6")));
        studySet.addCard(new QuizFlashcard(UUID.randomUUID(), "3 + 3?", "6", java.util.List.of("5", "6", "7", "8")));

        assertEquals(FlashcardType.QUIZ, studySet.getDeckCardType());
        assertTrue(studySet.isQuizDeck());
    }

    @Test
    void mixedCardTypesFallBackToTextDeckType() {
        StudySet studySet = new StudySet(UUID.randomUUID(), 11L, false, "Mixed", "Mixed deck", Visibility.PRIVATE);
        studySet.addCard(new QuizFlashcard(UUID.randomUUID(), "2 + 2?", "4", java.util.List.of("3", "4", "5", "6")));
        studySet.addCard(new TextFlashcard(UUID.randomUUID(), "Capital of France?", "Paris"));

        assertEquals(FlashcardType.TEXT, studySet.getDeckCardType());
        assertFalse(studySet.isQuizDeck());
    }

    @Test
    void removeCardReturnsTrueOnlyWhenCardExists() {
        StudySet studySet = new StudySet(UUID.randomUUID(), 11L, false, "Biology", "Cells", Visibility.PRIVATE);
        TextFlashcard card = new TextFlashcard(UUID.randomUUID(), "ATP?", "Energy");
        studySet.addCard(card);

        assertTrue(studySet.removeCard(card.getId()));
        assertFalse(studySet.removeCard(card.getId()));
    }

    @Test
    void privateDeckCanBeViewedByOwnerAndSharedUsersButNotStrangers() {
        StudySet studySet = new StudySet(UUID.randomUUID(), 11L, false, "Private", "Study notes", Visibility.PRIVATE);
        studySet.shareWith(99L);

        assertTrue(studySet.canBeViewedBy(11L));
        assertTrue(studySet.canBeViewedBy(99L));
        assertFalse(studySet.canBeViewedBy(77L));
    }

    @Test
    void publicDeckCanBeViewedByAnyUser() {
        StudySet studySet = new StudySet(UUID.randomUUID(), 11L, false, "Public", "Shared deck", Visibility.PUBLIC);

        assertTrue(studySet.canBeViewedBy(1L));
        assertTrue(studySet.canBeViewedBy(2L));
    }

    @Test
    void returnedCardsAndSharedUsersCollectionsAreImmutableViews() {
        StudySet studySet = new StudySet(UUID.randomUUID(), 11L, false, "Deck", "Immutable views", Visibility.PUBLIC);
        studySet.addCard(new TextFlashcard(UUID.randomUUID(), "Prompt", "Answer"));
        studySet.shareWith(42L);

        assertThrows(UnsupportedOperationException.class, () -> studySet.getCards().clear());
        assertThrows(UnsupportedOperationException.class, () -> studySet.getSharedWithUserIds().add(99L));
    }
}
