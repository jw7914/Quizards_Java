package quizards.web;

import quizards.domain.Visibility;

public record CreateStudySetRequest(
        String title,
        String description,
        Visibility visibility
) {
}
