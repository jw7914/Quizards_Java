package quizards.web;

import java.util.UUID;
import quizards.domain.FlashcardType;
import quizards.domain.MasteryLevel;

public record FlashcardResponse(
        UUID id,
        String prompt,
        String answer,
        FlashcardType type,
        MasteryLevel masteryLevel
) {
}
