package quizards.model;

import quizards.domain.FlashcardType;
import java.util.Objects;
import java.util.UUID;

public abstract class Flashcard {

    private final UUID id;
    private final String prompt;
    private final String answer;
    private final FlashcardType type;

    protected Flashcard(UUID id, String prompt, String answer, FlashcardType type) {
        this.id = Objects.requireNonNull(id, "id must not be null");
        this.prompt = Objects.requireNonNull(prompt, "prompt must not be null");
        this.answer = Objects.requireNonNull(answer, "answer must not be null");
        this.type = Objects.requireNonNull(type, "type must not be null");
    }

    public UUID getId() {
        return id;
    }

    public String getPrompt() {
        return prompt;
    }

    public String getAnswer() {
        return answer;
    }

    public FlashcardType getType() {
        return type;
    }

    public abstract boolean isCorrectResponse(String response);
}
