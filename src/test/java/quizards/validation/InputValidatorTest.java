package quizards.validation;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import quizards.exception.ValidationException;

class InputValidatorTest {

    private final InputValidator validator = new InputValidator();

    @Test
    void requireNonBlankRejectsNull() {
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> validator.requireNonBlank(null, "title")
        );

        assertEquals("title must not be blank.", exception.getMessage());
    }

    @Test
    void requireNonBlankRejectsWhitespaceOnlyValues() {
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> validator.requireNonBlank("   ", "description")
        );

        assertEquals("description must not be blank.", exception.getMessage());
    }

    @Test
    void requireNonBlankAllowsNormalText() {
        assertDoesNotThrow(() -> validator.requireNonBlank("Deck title", "title"));
    }

    @Test
    void parseDateReturnsParsedDateForIsoInput() {
        assertEquals(2026, validator.parseDate("2026-04-10", "dueDate").getYear());
        assertEquals(4, validator.parseDate("2026-04-10", "dueDate").getMonthValue());
        assertEquals(10, validator.parseDate("2026-04-10", "dueDate").getDayOfMonth());
    }

    @Test
    void parseDateRejectsInvalidFormat() {
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> validator.parseDate("04/10/2026", "dueDate")
        );

        assertEquals("dueDate must use ISO format yyyy-MM-dd.", exception.getMessage());
    }

    @Test
    void parseDateRejectsBlankInputBeforeParsing() {
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> validator.parseDate(" ", "dueDate")
        );

        assertEquals("dueDate must not be blank.", exception.getMessage());
    }

    @Test
    void requireReadableFileRejectsMissingFiles() {
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> validator.requireReadableFile(Path.of("missing.txt"), "proposalFile")
        );

        assertEquals("proposalFile must point to a readable file.", exception.getMessage());
    }

    @Test
    void requireReadableFileRejectsDirectories() {
        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> validator.requireReadableFile(Path.of("src"), "proposalFile")
        );

        assertEquals("proposalFile must point to a readable file.", exception.getMessage());
    }

    @Test
    void requireReadableFileAcceptsRegularReadableFiles() {
        assertDoesNotThrow(() -> validator.requireReadableFile(Path.of("pom.xml"), "proposalFile"));
    }
}
