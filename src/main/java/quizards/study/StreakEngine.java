package quizards.study;

import quizards.domain.StudyMode;
import quizards.exception.EmptyDeckException;
import quizards.model.StudySet;
import java.time.Duration;

public class StreakEngine implements StudyEngine {

    @Override
    public StudyMode mode() {
        return StudyMode.STREAK;
    }

    @Override
    public StudySession startSession(StudySet studySet) {
        if (studySet.getCards().isEmpty()) {
            throw new EmptyDeckException("Cannot start a streak session with an empty study set.");
        }
        return new StudySession(mode(), studySet.getCards(), 0, 0, Duration.ZERO);
    }
}
