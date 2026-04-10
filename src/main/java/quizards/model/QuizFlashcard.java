package quizards.model;

import quizards.domain.FlashcardType;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class QuizFlashcard extends Flashcard {

    private final List<String> choices;

    public QuizFlashcard(UUID id, String prompt, String answer, List<String> choices) {
        super(id, prompt, answer, FlashcardType.QUIZ);
        this.choices = List.copyOf(Objects.requireNonNull(choices, "choices must not be null"));
    }

    public List<String> getChoices() {
        return choices;
    }

    @Override
    public boolean isCorrectResponse(String response) {
        return getAnswer().equalsIgnoreCase(response == null ? "" : response.trim());
    }
}
