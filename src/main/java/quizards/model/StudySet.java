package quizards.model;

import quizards.domain.MasteryLevel;
import quizards.domain.Visibility;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

public class StudySet {

    private final UUID id;
    private String title;
    private String description;
    private Visibility visibility;
    private final List<Flashcard> cards;
    private final Set<Long> sharedWithUserIds;

    public StudySet(UUID id, String title, String description, Visibility visibility) {
        this.id = Objects.requireNonNull(id, "id must not be null");
        this.title = Objects.requireNonNull(title, "title must not be null");
        this.description = Objects.requireNonNull(description, "description must not be null");
        this.visibility = Objects.requireNonNull(visibility, "visibility must not be null");
        this.cards = new ArrayList<>();
        this.sharedWithUserIds = new HashSet<>();
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = Objects.requireNonNull(title, "title must not be null");
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = Objects.requireNonNull(description, "description must not be null");
    }

    public Visibility getVisibility() {
        return visibility;
    }

    public void setVisibility(Visibility visibility) {
        this.visibility = Objects.requireNonNull(visibility, "visibility must not be null");
    }

    public List<Flashcard> getCards() {
        return List.copyOf(cards);
    }

    public void addCard(Flashcard flashcard) {
        cards.add(Objects.requireNonNull(flashcard, "flashcard must not be null"));
    }

    public boolean removeCard(UUID flashcardId) {
        return cards.removeIf(card -> card.getId().equals(flashcardId));
    }

    public List<Flashcard> getCardsByMastery(MasteryLevel masteryLevel) {
        return cards.stream()
                .filter(card -> card.getMasteryLevel() == masteryLevel)
                .toList();
    }

    public List<Flashcard> getCardsSortedForLinearReview() {
        return cards.stream()
                .sorted(Comparator.comparing(Flashcard::getNextReviewAt))
                .toList();
    }

    public Set<Long> getSharedWithUserIds() {
        return Set.copyOf(sharedWithUserIds);
    }

    public void shareWith(long userId) {
        sharedWithUserIds.add(userId);
    }

    public boolean canBeViewedBy(long userId) {
        return visibility == Visibility.PUBLIC || sharedWithUserIds.contains(userId);
    }
}
