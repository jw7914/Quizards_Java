package quizards.web;

import java.util.UUID;
import quizards.domain.Visibility;

public record StudySetResponse(
        UUID id,
        String title,
        String description,
        Visibility visibility,
        String ownerUsername,
        int flashcardCount
) {
}
