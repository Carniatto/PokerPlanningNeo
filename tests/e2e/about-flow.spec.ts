import { test, expect } from '@playwright/test';

test.describe('About Flow', () => {
    test('should navigate to about page directly and verify contents', async ({ page }) => {
        // Direct navigation to avoid the intro overlay intercepting pointer events
        await page.goto('/about');
        await expect(page).toHaveURL(/.*about/);

        // Verify page header is visible and correct
        await expect(page.locator('.about-container h1')).toContainText('About Poker Planning Neo');

        // Verify creator card contents
        await expect(page.locator('.creator-info h3')).toContainText('Matt Carniatto');
        await expect(page.locator('.creator-info .role')).toContainText('Lead Developer & Architect');
    });
});
