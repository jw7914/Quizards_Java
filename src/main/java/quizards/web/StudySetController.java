package quizards.web;

import quizards.ai.AIService;
import quizards.ai.GeneratedDeck;
import quizards.domain.FlashcardType;
import quizards.domain.StudyMode;
import quizards.domain.Visibility;
import quizards.model.Flashcard;
import quizards.model.QuizFlashcard;
import quizards.model.StudySet;
import quizards.model.TextFlashcard;
import quizards.service.StudySetService;
import quizards.service.StudySessionService;
import quizards.study.StudySession;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import quizards.persistence.AppUserEntity;
import quizards.service.AuthService;

@RestController
@RequestMapping("/api")
public class StudySetController {

    private final StudySetService studySetService;
    private final StudySessionService studySessionService;
    private final AIService aiService;
    private final AuthService authService;

    public StudySetController(
            StudySetService studySetService,
            StudySessionService studySessionService,
            AIService aiService,
            AuthService authService
    ) {
        this.studySetService = studySetService;
        this.studySessionService = studySessionService;
        this.aiService = aiService;
        this.authService = authService;
    }

    @GetMapping("/study-sets")
    public List<StudySetResponse> getPublicStudySets() {
        return studySetService.findPublicStudySets().stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/my/study-sets")
    public List<StudySetResponse> getMyStudySets(Authentication authentication) {
        AppUserEntity owner = requireOwner(authentication);
        return studySetService.findStudySetsForOwner(owner.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/study-sets/{studySetId}")
    public StudySetDetailResponse getStudySet(@PathVariable UUID studySetId, Authentication authentication) {
        long userId = -1L;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            userId = requireOwner(authentication).getId();
        }
        StudySet studySet = studySetService.getAccessibleStudySet(studySetId, userId);
        return toDetailResponse(studySet);
    }

    @GetMapping("/study-sets/{studySetId}/study-session")
    public StudySessionResponse getStudySession(
            @PathVariable UUID studySetId,
            @RequestParam(defaultValue = "LEITNER") StudyMode mode,
            @RequestParam(required = false) Integer timeLimitMinutes,
            Authentication authentication
    ) {
        long userId = -1L;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            userId = requireOwner(authentication).getId();
        }

        StudySet studySet = studySetService.getAccessibleStudySet(studySetId, userId);
        if (!studySet.isQuizDeck()) {
            throw new IllegalArgumentException("Study engines are only available for quiz decks.");
        }
        StudySession session = studySessionService.startSession(studySet, mode, timeLimitMinutes);
        return toStudySessionResponse(studySetId, session);
    }

    @DeleteMapping("/study-sets/{studySetId}")
    public void deleteStudySet(@PathVariable UUID studySetId, Authentication authentication) {
        AppUserEntity owner = requireOwner(authentication);
        studySetService.deleteStudySet(studySetId, owner.getId());
    }

    @PatchMapping("/study-sets/{studySetId}/visibility")
    public StudySetResponse updateStudySetVisibility(
            @PathVariable UUID studySetId,
            @RequestBody UpdateStudySetVisibilityRequest request,
            Authentication authentication
    ) {
        AppUserEntity owner = requireOwner(authentication);
        StudySet studySet = studySetService.updateVisibility(
                studySetId,
                owner.getId(),
                request.visibility() == null ? Visibility.PRIVATE : request.visibility()
        );
        return toResponse(studySet, owner.getUsername());
    }

    @PostMapping("/study-sets")
    public StudySetResponse createStudySet(@RequestBody CreateStudySetRequest request, Authentication authentication) {
        AppUserEntity owner = requireOwner(authentication);
        List<Flashcard> flashcards = new ArrayList<>();
        if (request.flashcards() != null) {
            request.flashcards().forEach(card -> flashcards.add(toFlashcard(card)));
        }

        StudySet studySet = flashcards.isEmpty()
                ? studySetService.createStudySet(
                        owner,
                        request.title(),
                        request.description(),
                        request.visibility() == null ? Visibility.PRIVATE : request.visibility()
                )
                : studySetService.createStudySet(
                        owner,
                        request.title(),
                        request.description(),
                        request.visibility() == null ? Visibility.PRIVATE : request.visibility(),
                        flashcards
                );
        return toResponse(studySet, owner.getUsername());
    }

    @GetMapping("/notes/summary")
    public String summarizeNotes(@RequestParam String notes) {
        return aiService.summarizeNotes(notes);
    }

    @PostMapping("/ai/generate-draft")
    public GeneratedDeckResponse generateDraft(@RequestBody GenerateStudySetRequest request, Authentication authentication) {
        requireOwner(authentication);
        GeneratedDeck generatedDeck = aiService.generateFlashcardsFromPrompt(
                request.prompt(),
                request.cardType() == null ? FlashcardType.TEXT : request.cardType()
        );
        return toDraftResponse(generatedDeck);
    }

    @PostMapping("/ai/save-generated-study-set")
    public StudySetResponse saveGeneratedStudySet(@RequestBody SaveGeneratedStudySetRequest request, Authentication authentication) {
        AppUserEntity owner = requireOwner(authentication);
        List<Flashcard> flashcards = new ArrayList<>();
        if (request.flashcards() != null) {
            request.flashcards().forEach(card -> flashcards.add(toFlashcard(card)));
        }

        StudySet studySet = studySetService.createStudySet(
                owner,
                request.title(),
                request.description(),
                request.visibility() == null ? Visibility.PRIVATE : request.visibility(),
                flashcards
        );
        return toResponse(studySet, owner.getUsername());
    }

    private AppUserEntity requireOwner(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new IllegalArgumentException("You must be logged in.");
        }
        return authService.requireEntityByUsername(authentication.getName());
    }

    private StudySetResponse toResponse(StudySet studySet) {
        return new StudySetResponse(
                studySet.getId(),
                studySet.getTitle(),
                studySet.getDescription(),
                studySet.getVisibility(),
                studySet.getDeckCardType(),
                null,
                studySet.getCards().size()
        );
    }

    private StudySetResponse toResponse(StudySet studySet, String ownerUsername) {
        return new StudySetResponse(
                studySet.getId(),
                studySet.getTitle(),
                studySet.getDescription(),
                studySet.getVisibility(),
                studySet.getDeckCardType(),
                ownerUsername,
                studySet.getCards().size()
        );
    }

    private GeneratedDeckResponse toDraftResponse(GeneratedDeck generatedDeck) {
        return new GeneratedDeckResponse(
                generatedDeck.title(),
                generatedDeck.summary(),
                generatedDeck.keyTakeaways(),
                generatedDeck.flashcards().stream()
                        .map(card -> new FlashcardDraftResponse(
                                card.getPrompt(),
                                card.getAnswer(),
                                card.getType(),
                                card instanceof QuizFlashcard quizFlashcard ? quizFlashcard.getChoices() : List.of()
                        ))
                        .toList()
        );
    }

    private StudySetDetailResponse toDetailResponse(StudySet studySet) {
        return new StudySetDetailResponse(
                studySet.getId(),
                studySet.getTitle(),
                studySet.getDescription(),
                studySet.getVisibility(),
                studySet.getDeckCardType(),
                studySet.getCards().size(),
                studySet.getCards().stream()
                        .map(card -> new FlashcardResponse(
                                card.getId(),
                                card.getPrompt(),
                                card.getAnswer(),
                                card instanceof QuizFlashcard quizFlashcard ? quizFlashcard.getChoices() : List.of(),
                                card.getType(),
                                card.getMasteryLevel()
                        ))
                        .toList()
        );
    }

    private StudySessionResponse toStudySessionResponse(UUID studySetId, StudySession session) {
        return new StudySessionResponse(
                studySetId,
                session.mode(),
                session.currentIndex(),
                session.correctAnswers(),
                session.timeLimit().toSeconds(),
                session.queue().size(),
                session.queue().stream()
                        .map(this::toStudySessionCardResponse)
                        .toList()
        );
    }

    private StudySessionCardResponse toStudySessionCardResponse(Flashcard card) {
        return new StudySessionCardResponse(
                card.getId(),
                card.getPrompt(),
                card.getAnswer(),
                card instanceof QuizFlashcard quizFlashcard ? quizFlashcard.getChoices() : List.of(),
                card.getType(),
                card.getMasteryLevel()
        );
    }

    private Flashcard toFlashcard(FlashcardDraftRequest card) {
        FlashcardType type = card.type() == null ? FlashcardType.TEXT : card.type();
        if (type == FlashcardType.QUIZ) {
            List<String> choices = card.choices() == null
                    ? List.of()
                    : card.choices().stream()
                            .map(choice -> choice == null ? "" : choice.trim())
                            .filter(choice -> !choice.isBlank())
                            .collect(Collectors.toList());
            return new QuizFlashcard(
                    UUID.randomUUID(),
                    card.prompt(),
                    card.answer(),
                    choices
            );
        }

        return new TextFlashcard(
                UUID.randomUUID(),
                card.prompt(),
                card.answer()
        );
    }
}
