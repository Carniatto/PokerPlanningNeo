# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/game-flow.spec.ts >> 3-User Game Flow >> should allow host and players to vote and reveal
- Location: tests/e2e/game-flow.spec.ts:4:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.vote-value-text:has-text("5")')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.vote-value-text:has-text("5")')

```

```yaml
- banner:
  - link "Poker Planning Neo Poker Planning NEO":
    - /url: /
    - img "Poker Planning Neo"
    - text: Poker Planning
    - img "NEO"
  - navigation:
    - link "About":
      - /url: /about
    - link "How it Works":
      - /url: /how-it-works
- main:
  - main:
    - heading "Revealed Results" [level=1]
    - text: "Room Code:"
    - strong: M7QPVJ
    - link "🔗 Copy Invite Link":
      - /url: javascript:void(0)
    - text: "Timebox:"
    - button "30s"
    - button "1m"
    - button "1.5m"
    - button "End Session"
    - heading "Current Task Under Estimation" [level=2]
    - img
    - textbox "add here the current task to be estimated"
    - heading "Final Votes" [level=2]
    - text: 8 BO Bob
    - heading "Session History" [level=3]
    - button "🔗 Connect Jira"
    - textbox "Jira URL or Task description..."
    - button "Add Task" [disabled]
    - paragraph: No tasks in the list yet.
    - img
    - heading "Local Player Emulator" [level=3]
    - text: Dev Tool
    - button "▲ Expand"
  - complementary:
    - text: Result 8 Avg 8.0 Spread 0 Min 8 Max 8
    - button "Start Next Round"
    - heading "Participants (3)" [level=3]
    - text: HO Host (You)
    - button "Edit Name":
      - img
    - text: Host AL Alice
    - button "+ Host"
    - text: BO Bob
    - button "+ Host"
    - text: "8"
- contentinfo:
  - paragraph: © 2025 Poker Planning Neo. All rights reserved.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('3-User Game Flow', () => {
  4  |     test('should allow host and players to vote and reveal', async ({ browser }) => {
  5  |         // Create 3 isolated contexts (different cookies/localStorage = different anonymous users)
  6  |         const hostContext = await browser.newContext();
  7  |         const aliceContext = await browser.newContext();
  8  |         const bobContext = await browser.newContext();
  9  | 
  10 |         const hostPage = await hostContext.newPage();
  11 |         const alicePage = await aliceContext.newPage();
  12 |         const bobPage = await bobContext.newPage();
  13 | 
  14 |         // 1. Host Creates Room from home page
  15 |         await hostPage.goto('/');
  16 |         // Dismiss intro overlay if present (it intercepts pointer events)
  17 |         const enterMatrixBtn = hostPage.locator('button.enter-btn');
  18 |         if (await enterMatrixBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  19 |             await enterMatrixBtn.click();
  20 |             // Wait for overlay to disappear
  21 |             await enterMatrixBtn.waitFor({ state: 'hidden', timeout: 5000 });
  22 |         }
  23 |         await hostPage.getByPlaceholder('Enter Your Name').fill('Host');
  24 |         await hostPage.click('button:has-text("Create New Room")');
  25 |         await hostPage.waitForURL(/\/room\//);
  26 |         const roomUrl = hostPage.url();
  27 | 
  28 |         // 2. Alice joins via the room URL - she'll see the name prompt overlay in the room
  29 |         await alicePage.goto(roomUrl);
  30 |         // Wait for name prompt to appear (it's an overlay rendered when showNamePrompt() is true)
  31 |         await alicePage.getByPlaceholder('Your Name').waitFor({ timeout: 10000 });
  32 |         await alicePage.getByPlaceholder('Your Name').fill('Alice');
  33 |         await alicePage.click('button:has-text("Join Room")');
  34 |         // Name prompt should dismiss and Alice should be in the room
  35 |         await expect(alicePage.locator('.voting-area, .dashboard-container')).toBeVisible({ timeout: 10000 });
  36 | 
  37 |         // 3. Bob joins via the room URL similarly
  38 |         await bobPage.goto(roomUrl);
  39 |         await bobPage.getByPlaceholder('Your Name').waitFor({ timeout: 10000 });
  40 |         await bobPage.getByPlaceholder('Your Name').fill('Bob');
  41 |         await bobPage.click('button:has-text("Join Room")');
  42 |         await expect(bobPage.locator('.voting-area, .dashboard-container')).toBeVisible({ timeout: 10000 });
  43 | 
  44 |         // 4. Verify Participants on Host
  45 |         await expect(hostPage.locator('.participants-container')).toContainText('Alice', { timeout: 10000 });
  46 |         await expect(hostPage.locator('.participants-container')).toContainText('Bob', { timeout: 10000 });
  47 | 
  48 |         // 5. Voting - click the voting cards on Alice and Bob's pages
  49 |         await alicePage.locator('.voting-grid').waitFor({ timeout: 10000 });
  50 |         await alicePage.locator('app-voting-card:has-text("5")').click();
  51 | 
  52 |         await bobPage.locator('.voting-grid').waitFor({ timeout: 10000 });
  53 |         await bobPage.locator('app-voting-card:has-text("8")').click();
  54 | 
  55 |         // Wait for votes to register on host (at least one participant shows as has-voted)
  56 |         await hostPage.locator('.participants-container .has-voted').waitFor({ timeout: 10000 });
  57 | 
  58 |         // 6. Host Reveals
  59 |         const revealBtn = hostPage.locator('button:has-text("REVEAL VOTES")');
  60 |         await expect(revealBtn).toBeEnabled({ timeout: 5000 });
  61 |         await revealBtn.click();
  62 | 
  63 |         // 7. Verify Results - after reveal, .vote-value-text divs show individual votes
> 64 |         await expect(hostPage.locator('.vote-value-text:has-text("5")')).toBeVisible({ timeout: 10000 });
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  65 |         await expect(hostPage.locator('.vote-value-text:has-text("8")')).toBeVisible({ timeout: 5000 });
  66 | 
  67 |         // Check for average badge
  68 |         await expect(hostPage.locator('.average-badge')).toBeVisible();
  69 |         await expect(hostPage.locator('.average-badge')).toContainText('Average: 6.5');
  70 |     });
  71 | });
  72 | 
```