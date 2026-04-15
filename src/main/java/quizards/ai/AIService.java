package quizards.ai;

import quizards.domain.FlashcardType;

public interface AIService {

    String summarizeNotes(String notes);

    GeneratedDeck generateFlashcardsFromNotes(String notes);

    GeneratedDeck generateFlashcardsFromPrompt(String prompt, FlashcardType cardType);
}
