# PokerPlanningNeo

A modern, fast, and interactive Agile Planning Poker application designed for real-time team estimation. Built with the latest Angular features (Zoneless, Signals) and powered by Firebase Data Connect.

## Features
- **Real-time Collaboration:** Instant updates for participants joining, voting, and revealing cards.
- **Host Controls:** Manage rounds, reveal votes, and control the flow of the estimation session.
- **Zoneless Architecture:** Built using Angular's modern zoneless capabilities for maximum performance.
- **Signal-based State:** Fully reactive state management using Angular Signals.
- **Firebase Data Connect:** Robust, database-first backend schema.

## Prerequisites
- **Node.js** (v18+)
- **PNPM** (Strictly use `pnpm`, not npm or yarn)
- **Firebase CLI** (For running the local Data Connect emulator)
- **Angular CLI**

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Start the Firebase Emulator**
   *Note: Ensure only ONE emulator instance is running.*
   ```bash
   firebase emulators:start --only dataconnect
   ```

3. **Start the Development Server**
   ```bash
   pnpm start
   ```
   Navigate to `http://localhost:4200` (or your assigned unique port if using worktrees).

## Agentic Development
This project is designed to be built in collaboration with AI agents. If you are an AI agent taking over this project, you **MUST** read:
- `AGENTS.md`: For workflow, environment, and code standard rules.
- `DESIGN.md`: For architectural and UI/UX guidelines.

## License
MIT License
