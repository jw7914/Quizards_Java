package quizards;

import quizards.ai.AIProperties;
import quizards.ai.AIService;
import quizards.ai.GeminiAIService;
import quizards.ai.StubAIService;
import quizards.validation.InputValidator;
import java.util.concurrent.Executor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

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
    Executor aiExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix("quizards-ai-");
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(20);
        executor.initialize();
        return executor;
    }

    @Bean
    AIService aiService(AIProperties aiProperties, Executor aiExecutor) {
        if (!aiProperties.hasGeminiApiKey()) {
            return new StubAIService();
        }
        return new GeminiAIService(aiProperties.gemini().apiKey(), aiExecutor);
    }
}
