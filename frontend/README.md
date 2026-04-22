# Quizards Frontend

This frontend is the React single-page app for Quizards. It handles public browsing, account flows, deck creation, library management, and deck study views while relying on the Spring Boot backend for all persistence, authentication, and AI generation.

In production, this frontend is built with Vite and served by the backend as static assets.

## Stack

- React 19
- React Router 7
- Vite 8
- Material UI 9
- Emotion
- ESLint 9

## Scripts

From the `frontend/` directory:

```bash
npm ci
npm run dev
npm run build
npm run lint
npm run preview
```

What they do:

- `npm run dev`
  - starts the Vite development server
- `npm run build`
  - builds the production bundle
- `npm run lint`
  - runs ESLint
- `npm run preview`
  - previews the production build locally

## App Structure

```text
frontend/src
|- api.js
|- App.jsx
|- main.jsx
|- theme.js
|- components/
`- pages/
```

### Core Files

- `App.jsx`
  - bootstraps auth state
  - loads dashboard data
  - defines routes
  - owns delete/visibility actions used across pages
- `api.js`
  - wraps `fetch`
  - sends `credentials: 'include'`
  - centralizes API calls and error handling
- `theme.js`
  - Material UI theme configuration

## Routes

Defined in [App.jsx](/root/Quizards_Java/frontend/src/App.jsx:1):

- `/`
  - home page
- `/browse`
  - public deck browsing
- `/login`
  - sign in
- `/register`
  - sign up
- `/create`
  - authenticated deck creation
- `/library`
  - authenticated deck management
- `/study-set/:studySetId`
  - deck details and study UI

Unknown routes redirect back to `/`.

## Pages

- `HomePage.jsx`
  - landing view
  - workspace overview for authenticated users
  - public deck preview for guests
- `BrowsePage.jsx`
  - search and filter public decks
- `CreatePage.jsx`
  - manual deck creation
  - AI draft generation and save flow
- `LibraryPage.jsx`
  - owned deck listing
  - visibility toggling
  - deletion actions
- `StudySetPage.jsx`
  - deck detail view
  - edit flow for owners
  - study session modes for quiz decks
- `SignInPage.jsx`
  - login form
- `RegisterPage.jsx`
  - registration form

## API Integration

The frontend talks to same-origin backend endpoints such as:

- `/api/auth/*`
- `/api/study-sets/*`
- `/api/my/study-sets`
- `/api/ai/*`

Requests use:

```js
credentials: 'include'
```

That means session cookies are required for authenticated flows.

## Local Development Notes

If you run the frontend separately with Vite, you will usually also want the Spring Boot backend running locally. The frontend code currently assumes same-origin API paths like `/api/study-sets`, so a proxy or integrated backend serving is the simplest setup.

Typical workflow:

1. Start the backend from the repository root:

```bash
mvn spring-boot:run
```

2. In another terminal, start the frontend:

```bash
cd frontend
npm ci
npm run dev
```

## Production Build

The root Dockerfile builds this frontend first:

```dockerfile
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build
```

The resulting static assets are then copied into the backend resources so Spring Boot can serve them.

## Notes

- This README replaces the default Vite template README because this folder is now an application, not a starter scaffold.
- For full-stack setup, runtime config, Docker usage, and Cloud Run notes, see the root [README.md](/root/Quizards_Java/README.md:1).
