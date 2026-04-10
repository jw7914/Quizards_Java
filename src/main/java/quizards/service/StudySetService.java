package quizards.service;

import quizards.domain.Visibility;
import quizards.exception.AccessDeniedException;
import quizards.model.StudySet;
import quizards.model.User;
import quizards.validation.InputValidator;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class StudySetService {

    private final List<StudySet> demoStudySets = new ArrayList<>();
    private final InputValidator inputValidator;

    public StudySetService(InputValidator inputValidator) {
        this.inputValidator = inputValidator;
        seedDemoStudySet();
    }

    public List<StudySet> findPublicStudySets() {
        return List.copyOf(demoStudySets);
    }

    public Optional<StudySet> findById(UUID studySetId) {
        return demoStudySets.stream()
                .filter(studySet -> studySet.getId().equals(studySetId))
                .findFirst();
    }

    public StudySet createStudySet(User owner, String title, String description, Visibility visibility) {
        inputValidator.requireNonBlank(title, "title");
        inputValidator.requireNonBlank(description, "description");

        StudySet studySet = new StudySet(UUID.randomUUID(), title, description, visibility);
        owner.addStudySet(studySet);
        demoStudySets.add(studySet);
        return studySet;
    }

    public StudySet getAccessibleStudySet(UUID studySetId, long userId) {
        StudySet studySet = findById(studySetId)
                .orElseThrow(() -> new IllegalArgumentException("Study set not found."));
        if (!studySet.canBeViewedBy(userId) && studySet.getVisibility() != Visibility.PUBLIC) {
            throw new AccessDeniedException("You do not have access to this study set.");
        }
        return studySet;
    }

    private void seedDemoStudySet() {
        StudySet demoSet = new StudySet(
                UUID.randomUUID(),
                "Intro to Quizards",
                "Starter deck that shows how study sets can be modeled.",
                Visibility.PUBLIC
        );
        demoStudySets.add(demoSet);
    }
}
