# Quizards

Quizards is a full-stack study deck app built with a Spring Boot backend and a React/Vite frontend. Users can register, create private or public decks, browse public decks, generate AI-assisted draft decks, and study quiz-style decks through multiple session modes.

The production deployment model is a single container: Vite builds the frontend into static assets, Spring Boot serves those assets and the JSON API, and the combined image can be deployed to platforms such as Google Cloud Run.

## What The App Does

- Registers and authenticates users with session-based auth
- Stores study sets and flashcards in PostgreSQL
- Supports public browsing plus private owner-only library management
- Lets users create text flashcards or quiz decks
- Generates draft decks with Gemini when `GEMINI_API_KEY` is configured
- Falls back to a local stub AI service when Gemini is not configured
- Starts study sessions in `REPETITION`, `TIMED_QUIZ`, and `STREAK` modes for quiz decks

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.3.5
- Spring Web
- Spring Data JPA
- Spring Security
- Spring Session JDBC
- PostgreSQL
- LangChain4j + Google Gemini
- Maven 3.9.x

### Frontend

- React 19
- React Router 7
- Vite 8
- Material UI 9
- Emotion

### Deployment

- Multi-stage Docker build
- Suitable for Google Cloud Run and Digital Ocean App Platform

## Repository Layout

```text
.
|- Dockerfile
|- README.md
|- .env.example
|- pom.xml
|- src/
|  |- main/
|  |  |- java/quizards/
|  |  |  |- ai/
|  |  |  |- domain/
|  |  |  |- exception/
|  |  |  |- model/
|  |  |  |- persistence/
|  |  |  |- repository/
|  |  |  |- security/
|  |  |  |- service/
|  |  |  |- study/
|  |  |  |- validation/
|  |  |  `- web/
|  |  `- resources/
|  `- test/
|     `- java/quizards/
`- frontend/
   |- README.md
   |- package.json
   `- src/
```

## Architecture Overview

### Backend

The backend owns authentication, persistence, authorization, AI integration, and session generation.

- `quizards.web`
  - Controllers, request DTOs, response DTOs, and exception mapping
- `quizards.service`
  - Business logic for auth, study sets, and study sessions
- `quizards.persistence`
  - JPA entities for `app_users`, `study_sets`, and `flashcards`
- `quizards.repository`
  - Spring Data repository interfaces
- `quizards.model`
  - Domain models used by services and controllers
- `quizards.study`
  - Study engine implementations and `StudySession`
- `quizards.ai`
  - AI abstraction plus Gemini and stub implementations
- `quizards.security`
  - Spring Security configuration
- `quizards.validation`
  - Shared validation helpers

### Frontend

The frontend is a React SPA that talks to the backend with same-origin requests and browser session cookies.

Main pages:

- `/`
  - home/overview page
- `/browse`
  - public deck discovery
- `/login`
  - sign in
- `/register`
  - sign up
- `/create`
  - authenticated deck creation and AI draft generation
- `/library`
  - authenticated deck management
- `/study-set/:studySetId`
  - deck details and study view

## Application Flow

### Authentication

- `POST /api/auth/register`
  - creates a user, authenticates them, and stores the session
- `POST /api/auth/login`
  - authenticates and stores the session
- `POST /api/auth/logout`
  - clears the session
- `GET /api/auth/me`
  - returns the current auth state

Authentication is session-based, not token-based. The frontend sends `credentials: 'include'` on API requests.

### Study Sets

- Public visitors can browse public sets
- Authenticated users can create, edit, delete, and toggle visibility on their own sets
- A study set can be:
  - `PRIVATE`
  - `PUBLIC`
- A deck can contain:
  - text flashcards
  - quiz flashcards

### AI

If `GEMINI_API_KEY` is present, the app uses `GeminiAIService`. If it is absent, `StubAIService` is used so the app can still run locally without a live model.

## Configuration

Runtime configuration comes from `src/main/resources/application.properties` plus the optional `.env` file loaded through:

```properties
spring.config.import=optional:file:.env[.properties]
```

### Example Environment File

Use [.env.example](/root/Quizards_Java/.env.example:1) as the starting point:

```bash
cp .env.example .env
```

Current variables:

- `SUPABASE_DB_URL`
- `SUPABASE_DB_USERNAME`
- `SUPABASE_DB_PASSWORD`
- `GEMINI_API_KEY`
- `DB_MAX_POOL_SIZE`
- `DB_MIN_IDLE`
- `DB_CONNECTION_TIMEOUT_MS`

Additional Hikari values are also supported through the defaults in `application.properties`, including:

- `DB_IDLE_TIMEOUT_MS`
- `DB_MAX_LIFETIME_MS`
- `DB_APPLICATION_NAME`

### Spring Profiles

- `application.properties`
  - main runtime config
- `application-dev.properties`
  - development-oriented overrides such as `spring.jpa.hibernate.ddl-auto=validate`

To use the `dev` profile locally:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Local Development

### Prerequisites

- Java 17
- Maven 3.9.x or compatible
- Node.js 22+
- npm
- PostgreSQL database credentials

### Backend Only

```bash
cp .env.example .env
mvn spring-boot:run
```

The Spring Boot server runs on `http://localhost:8080`.

### Frontend Only

The frontend can also be run separately with Vite:

```bash
cd frontend
npm ci
npm run dev
```

This is useful for UI work, but production uses the integrated Docker build where the frontend is bundled into Spring Boot static assets.

### Full Local Build

```bash
cd frontend
npm ci
npm run build
cd ..
mvn package
```

## Docker

The [Dockerfile](/root/Quizards_Java/Dockerfile:1) uses three stages:

1. `frontend-build`
   - installs frontend dependencies
   - runs `npm run build`
2. `backend-build`
   - copies backend code and compiled frontend assets
   - runs `mvn -B package`
   - tests run here and must pass
3. runtime image
   - uses Eclipse Temurin 17 JRE
   - runs the packaged Spring Boot jar

### Build And Run

```bash
docker build -t quizards .
docker run --rm -p 8080:8080 --env-file .env quizards
```

## Google Cloud Run Notes

If you deploy from the Dockerfile:

- frontend build runs during the image build
- backend tests run during `mvn -B package`
- if tests fail, the image build fails
- if the image build fails, Cloud Run does not receive a new deployable image

That makes the Docker build itself a deployment gate.

## Testing

Current automated coverage focuses on deterministic backend logic.

### Test Areas

- `src/test/java/quizards/study/StudySessionServiceTest.java`
  - study mode selection
  - timed quiz validation
  - empty deck handling
  - session queue ordering
- `src/test/java/quizards/model/FlashcardTest.java`
  - text and quiz answer evaluation
  - quiz choice immutability
- `src/test/java/quizards/model/StudySetTest.java`
  - deck type inference
  - visibility rules
  - collection immutability
- `src/test/java/quizards/validation/InputValidatorTest.java`
  - blank-field validation
  - date parsing
  - readable-file validation
- `src/test/java/quizards/service/StudySetServiceTest.java`
  - sorting behavior
  - `createdAt` backfill behavior
  - access control
  - flashcard persistence mapping
  - update behavior

### Run Tests

```bash
mvn test
```

If you are in a restricted environment where the default Maven cache is not writable, use:

```bash
mvn -Dmaven.repo.local=/tmp/quizards-m2 test
```

## API Overview

### Auth Endpoints

- `GET /api/auth/me`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Study Set Endpoints

- `GET /api/study-sets`
- `GET /api/study-sets/random?limit=3`
- `GET /api/my/study-sets`
- `GET /api/study-sets/{studySetId}`
- `POST /api/study-sets`
- `PUT /api/study-sets/{studySetId}`
- `PATCH /api/study-sets/{studySetId}/visibility`
- `DELETE /api/study-sets/{studySetId}`

### Study Session Endpoint

- `GET /api/study-sets/{studySetId}/study-session?mode=REPETITION`
- `GET /api/study-sets/{studySetId}/study-session?mode=TIMED_QUIZ&timeLimitMinutes=15`
- `GET /api/study-sets/{studySetId}/study-session?mode=STREAK`

Note:

- study sessions are only available for quiz decks

### AI Endpoints

- `POST /api/ai/generate-draft`
- `POST /api/ai/save-generated-study-set`

## Key Backend Classes

### `QuizardsApplication`

Bootstraps Spring Boot and wires:

- `InputValidator`
- AI executor
- `AIService` selection between Gemini and stub mode

### `StudySetService`

Central service for:

- creating study sets
- mapping JPA entities to domain models
- enforcing visibility and ownership rules
- sorting public and owner deck lists
- serializing and deserializing quiz choices

### `StudySessionService`

Chooses the correct study engine and validates timed quiz duration.

### `SecurityConfig`

Configures:

- public SPA routes
- public auth routes
- public `GET` study set routes
- authenticated mutating routes
- session-based security context handling

## Frontend Summary

The frontend is described in more detail in [frontend/README.md](/root/Quizards_Java/frontend/README.md:1).

At a high level it provides:

- guest browsing
- authenticated library management
- AI-assisted deck creation
- study-set detail and quiz modes
- same-origin API integration with session cookies

## Current Limitations

- no token-based auth; auth is cookie/session based
- no full integration-test suite against a real database
- study engines generate sessions but do not persist answer-by-answer progress
- no separate frontend env/config system for talking to a remote API; the app assumes same-origin API access in production

## License / Ownership

No explicit license file is present in this repository. If you plan to publish or share the project externally, add a license file and ownership notes.
