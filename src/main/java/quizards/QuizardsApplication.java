package quizards;

import quizards.ai.AIProperties;
import quizards.ai.AIService;
import quizards.ai.GeminiAIService;
import quizards.ai.StubAIService;
import quizards.service.StudySetService;
import quizards.validation.InputValidator;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableConfigurationProperties(AIProperties.class)
public class QuizardsApplication {

    public static void main(String[] args) {
        SpringApplication.run(QuizardsApplication.class, args);
    }

    @Bean
    InputValidator inputValidator() {
        return new InputValidator();
    }

    @Bean
    StudySetService studySetService(InputValidator inputValidator) {
        return new StudySetService(inputValidator);
    }

    @Bean
    AIService aiService(AIProperties aiProperties) {
        if (!aiProperties.hasGeminiApiKey()) {
            return new StubAIService();
        }
        return new GeminiAIService(aiProperties.gemini().apiKey());
    }
}
