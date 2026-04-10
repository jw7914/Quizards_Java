package quizards.web;

import java.util.List;
import java.util.UUID;
import quizards.domain.Visibility;

public record StudySetDetailResponse(
        UUID id,
        String title,
        String description,
        Visibility visibility,
        int flashcardCount,
        List<FlashcardResponse> flashcards
) {
}
