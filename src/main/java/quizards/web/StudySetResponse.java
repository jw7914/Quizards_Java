package quizards.web;

import java.util.UUID;
import quizards.domain.FlashcardType;
import quizards.domain.Visibility;

public record StudySetResponse(
        UUID id,
        String title,
        String description,
        Visibility visibility,
        FlashcardType deckType,
        boolean createdByAi,
        String ownerUsername,
        int flashcardCount
) {
}
