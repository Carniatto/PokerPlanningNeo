import { test, expect } from '@playwright/test';

test.describe('Host Controls Flow', () => {
    test('should allow host to manage tasks, estimate them, save, and reset rounds', async ({ browser }) => {
        const hostContext = await browser.newContext();
        const aliceContext = await browser.newContext();

        const hostPage = await hostContext.newPage();
        const alicePage = await aliceContext.newPage();

        // 1. Host creates a room
        await hostPage.goto('/');
        
        // Dismiss intro overlay if present
        const enterMatrixBtn = hostPage.locator('button.enter-btn');
        if (await enterMatrixBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await enterMatrixBtn.click();
            await enterMatrixBtn.waitFor({ state: 'hidden', timeout: 5000 });
        }

        await hostPage.getByPlaceholder('Enter Your Name').fill('Host User');
        await hostPage.click('button:has-text("Create New Room")');
        await hostPage.waitForURL(/\/room\//);
        const roomUrl = hostPage.url();

        // 2. Host adds a custom task
        const taskInput = hostPage.locator('input.add-task-input');
        await expect(taskInput).toBeVisible({ timeout: 10000 });
        await taskInput.fill('My Custom Story 123');
        await hostPage.click('button:has-text("Add Task")');

        // Verify task appears in the table with no estimate
        const taskRow = hostPage.locator('tr.clickable:has-text("My Custom Story 123")');
        await expect(taskRow).toBeVisible({ timeout: 5000 });
        await expect(taskRow.locator('.estimate-input, .estimate-value-neo')).toHaveValue('');

        // 3. Host selects the custom task for estimation
        await taskRow.click();
        
        // Verify task description header updates
        const taskDescHeader = hostPage.locator('app-task-description');
        await expect(taskDescHeader).toContainText('My Custom Story 123');

        // 4. Alice joins the room
        await alicePage.goto(roomUrl);
        await alicePage.getByPlaceholder('Your Name').waitFor({ timeout: 10000 });
        await alicePage.getByPlaceholder('Your Name').fill('Alice Player');
        await alicePage.click('button:has-text("Join Room")');
        await expect(alicePage.locator('.voting-area')).toBeVisible({ timeout: 10000 });

        // Verify Alice sees the active task
        await expect(alicePage.locator('app-task-description')).toContainText('My Custom Story 123');

        // 5. Voting
        await alicePage.locator('app-voting-card:has-text("5")').click();
        await hostPage.locator('app-voting-card:has-text("8")').click();

        // Wait for votes to register
        await hostPage.locator('.participant-row:has-text("Alice Player").has-voted').waitFor({ timeout: 5000 });

        // 6. Host reveals votes
        const revealBtn = hostPage.locator('button:has-text("REVEAL VOTES")');
        await expect(revealBtn).toBeEnabled();
        await revealBtn.click();

        // Verify result stats (average is 6.5)
        await expect(hostPage.locator('.stat:has-text("Avg") .value')).toContainText('6.5');

        // 7. Host confirms estimate (e.g. choose 8)
        const chip8 = hostPage.locator('.estimate-chip:has-text("8")');
        await chip8.click();
        await expect(chip8).toHaveClass(/selected/);

        // 8. Host saves estimate
        const saveBtn = hostPage.locator('button.btn-save-continue');
        await expect(saveBtn).toBeVisible();
        await saveBtn.click();

        // Verify estimate in task list table is updated to "8"
        await expect(taskRow.locator('.estimate-input')).toHaveValue('8');

        // 9. Host starts next round / replays
        // In the results state without active task, or inside host view: click "Replay Round" or "Start Next Round"
        // Let's click "Start Next Round" or "Replay Round" if we are in results state.
        const replayBtn = hostPage.locator('button:has-text("Replay Round"), button:has-text("Start Next Round")');
        await expect(replayBtn).toBeVisible();
        await replayBtn.click();

        // Verify that the voting state is reset (e.g. REVEAL VOTES button is back but disabled)
        await expect(hostPage.locator('button:has-text("REVEAL VOTES")')).toBeDisabled({ timeout: 5000 });
    });
});
