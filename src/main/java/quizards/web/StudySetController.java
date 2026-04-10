package quizards.web;

import quizards.ai.AIService;
import quizards.ai.GeneratedDeck;
import quizards.domain.Visibility;
import quizards.model.StudySet;
import quizards.model.User;
import quizards.service.StudySetService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StudySetController {

    private final StudySetService studySetService;
    private final AIService aiService;

    public StudySetController(StudySetService studySetService, AIService aiService) {
        this.studySetService = studySetService;
        this.aiService = aiService;
    }

    @GetMapping("/study-sets")
    public List<StudySet> getPublicStudySets() {
        return studySetService.findPublicStudySets();
    }

    @PostMapping("/study-sets")
    public StudySet createStudySet(@RequestBody CreateStudySetRequest request) {
        User placeholderUser = new User(1L, "demo-user");
        return studySetService.createStudySet(
                placeholderUser,
                request.title(),
                request.description(),
                request.visibility() == null ? Visibility.PRIVATE : request.visibility()
        );
    }

    @GetMapping("/notes/summary")
    public String summarizeNotes(@RequestParam String notes) {
        return aiService.summarizeNotes(notes);
    }

    @PostMapping("/ai/generate-study-set")
    public StudySet generateStudySet(@RequestBody GenerateStudySetRequest request) {
        GeneratedDeck generatedDeck = aiService.generateFlashcardsFromPrompt(request.prompt());
        User placeholderUser = new User(1L, "demo-user");

        StudySet studySet = studySetService.createStudySet(
                placeholderUser,
                generatedDeck.title(),
                generatedDeck.summary(),
                request.visibility() == null ? Visibility.PRIVATE : request.visibility()
        );
        generatedDeck.flashcards().forEach(studySet::addCard);
        return studySet;
    }
}
