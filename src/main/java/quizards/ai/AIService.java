package quizards.ai;

import java.util.concurrent.CompletableFuture;
import quizards.domain.FlashcardType;

public interface AIService {

    CompletableFuture<GeneratedDeck> generateFlashcardsFromPrompt(String prompt, FlashcardType cardType);
}
