package quizards.web;

import java.util.List;
import java.util.UUID;
import quizards.domain.FlashcardType;

public record StudySessionCardResponse(
        UUID id,
        String prompt,
        String answer,
        List<String> choices,
        FlashcardType type
) {
}
