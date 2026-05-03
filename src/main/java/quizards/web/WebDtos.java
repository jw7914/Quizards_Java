package quizards.web;

import java.util.List;
import java.util.UUID;
import quizards.model.FlashcardType;
import quizards.model.StudyMode;
import quizards.model.Visibility;

record AuthRequest(String username, String password) {
}

record CreateStudySetRequest(
        String title,
        String description,
        Visibility visibility,
        List<FlashcardDraftRequest> flashcards
) {
}

record FlashcardDraftRequest(
        String prompt,
        String answer,
        FlashcardType type,
        List<String> choices
) {
}

record GenerateStudySetRequest(
        String prompt,
        Visibility visibility,
        FlashcardType cardType
) {
}

record SaveGeneratedStudySetRequest(
        String title,
        String description,
        Visibility visibility,
        List<FlashcardDraftRequest> flashcards
) {
}

record UpdateStudySetRequest(
        String title,
        String description,
        Visibility visibility,
        List<FlashcardDraftRequest> flashcards
) {
}

record UpdateStudySetVisibilityRequest(
        Visibility visibility
) {
}

record AuthUserResponse(boolean authenticated, Long id, String username) {
}

record FlashcardDraftResponse(
        String prompt,
        String answer,
        FlashcardType type,
        List<String> choices
) {
}

record FlashcardResponse(
        UUID id,
        String prompt,
        String answer,
        List<String> choices,
        FlashcardType type
) {
}

record GeneratedDeckResponse(
        String title,
        String summary,
        List<String> keyTakeaways,
        List<FlashcardDraftResponse> flashcards
) {
}

record StudySessionCardResponse(
        UUID id,
        String prompt,
        String answer,
        List<String> choices,
        FlashcardType type
) {
}

record StudySessionResponse(
        UUID studySetId,
        StudyMode mode,
        int currentIndex,
        int correctAnswers,
        long timeLimitSeconds,
        int totalCards,
        List<StudySessionCardResponse> queue
) {
}

record StudySetDetailResponse(
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

record StudySetResponse(
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
