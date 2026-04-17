# Quizards

Quizards is a Spring Boot backend for creating, storing, generating, and studying flashcard decks. The Java application serves a React single-page frontend, exposes REST endpoints under `/api`, persists users and study sets with Spring Data JPA, and can optionally call Gemini through LangChain4j to generate draft decks.

This README focuses on the Java backend and describes each major backend component in detail.

## Backend Stack

- Java 17
- Spring Boot 3.3.5
- Spring Web for REST controllers and SPA hosting
- Spring Data JPA for persistence
- Spring Security for session-based authentication
- PostgreSQL for storage
- LangChain4j + Google Gemini for AI-generated study content

## Application Entry Point

`src/main/java/quizards/QuizardsApplication.java`

This is the Spring Boot bootstrap class. It does three important things:

- Starts the application with `SpringApplication.run(...)`
- Registers `InputValidator` as a Spring bean so services can reuse the same validation helper
- Registers the `AIService` implementation dynamically

The AI bean selection is configuration-driven:

- If `quizards.ai.gemini.api-key` is blank, the app uses `StubAIService`
- If a Gemini API key is present, the app uses `GeminiAIService`

That design lets the backend run locally without an LLM dependency while keeping the controller and service layers independent of the concrete AI provider.

## Backend Package Layout

```text
src/main/java/quizards
|- ai
|- domain
|- exception
|- model
|- persistence
|- repository
|- security
|- service
|- study
|- tracking
|- validation
|- web
`- QuizardsApplication.java
```

## Component Breakdown

### `ai`

This package contains the abstraction and implementations for AI-assisted summarization and study-set generation.

Files:

- `AIService`
- `AIProperties`
- `GeminiAIService`
- `StubAIService`
- `GeneratedDeck`

Responsibilities:

- `AIService` defines the contract used by the web layer:
  - summarize notes
  - generate flashcards from notes
  - generate flashcards from a prompt and card type
- `AIProperties` binds `quizards.ai.*` configuration from Spring properties into a typed record. Its `hasGeminiApiKey()` helper is what the application uses to decide whether Gemini is enabled.
- `GeminiAIService` is the real provider implementation. It:
  - builds a LangChain4j `GoogleAiGeminiChatModel`
  - uses JSON-schema structured output
  - creates three AI assistants for summaries, text decks, and quiz decks
  - converts structured AI responses into backend `Flashcard` objects
  - throws `AIProviderException` when the provider fails or returns unusable output
- `StubAIService` is the fallback implementation used when there is no Gemini key. It returns placeholder summaries and decks so the rest of the app can still run.
- `GeneratedDeck` is the transport object returned by the AI layer before a generated draft is converted into API response records or persisted as a study set.

Important design point:

The controller layer never knows whether it is talking to Gemini or a stub. It only depends on `AIService`, which keeps the backend loosely coupled.

### `domain`

This package contains the core enums that define backend state and behavior categories.

Files:

- `FlashcardType`
- `MasteryLevel`
- `StudyMode`
- `Visibility`

Responsibilities:

- `FlashcardType` distinguishes `TEXT` decks from `QUIZ` decks
- `MasteryLevel` tracks review progression: `NEW`, `LEARNING`, `REVIEW`, `MASTERED`
- `StudyMode` defines the supported study engines: `LEITNER`, `TIMED_QUIZ`, `STREAK`
- `Visibility` controls whether a set is `PRIVATE` or `PUBLIC`

These enums are shared across models, entities, services, and API responses, so they function as the backend’s common vocabulary.

### `exception`

This package contains custom runtime exceptions used to express domain-specific failure modes.

Files:

- `AccessDeniedException`
- `AIProviderException`
- `EmptyDeckException`
- `ValidationException`

Responsibilities:

- `AccessDeniedException` is thrown when a user tries to access or mutate a private set they do not own
- `AIProviderException` wraps LLM failures with backend-specific error context
- `EmptyDeckException` prevents study sessions from starting with no cards
- `ValidationException` is used by the generic validation helper

These exceptions are translated into HTTP responses by `web/ApiExceptionHandler`.

### `model`

This package contains the backend’s domain models. These are not JPA entities. They are in-memory business objects used by services, study engines, and controller-to-response mapping.

Files:

- `Flashcard`
- `TextFlashcard`
- `QuizFlashcard`
- `StudySet`
- `User`

Responsibilities:

- `Flashcard`
  - abstract base class for all flashcards
  - stores `id`, `prompt`, `answer`, `type`, `masteryLevel`, and `nextReviewAt`
  - defines `isCorrectResponse(...)` for subclasses to implement
- `TextFlashcard`
  - simple question-answer card
  - correctness is a case-insensitive match against the answer
- `QuizFlashcard`
  - multiple-choice card
  - stores immutable `choices`
  - still validates correctness via answer matching
- `StudySet`
  - aggregate root for a deck of cards
  - stores metadata like `title`, `description`, `visibility`, and `ownerUserId`
  - provides helpers such as:
    - `addCard(...)`
    - `removeCard(...)`
    - `getCardsByMastery(...)`
    - `getCardsSortedForLinearReview()`
    - `getDeckCardType()`
    - `isQuizDeck()`
    - `canBeViewedBy(...)`
- `User`
  - simplified domain representation of an authenticated user
  - stores app-level attributes like `preferredStudyMode` and usage counters

Important design point:

The app separates domain models from persistence entities. That avoids leaking JPA concerns directly into the study logic and controller serialization layer.

### `persistence`

This package contains the JPA entities that map Java objects to the PostgreSQL schema.

Files:

- `AppUserEntity`
- `StudySetEntity`
- `FlashcardEntity`

Responsibilities:

- `AppUserEntity`
  - maps to `app_users`
  - stores `id`, `username`, and `passwordHash`
  - owns a one-to-many relationship to study sets
- `StudySetEntity`
  - maps to `study_sets`
  - stores `id`, `title`, `description`, `visibility`, `owner`, `createdAt`
  - owns a one-to-many relationship to flashcards
  - uses `CascadeType.ALL` and `orphanRemoval = true`, so card lifecycle follows the study set lifecycle
  - assigns `createdAt` in `@PrePersist` if unset
- `FlashcardEntity`
  - maps to `flashcards`
  - stores `prompt`, `answer`, `choicesData`, `type`, `masteryLevel`, `nextReviewAt`
  - links back to its parent `StudySetEntity`

Notable persistence choices:

- UUIDs are used for study sets and flashcards
- quiz choices are stored as newline-delimited text in `choicesData`
- flashcard mastery and review scheduling are persisted, not just computed in memory

### `repository`

This package contains the Spring Data JPA repository interfaces.

Files:

- `AppUserRepository`
- `StudySetRepository`

Responsibilities:

- `AppUserRepository`
  - loads users by username for both registration checks and authentication
  - exposes `existsByUsername(...)` for uniqueness enforcement
- `StudySetRepository`
  - loads public sets
  - loads sets by owner id
  - loads a set by UUID
  - uses `@EntityGraph(attributePaths = {"owner", "flashcards"})` to eagerly fetch the owner and cards needed by the service layer

Important design point:

`StudySetRepository` is tuned to the service mapping code. Because the service converts entities into domain models immediately, prefetching owner and flashcards avoids lazy-loading issues and reduces extra queries.

### `security`

This package contains Spring Security configuration.

Files:

- `SecurityConfig`

Responsibilities:

- defines the `SecurityFilterChain`
- configures which routes are public and which require authentication
- disables CSRF, form login, HTTP basic auth, and built-in logout handling
- keeps authentication state in the HTTP session
- provides:
  - `UserDetailsService`
  - `PasswordEncoder`
  - `AuthenticationManager`
  - `SecurityContextRepository`

How authentication works:

- Public routes include:
  - SPA routes such as `/`, `/auth`, `/register`, `/library`
  - `/api/auth/**`
  - `GET /api/study-sets` and `GET /api/study-sets/**`
- All other requests require authentication
- The custom `UserDetailsService` loads `AppUserEntity` records by username and adapts them to Spring Security’s `User`
- Passwords are hashed with BCrypt
- Login state is stored in the HTTP session through `HttpSessionSecurityContextRepository`

This backend is using session-based auth, not token-based auth.

### `service`

This package contains the main business logic layer.

Files:

- `AuthService`
- `StudySetService`
- `StudySessionService`

Responsibilities:

- `AuthService`
  - validates registration inputs
  - enforces username and password rules
  - checks username uniqueness
  - hashes passwords before persistence
  - loads users by username
  - returns either a domain `User` or the underlying `AppUserEntity` depending on caller needs
- `StudySetService`
  - central service for creating, fetching, updating, and deleting study sets
  - converts JPA entities into domain `StudySet` objects
  - converts domain flashcards into `FlashcardEntity` records when saving
  - enforces ownership and visibility checks
  - sorts sets by creation time and title
  - normalizes missing `createdAt` values for legacy rows
  - reconstructs quiz choices from the newline-delimited persistence format
- `StudySessionService`
  - owns the registry of study engines
  - resolves the requested `StudyMode`
  - validates timed-quiz duration boundaries
  - delegates session creation to the correct engine

Important design point:

`StudySetService` is the central bridge between persistence and the domain model. Most controller endpoints rely on it to keep access control and entity-to-model mapping consistent.

### `study`

This package contains the study-mode engine abstraction and concrete implementations.

Files:

- `StudyEngine`
- `StudySession`
- `LeitnerEngine`
- `TimedQuizEngine`
- `StreakEngine`

Responsibilities:

- `StudyEngine` is the strategy interface implemented by all study modes
- `StudySession` is an immutable record describing a generated session:
  - mode
  - queue of cards
  - current index
  - correct answer count
  - time limit
- `LeitnerEngine`
  - rejects empty decks
  - sorts cards by `nextReviewAt`
  - is the most scheduling-aware engine
- `TimedQuizEngine`
  - rejects empty decks
  - supports an explicit or default time limit
  - defaults to 10 minutes
- `StreakEngine`
  - rejects empty decks
  - returns cards in deck order with no timer

Current scope:

These engines create initial study sessions. They do not yet persist per-session progress or submit-answer events back into the database.

### `tracking`

This package contains review-order support logic.

Files:

- `DifficultyTracker`

Responsibilities:

- stores flashcards in a priority queue ordered by `nextReviewAt`
- returns the next due card
- reschedules a card for later review

This class is not heavily wired into the current controller flow, but it shows the intended direction for spaced-repetition scheduling behavior.

### `validation`

This package contains reusable input validation helpers.

Files:

- `InputValidator`

Responsibilities:

- rejects blank values
- parses ISO dates
- validates that a file path exists and is readable

Current usage:

The backend actively uses `requireNonBlank(...)` in the service layer. The date and file helpers are currently more general-purpose infrastructure than hot-path API logic.

### `web`

This package contains controllers, request DTOs, response DTOs, and exception-to-HTTP mapping.

Files:

- Controllers:
  - `AuthController`
  - `StudySetController`
  - `SpaController`
  - `ApiExceptionHandler`
- Request records:
  - `AuthRequest`
  - `CreateStudySetRequest`
  - `FlashcardDraftRequest`
  - `GenerateStudySetRequest`
  - `SaveGeneratedStudySetRequest`
  - `UpdateStudySetVisibilityRequest`
- Response records:
  - `AuthUserResponse`
  - `FlashcardDraftResponse`
  - `FlashcardResponse`
  - `GeneratedDeckResponse`
  - `StudySessionCardResponse`
  - `StudySessionResponse`
  - `StudySetDetailResponse`
  - `StudySetResponse`

Responsibilities:

- `AuthController`
  - `GET /api/auth/me` returns current auth state
  - `POST /api/auth/register` creates a user, then signs them in
  - `POST /api/auth/login` authenticates and stores the security context in the session
  - `POST /api/auth/logout` clears the session
- `StudySetController`
  - exposes public browsing endpoints for study sets
  - exposes authenticated endpoints for a user’s own sets
  - creates, deletes, and updates sets
  - starts study sessions for quiz decks
  - triggers AI draft generation
  - saves AI-generated flashcards as persisted study sets
- `SpaController`
  - forwards browser routes for the React app to `index.html`
  - keeps direct browser refreshes on SPA routes working
- `ApiExceptionHandler`
  - maps backend exceptions into clean HTTP responses:
    - `400` for invalid arguments and empty decks
    - `401` for bad credentials
    - `403` for access denial

The request and response records keep JSON payloads stable and separate from internal domain or entity classes.

## Backend Request Flow

A typical request moves through the backend in this order:

1. A controller in `web` receives HTTP input.
2. The controller reads `Authentication` if the route depends on the current user.
3. The controller delegates to a service in `service`.
4. The service queries repositories in `repository`.
5. Repositories load JPA entities from `persistence`.
6. The service converts entities into domain models from `model`.
7. If the request is a study-session request, `StudySessionService` delegates to an engine in `study`.
8. If the request is an AI generation request, the controller delegates through `AIService` in `ai`.
9. The controller converts the result into response records in `web`.
10. If anything fails, `ApiExceptionHandler` turns the exception into an HTTP response.

## REST API Surface

### Authentication

- `GET /api/auth/me`
  - Returns whether the current session is authenticated
- `POST /api/auth/register`
  - Creates a user and immediately signs them in
- `POST /api/auth/login`
  - Authenticates an existing user
- `POST /api/auth/logout`
  - Invalidates the current session

### Study Sets

- `GET /api/study-sets`
  - Returns all public study sets
- `GET /api/study-sets/random?limit=3`
  - Returns a shuffled subset of public study sets
- `GET /api/my/study-sets`
  - Returns the authenticated user’s own study sets
- `GET /api/study-sets/{studySetId}`
  - Returns the full details for a public set or a private set owned by the current user
- `POST /api/study-sets`
  - Creates a new study set, optionally with flashcards
- `PATCH /api/study-sets/{studySetId}/visibility`
  - Changes a set between public and private
- `DELETE /api/study-sets/{studySetId}`
  - Deletes a set owned by the current user

### Study Sessions

- `GET /api/study-sets/{studySetId}/study-session?mode=LEITNER`
  - Starts a study session for a quiz deck
- `GET /api/study-sets/{studySetId}/study-session?mode=TIMED_QUIZ&timeLimitMinutes=15`
  - Starts a timed quiz session with an explicit duration

Constraint:

The controller currently rejects study sessions for non-quiz decks.

### AI Endpoints

- `GET /api/notes/summary?notes=...`
  - Summarizes raw notes text
- `POST /api/ai/generate-draft`
  - Generates a draft deck from a prompt
- `POST /api/ai/save-generated-study-set`
  - Persists a generated draft as a real study set

## Configuration

`src/main/resources/application.properties`

The backend expects the following runtime configuration:

```properties
spring.config.import=optional:file:.env[.properties]
app.name=quizards
quizards.ai.gemini.api-key=${GEMINI_API_KEY:}
spring.datasource.url=${SUPABASE_DB_URL:}
spring.datasource.username=${SUPABASE_DB_USERNAME:}
spring.datasource.password=${SUPABASE_DB_PASSWORD:}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

Meaning:

- `.env` can supply local secrets without editing `application.properties`
- `GEMINI_API_KEY` enables the real AI provider
- `SUPABASE_DB_URL`, `SUPABASE_DB_USERNAME`, and `SUPABASE_DB_PASSWORD` configure PostgreSQL access
- Hibernate is set to `update`, so it will evolve the schema automatically at startup

## Running the Backend

### Prerequisites

- Java 17
- Maven
- PostgreSQL database credentials

### Run

```bash
mvn spring-boot:run
```

Then open [http://localhost:8080](http://localhost:8080).

### Optional `.env`

```bash
GEMINI_API_KEY=your_gemini_key
SUPABASE_DB_URL=jdbc:postgresql://host:5432/database
SUPABASE_DB_USERNAME=your_username
SUPABASE_DB_PASSWORD=your_password
```

If `GEMINI_API_KEY` is missing, the app still runs with `StubAIService`.

## Tests

Current backend tests are lightweight smoke tests:

- `src/test/java/quizards/study/LeitnerEngineSmokeTest.java`
- `src/test/java/quizards/validation/InputValidatorSmokeTest.java`

These focus on basic engine and validation behavior rather than full Spring integration testing.

## Current Backend Characteristics

The backend is already beyond the original in-memory prototype stage. It currently includes:

- persisted users, study sets, and flashcards
- session-based authentication
- ownership and visibility enforcement
- multiple study engines
- AI draft generation with a real-provider fallback
- controller/request/response separation

The main areas that still look intentionally lightweight are:

- minimal automated test coverage
- no token-based auth or CSRF-enabled browser security model
- no persisted per-session progress updates
- no dedicated DTO-to-model mapper layer outside the controllers
