package quizards.study;

import quizards.domain.StudyMode;
import quizards.exception.EmptyDeckException;
import quizards.model.StudySet;
import java.time.Duration;

public class LeitnerEngine implements StudyEngine {

    @Override
    public StudyMode mode() {
        return StudyMode.LEITNER;
    }

    @Override
    public StudySession startSession(StudySet studySet) {
        validateStudySet(studySet);
        return new StudySession(mode(), studySet.getCards(), 0, 0, Duration.ZERO);
    }

    private void validateStudySet(StudySet studySet) {
        if (studySet.getCards().isEmpty()) {
            throw new EmptyDeckException("Cannot start a Leitner session with an empty study set.");
        }
    }
}
