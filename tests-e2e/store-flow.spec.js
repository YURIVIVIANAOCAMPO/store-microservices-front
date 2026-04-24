import { test, expect } from '@playwright/test';

test.describe('Store Flow', () => {
  test('should login and navigate through products', async ({ page }) => {
    // Note: This requires the app and backend to be running
    await page.goto('http://localhost:5173/login');
    
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.locator('h1')).toContainText('Product Catalog');

    // Go to detail
    await page.click('.glass-card a');
    await expect(page.locator('h1')).toBeVisible();

    // Purchase
    await page.fill('input[type="number"]', '1');
    await page.click('button:has-text("Confirm Purchase")');
    
    // Check feedback
    const feedback = page.locator('.p-4.rounded-xl');
    await expect(feedback).toBeVisible();
  });
});
