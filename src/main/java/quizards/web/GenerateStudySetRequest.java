package quizards.web;

import quizards.domain.Visibility;

public record GenerateStudySetRequest(
        String prompt,
        Visibility visibility
) {
}
