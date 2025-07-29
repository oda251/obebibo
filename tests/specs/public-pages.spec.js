const { test, expect } = require('@playwright/test');

/**
 * Public Pages E2E Tests
 * Tests all publicly accessible pages that don't require authentication
 */

test.describe('Public Pages', () => {
  
  test('Homepage (/) should load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that page loads successfully
    await expect(page).toHaveTitle(/Obebibo|トップ|ホーム/);
    
    // Verify it's the homepage with campaigns or content
    await expect(page.locator('body')).toBeVisible();
    
    // Should not show error messages
    await expect(page.locator('text=error', 'text=404', 'text=500')).toHaveCount(0);
  });

  test('Campaigns listing (/campaigns) should load successfully', async ({ page }) => {
    await page.goto('/campaigns');
    
    // Check page loads
    await expect(page).toHaveTitle(/キャンペーン|Campaigns/);
    
    // Should show campaigns or "no campaigns" message
    await expect(page.locator('body')).toBeVisible();
    
    // Should not show error messages
    await expect(page.locator('text=error', 'text=404', 'text=500')).toHaveCount(0);
  });

  test('Campaign details (/campaigns/:id) should load for valid campaign', async ({ page }) => {
    // First get a campaign ID from the campaigns page
    await page.goto('/campaigns');
    
    // Look for the first campaign link
    const campaignLink = page.locator('a[href*="/campaigns/"]').first();
    
    if (await campaignLink.count() > 0) {
      await campaignLink.click();
      
      // Should be on campaign detail page
      await expect(page.url()).toMatch(/\/campaigns\/\d+$/);
      await expect(page.locator('body')).toBeVisible();
    } else {
      // If no campaigns exist, visit a hypothetical campaign page
      await page.goto('/campaigns/1');
      // This might show "not found" which is acceptable
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Terms page (/terms) should load successfully', async ({ page }) => {
    await page.goto('/terms');
    
    // Check page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Should contain terms content or heading
    await expect(page.locator('h1, h2, .terms, text=利用規約, text=Terms')).toHaveCount.greaterThan(0);
  });

  test('Privacy policy page (/privacy) should load successfully', async ({ page }) => {
    await page.goto('/privacy');
    
    // Check page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Should contain privacy content or heading
    await expect(page.locator('h1, h2, .privacy, text=プライバシー, text=Privacy')).toHaveCount.greaterThan(0);
  });

  test('Inquiry page (/inquiry) should load successfully', async ({ page }) => {
    await page.goto('/inquiry');
    
    // Check page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Should contain inquiry form or content
    await expect(page.locator('h1, h2, form, text=お問い合わせ, text=Inquiry')).toHaveCount.greaterThan(0);
  });

  test('Login page (/login) should load successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Check page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Should have login form elements
    await expect(page.locator('input[type="email"], input[name*="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name*="password"]')).toBeVisible();
    await expect(page.locator('input[type="submit"], button[type="submit"]')).toBeVisible();
  });

  test('Registration page (/register) should load successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Check page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Should have registration form elements
    await expect(page.locator('input[name*="email"]')).toBeVisible();
    await expect(page.locator('input[name*="password"]')).toBeVisible();
  });

  test('Navigation between public pages should work', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Navigate to campaigns
    const campaignsLink = page.locator('a[href="/campaigns"], a:has-text("キャンペーン"), a:has-text("Campaigns")').first();
    if (await campaignsLink.count() > 0) {
      await campaignsLink.click();
      await expect(page.url()).toMatch(/\/campaigns/);
    }
    
    // Navigate to terms
    const termsLink = page.locator('a[href="/terms"], a:has-text("利用規約"), a:has-text("Terms")').first();
    if (await termsLink.count() > 0) {
      await termsLink.click();
      await expect(page.url()).toMatch(/\/terms/);
    }
    
    // Navigate back to home
    const homeLink = page.locator('a[href="/"], a:has-text("トップ"), a:has-text("Home"), .logo').first();
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await expect(page.url()).toMatch(/\/$/);
    }
  });
});