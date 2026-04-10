package quizards.model;

import quizards.domain.StudyMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class User {

    private final long id;
    private String username;
    private StudyMode preferredStudyMode;
    private int studySetsAttempted;
    private int studySessionsCompleted;
    private final List<StudySet> ownedStudySets;

    public User(long id, String username) {
        this.id = id;
        this.username = Objects.requireNonNull(username, "username must not be null");
        this.preferredStudyMode = StudyMode.LEITNER;
        this.ownedStudySets = new ArrayList<>();
    }

    public long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = Objects.requireNonNull(username, "username must not be null");
    }

    public StudyMode getPreferredStudyMode() {
        return preferredStudyMode;
    }

    public void setPreferredStudyMode(StudyMode preferredStudyMode) {
        this.preferredStudyMode = Objects.requireNonNull(preferredStudyMode, "preferredStudyMode must not be null");
    }

    public int getStudySetsAttempted() {
        return studySetsAttempted;
    }

    public int getStudySessionsCompleted() {
        return studySessionsCompleted;
    }

    public List<StudySet> getOwnedStudySets() {
        return List.copyOf(ownedStudySets);
    }

    public void addStudySet(StudySet studySet) {
        ownedStudySets.add(Objects.requireNonNull(studySet, "studySet must not be null"));
    }

    public void incrementStudySetsAttempted() {
        studySetsAttempted++;
    }

    public void incrementStudySessionsCompleted() {
        studySessionsCompleted++;
    }
}
