package quizards.persistence;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;
import quizards.domain.Visibility;

@Entity
@Table(name = "study_sets")
public class StudySetEntity {

    @Id
    @UuidGenerator
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Visibility visibility;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private AppUserEntity owner;

    @OneToMany(mappedBy = "studySet", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FlashcardEntity> flashcards = new ArrayList<>();

    protected StudySetEntity() {
    }

    public StudySetEntity(String title, String description, Visibility visibility, AppUserEntity owner) {
        this.title = title;
        this.description = description;
        this.visibility = visibility;
        this.owner = owner;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public AppUserEntity getOwner() {
        return owner;
    }

    public List<FlashcardEntity> getFlashcards() {
        return flashcards;
    }

    public void addFlashcard(FlashcardEntity flashcard) {
        flashcards.add(flashcard);
        flashcard.setStudySet(this);
    }
}
