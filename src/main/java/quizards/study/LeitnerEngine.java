package quizards.study;

import quizards.domain.StudyMode;
import quizards.exception.EmptyDeckException;
import quizards.model.Flashcard;
import quizards.model.StudySet;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;

public class LeitnerEngine implements StudyEngine {

    @Override
    public StudyMode mode() {
        return StudyMode.LEITNER;
    }

    @Override
    public StudySession startSession(StudySet studySet) {
        validateStudySet(studySet);
        List<Flashcard> queue = studySet.getCards().stream()
                .sorted(Comparator.comparing(Flashcard::getNextReviewAt))
                .toList();
        return new StudySession(mode(), queue, 0, 0, Duration.ZERO);
    }

    private void validateStudySet(StudySet studySet) {
        if (studySet.getCards().isEmpty()) {
            throw new EmptyDeckException("Cannot start a Leitner session with an empty study set.");
        }
    }
}
