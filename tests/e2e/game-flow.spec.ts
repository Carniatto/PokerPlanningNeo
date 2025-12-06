import { test, expect } from '@playwright/test';

test.describe('3-User Game Flow', () => {
    test('should allow host and players to vote and reveal', async ({ browser }) => {
        // Create 3 isolated contexts
        const hostContext = await browser.newContext();
        const aliceContext = await browser.newContext();
        const bobContext = await browser.newContext();

        const hostPage = await hostContext.newPage();
        const alicePage = await aliceContext.newPage();
        const bobPage = await bobContext.newPage();

        // 1. Host Creates Room
        await hostPage.goto('http://localhost:4200');

        // Dismiss Intro if present
        const enterBtn = hostPage.locator('.enter-btn');
        if (await enterBtn.isVisible()) {
            await enterBtn.click();
        }

        await hostPage.fill('input[name="name"]', 'Host');
        await hostPage.click('button:has-text("Create New Room")');
        // Wait for room to load
        await hostPage.waitForURL(/\/room\//);
        const roomUrl = hostPage.url();

        // 2. Players Join
        await alicePage.goto(roomUrl);
        const aliceEnterBtn = alicePage.locator('.enter-btn');
        if (await aliceEnterBtn.isVisible()) {
            await aliceEnterBtn.click();
        }
        await alicePage.fill('input[name="name"]', 'Alice');
        await alicePage.click('button:has-text("Join Room")');

        await bobPage.goto(roomUrl);
        const bobEnterBtn = bobPage.locator('.enter-btn');
        if (await bobEnterBtn.isVisible()) {
            await bobEnterBtn.click();
        }
        await bobPage.fill('input[name="name"]', 'Bob');
        await bobPage.click('button:has-text("Join Room")');

        // 3. Verify Participants on Host
        await expect(hostPage.locator('.participants-container')).toContainText('Alice');
        await expect(hostPage.locator('.participants-container')).toContainText('Bob');

        // 4. Voting
        await alicePage.click('app-voting-card:has-text("5")');
        await bobPage.click('app-voting-card:has-text("8")');

        // 5. Host Reveals
        const revealBtn = hostPage.locator('button:has-text("REVEAL VOTES")');
        await expect(revealBtn).toBeVisible({ timeout: 5000 });
        await revealBtn.click({ force: true });

        // 6. Verify Results
        await expect(hostPage.locator('.participants-container')).toContainText('5', { timeout: 10000 }); // Alice's vote
        await expect(hostPage.locator('.participants-container')).toContainText('8'); // Bob's vote
        await expect(hostPage.locator('.participants-container')).toContainText('8'); // Bob's vote
        await expect(hostPage.locator('.participants-container')).toContainText('8'); // Bob's vote

        // Check for Host Result Card
        await expect(hostPage.locator('.round-result-card')).toBeVisible();
        await expect(hostPage.locator('.round-result-card')).toContainText('Round Result');
        await expect(hostPage.locator('.round-result-card')).toContainText('6.5'); // Avg of 5 and 8
    });
});
