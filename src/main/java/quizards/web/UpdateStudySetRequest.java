package quizards.web;

import java.util.List;
import quizards.domain.Visibility;

public record UpdateStudySetRequest(
        String title,
        String description,
        Visibility visibility,
        List<FlashcardDraftRequest> flashcards
) {
}
