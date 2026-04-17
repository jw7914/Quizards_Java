package quizards.web;

import java.util.Map;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import quizards.exception.AccessDeniedException;
import quizards.exception.AIProviderException;
import quizards.exception.EmptyDeckException;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleBadRequest(IllegalArgumentException exception) {
        return Map.of("error", exception.getMessage());
    }

    @ExceptionHandler(EmptyDeckException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleEmptyDeck(EmptyDeckException exception) {
        return Map.of("error", exception.getMessage());
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public Map<String, String> handleAccessDenied(AccessDeniedException exception) {
        return Map.of("error", exception.getMessage());
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String, String> handleBadCredentials(BadCredentialsException exception) {
        return Map.of("error", "Invalid username or password.");
    }

    @ExceptionHandler(AIProviderException.class)
    @ResponseStatus(HttpStatus.BAD_GATEWAY)
    public Map<String, String> handleAiProvider(AIProviderException exception) {
        String causeMessage = exception.getCause() != null ? exception.getCause().getMessage() : null;
        return Map.of(
                "error", exception.getMessage(),
                "details", causeMessage == null || causeMessage.isBlank() ? "No provider details available." : causeMessage
        );
    }

    @ExceptionHandler({CompletionException.class, ExecutionException.class})
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public Map<String, String> handleAsyncWrapper(Exception exception) {
        Throwable root = unwrapAsyncException(exception);

        if (root instanceof AIProviderException aiProviderException) {
            String causeMessage = aiProviderException.getCause() != null ? aiProviderException.getCause().getMessage() : null;
            return Map.of(
                    "error", aiProviderException.getMessage(),
                    "details", causeMessage == null || causeMessage.isBlank() ? "No provider details available." : causeMessage
            );
        }
        if (root instanceof IllegalArgumentException illegalArgumentException) {
            return Map.of("error", illegalArgumentException.getMessage());
        }
        if (root instanceof AccessDeniedException accessDeniedException) {
            return Map.of("error", accessDeniedException.getMessage());
        }

        String message = root.getMessage();
        return Map.of("error", message == null || message.isBlank() ? "Request failed." : message);
    }

    private Throwable unwrapAsyncException(Throwable throwable) {
        Throwable current = throwable;
        while ((current instanceof CompletionException || current instanceof ExecutionException) && current.getCause() != null) {
            current = current.getCause();
        }
        return current;
    }
}
