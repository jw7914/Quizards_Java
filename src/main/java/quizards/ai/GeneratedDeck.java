package quizards.ai;

import quizards.model.Flashcard;
import java.util.List;

public record GeneratedDeck(String title, String summary, List<String> keyTakeaways, List<Flashcard> flashcards) {
}
