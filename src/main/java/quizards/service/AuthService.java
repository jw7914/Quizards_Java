package quizards.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import quizards.model.User;
import quizards.repository.AppUserRepository;
import quizards.persistence.AppUserEntity;
import quizards.validation.InputValidator;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final InputValidator inputValidator;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder, InputValidator inputValidator) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.inputValidator = inputValidator;
    }

    public User register(String username, String rawPassword) {
        inputValidator.requireNonBlank(username, "username");
        inputValidator.requireNonBlank(rawPassword, "password");

        String normalizedUsername = username.trim();
        if (normalizedUsername.length() < 3) {
            throw new IllegalArgumentException("Username must be at least 3 characters.");
        }
        if (rawPassword.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }
        if (appUserRepository.existsByUsername(normalizedUsername)) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        AppUserEntity savedUser = appUserRepository.save(new AppUserEntity(
                normalizedUsername,
                passwordEncoder.encode(rawPassword)
        ));
        return toModel(savedUser);
    }

    public User findByUsername(String username) {
        return appUserRepository.findByUsername(username)
                .map(this::toModel)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    public AppUserEntity requireEntityByUsername(String username) {
        return appUserRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
    }

    private User toModel(AppUserEntity entity) {
        return new User(entity.getId(), entity.getUsername());
    }
}
