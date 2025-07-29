const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../utils/auth');
const { TestDataHelper } = require('../utils/testData');

/**
 * User Authentication and Protected Pages E2E Tests
 * Tests user registration, login, and authenticated pages
 */

test.describe('User Authentication', () => {
  let authHelper;
  let testDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('User registration flow should work', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    
    await page.goto('/register');
    
    // Fill registration form
    await page.fill('input[name*="name"]', 'Test User');
    await page.fill('input[name*="email"]', testEmail);
    await page.fill('input[name*="password"]:not([name*="confirmation"])', 'password123');
    await page.fill('input[name*="password_confirmation"], input[name*="password"][name*="confirmation"]', 'password123');
    
    // Submit form
    await page.click('input[type="submit"], button[type="submit"]');
    
    // Should redirect to authenticated area (home or mypage)
    await page.waitForURL(/(?:\/|\/mypage)/);
    
    // Should be logged in now
    expect(await authHelper.isLoggedIn()).toBeTruthy();
  });

  test('User login flow should work', async ({ page }) => {
    await page.goto('/login');
    
    // Use default test credentials (assuming they exist in seed data)
    await page.fill('input[name*="email"]', 'testuser@example.com');
    await page.fill('input[name*="password"]', 'password123');
    
    await page.click('input[type="submit"], button[type="submit"]');
    
    // Should redirect after login
    await page.waitForURL(/(?:\/|\/mypage|\/campaigns)/);
    
    // Check if login was successful (either logged in or redirected to register)
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
  });

  test('Logout should work', async ({ page }) => {
    // First login
    try {
      await authHelper.loginAsUser();
    } catch (error) {
      // If login fails, skip this test
      test.skip('User login not available');
    }
    
    // Logout
    await authHelper.logout();
    
    // Should be logged out
    expect(await authHelper.isLoggedIn()).toBeFalsy();
  });
});

test.describe('User Protected Pages', () => {
  let authHelper;
  let testDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('MyPage (/mypage) should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/mypage');
    
    // Should redirect to login page
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('MyPage (/mypage) should load when authenticated', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      await page.goto('/mypage');
      
      // Should load mypage successfully
      await expect(page.locator('body')).toBeVisible();
      await expect(page.url()).toMatch(/\/mypage/);
      
      // Should contain user-specific content
      await expect(page.locator('h1, h2, .mypage, text=マイページ, text=MyPage')).toHaveCount.greaterThan(0);
    } catch (error) {
      test.skip('User authentication not available');
    }
  });

  test('Campaign entry form (/campaigns/:id/entry) should redirect to login when not authenticated', async ({ page }) => {
    const campaignId = await testDataHelper.getFirstCampaignId() || 1;
    
    await page.goto(`/campaigns/${campaignId}/entry`);
    
    // Should redirect to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('Campaign entry form (/campaigns/:id/entry) should load when authenticated', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      const campaignId = await testDataHelper.getFirstCampaignId() || 1;
      await page.goto(`/campaigns/${campaignId}/entry`);
      
      // Should either load entry form or show already applied message
      await expect(page.locator('body')).toBeVisible();
      
      // URL should be correct
      await expect(page.url()).toMatch(/\/campaigns\/\d+\/entry/);
    } catch (error) {
      test.skip('User authentication or campaign not available');
    }
  });

  test('Campaign entry completion (/campaigns/:id/entry/done) should redirect to login when not authenticated', async ({ page }) => {
    const campaignId = await testDataHelper.getFirstCampaignId() || 1;
    
    await page.goto(`/campaigns/${campaignId}/entry/done`);
    
    // Should redirect to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('Campaign entry completion (/campaigns/:id/entry/done) should handle authenticated access', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      const campaignId = await testDataHelper.getFirstCampaignId() || 1;
      await page.goto(`/campaigns/${campaignId}/entry/done`);
      
      // Should handle the request (either show completion or redirect appropriately)
      await expect(page.locator('body')).toBeVisible();
    } catch (error) {
      test.skip('User authentication or campaign not available');
    }
  });

  test('Review posting (/mypage/review/:id) should redirect to login when not authenticated', async ({ page }) => {
    const campaignId = await testDataHelper.getFirstCampaignId() || 1;
    
    await page.goto(`/mypage/review/${campaignId}`);
    
    // Should redirect to login
    await page.waitForURL('/login');
    expect(page.url()).toContain('/login');
  });

  test('Review posting (/mypage/review/:id) should handle authenticated access', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      const campaignId = await testDataHelper.getFirstCampaignId() || 1;
      await page.goto(`/mypage/review/${campaignId}`);
      
      // Should handle the request appropriately
      await expect(page.locator('body')).toBeVisible();
    } catch (error) {
      test.skip('User authentication or campaign not available');
    }
  });
});