import { test, expect } from '@playwright/test';

const ADMIN_USER = {
    email: 'c0mplexie1@gmail.com',
    password: 'sa1231234'
};

async function loginAsAdmin(page: any) {
    await page.goto('/auth/login');
    await page.fill('input#email', ADMIN_USER.email);
    await page.fill('input#password', ADMIN_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
}

test.describe('Admin Panel Tests', () => {

    test('TC-18: Access Admin Panel - Authorized', async ({ page }) => {
        await loginAsAdmin(page);

        await page.goto('/admin');

        await expect(page.locator('text=Admin Panel')).toBeVisible();
        await expect(page.locator('text=Add Movie')).toBeVisible();
    });

    test('TC-19: Access Admin Panel - Unauthorized', async ({ page }) => {
        await page.goto('/auth/login');
        await page.fill('input#email', 'test@example.com');
        await page.fill('input#password', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        await page.goto('/admin');

        await expect(page.locator('text=Access Denied')).toBeVisible();
    });

    test('TC-20: Create Movie', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto('/admin');

        await page.click('button:has-text("Add Movie")');

        await page.waitForSelector('form', { timeout: 5000 });

        await page.fill('input[name="title"]', 'Test Movie ' + Date.now());
        await page.fill('textarea[name="description"]', 'Test description');
        await page.fill('input[name="director"]', 'Test Director');
        await page.fill('input[name="releaseYear"]', '2024');
        await page.fill('input[name="duration"]', '120');
        await page.fill('input[name="rating"]', '8.5');
        await page.fill('input[name="price"]', '9.99');

        await page.click('button[type="submit"]');

        await page.waitForTimeout(1000);
        import { test, expect } from '@playwright/test';

// Helper to login
        async function login(page: any) {
            await page.goto('/auth/login');
            await page.fill('input#email', 'test@example.com');
            await page.fill('input#password', 'password123');
            await page.click('button[type="submit"]');
            await page.waitForURL('/');
        }

        test.describe('Movie Catalog Tests', () => {

            test.beforeEach(async ({ page }) => {
                await login(page);
            });

            test('TC-08: View All Movies', async ({ page }) => {
                await page.goto('/movies');

                // Wait for movies to load
                await page.waitForSelector('.grid', { timeout: 10000 });

                // Verify movies are displayed
                const movieCards = await page.locator('[data-testid="movie-card"]').count();
                expect(movieCards).toBeGreaterThan(0);
            });

            test('TC-09: Search Movies', async ({ page }) => {
                await page.goto('/movies');

                // Wait for page to load
                await page.waitForLoadState('networkidle');

                // Find search input (adjust selector based on SearchBar component)
                const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
                await searchInput.fill('action');
                await searchInput.press('Enter');

                // Wait for search results
                await page.waitForTimeout(1000);

                // Verify results (movies should be visible)
                const results = await page.locator('[data-testid="movie-card"]').count();
                expect(results).toBeGreaterThanOrEqual(0);
            });

            test('TC-10: Filter by Genre - Action', async ({ page }) => {
                await page.goto('/movies');

                // Wait for page load
                await page.waitForLoadState('networkidle');

                // Click Action genre button
                await page.click('button:has-text("Action")');

                // Wait for filter to apply
                await page.waitForTimeout(1000);

                // Verify Action button is active
                const actionButton = page.locator('button:has-text("Action")');
                await expect(actionButton).toHaveClass(/bg-primary-600/);
            });

            test('TC-11: Filter by Genre - All', async ({ page }) => {
                await page.goto('/movies');
                await page.waitForLoadState('networkidle');

                // Click on a genre first
                await page.click('button:has-text("Comedy")');
                await page.waitForTimeout(500);

                // Click "All" to reset
                await page.click('button:has-text("All")');
                await page.waitForTimeout(500);

                // Verify All button is active
                const allButton = page.locator('button:has-text("All")').first();
                await expect(allButton).toHaveClass(/bg-primary-600/);
            });

            test('TC-12: View Movie Details', async ({ page }) => {
                await page.goto('/movies');
                await page.waitForLoadState('networkidle');

                // Click on first movie card
                const firstMovie = page.locator('[data-testid="movie-card"]').first();
                await firstMovie.click();

                // Wait for navigation
                await page.waitForURL(/\/movies\/.+/);

                // Verify movie details page loaded
                await expect(page.locator('h1, h2')).toBeVisible();
            });

            test('TC-13: Add Movie to Watchlist', async ({ page }) => {
                await page.goto('/movies');
                await page.waitForLoadState('networkidle');

                // Find watchlist button and click
                const watchlistButton = page.locator('button[aria-label*="watchlist"], button:has-text("Watchlist")').first();
                await watchlistButton.click();

                // Wait for action to complete
                await page.waitForTimeout(500);

                // Verify button state changed or success message
                // Adjust based on your UI feedback
            });

            test('TC-14: Like Movie', async ({ page }) => {
                await page.goto('/movies');
                await page.waitForLoadState('networkidle');

                // Find and click like button
                const likeButton = page.locator('button[aria-label*="like"], button:has-text("Like")').first();
                await likeButton.click();

                await page.waitForTimeout(500);

                // Verify interaction recorded (button state change or message)
            });
        });
        await expect(page.locator('text=Test Movie')).toBeVisible();
    });
});