package quizards.web;

import java.util.List;
import quizards.domain.Visibility;

public record CreateStudySetRequest(
        String title,
        String description,
        Visibility visibility,
        List<FlashcardDraftRequest> flashcards
) {
}
