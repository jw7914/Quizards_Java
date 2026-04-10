package quizards.study;

import quizards.domain.StudyMode;
import quizards.model.StudySet;

public interface StudyEngine {

    StudyMode mode();

    StudySession startSession(StudySet studySet);
}
