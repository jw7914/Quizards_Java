package quizards.web;

import quizards.domain.Visibility;

public record UpdateStudySetVisibilityRequest(
        Visibility visibility
) {
}
