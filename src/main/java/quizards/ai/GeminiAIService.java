package quizards.ai;

import static dev.langchain4j.model.chat.Capability.RESPONSE_FORMAT_JSON_SCHEMA;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.output.structured.Description;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import java.util.List;
import java.util.UUID;
import quizards.exception.AIProviderException;
import quizards.model.Flashcard;
import quizards.model.TextFlashcard;

public class GeminiAIService implements AIService {

    private final QuizardsSummaryAssistant summaryAssistant;
    private final QuizardsDeckAssistant deckAssistant;

    public GeminiAIService(String apiKey) {
        ChatModel chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-2.5-flash")
                .temperature(0.2)
                .supportedCapabilities(RESPONSE_FORMAT_JSON_SCHEMA)
                .build();

        this.summaryAssistant = AiServices.create(QuizardsSummaryAssistant.class, chatModel);
        this.deckAssistant = AiServices.create(QuizardsDeckAssistant.class, chatModel);
    }

    @Override
    public String summarizeNotes(String notes) {
        try {
            SummaryPayload payload = summaryAssistant.summarize(notes);
            return payload.summary();
        } catch (RuntimeException exception) {
            throw new AIProviderException("Unable to summarize notes with Gemini via LangChain4j.", exception);
        }
    }

    @Override
    public GeneratedDeck generateFlashcardsFromNotes(String notes) {
        return generateDeck("""
                Create a study set from the student's notes.
                Focus on the important concepts, definitions, and likely review questions.

                Notes:
                %s
                """.formatted(notes));
    }

    @Override
    public GeneratedDeck generateFlashcardsFromPrompt(String prompt) {
        return generateDeck(prompt);
    }

    private GeneratedDeck generateDeck(String prompt) {
        try {
            StudySetDraft draft = deckAssistant.generate(prompt);
            List<Flashcard> flashcards = draft.flashcards().stream()
                    .map(card -> new TextFlashcard(UUID.randomUUID(), card.prompt(), card.answer()))
                    .map(Flashcard.class::cast)
                    .toList();

            if (flashcards.isEmpty()) {
                throw new AIProviderException("Gemini returned no flashcards.");
            }

            return new GeneratedDeck(
                    draft.title(),
                    draft.summary(),
                    draft.keyTakeaways(),
                    flashcards
            );
        } catch (RuntimeException exception) {
            throw new AIProviderException("Unable to generate a study set with Gemini via LangChain4j.", exception);
        }
    }

    @SystemMessage("""
            You are Quizards, an educational study assistant.
            Produce concise, accurate summaries for students.
            Prioritize the concepts they need to review and retain.
            """)
    interface QuizardsSummaryAssistant {

        @UserMessage("""
                Summarize these notes in 2 to 4 sentences.
                Keep the wording clear for a student preparing to study.

                {{notes}}
                """)
        SummaryPayload summarize(String notes);
    }

    @SystemMessage("""
            You are Quizards, an educational study assistant.
            Build study sets that match the student's topic or notes.
            The deck should be accurate, concise, and useful for active recall.
            """)
    interface QuizardsDeckAssistant {

        @UserMessage("""
                Generate a study set from the student's request or notes below.
                Include a short title, a brief summary, 3 to 5 key takeaways, and 4 to 8 flashcards.
                Flashcards should be direct, factually correct, and useful for review.

                {{prompt}}
                """)
        StudySetDraft generate(String prompt);
    }

    @Description("A concise notes summary for the student.")
    record SummaryPayload(
            @JsonProperty(required = true)
            @Description("A summary in 2 to 4 sentences.")
            String summary
    ) {
    }

    @Description("A generated study set draft.")
    record StudySetDraft(
            @JsonProperty(required = true)
            @Description("A short study set title.")
            String title,

            @JsonProperty(required = true)
            @Description("A 1 to 2 sentence topic summary.")
            String summary,

            @JsonProperty(required = true)
            @Description("Three to five important takeaways from the topic.")
            List<String> keyTakeaways,

            @JsonProperty(required = true)
            @Description("Four to eight flashcards for student review.")
            List<StudyFlashcardDraft> flashcards
    ) {
    }

    @Description("A single text flashcard draft.")
    record StudyFlashcardDraft(
            @JsonProperty(required = true)
            @Description("The flashcard question or study cue.")
            String prompt,

            @JsonProperty(required = true)
            @Description("The flashcard answer.")
            String answer
    ) {
    }
}
