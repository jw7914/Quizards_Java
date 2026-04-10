package quizards.web;

import quizards.ai.AIService;
import quizards.ai.GeneratedDeck;
import quizards.domain.Visibility;
import quizards.model.StudySet;
import quizards.model.TextFlashcard;
import quizards.service.StudySetService;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
    private final AIService aiService;
    private final AuthService authService;

    public StudySetController(StudySetService studySetService, AIService aiService, AuthService authService) {
        this.studySetService = studySetService;
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

    @PostMapping("/study-sets")
    public StudySetResponse createStudySet(@RequestBody CreateStudySetRequest request, Authentication authentication) {
        AppUserEntity owner = requireOwner(authentication);
        StudySet studySet = studySetService.createStudySet(
                owner,
                request.title(),
                request.description(),
                request.visibility() == null ? Visibility.PRIVATE : request.visibility()
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
        GeneratedDeck generatedDeck = aiService.generateFlashcardsFromPrompt(request.prompt());
        return toDraftResponse(generatedDeck);
    }

    @PostMapping("/ai/save-generated-study-set")
    public StudySetResponse saveGeneratedStudySet(@RequestBody SaveGeneratedStudySetRequest request, Authentication authentication) {
        AppUserEntity owner = requireOwner(authentication);
        List<TextFlashcard> flashcards = new ArrayList<>();
        if (request.flashcards() != null) {
            request.flashcards().forEach(card -> flashcards.add(new TextFlashcard(
                    UUID.randomUUID(),
                    card.prompt(),
                    card.answer()
            )));
        }

        StudySet studySet = studySetService.createStudySetFromDraft(
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
                        .map(card -> new FlashcardDraftResponse(card.getPrompt(), card.getAnswer()))
                        .toList()
        );
    }

    private StudySetDetailResponse toDetailResponse(StudySet studySet) {
        return new StudySetDetailResponse(
                studySet.getId(),
                studySet.getTitle(),
                studySet.getDescription(),
                studySet.getVisibility(),
                studySet.getCards().size(),
                studySet.getCards().stream()
                        .map(card -> new FlashcardResponse(
                                card.getId(),
                                card.getPrompt(),
                                card.getAnswer(),
                                card.getType(),
                                card.getMasteryLevel()
                        ))
                        .toList()
        );
    }
}
