import { test, expect } from '@playwright/test';

test.describe('3-User Game Flow', () => {
    test('should allow players to vote and host/co-hosts to reveal', async ({ browser }) => {
        // Create 3 isolated contexts (different cookies/localStorage = different anonymous users)
        const hostContext = await browser.newContext();
        const aliceContext = await browser.newContext();
        const bobContext = await browser.newContext();

        const hostPage = await hostContext.newPage();
        const alicePage = await aliceContext.newPage();
        const bobPage = await bobContext.newPage();

        // 1. Host Creates Room from home page
        await hostPage.goto('/');
        // Dismiss intro overlay if present (it intercepts pointer events)
        const enterMatrixBtn = hostPage.locator('button.enter-btn');
        if (await enterMatrixBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await enterMatrixBtn.click();
            // Wait for overlay to disappear
            await enterMatrixBtn.waitFor({ state: 'hidden', timeout: 5000 });
        }
        await hostPage.getByPlaceholder('Enter Your Name').fill('Host');
        await hostPage.click('button:has-text("Create New Room")');
        await hostPage.waitForURL(/\/room\//);
        const roomUrl = hostPage.url();

        // 2. Alice joins via the room URL - she'll see the name prompt overlay in the room
        await alicePage.goto(roomUrl);
        // Wait for name prompt to appear (it's an overlay rendered when showNamePrompt() is true)
        await alicePage.getByPlaceholder('Your Name').waitFor({ timeout: 10000 });
        await alicePage.getByPlaceholder('Your Name').fill('Alice');
        await alicePage.click('button:has-text("Join Room")');
        // Name prompt should dismiss and Alice should be in the room
        await expect(alicePage.locator('.room-layout')).toBeVisible({ timeout: 10000 });


        // 3. Bob joins via the room URL similarly
        await bobPage.goto(roomUrl);
        await bobPage.getByPlaceholder('Your Name').waitFor({ timeout: 10000 });
        await bobPage.getByPlaceholder('Your Name').fill('Bob');
        await bobPage.click('button:has-text("Join Room")');
        await expect(bobPage.locator('.room-layout')).toBeVisible({ timeout: 10000 });

        // 4. Verify Participants on Host
        await expect(hostPage.locator('.participants-container')).toContainText('Alice', { timeout: 10000 });
        await expect(hostPage.locator('.participants-container')).toContainText('Bob', { timeout: 10000 });

        // 5. Voting - click the voting cards on Alice and Bob's pages
        await alicePage.locator('.voting-grid').waitFor({ timeout: 10000 });
        await alicePage.locator('neo-voting-card:has-text("5")').click();

        await bobPage.locator('.voting-grid').waitFor({ timeout: 10000 });
        await bobPage.locator('neo-voting-card:has-text("8")').click();

        // Wait for votes to register on host (both participants show as has-voted)
        await hostPage.locator('.participant-row:has-text("Alice").has-voted').waitFor({ timeout: 10000 });
        await hostPage.locator('.participant-row:has-text("Bob").has-voted').waitFor({ timeout: 10000 });

        // 6. Host Reveals
        const revealBtn = hostPage.locator('button:has-text("REVEAL VOTES")');
        await expect(revealBtn).toBeEnabled({ timeout: 5000 });
        await revealBtn.click();

        // 7. Verify Results - after reveal, .vote-value-text divs show individual votes
        await expect(hostPage.locator('.vote-value-text:has-text("5")')).toBeVisible({ timeout: 10000 });
        await expect(hostPage.locator('.vote-value-text:has-text("8")')).toBeVisible({ timeout: 5000 });

        // Check for average in Host's sidebar stats
        await expect(hostPage.locator('.stat:has-text("Avg") .value')).toContainText('6.5');

        // Check for average badge on Player page (Alice)
        await expect(alicePage.locator('.average-badge')).toBeVisible();
        await expect(alicePage.locator('.average-badge')).toContainText('Average: 6.5');
    });

    test('should restrict reveal controls to the host and co-hosts only', async ({ browser }) => {
        const hostContext = await browser.newContext();
        const playerContext = await browser.newContext();

        const hostPage = await hostContext.newPage();
        const playerPage = await playerContext.newPage();

        // 1. Host Creates Room
        await hostPage.goto('/');
        const enterMatrixBtn = hostPage.locator('button.enter-btn');
        if (await enterMatrixBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await enterMatrixBtn.click();
            await enterMatrixBtn.waitFor({ state: 'hidden', timeout: 5000 });
        }
        await hostPage.getByPlaceholder('Enter Your Name').fill('Host');
        await hostPage.click('button:has-text("Create New Room")');
        await hostPage.waitForURL(/\/room\//);
        const roomUrl = hostPage.url();

        // 2. Player joins the room
        await playerPage.goto(roomUrl);
        await playerPage.getByPlaceholder('Your Name').waitFor({ timeout: 10000 });
        await playerPage.getByPlaceholder('Your Name').fill('Player');
        await playerPage.click('button:has-text("Join Room")');
        await expect(playerPage.locator('.room-layout')).toBeVisible({ timeout: 10000 });

        // Verify player cannot see "REVEAL VOTES" button initially
        await expect(playerPage.locator('button:has-text("REVEAL VOTES")')).not.toBeVisible();

        // 3. Voting
        await playerPage.locator('.voting-grid').waitFor({ timeout: 10000 });
        await playerPage.locator('neo-voting-card:has-text("5")').click();

        // Wait for player's vote to register on host
        await hostPage.locator('.participant-row:has-text("Player").has-voted').waitFor({ timeout: 10000 });

        // Verify player still cannot see "REVEAL VOTES" button after voting
        await expect(playerPage.locator('button:has-text("REVEAL VOTES")')).not.toBeVisible();

        // 4. Host reveals the votes
        const revealBtn = hostPage.locator('button:has-text("REVEAL VOTES")');
        await expect(revealBtn).toBeEnabled({ timeout: 5000 });
        await revealBtn.click();

        // Verify results are visible to both
        await expect(hostPage.locator('.vote-value-text:has-text("5")')).toBeVisible({ timeout: 10000 });
        await expect(playerPage.locator('.average-badge')).toBeVisible({ timeout: 10000 });

        // Verify player still cannot see "REVEAL VOTES" button after reveal
        await expect(playerPage.locator('button:has-text("REVEAL VOTES")')).not.toBeVisible();
    });
});
