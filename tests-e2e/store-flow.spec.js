import { test, expect } from '@playwright/test';

test.describe('StoreMaster Flow', () => {
  test('should login and navigate to catalog', async ({ page }) => {
    await page.goto('/login');
    
    // Fill login
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin');
    await page.click('button[type="submit"]');

    // Wait for redirect to home
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Catálogo de Productos');
  });

  test('should view product detail and attempt purchase', async ({ page }) => {
    await page.goto('/');
    
    // Select first product
    await page.locator('.group').first().click();
    
    // Verify detail page
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('button:has-text("Comprar Ahora")')).toBeVisible();

    // Perform purchase (assuming inventory is up)
    await page.click('button:has-text("Comprar Ahora")');
    
    // Success feedback (Toast)
    await expect(page.locator('.fixed.bottom-10')).toBeVisible();
  });
});
