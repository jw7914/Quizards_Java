package quizards.model;

import quizards.domain.FlashcardType;
import java.util.UUID;

public class TextFlashcard extends Flashcard {

    public TextFlashcard(UUID id, String prompt, String answer) {
        super(id, prompt, answer, FlashcardType.TEXT);
    }

    @Override
    public boolean isCorrectResponse(String response) {
        return getAnswer().equalsIgnoreCase(response == null ? "" : response.trim());
    }
}
