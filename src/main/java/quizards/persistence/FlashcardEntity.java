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
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;
import quizards.domain.FlashcardType;

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

    @Column(name = "choices_data", length = 4000)
    private String choicesData;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FlashcardType type;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "study_set_id", nullable = false)
    private StudySetEntity studySet;

    protected FlashcardEntity() {
    }

    public FlashcardEntity(String prompt, String answer, String choicesData, FlashcardType type) {
        this.prompt = prompt;
        this.answer = answer;
        this.choicesData = choicesData;
        this.type = type;
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

    public String getChoicesData() {
        return choicesData;
    }

    public FlashcardType getType() {
        return type;
    }

    public void setStudySet(StudySetEntity studySet) {
        this.studySet = studySet;
    }
}
