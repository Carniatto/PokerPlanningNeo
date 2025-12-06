# Best Practices & Guidelines

## Architecture & State Management
-   **Signals First:** Use Angular Signals (`signal`, `computed`, `effect`) for all local and shared state. Avoid `BehaviorSubject` unless absolutely necessary.
-   **Service-Based State:** The `GameService` should be the single source of truth for all game data. Components should read from the service's signals.
-   **Smart vs. Dumb Components:**
    -   **Smart (Container):** `RoomComponent`, `HomeComponent`. Connect to services, handle logic.
    -   **Dumb (Presentational):** `VotingCardComponent`, `RoundResultComponent`. Receive data via `@Input` (signals preferred) and emit events via `@Output`.
-   **Control Flow:** ALWAYS use the new built-in control flow syntax (`@if`, `@for`, `@switch`) instead of structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`).

## Firebase & Data
-   **Real-time Updates:** Use `onSnapshot` in the service to keep signals updated.
-   **Security:** Ensure Firestore rules (to be implemented) validate data integrity.
-   **Anonymous Auth:** Handle user identity gracefully (reconnect if possible, or create new).

## Styling & UI
-   **CSS Variables:** Use `--primary`, `--bg-color`, etc., defined in `styles.css` for consistent theming.
-   **Mobile First:** Always test layouts on mobile viewports. Flexbox and Grid are your friends.
-   **Visual Feedback:** Provide immediate feedback for all actions (clicks, errors, loading).

## Agentic Workflow
-   **Task Tracking:** Always keep `task.md` updated.
-   **Documentation:** Update `glossary.md` and `requirements.md` as features evolve.
-   **Communication:** Use `notify_user` when blocked or needing high-level decisions.

## Product-First Workflow
-   **Specify First:** Don't just code. When a bug or feature is identified, create a **Technical Specification** (like `docs/technical_specs_mvp_fixes.md`) *before* writing code.
-   **Why:** Ensures alignment with the user's vision (especially for UI details) and reduces "revert" cycles.

## Known Gotchas
-   **Firebase Emulators:** Ensure Java is installed and `firebase.json` is configured correctly for local dev.
-   **Anonymous Auth:** Users are signed in anonymously. Session persistence is key.
-   **Strict Control Flow:** Reminding again: **NO** `*ngIf` / `*ngFor`. Use `@if` / `@for`.
