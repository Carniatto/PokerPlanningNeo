import { test, expect } from '@playwright/test';

test.describe('Task Reordering Flow', () => {
    test('should allow host to reorder tasks using drag and drop', async ({ browser }) => {
        const hostContext = await browser.newContext();
        const aliceContext = await browser.newContext();

        const hostPage = await hostContext.newPage();
        const alicePage = await aliceContext.newPage();

        // 1. Host creates a room
        await hostPage.goto('/');
        const enterMatrixBtn = hostPage.locator('button.enter-btn');
        if (await enterMatrixBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await enterMatrixBtn.click();
            await enterMatrixBtn.waitFor({ state: 'hidden', timeout: 5000 });
        }
        await hostPage.getByPlaceholder('Enter Your Name').fill('Host User');
        await hostPage.click('button:has-text("Create New Room")');
        await hostPage.waitForURL(/\/room\//);
        const roomUrl = hostPage.url();

        // 2. Add two tasks
        const taskInput = hostPage.locator('input.add-task-input');
        await expect(taskInput).toBeVisible({ timeout: 10000 });
        
        await taskInput.fill('Task A');
        await hostPage.click('button:has-text("Add Task")');
        await expect(hostPage.locator('tr.clickable:has-text("Task A")')).toBeVisible({ timeout: 5000 });

        await taskInput.fill('Task B');
        await hostPage.click('button:has-text("Add Task")');
        await expect(hostPage.locator('tr.clickable:has-text("Task B")')).toBeVisible({ timeout: 5000 });

        // 3. Alice joins
        await alicePage.goto(roomUrl);
        await alicePage.getByPlaceholder('Your Name').waitFor({ timeout: 10000 });
        await alicePage.getByPlaceholder('Your Name').fill('Alice Player');
        await alicePage.click('button:has-text("Join Room")');
        await expect(alicePage.locator('.room-layout')).toBeVisible({ timeout: 10000 });

        // Verify task order initially: Task A, then Task B
        const hostRowsBefore = hostPage.locator('table.tasks-table tbody tr');
        await expect(hostRowsBefore.nth(0)).toContainText('Task A');
        await expect(hostRowsBefore.nth(1)).toContainText('Task B');

        const aliceRowsBefore = alicePage.locator('table.tasks-table tbody tr');
        await expect(aliceRowsBefore.nth(0)).toContainText('Task A');
        await expect(aliceRowsBefore.nth(1)).toContainText('Task B');

        // 4. Drag and Drop: Drag Task A's handle and drop it on Task B using mouse simulation
        const handleA = hostRowsBefore.nth(0).locator('.drag-handle');
        const rowB = hostRowsBefore.nth(1);

        // Scroll the drag handle into view before fetching coordinates
        await handleA.hover();
        await hostPage.waitForTimeout(100);

        const boxA = await handleA.boundingBox();
        const boxB = await rowB.boundingBox();

        if (boxA && boxB) {
            // Move to handle A (scroll-adjusted) and press down
            await hostPage.mouse.move(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2);
            await hostPage.mouse.down();
            await hostPage.waitForTimeout(200); // Crucial wait for Angular CDK state initialization
            
            // Move slightly down (10px) to trigger the CDK drag start threshold
            await hostPage.mouse.move(boxA.x + boxA.width / 2, boxA.y + boxA.height / 2 + 10, { steps: 5 });
            await hostPage.waitForTimeout(200);
            
            // Move smoothly to the original center of row B (which triggers dragover)
            await hostPage.mouse.move(boxB.x + boxB.width / 2, boxB.y + boxB.height / 2, { steps: 10 });
            await hostPage.waitForTimeout(200);
            
            // Release mouse
            await hostPage.mouse.up();
            await hostPage.waitForTimeout(500); // Wait for database roundtrip to sync
        } else {
            throw new Error('Could not find bounding boxes for drag and drop elements');
        }

        // 5. Verify the order is swapped on both Host and Alice pages
        const hostRowsAfter = hostPage.locator('table.tasks-table tbody tr');
        await expect(hostRowsAfter.nth(0)).toContainText('Task B', { timeout: 10000 });
        await expect(hostRowsAfter.nth(1)).toContainText('Task A');

        const aliceRowsAfter = alicePage.locator('table.tasks-table tbody tr');
        await expect(aliceRowsAfter.nth(0)).toContainText('Task B', { timeout: 10000 });
        await expect(aliceRowsAfter.nth(1)).toContainText('Task A');
    });
});
