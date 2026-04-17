package quizards.ai;

import static dev.langchain4j.model.chat.Capability.RESPONSE_FORMAT_JSON_SCHEMA;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.output.structured.Description;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import quizards.exception.AIProviderException;
import quizards.domain.FlashcardType;
import quizards.model.Flashcard;
import quizards.model.QuizFlashcard;
import quizards.model.TextFlashcard;

public class GeminiAIService implements AIService {

    private static final int DEFAULT_MIN_CARD_COUNT = 4;
    private static final int DEFAULT_MAX_CARD_COUNT = 8;
    private static final int ABSOLUTE_MAX_CARD_COUNT = 20;
    private static final Pattern REQUESTED_DIGIT_COUNT_PATTERN = Pattern.compile(
            "\\b(?:exactly\\s+)?(\\d{1,2})\\s+(?:flashcards?|cards?|questions?|quiz\\s+cards?)\\b"
    );
    private static final Map<String, Integer> REQUESTED_WORD_COUNTS = Map.ofEntries(
            Map.entry("one", 1),
            Map.entry("two", 2),
            Map.entry("three", 3),
            Map.entry("four", 4),
            Map.entry("five", 5),
            Map.entry("six", 6),
            Map.entry("seven", 7),
            Map.entry("eight", 8),
            Map.entry("nine", 9),
            Map.entry("ten", 10),
            Map.entry("eleven", 11),
            Map.entry("twelve", 12),
            Map.entry("thirteen", 13),
            Map.entry("fourteen", 14),
            Map.entry("fifteen", 15),
            Map.entry("sixteen", 16),
            Map.entry("seventeen", 17),
            Map.entry("eighteen", 18),
            Map.entry("nineteen", 19),
            Map.entry("twenty", 20)
    );

    private final QuizardsTextDeckAssistant textDeckAssistant;
    private final QuizardsQuizDeckAssistant quizDeckAssistant;
    private final Executor aiExecutor;

    public GeminiAIService(String apiKey, Executor aiExecutor) {
        ChatModel chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-2.5-flash")
                .temperature(0.2)
                .supportedCapabilities(RESPONSE_FORMAT_JSON_SCHEMA)
                .build();

        this.textDeckAssistant = AiServices.create(QuizardsTextDeckAssistant.class, chatModel);
        this.quizDeckAssistant = AiServices.create(QuizardsQuizDeckAssistant.class, chatModel);
        this.aiExecutor = aiExecutor;
    }

    @Override
    public CompletableFuture<GeneratedDeck> generateFlashcardsFromPrompt(String prompt, FlashcardType cardType) {
        return cardType == FlashcardType.QUIZ ? generateQuizDeck(prompt) : generateTextDeck(prompt);
    }

    private CompletableFuture<GeneratedDeck> generateTextDeck(String prompt) {
        return CompletableFuture.supplyAsync(() -> {
            Integer requestedCount = extractRequestedCardCount(prompt);
            try {
                StudySetDraft draft = textDeckAssistant.generate(buildCardCountInstruction(requestedCount), prompt);
                List<Flashcard> flashcards = normalizeTextFlashcards(draft.flashcards(), requestedCount).stream()
                        .map(card -> new TextFlashcard(UUID.randomUUID(), card.prompt(), card.answer()))
                        .map(Flashcard.class::cast)
                        .toList();

                return new GeneratedDeck(
                        draft.title(),
                        draft.summary(),
                        draft.keyTakeaways(),
                        flashcards
                );
            } catch (RuntimeException exception) {
                throw new AIProviderException("Unable to generate a study set with Gemini via LangChain4j.", exception);
            }
        }, aiExecutor);
    }

    private CompletableFuture<GeneratedDeck> generateQuizDeck(String prompt) {
        return CompletableFuture.supplyAsync(() -> {
            Integer requestedCount = extractRequestedCardCount(prompt);
            try {
                QuizStudySetDraft draft = quizDeckAssistant.generate(buildCardCountInstruction(requestedCount), prompt);
                List<Flashcard> flashcards = normalizeQuizFlashcards(draft.flashcards(), requestedCount).stream()
                        .map(card -> new QuizFlashcard(UUID.randomUUID(), card.prompt(), card.answer(), card.choices()))
                        .map(Flashcard.class::cast)
                        .toList();

                return new GeneratedDeck(
                        draft.title(),
                        draft.summary(),
                        draft.keyTakeaways(),
                        flashcards
                );
            } catch (RuntimeException exception) {
                throw new AIProviderException("Unable to generate a quiz study set with Gemini via LangChain4j.", exception);
            }
        }, aiExecutor);
    }

    @SystemMessage("""
            You are Quizards, an educational study assistant.
            Build study sets that match the student's topic or notes.
            The deck should be accurate, concise, and useful for active recall.
            """)
    interface QuizardsTextDeckAssistant {

        @UserMessage("""
                Generate a study set from the student's request or notes below.
                Include a short title, a brief summary, and 3 to 5 key takeaways.
                {{cardCountInstruction}}
                Flashcards should be direct, factually correct, and useful for review.

                {{prompt}}
                """)
        StudySetDraft generate(String cardCountInstruction, String prompt);
    }

    @SystemMessage("""
            You are Quizards, an educational study assistant.
            Build multiple-choice study sets that match the student's topic or notes.
            Each quiz card must have exactly four answer choices with one correct answer.
            Keep the deck accurate, concise, and useful for practice.
            """)
    interface QuizardsQuizDeckAssistant {

        @UserMessage("""
                Generate a multiple-choice study set from the student's request or notes below.
                Include a short title, a brief summary, and 3 to 5 key takeaways.
                {{cardCountInstruction}}
                Every quiz card must have a prompt, exactly four choices, and the correct answer must exactly match one of the choices.

                {{prompt}}
                """)
        QuizStudySetDraft generate(String cardCountInstruction, String prompt);
    }

    private String buildCardCountInstruction(Integer requestedCount) {
        if (requestedCount != null) {
            return "Return exactly %d flashcards. If the student asks for more than %d, return exactly %d flashcards instead."
                    .formatted(requestedCount, ABSOLUTE_MAX_CARD_COUNT, ABSOLUTE_MAX_CARD_COUNT);
        }
        return "If the student does not ask for a specific number of flashcards, return between %d and %d flashcards."
                .formatted(DEFAULT_MIN_CARD_COUNT, DEFAULT_MAX_CARD_COUNT);
    }

    private Integer extractRequestedCardCount(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return null;
        }

        String normalizedPrompt = prompt.toLowerCase(Locale.ROOT);
        Matcher digitMatcher = REQUESTED_DIGIT_COUNT_PATTERN.matcher(normalizedPrompt);
        if (digitMatcher.find()) {
            return clampRequestedCount(Integer.parseInt(digitMatcher.group(1)));
        }

        for (Map.Entry<String, Integer> entry : REQUESTED_WORD_COUNTS.entrySet()) {
            Pattern wordPattern = Pattern.compile(
                    "\\b(?:exactly\\s+)?" + entry.getKey() + "\\s+(?:flashcards?|cards?|questions?|quiz\\s+cards?)\\b"
            );
            if (wordPattern.matcher(normalizedPrompt).find()) {
                return clampRequestedCount(entry.getValue());
            }
        }

        return null;
    }

    private int clampRequestedCount(int requestedCount) {
        return Math.min(requestedCount, ABSOLUTE_MAX_CARD_COUNT);
    }

    private List<StudyFlashcardDraft> normalizeTextFlashcards(List<StudyFlashcardDraft> flashcards, Integer requestedCount) {
        int expectedCount = requestedCount == null ? DEFAULT_MAX_CARD_COUNT : requestedCount;
        int minimumCount = requestedCount == null ? DEFAULT_MIN_CARD_COUNT : requestedCount;
        return normalizeFlashcards(flashcards, minimumCount, expectedCount, "flashcards");
    }

    private List<QuizFlashcardDraft> normalizeQuizFlashcards(List<QuizFlashcardDraft> flashcards, Integer requestedCount) {
        int expectedCount = requestedCount == null ? DEFAULT_MAX_CARD_COUNT : requestedCount;
        int minimumCount = requestedCount == null ? DEFAULT_MIN_CARD_COUNT : requestedCount;
        return normalizeFlashcards(flashcards, minimumCount, expectedCount, "quiz flashcards");
    }

    private <T> List<T> normalizeFlashcards(List<T> flashcards, int minimumCount, int maximumCount, String label) {
        if (flashcards == null || flashcards.isEmpty()) {
            throw new AIProviderException("Gemini returned no " + label + ".");
        }
        if (flashcards.size() < minimumCount) {
            throw new AIProviderException("Gemini returned %d %s, but at least %d were required."
                    .formatted(flashcards.size(), label, minimumCount));
        }
        if (flashcards.size() <= maximumCount) {
            return flashcards;
        }
        return new ArrayList<>(flashcards.subList(0, maximumCount));
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
            @Description("Flashcards for student review. Return exactly the requested count up to twenty, otherwise return four to eight.")
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

    @Description("A generated multiple-choice study set draft.")
    record QuizStudySetDraft(
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
            @Description("Multiple-choice cards for student review. Return exactly the requested count up to twenty, otherwise return four to eight.")
            List<QuizFlashcardDraft> flashcards
    ) {
    }

    @Description("A single multiple-choice flashcard draft.")
    record QuizFlashcardDraft(
            @JsonProperty(required = true)
            @Description("The quiz question.")
            String prompt,

            @JsonProperty(required = true)
            @Description("Exactly four choices with one correct answer included.")
            List<String> choices,

            @JsonProperty(required = true)
            @Description("The correct answer text. It must match one of the choices exactly.")
            String answer
    ) {
    }
}
