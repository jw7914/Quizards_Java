package quizards.service;

import java.time.Duration;
import java.util.EnumMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import quizards.domain.StudyMode;
import quizards.model.StudySet;
import quizards.study.RepetitionEngine;
import quizards.study.StreakEngine;
import quizards.study.StudyEngine;
import quizards.study.StudySession;
import quizards.study.TimedQuizEngine;

@Service
public class StudySessionService {

    private final Map<StudyMode, StudyEngine> engines;

    public StudySessionService() {
        engines = new EnumMap<>(StudyMode.class);
        register(new RepetitionEngine());
        register(new TimedQuizEngine());
        register(new StreakEngine());
    }

    public StudySession startSession(StudySet studySet, StudyMode mode) {
        return startSession(studySet, mode, null);
    }

    public StudySession startSession(StudySet studySet, StudyMode mode, Integer timeLimitMinutes) {
        StudyMode resolvedMode = mode == null ? StudyMode.REPETITION : mode;

        if (resolvedMode == StudyMode.TIMED_QUIZ) {
            TimedQuizEngine timedQuizEngine = (TimedQuizEngine) engines.get(StudyMode.TIMED_QUIZ);
            if (timedQuizEngine == null) {
                throw new IllegalArgumentException("Unsupported study mode: " + resolvedMode);
            }

            Duration timeLimit = TimedQuizEngine.DEFAULT_TIME_LIMIT;
            if (timeLimitMinutes != null) {
                if (timeLimitMinutes < 1 || timeLimitMinutes > 180) {
                    throw new IllegalArgumentException("Timed quiz length must be between 1 and 180 minutes.");
                }
                timeLimit = Duration.ofMinutes(timeLimitMinutes);
            }
            return timedQuizEngine.startSession(studySet, timeLimit);
        }

        StudyEngine engine = engines.get(resolvedMode);
        if (engine == null) {
            throw new IllegalArgumentException("Unsupported study mode: " + resolvedMode);
        }
        return engine.startSession(studySet);
    }

    private void register(StudyEngine engine) {
        engines.put(engine.mode(), engine);
    }
}
