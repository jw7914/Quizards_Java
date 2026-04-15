package quizards.web;

import java.util.List;
import quizards.domain.FlashcardType;

public record FlashcardDraftRequest(
        String prompt,
        String answer,
        FlashcardType type,
        List<String> choices
) {
}
