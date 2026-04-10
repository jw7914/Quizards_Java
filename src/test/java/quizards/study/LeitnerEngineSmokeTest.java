package quizards.study;

import quizards.domain.Visibility;
import quizards.exception.EmptyDeckException;
import quizards.model.StudySet;
import quizards.model.TextFlashcard;
import java.util.UUID;

public class LeitnerEngineSmokeTest {

    public static void main(String[] args) {
        LeitnerEngine engine = new LeitnerEngine();
        verifyEmptyDeckThrows(engine);
        verifyDeckStarts(engine);
    }

    private static void verifyEmptyDeckThrows(LeitnerEngine engine) {
        StudySet studySet = new StudySet(UUID.randomUUID(), "Empty", "No cards yet", Visibility.PRIVATE);
        try {
            engine.startSession(studySet);
            throw new AssertionError("Expected EmptyDeckException for an empty study set.");
        } catch (EmptyDeckException ignored) {
            // Expected path for the smoke test.
        }
    }

    private static void verifyDeckStarts(LeitnerEngine engine) {
        StudySet studySet = new StudySet(UUID.randomUUID(), "Biology", "Cells", Visibility.PUBLIC);
        studySet.addCard(new TextFlashcard(UUID.randomUUID(), "What is ATP?", "Cellular energy"));

        StudySession session = engine.startSession(studySet);
        if (session.queue().size() != 1) {
            throw new AssertionError("Expected one card in the session queue.");
        }
    }
}
