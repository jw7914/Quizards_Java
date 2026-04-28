package quizards.validation;

import quizards.exception.EmptyCardException;
import quizards.exception.ValidationException;
import quizards.model.Flashcard;
import quizards.model.QuizFlashcard;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

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

    public void requireCompleteFlashcards(List<Flashcard> flashcards, String fieldName) {
        if (flashcards == null) {
            return;
        }

        for (int index = 0; index < flashcards.size(); index++) {
            Flashcard flashcard = flashcards.get(index);
            String cardField = fieldName + "[" + index + "]";
            boolean promptBlank = flashcard.getPrompt().isBlank();
            boolean answerBlank = flashcard.getAnswer().isBlank();

            if (flashcard instanceof QuizFlashcard quizFlashcard) {
                List<String> choices = quizFlashcard.getChoices();
                boolean allChoicesBlank = choices.isEmpty() || choices.stream().allMatch(String::isBlank);
                if (promptBlank && answerBlank && allChoicesBlank) {
                    throw new EmptyCardException(cardField + " must not be empty.");
                }
            } else if (promptBlank && answerBlank) {
                throw new EmptyCardException(cardField + " must not be empty.");
            }

            requireNonBlank(flashcard.getPrompt(), cardField + ".prompt");
            requireNonBlank(flashcard.getAnswer(), cardField + ".answer");

            if (flashcard instanceof QuizFlashcard quizFlashcard) {
                List<String> choices = quizFlashcard.getChoices();
                if (choices.isEmpty()) {
                    throw new ValidationException(cardField + ".choices must not be empty.");
                }
                for (int choiceIndex = 0; choiceIndex < choices.size(); choiceIndex++) {
                    requireNonBlank(choices.get(choiceIndex), cardField + ".choices[" + choiceIndex + "]");
                }
            }
        }
    }
}
