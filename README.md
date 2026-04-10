# Quizards

This repository contains a small Spring Boot web app for the Quizards semester project.

## What's Included

- A Spring Boot web application you can open in the browser
- Core domain models for `User`, `StudySet`, `Flashcard`, `TextFlashcard`, and `QuizFlashcard`
- Study engine abstractions with starter implementations for Leitner, timed quiz, and streak modes
- AI integration interfaces plus a stub service that can later be replaced with LangChain4j or Spring services
- Input validation and custom exceptions matching the proposal
- REST endpoints plus a static landing page at `/`
- LangChain4j + Gemini powered study set generation when `GEMINI_API_KEY` is present in `.env`

## Project Layout

```text
src/main/java/quizards
|- ai
|- domain
|- exception
|- model
|- service
|- study
|- tracking
|- validation
`- web
```

## Run

```bash
mvn spring-boot:run
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## Gemini Setup

Create a `.env` file in the project root with:

```bash
GEMINI_API_KEY=your_api_key_here
```

Spring Boot imports `.env` directly through `spring.config.import`, then binds `GEMINI_API_KEY` into `quizards.ai.gemini.api-key`. If no key is available, the app uses the stub AI service instead.

The Gemini integration is implemented through LangChain4j AI Services and the Google AI Gemini chat model.
The browser UI can generate an AI study set through `POST /api/ai/generate-study-set`.

## Suggested Next Steps

1. Replace the in-memory `StudySetService` with persistence.
2. Add authentication and real user ownership checks.
3. Replace the demo API and static page with the full product UI.
4. Plug `AIService` into LangChain4j and validate structured outputs.
