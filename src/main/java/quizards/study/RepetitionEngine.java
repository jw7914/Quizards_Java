package quizards.study;

import quizards.domain.StudyMode;
import quizards.exception.EmptyDeckException;
import quizards.model.StudySet;
import java.time.Duration;

public class RepetitionEngine implements StudyEngine {

    @Override
    public StudyMode mode() {
        return StudyMode.REPETITION;
    }

    @Override
    public StudySession startSession(StudySet studySet) {
        validateStudySet(studySet);
        return new StudySession(mode(), studySet.getCards(), 0, 0, Duration.ZERO);
    }

    private void validateStudySet(StudySet studySet) {
        if (studySet.getCards().isEmpty()) {
            throw new EmptyDeckException("Cannot start a repetition session with an empty study set.");
        }
    }
}
