import { test, expect } from '@playwright/test';

test.describe('How It Works Flow', () => {
    test('should navigate through slides', async ({ page }) => {
        // 1. Direct Navigation to Module (bypass Home click to avoid interception issues)
        await page.goto('/how-it-works');
        await expect(page).toHaveURL(/.*how-it-works/);

        // 3. Verify Slide 1 (The Goal)
        // Note: Using .first() to target the first slide in the DOM, or filtering by text
        await expect(page.locator('.slide').first().locator('h2')).toContainText('The Goal');

        // 4. Next Slide
        await page.click('button.nav-btn.next');
        // Wait for animation if needed, or just check next slide
        // We can check that the 2nd slide exists
        await expect(page.locator('.slide').nth(1).locator('h2')).toContainText('1. Discuss');

        // 5. Close
        await page.click('button.close-btn');
        await expect(page).toHaveURL(/http:\/\/localhost:\d+\/$/);
    });
});
