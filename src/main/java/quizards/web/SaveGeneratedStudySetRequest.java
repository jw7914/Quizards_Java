package quizards.web;

import java.util.List;
import quizards.domain.Visibility;

public record SaveGeneratedStudySetRequest(
        String title,
        String description,
        Visibility visibility,
        List<FlashcardDraftRequest> flashcards
) {
}
