package quizards.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class FlashcardTest {

    @Test
    void textFlashcardAcceptsCaseInsensitiveTrimmedResponses() {
        TextFlashcard flashcard = new TextFlashcard(UUID.randomUUID(), "Capital of France?", "Paris");

        assertTrue(flashcard.isCorrectResponse(" paris "));
        assertTrue(flashcard.isCorrectResponse("PARIS"));
    }

    @Test
    void textFlashcardRejectsNullOrIncorrectResponses() {
        TextFlashcard flashcard = new TextFlashcard(UUID.randomUUID(), "Capital of France?", "Paris");

        assertFalse(flashcard.isCorrectResponse(null));
        assertFalse(flashcard.isCorrectResponse("London"));
    }

    @Test
    void quizFlashcardAcceptsCaseInsensitiveTrimmedResponses() {
        QuizFlashcard flashcard = new QuizFlashcard(
                UUID.randomUUID(),
                "2 + 2?",
                "4",
                List.of("3", "4", "5", "6")
        );

        assertTrue(flashcard.isCorrectResponse(" 4 "));
        assertTrue(flashcard.isCorrectResponse("4"));
    }

    @Test
    void quizFlashcardRejectsIncorrectResponses() {
        QuizFlashcard flashcard = new QuizFlashcard(
                UUID.randomUUID(),
                "2 + 2?",
                "4",
                List.of("3", "4", "5", "6")
        );

        assertFalse(flashcard.isCorrectResponse("5"));
        assertFalse(flashcard.isCorrectResponse(null));
    }

    @Test
    void quizFlashcardDefensivelyCopiesChoices() {
        List<String> choices = new ArrayList<>(List.of("Mercury", "Venus", "Earth", "Mars"));

        QuizFlashcard flashcard = new QuizFlashcard(
                UUID.randomUUID(),
                "Which planet do we live on?",
                "Earth",
                choices
        );

        choices.set(2, "Jupiter");

        assertEquals(List.of("Mercury", "Venus", "Earth", "Mars"), flashcard.getChoices());
    }

    @Test
    void quizFlashcardReturnsImmutableChoices() {
        QuizFlashcard flashcard = new QuizFlashcard(
                UUID.randomUUID(),
                "Which planet do we live on?",
                "Earth",
                List.of("Mercury", "Venus", "Earth", "Mars")
        );

        assertThrows(UnsupportedOperationException.class, () -> flashcard.getChoices().add("Pluto"));
    }
}
