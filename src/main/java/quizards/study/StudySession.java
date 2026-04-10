package quizards.study;

import quizards.domain.StudyMode;
import quizards.model.Flashcard;
import java.time.Duration;
import java.util.List;

public record StudySession(
        StudyMode mode,
        List<Flashcard> queue,
        int currentIndex,
        int correctAnswers,
        Duration timeLimit
) {
}
