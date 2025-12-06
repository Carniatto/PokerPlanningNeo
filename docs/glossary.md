# Glossary

## Core Entities

### Room
A virtual space where a planning session takes place. Identified by a unique `Room ID`.
-   **Host:** The creator of the room or the person currently in control. Has special permissions (Reveal, Reset).
-   **Participant:** Any user in the room. Can be a **Voter** or (potentially) a **Spectator**.

### User
-   **Display Name:** The name shown to other participants.
-   **User ID (UID):** Unique identifier (anonymous auth).

### Session / Round
A single estimation cycle for a specific task or story.
-   **Voting Phase:** Participants select cards. Cards are face down.
-   **Reveal Phase:** Host reveals cards. Estimates are shown.
-   **Consensus:** When the team agrees on a value (not enforced by code yet, but a social state).

## Actions

-   **Vote:** Selecting a card representing story points.
-   **Reveal:** Showing all votes to everyone.
-   **Reset / New Round:** Clearing votes to start estimating a new item.
-   **Join:** Entering a room via code or link.

## Values (Deck)
-   **Fibonacci:** 0, 1, 2, 3, 5, 8, 13, 20...
-   **?:** Unsure / Needs discussion.
-   **Coffee (☕):** Needs a break.
