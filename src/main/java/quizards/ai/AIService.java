package quizards.ai;

public interface AIService {

    String summarizeNotes(String notes);

    GeneratedDeck generateFlashcardsFromNotes(String notes);

    GeneratedDeck generateFlashcardsFromPrompt(String prompt);
}
