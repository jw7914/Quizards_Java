package quizards.web;

public record AuthUserResponse(boolean authenticated, Long id, String username) {
}
