package quizards.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "quizards.ai")
public record AIProperties(Gemini gemini) {

    public boolean hasGeminiApiKey() {
        return gemini != null && gemini.apiKey() != null && !gemini.apiKey().isBlank();
    }

    public record Gemini(String apiKey) {
    }
}
