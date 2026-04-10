package quizards.tracking;

import quizards.model.Flashcard;
import java.time.Instant;
import java.util.Comparator;
import java.util.PriorityQueue;
import java.util.Queue;

public class DifficultyTracker {

    private final Queue<Flashcard> reviewQueue = new PriorityQueue<>(Comparator.comparing(Flashcard::getNextReviewAt));

    public void add(Flashcard flashcard) {
        reviewQueue.offer(flashcard);
    }

    public Flashcard nextCard() {
        return reviewQueue.peek();
    }

    public int size() {
        return reviewQueue.size();
    }

    public void markForLaterReview(Flashcard flashcard, Instant nextReviewAt) {
        reviewQueue.remove(flashcard);
        flashcard.setNextReviewAt(nextReviewAt);
        reviewQueue.offer(flashcard);
    }
}
