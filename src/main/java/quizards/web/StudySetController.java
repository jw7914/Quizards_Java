package quizards.web;

import quizards.ai.AIService;
import quizards.ai.GeneratedDeck;
import quizards.domain.Visibility;
import quizards.model.StudySet;
import quizards.service.StudySetService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
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

    @PostMapping("/ai/generate-study-set")
    public StudySetResponse generateStudySet(@RequestBody GenerateStudySetRequest request, Authentication authentication) {
        GeneratedDeck generatedDeck = aiService.generateFlashcardsFromPrompt(request.prompt());
        AppUserEntity owner = requireOwner(authentication);

        StudySet studySet = studySetService.createStudySet(
                owner,
                generatedDeck.title(),
                generatedDeck.summary(),
                request.visibility() == null ? Visibility.PRIVATE : request.visibility(),
                generatedDeck.flashcards()
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
}
