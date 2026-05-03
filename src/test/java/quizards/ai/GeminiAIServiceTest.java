package quizards.ai;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.concurrent.CompletionException;
import org.junit.jupiter.api.Test;
import quizards.domain.FlashcardType;
import quizards.exception.AIProviderException;
import quizards.model.Flashcard;
import quizards.model.QuizFlashcard;
import quizards.model.TextFlashcard;

class GeminiAIServiceTest {

    @Test
    void extractsRequestedCardCountFromDigitsAndClampsAboveTwenty() {
        GeminiAIService service = serviceWithNoOpAssistants();

        assertEquals(7, service.extractRequestedCardCount("Create 7 flashcards about mitosis."));
        assertEquals(20, service.extractRequestedCardCount("Generate exactly 25 cards on chemistry."));
    }

    @Test
    void extractsRequestedCardCountFromWords() {
        GeminiAIService service = serviceWithNoOpAssistants();

        assertEquals(6, service.extractRequestedCardCount("Please make six quiz cards about geography."));
        assertEquals(20, service.extractRequestedCardCount("Generate twenty flashcards on biology."));
    }

    @Test
    void returnsNullRequestedCardCountWhenPromptHasNoExplicitCount() {
        GeminiAIService service = serviceWithNoOpAssistants();

        assertEquals(null, service.extractRequestedCardCount("Teach me the key ideas from Newton's laws."));
    }

    @Test
    void buildCardCountInstructionUsesDefaultRangeWhenCountMissing() {
        GeminiAIService service = serviceWithNoOpAssistants();

        assertEquals(
                "If the student does not ask for a specific number of flashcards, return between 4 and 8 flashcards.",
                service.buildCardCountInstruction(null)
        );
    }

    @Test
    void generatesTextDeckAndTrimsDefaultResponseToEightCards() {
        GeminiAIService service = new GeminiAIService(
                (instruction, prompt) -> new GeminiAIService.StudySetDraft(
                        "Cell Biology",
                        "Core organelle review.",
                        List.of("Cells have organelles."),
                        List.of(
                                new GeminiAIService.StudyFlashcardDraft("Q1", "A1"),
                                new GeminiAIService.StudyFlashcardDraft("Q2", "A2"),
                                new GeminiAIService.StudyFlashcardDraft("Q3", "A3"),
                                new GeminiAIService.StudyFlashcardDraft("Q4", "A4"),
                                new GeminiAIService.StudyFlashcardDraft("Q5", "A5"),
                                new GeminiAIService.StudyFlashcardDraft("Q6", "A6"),
                                new GeminiAIService.StudyFlashcardDraft("Q7", "A7"),
                                new GeminiAIService.StudyFlashcardDraft("Q8", "A8"),
                                new GeminiAIService.StudyFlashcardDraft("Q9", "A9")
                        )
                ),
                (instruction, prompt) -> {
                    throw new AssertionError("Quiz assistant should not be used for text decks.");
                },
                Runnable::run
        );

        GeneratedDeck result = service.generateFlashcardsFromPrompt("Make a cell biology deck.", FlashcardType.TEXT).join();

        assertEquals("Cell Biology", result.title());
        assertEquals(8, result.flashcards().size());
        assertTrue(result.flashcards().stream().allMatch(TextFlashcard.class::isInstance));
        assertEquals("Q8", result.flashcards().get(7).getPrompt());
    }

    @Test
    void generatesQuizDeckWithRequestedCountAndChoiceMapping() {
        GeminiAIService service = new GeminiAIService(
                (instruction, prompt) -> {
                    throw new AssertionError("Text assistant should not be used for quiz decks.");
                },
                (instruction, prompt) -> {
                    assertEquals(
                            "Return exactly 3 flashcards. If the student asks for more than 20, return exactly 20 flashcards instead.",
                            instruction
                    );
                    return new GeminiAIService.QuizStudySetDraft(
                            "US Capitals",
                            "State capital practice.",
                            List.of("Capitals are location-based facts."),
                            List.of(
                                    new GeminiAIService.QuizFlashcardDraft(
                                            "Capital of New York?",
                                            List.of("Albany", "Buffalo", "Rochester", "Syracuse"),
                                            "Albany"
                                    ),
                                    new GeminiAIService.QuizFlashcardDraft(
                                            "Capital of California?",
                                            List.of("Los Angeles", "San Diego", "Sacramento", "San Jose"),
                                            "Sacramento"
                                    ),
                                    new GeminiAIService.QuizFlashcardDraft(
                                            "Capital of Texas?",
                                            List.of("Austin", "Dallas", "Houston", "El Paso"),
                                            "Austin"
                                    )
                            )
                    );
                },
                Runnable::run
        );

        GeneratedDeck result = service.generateFlashcardsFromPrompt("Generate 3 quiz cards about US state capitals.", FlashcardType.QUIZ).join();

        assertEquals(3, result.flashcards().size());
        Flashcard flashcard = result.flashcards().get(0);
        QuizFlashcard quizFlashcard = assertInstanceOf(QuizFlashcard.class, flashcard);
        assertEquals("Albany", quizFlashcard.getAnswer());
        assertEquals(List.of("Albany", "Buffalo", "Rochester", "Syracuse"), quizFlashcard.getChoices());
    }

    @Test
    void rejectsDefaultDecksWithFewerThanFourCards() {
        GeminiAIService service = new GeminiAIService(
                (instruction, prompt) -> new GeminiAIService.StudySetDraft(
                        "Short deck",
                        "Too short.",
                        List.of("Need more cards."),
                        List.of(
                                new GeminiAIService.StudyFlashcardDraft("Q1", "A1"),
                                new GeminiAIService.StudyFlashcardDraft("Q2", "A2"),
                                new GeminiAIService.StudyFlashcardDraft("Q3", "A3")
                        )
                ),
                (instruction, prompt) -> {
                    throw new AssertionError("Quiz assistant should not be used for text decks.");
                },
                Runnable::run
        );

        CompletionException exception = assertThrows(
                CompletionException.class,
                () -> service.generateFlashcardsFromPrompt("Explain osmosis.", FlashcardType.TEXT).join()
        );

        AIProviderException cause = assertInstanceOf(AIProviderException.class, exception.getCause());
        assertEquals("Unable to generate a study set with Gemini via LangChain4j.", cause.getMessage());
        assertEquals("Gemini returned 3 flashcards, but at least 4 were required.", cause.getCause().getMessage());
    }

    @Test
    void wrapsAssistantFailuresInProviderException() {
        RuntimeException rootCause = new RuntimeException("boom");
        GeminiAIService service = new GeminiAIService(
                (instruction, prompt) -> {
                    throw rootCause;
                },
                (instruction, prompt) -> {
                    throw new AssertionError("Quiz assistant should not be used for text decks.");
                },
                Runnable::run
        );

        CompletionException exception = assertThrows(
                CompletionException.class,
                () -> service.generateFlashcardsFromPrompt("Explain osmosis.", FlashcardType.TEXT).join()
        );

        AIProviderException cause = assertInstanceOf(AIProviderException.class, exception.getCause());
        assertEquals("Unable to generate a study set with Gemini via LangChain4j.", cause.getMessage());
        assertEquals(rootCause, cause.getCause());
    }

    private GeminiAIService serviceWithNoOpAssistants() {
        return new GeminiAIService(
                (instruction, prompt) -> {
                    throw new AssertionError("Text assistant should not be used in this test.");
                },
                (instruction, prompt) -> {
                    throw new AssertionError("Quiz assistant should not be used in this test.");
                },
                Runnable::run
        );
    }
}
