import { test, expect } from '@playwright/test';
import { CHANGELOG } from '../../src/app/changelog';

const latestVersion = CHANGELOG[0].version;

test.describe('Changelog and Versioning Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Pre-set hasSeenIntro in localStorage to bypass the welcome screen
        await page.addInitScript(() => {
            localStorage.setItem('hasSeenIntro', 'true');
        });
    });

    test('first-time user should get version silently and badge clickable', async ({ page }) => {
        await page.goto('/');

        // Verify version badge is visible in header
        const badgeBtn = page.locator('.version-badge-btn');
        await expect(badgeBtn).toBeVisible();
        await expect(badgeBtn).toContainText(`v${latestVersion}`);

        // Since it's a first time user, no notification dot should be present
        const badgeDot = page.locator('.badge-dot');
        await expect(badgeDot).not.toBeVisible();

        // Local storage should have been set to latest version
        const lastSeen = await page.evaluate(() => localStorage.getItem('poker_last_seen_version'));
        expect(lastSeen).toBe(latestVersion);

        // Click version badge to open history manually
        await badgeBtn.click();

        // Verify modal is open and has correct history title
        const modal = page.locator('.changelog-modal');
        await expect(modal).toBeVisible();
        await expect(modal.locator('h2')).toContainText('Version History');

        // Verify features and fixes list
        await expect(modal.locator('.version-number').first()).toContainText(`v${latestVersion}`);
        await expect(modal.locator('.text-neon').first()).toContainText('New Features');
        await expect(modal.locator('.text-purple').first()).toContainText('Bug Fixes');

        // Close the modal
        await modal.locator('button:has-text("Got it!")').click();
        await expect(modal).not.toBeVisible();
    });

    test('returning user with old version should see What Is New popup', async ({ page }) => {
        // Pre-configure older version in localStorage before page load
        await page.addInitScript(() => {
            localStorage.setItem('poker_last_seen_version', '0.0.0');
        });

        await page.goto('/');

        // The popup should appear automatically
        const modal = page.locator('.changelog-modal');
        await expect(modal).toBeVisible({ timeout: 10000 });
        await expect(modal.locator('h2')).toContainText("What's New in Neo!");

        // The notification badge dot should be pulsing in the header
        const badgeDot = page.locator('.badge-dot');
        await expect(badgeDot).toBeVisible();

        // Click "Got it!" to dismiss
        await modal.locator('button:has-text("Got it!")').click();
        await expect(modal).not.toBeVisible();

        // The notification badge dot should be gone
        await expect(badgeDot).not.toBeVisible();

        // Local storage should be updated to latest
        const lastSeen = await page.evaluate(() => localStorage.getItem('poker_last_seen_version'));
        expect(lastSeen).toBe(latestVersion);
    });
});
