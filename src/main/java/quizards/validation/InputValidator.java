package quizards.validation;

import quizards.exception.ValidationException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;

public class InputValidator {

    public void requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new ValidationException(fieldName + " must not be blank.");
        }
    }

    public LocalDate parseDate(String value, String fieldName) {
        requireNonBlank(value, fieldName);
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            throw new ValidationException(fieldName + " must use ISO format yyyy-MM-dd.");
        }
    }

    public void requireReadableFile(Path path, String fieldName) {
        if (path == null || !Files.isRegularFile(path) || !Files.isReadable(path)) {
            throw new ValidationException(fieldName + " must point to a readable file.");
        }
    }
}
