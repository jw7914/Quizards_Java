package quizards.web;

public record FlashcardDraftRequest(
        String prompt,
        String answer
) {
}
