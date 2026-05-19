# System Design & Architecture (DESIGN.md)

This document outlines the architectural decisions and UI/UX vision for PokerPlanningNeo. Agents should reference this file before generating new components or modifying the database.

## 1. UI/UX Vision & Aesthetics

The user interface must be modern, highly interactive, and visually stunning. 
- **Style Language:** Vanilla CSS or SCSS (Tailwind is only permitted if explicitly requested/configured).
- **Aesthetics:** Use curated, harmonious color palettes, sleek dark modes, and glassmorphism where appropriate. Avoid basic default colors (e.g., plain red or blue).
- **Typography:** Utilize modern web fonts (e.g., Inter, Roboto, Outfit).
- **Interactivity:** Implement micro-animations for interactions (hovering cards, revealing votes, joining rooms) to make the app feel alive and responsive.
- **Placeholders:** Do not use broken placeholders. If mock assets are needed, generate them or use high-quality SVGs.

## 2. Frontend Architecture (Angular)

The frontend is divided into modular, standalone components following a strict zoneless and signals-based approach.

### Core Components
- **Room Component (`src/app/room`):** The main orchestration container for an active planning poker session.
- **Room Header & Sidebar:** Display room metadata, active task information, and navigation.
- **Participants List:** Real-time list of users in the room and their current voting status (voting, ready, disconnected).
- **Voting Card (`src/app/components/voting-card`):** The interactive UI element users click to submit a story point estimate.
- **Player Card (`src/app/components/player-card`):** Represents a user at the "table".
- **Host Controls (`src/app/components/host-controls`):** Specialized UI visible only to the room creator to reveal cards, reset rounds, and switch tasks.

### State Management
- A global/room-level Signal store holds the state of the current round.
- State shape includes: `participants[]`, `currentTask`, `votes{}`, `roundStatus` (waiting, voting, revealed).
- Computed signals derive values like `isEveryoneReady`, `averageVote`, and `consensusReached`.

## 3. Backend Architecture (Firebase Data Connect)

The backend relies on Firebase Data Connect, meaning the schema is heavily SQL-driven.
- **Database First:** All relationships (Rooms -> Participants, Rooms -> Tasks, Tasks -> Votes) are defined securely via Data Connect schemas.
- **Real-time:** The application uses Data Connect queries and mutations. Ensure that subscriptions to data changes are cleanly managed and pipe directly into Angular Signals (`toSignal()`).

## 4. Future Roadmap
- Integration with external issue trackers (Jira, GitHub Issues).
- Advanced analytics for team velocity based on historical votes.
- Custom card decks (Fibonacci, T-Shirt sizes, Sequential).
