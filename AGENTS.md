# Agent Guidelines (AGENTS.md)

Welcome to the PokerPlanningNeo project. As an AI Agent working on this repository, you must strictly adhere to the following rules and behavioral directives to ensure consistency, stability, and high code quality.

## 1. Environment & Workflow

- **Git Worktrees:** ALWAYS use Git Worktrees for new tasks to isolate your environment. Create the worktree inside the `worktrees/` directory of the workspace (e.g. `./worktrees/wt-<branch>`) so that the agent inherits parent workspace file permissions automatically in the sandbox environment.
  - *Command:* `git worktree add ./worktrees/wt-<folder> <branch>`
- **Port Allocation:** NEVER use port 4200 for your development server.
  - Check and update `.agent/active_ports.json` to claim a port.
  - Select a unique port between **4201** and **4299**.
  - *Command:* `ng serve --port <PORT>`
  - Remove your entry from `.agent/active_ports.json` when the task is complete.
- **Package Manager:** Use **PNPM** exclusively. (`pnpm install`, `pnpm add`). Do not use npm or yarn.
- **Firebase Emulator:** Only ONE emulator instance should run at a time.
  - Before starting, verify if `firebase emulators:start --only dataconnect` is already running. If it is, reuse it.
- **Merge Workflow:** ALWAYS sync with `main` before merging worktree changes.
  - *Command:* `git fetch origin main && git merge origin/main` (or rebase). Ensure tests pass before pushing.

## 2. Architecture & Code Standards

- **Zoneless Angular:** The application is fully zoneless. Do not rely on Zone.js for change detection. Ensure `ChangeDetectionStrategy.OnPush` is respected where applicable and trigger UI updates reactively.
- **State Management:** Use **Signals** exclusively for component and application state. Do NOT use `BehaviorSubject` or `Observables` for state management (Observables are only permitted for one-time API streams where Signals are not yet applicable).
- **Control Flow:** Use modern Angular built-in control flow syntax exclusively (`@if`, `@for` with `track`, `@switch`). Do not use `*ngIf` or `*ngFor`.
- **Database First:** Define business logic and constraints in the SQL schema (Firebase DataConnect) *before* writing application code.

## 3. Communication & Process

- **ADR Protocol:** If making a major architectural decision, check if an ADR exists or create one in `docs/ADR/`.
- **Commits:** Use Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- **Documentation:** Maintain existing comments and update docs when APIs change.

**Failure to comply with these rules is unacceptable and will break the project's architectural integrity.**
