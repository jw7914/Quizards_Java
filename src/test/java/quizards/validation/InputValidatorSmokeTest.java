package quizards.validation;

import quizards.exception.ValidationException;
import java.nio.file.Path;

public class InputValidatorSmokeTest {

    public static void main(String[] args) {
        InputValidator validator = new InputValidator();
        verifyDateParsing(validator);
        verifyMissingFileFails(validator);
        verifyExistingFilePasses(validator);
    }

    private static void verifyDateParsing(InputValidator validator) {
        if (validator.parseDate("2026-04-10", "dueDate").getYear() != 2026) {
            throw new AssertionError("Expected a parsed year of 2026.");
        }
    }

    private static void verifyMissingFileFails(InputValidator validator) {
        try {
            validator.requireReadableFile(Path.of("missing.txt"), "proposalFile");
            throw new AssertionError("Expected ValidationException for a missing file.");
        } catch (ValidationException ignored) {
            // Expected path for the smoke test.
        }
    }

    private static void verifyExistingFilePasses(InputValidator validator) {
        validator.requireReadableFile(Path.of("pom.xml"), "proposalFile");
    }
}
