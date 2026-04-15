package quizards.study;

import quizards.domain.StudyMode;
import quizards.exception.EmptyDeckException;
import quizards.model.StudySet;
import java.time.Duration;

public class TimedQuizEngine implements StudyEngine {

    public static final Duration DEFAULT_TIME_LIMIT = Duration.ofMinutes(10);

    @Override
    public StudyMode mode() {
        return StudyMode.TIMED_QUIZ;
    }

    @Override
    public StudySession startSession(StudySet studySet) {
        return startSession(studySet, DEFAULT_TIME_LIMIT);
    }

    public StudySession startSession(StudySet studySet, Duration timeLimit) {
        if (studySet.getCards().isEmpty()) {
            throw new EmptyDeckException("Cannot start a timed quiz with an empty study set.");
        }
        return new StudySession(mode(), studySet.getCards(), 0, 0, timeLimit);
    }
}
