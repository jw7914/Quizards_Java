package quizards.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;
import quizards.domain.FlashcardType;
import quizards.domain.MasteryLevel;

@Entity
@Table(name = "flashcards")
public class FlashcardEntity {

    @Id
    @UuidGenerator
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 1000)
    private String prompt;

    @Column(nullable = false, length = 4000)
    private String answer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FlashcardType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MasteryLevel masteryLevel;

    @Column(nullable = false)
    private Instant nextReviewAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_set_id", nullable = false)
    private StudySetEntity studySet;

    protected FlashcardEntity() {
    }

    public FlashcardEntity(String prompt, String answer, FlashcardType type, MasteryLevel masteryLevel, Instant nextReviewAt) {
        this.prompt = prompt;
        this.answer = answer;
        this.type = type;
        this.masteryLevel = masteryLevel;
        this.nextReviewAt = nextReviewAt;
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

    public Instant getNextReviewAt() {
        return nextReviewAt;
    }

    public void setStudySet(StudySetEntity studySet) {
        this.studySet = studySet;
    }
}
