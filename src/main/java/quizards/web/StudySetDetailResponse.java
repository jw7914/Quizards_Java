package quizards.web;

import java.util.List;
import java.util.UUID;
import quizards.domain.FlashcardType;
import quizards.domain.Visibility;

public record StudySetDetailResponse(
        UUID id,
        Long ownerId,
        String title,
        String description,
        Visibility visibility,
        FlashcardType deckType,
        boolean createdByAi,
        int flashcardCount,
        List<FlashcardResponse> flashcards
) {
}
