package quizards.web;

import java.util.List;
import java.util.UUID;
import quizards.domain.StudyMode;

public record StudySessionResponse(
        UUID studySetId,
        StudyMode mode,
        int currentIndex,
        int correctAnswers,
        long timeLimitSeconds,
        int totalCards,
        List<StudySessionCardResponse> queue
) {
}
