package quizards.ai;

import quizards.domain.FlashcardType;
import quizards.model.Flashcard;
import quizards.model.QuizFlashcard;
import quizards.model.TextFlashcard;
import java.util.List;
import java.util.UUID;

public class StubAIService implements AIService {

    @Override
    public String summarizeNotes(String notes) {
        return "AI summary placeholder for: " + notes;
    }

    @Override
    public GeneratedDeck generateFlashcardsFromNotes(String notes) {
        return buildPlaceholderDeck("Generated from notes", notes);
    }

    @Override
    public GeneratedDeck generateFlashcardsFromPrompt(String prompt, FlashcardType cardType) {
        return buildPlaceholderDeck("Generated from prompt", prompt, cardType == null ? FlashcardType.TEXT : cardType);
    }

    private GeneratedDeck buildPlaceholderDeck(String summaryPrefix, String input) {
        return buildPlaceholderDeck(summaryPrefix, input, FlashcardType.TEXT);
    }

    private GeneratedDeck buildPlaceholderDeck(String summaryPrefix, String input, FlashcardType cardType) {
        Flashcard card = cardType == FlashcardType.QUIZ
                ? new QuizFlashcard(
                        UUID.randomUUID(),
                        "Which statement best matches the topic?",
                        "Replace this placeholder with an AI-generated answer.",
                        List.of(
                                "Replace this placeholder with an AI-generated answer.",
                                "Distractor option one.",
                                "Distractor option two.",
                                "Distractor option three."
                        )
                )
                : new TextFlashcard(
                        UUID.randomUUID(),
                        "What is the main idea?",
                        "Replace this placeholder with an AI-generated answer."
                );
        return new GeneratedDeck(
                "AI Placeholder Deck",
                summaryPrefix + ": " + input,
                List.of("Connect a real LLM provider here.", "Validate AI output before saving."),
                List.of(card)
        );
    }
}
