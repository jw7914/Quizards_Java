package quizards.model;

import quizards.domain.FlashcardType;
import quizards.domain.MasteryLevel;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public abstract class Flashcard {

    private final UUID id;
    private final String prompt;
    private final String answer;
    private final FlashcardType type;
    private MasteryLevel masteryLevel;
    private Instant nextReviewAt;

    protected Flashcard(UUID id, String prompt, String answer, FlashcardType type) {
        this.id = Objects.requireNonNull(id, "id must not be null");
        this.prompt = Objects.requireNonNull(prompt, "prompt must not be null");
        this.answer = Objects.requireNonNull(answer, "answer must not be null");
        this.type = Objects.requireNonNull(type, "type must not be null");
        this.masteryLevel = MasteryLevel.NEW;
        this.nextReviewAt = Instant.now();
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

    public MasteryLevel getMasteryLevel() {
        return masteryLevel;
    }

    public void setMasteryLevel(MasteryLevel masteryLevel) {
        this.masteryLevel = Objects.requireNonNull(masteryLevel, "masteryLevel must not be null");
    }

    public Instant getNextReviewAt() {
        return nextReviewAt;
    }

    public void setNextReviewAt(Instant nextReviewAt) {
        this.nextReviewAt = Objects.requireNonNull(nextReviewAt, "nextReviewAt must not be null");
    }

    public abstract boolean isCorrectResponse(String response);
}
