# Technical Specifications: Player Room Redesign

**Status:** Ready for Dev
**Reference:** [Design Mockup](file:///c:/Users/Carniatto/DEV/PokerPlanningNeo/docs/assets/player_room_design.jpg)

## 🎯 Goal
Transform the detailed "Room View" into a high-fidelity, gamified experience ("Neo" aesthetic).

## 🖼️ UI Requirements

### 1. Global Layout
-   **Background:** Deep Dark Navy (`#050A14` to `#0B1221` radial gradient).
-   **Grid System:**
    -   **Main Content (Left 75%):** Voting area.
    -   **Sidebar (Right 25%):** Participants & Stats.

### 2. Header (Task Info)
-   **Location:** Top left overlay.
-   **Content:**
    -   **Title:** "Estimating: [Task Name]" (Large, White, Bold).
    -   **Subtitle:** "The team has reached a consensus" (or current status text).
-   **Style:** Clean, sans-serif transparency.

### 3. Voting Grid (The "Cards")
-   **Cards:**
    -   **Normal State:** Glassmorphism (`rgba(255,255,255,0.05)`), thin border.
    -   **Selected State:** Neon Blue Border (`box-shadow: 0 0 15px #3b82f6`), slightly scaled up.
    -   **Revealed State (Winner):** "Explosive" highlights (see Visual Effects).
-   **Typography:** Huge, glowing numbers (e.g., "8", "13").

### 4. Sidebar (Participants)
-   **Container:** Glass panel with a distinct right-side border/separator.
-   **List Items:**
    -   Avatar (Circle).
    -   Name (White).
    -   Vote Bubble (Right aligned).
        -   **Hidden:** Gray square on rounded rect.
        -   **Revealed:** Blue square with number.

### 5. Round Result (Bottom Right)
-   **Container:** Neon bordered box (Cyan/Pink gradient border).
-   **Content:**
    -   **Main Number:** The Consensus / Average.
    -   **Stats Row:** Min / Max / Average small labels.
-   **Action Button:** "Start Next Round" (Blue Gradient, Full Width).

## ✨ Visual Effects (The "Wow" Factor)
-   **Particles:** On "Reveal", if there is a consensus, trigger a particle explosion (fireworks/sparks) behind the winning card.
-   **Glow:** All interactive elements should have hover-glows.
-   **Lighting:** Use CSS gradients to simulate top-down lighting on the cards.

## 🛠️ Implementation Strategy
-   **Component:** `src/app/room/room.component.ts` (Layout) & `src/app/components/voting-card/voting-card.component.ts` (Card styles).
-   **Assets:** Use CSS for all glows/gradients (performant). Use a lightweight library (like `tsparticles` or plain Canvas) for the explosion if requested, otherwise CSS keyframe animations.
