package quizards.ai;

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
    public GeneratedDeck generateFlashcardsFromPrompt(String prompt) {
        return buildPlaceholderDeck("Generated from prompt", prompt);
    }

    private GeneratedDeck buildPlaceholderDeck(String summaryPrefix, String input) {
        TextFlashcard card = new TextFlashcard(
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
