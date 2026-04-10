package quizards.web;

import java.util.List;

public record GeneratedDeckResponse(
        String title,
        String summary,
        List<String> keyTakeaways,
        List<FlashcardDraftResponse> flashcards
) {
}
