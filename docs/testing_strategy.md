# Automated E2E Testing Strategy

## 🎯 Goal
Verify the full 3-user MVP flow (Host + 2 Players) to ensure real-time synchronization and UI correctness.

## 💡 Selected Solution: Playwright E2E

We will use **Playwright** because it natively supports **multiple browser contexts**. This allows a single test to control three distinct "users" (Host, Player 1, Player 2) simultaneously, each with their own cookies/storage, perfectly simulating a real multiplayer session.

### 1. The Concept
A single test file (`tests/e2e/game-flow.spec.ts`) will orchestrate three browser windows:
-   **Context A (Host):** Creates the room.
-   **Context B (Alice):** Joins the room.
-   **Context C (Bob):** Joins the room.

### 2. Test Scenario: "Happy Path"
1.  **Host** creates room -> gets `roomId`.
2.  **Alice & Bob** navigate to `/room/:roomId`.
3.  **Alice** enters name "Alice" -> joins.
4.  **Bob** enters name "Bob" -> joins.
5.  **Host** verifies sidebar shows "Alice" and "Bob".
6.  **Alice** votes "5".
7.  **Bob** votes "8".
8.  **Host** sees checkmarks for Alice and Bob.
9.  **Host** clicks "Reveal Votes".
10. **All** verify that cards are revealed:
    -   Host sees "5" and "8".
    -   Alice sees "5" (hers) and "8" (Bob's).
    -   Bob sees "5" (Alice's) and "8" (hers).

### 3. Technical Implementation

#### A. Setup
```bash
npm init playwright@latest
```

#### B. Sample Test Structure
```typescript
test('3-User Game Flow', async ({ browser }) => {
  // Create 3 isolated contexts
  const hostContext = await browser.newContext();
  const aliceContext = await browser.newContext();
  const bobContext = await browser.newContext();

  const hostPage = await hostContext.newPage();
  const alicePage = await aliceContext.newPage();
  const bobPage = await bobContext.newPage();

  // 1. Host Creates Room
  await hostPage.goto('http://localhost:4200');
  await hostPage.fill('input[name="name"]', 'Host');
  await hostPage.click('button:has-text("Create")');
  const roomUrl = hostPage.url();

  // 2. Players Join
  await alicePage.goto(roomUrl);
  await alicePage.fill('input[name="name"]', 'Alice');
  await alicePage.click('button:has-text("Join")');
  
  // ... (Bob joins, Voting logic, Reveal logic)
});
```

### 4. Benefits
-   **Realism:** Tests the *actual* app code, including routing, guards, and Firestore sync.
-   **Standard:** Uses industry-standard tooling (no custom "Bot" code to maintain).
-   **Scalable:** Easy to add more complex scenarios (e.g., user leaving, changing vote).

## ✅ Verification Checklist
-   [ ] Install Playwright.
-   [ ] Write `game-flow.spec.ts`.
-   [ ] Run `npx playwright test`.
