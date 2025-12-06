# Technical Specifications: MVP Fixes

## 🐛 Bug Reports

### 1. Player View: "Reveal" State Incorrect
**Severity:** High
**Description:** When the Host reveals the cards, the Player View continues to show the **Voting Deck** (selectable cards) instead of the **Results View**.
**Expected Behavior:**
-   **Hide:** The Voting Deck (0, 1, 2, 3...).
-   **Show:** A grid of all participants with their revealed votes (e.g., "Matt: 5", "Olga: 8").
-   **Show:** The Round Result summary (Average, Consensus).

### 2. Host View: Round Result Calculation Missing
**Severity:** High
**Description:** The "Round Result" card on the Host Dashboard shows `?` and empty stats (`-`) even after votes are revealed.
**Expected Behavior:**
-   Calculate **Average** of all numeric votes.
-   Calculate **Min** and **Max**.
-   Display **Consensus** value if all votes are identical, otherwise show `?` or the Average.

### 3. Host View: Player Cards Not Showing Values
**Severity:** Medium
**Description:** In the "Players Status" section of the Host Dashboard, player cards show a checkmark (`✓`) even when `areCardsRevealed` is true.
**Expected Behavior:**
-   If `areCardsRevealed` is **true**, replace the checkmark with the actual vote value (e.g., `5`, `8`, `☕`).

## 🛠️ Implementation Guide (For Developers)

### Component: `PlayerCardComponent`
-   **Input:** Add `@Input() isRevealed: boolean`.
-   **Template:**
    -   If `isRevealed` is true AND `player.vote` exists: Display the vote value.
    -   Else: Display the status icon (Checkmark/Dot).
-   **Style:** Add a `.revealed` class to style the vote value distinctively (e.g., white background, bold text).

### Component: `RoundResultComponent`
-   **Input:** Add `@Input() players: Player[]`.
-   **Logic:** Implement a `stats` getter that calculates:
    -   `avg`: Sum / Count (formatted to 1 decimal).
    -   `min`/`max`: Standard math.
    -   `consensus`: If all votes equal, show value.
-   **Template:** Bind the calculated stats to the view.

### Component: `RoomComponent`
-   **Template (Host View):** Pass `[isRevealed]="areCardsRevealed()"` to `<app-player-card>`.
-   **Template (Player View):**
    -   Use `@if (!areCardsRevealed())` for the Voting Grid.
    -   Use `@if (areCardsRevealed())` for the Results Grid (reuse `app-player-card` or similar).

### 4. UI/UX Polish: Player Room Layout (Design Match)
**Reference:** [Design Mockup](file:///C:/Users/Carniatto/.gemini/antigravity/brain/68386e09-2f3c-4ca2-bc82-7f6e02f53815/uploaded_image_1764937782239.png)
**Requirements:**
-   **Header:** Large, bold text "Estimating: [Task Name]" (Default to "General Task" if not set). Subtitle: "Select a card to place your vote."
-   **Card Grid:**
    -   Cards should be dark (`#112240` approx).
    -   **Selected State:** Bright Blue border (`#3b82f6`) with a subtle outer glow.
-   **Sidebar (Participants):**
    -   Right-aligned.
    -   List items: Avatar (Left) + Name (Middle) + Status Icon (Right).
    -   **Status Icons:** Green Checkmark (Voted), Orange Hourglass (Waiting).
    -   **Active User:** Highlight the current user's row with a subtle blue background.
-   **Bottom Action Bar (Optional but recommended):**
    -   Fixed container at bottom right of the main area.
    -   Text: "Your vote: [Selected Value]".
    -   Note: "Reveal Votes" button should **ONLY** be visible to the Host.

### 5. UI/UX Polish: Host Dashboard (Design Match)
**Reference:** [Host Dashboard Mockup](file:///c:/Users/Carniatto/DEV/PokerPlanningNeo/docs/assets/host_dashboard.png)
**Current Issue:** The current Host View is too generic and lacks the "Control Center" feel of the vision.
**Requirements:**
-   **Layout Structure:**
    -   **Top Section:** "Project Phoenix - Sprint 1" (or Room Name) with a "Copy Invite Link" action.
    -   **Main Content (Left/Center):**
        -   **Current Task:** Large text description of what is being estimated.
        -   **Players Grid:** A clean grid of player cards (Avatar + Name + Status). *Not* a list.
        -   **Host Deck:** The host's voting cards at the bottom.
    -   **Control Panel (Right Sidebar):**
        -   **Host Controls:** Prominent "Reveal Votes" (Blue) and "Start New Round" (Secondary) buttons.
        -   **Manage Participants:** A list of users with "Kick" or "Select" checkboxes (if applicable, or just a list for now).
-   **Styling:**
    -   Use the dark navy background (`#0a192f`).
    -   Cards should have the "glass" effect.
    -   Typography: Headings in white, secondary text in `#8892b0`.
