package quizards.study;

import quizards.model.StudyMode;
import quizards.model.StudySet;

public interface StudyEngine {

    StudyMode mode();

    StudySession startSession(StudySet studySet);
}
