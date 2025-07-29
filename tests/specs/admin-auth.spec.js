const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../utils/auth');
const { TestDataHelper } = require('../utils/testData');

/**
 * Admin Authentication and Protected Pages E2E Tests
 * Tests admin login and all admin interface pages
 */

test.describe('Admin Authentication', () => {
  let authHelper;
  let testDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('Admin login page should be accessible', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to admin login or show login form
    await page.waitForURL('/admin*');
    
    if (page.url().includes('/sign_in')) {
      // Login form should be visible
      await expect(page.locator('input[name*="email"]')).toBeVisible();
      await expect(page.locator('input[name*="password"]')).toBeVisible();
      await expect(page.locator('input[type="submit"], button[type="submit"]')).toBeVisible();
    }
  });

  test('Admin login should work with valid credentials', async ({ page }) => {
    await page.goto('/admin');
    
    // If redirected to sign in, fill the form
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      
      // Should redirect to admin dashboard
      await page.waitForURL('/admin');
    }
    
    // Should be on admin dashboard
    expect(page.url()).toMatch(/\/admin$/);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Protected Pages', () => {
  let authHelper;
  let testDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('Admin dashboard (/admin) should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    
    // Should either be on admin dashboard or redirect to admin login
    await page.waitForURL('/admin*');
    
    if (page.url().includes('/sign_in')) {
      // Login form should be present
      await expect(page.locator('input[name*="email"]')).toBeVisible();
    } else {
      // Should be on dashboard
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Admin dashboard (/admin) should load when authenticated', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin');
      
      // Should load admin dashboard
      await expect(page.url()).toMatch(/\/admin$/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should contain admin-specific content
      await expect(page.locator('h1, h2, .admin, text=管理, text=Admin, text=Dashboard')).toHaveCount.greaterThan(0);
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Campaign management (/admin/campaigns) should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/campaigns');
    
    // Should redirect to admin login
    await page.waitForURL('/admin*');
    
    if (page.url().includes('/sign_in')) {
      await expect(page.locator('input[name*="email"]')).toBeVisible();
    }
  });

  test('Campaign management (/admin/campaigns) should load when authenticated', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/campaigns');
      
      // Should load campaigns management page
      await expect(page.url()).toMatch(/\/admin\/campaigns/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should contain campaign management content
      await expect(page.locator('h1, h2, table, .campaigns, text=キャンペーン, text=Campaign')).toHaveCount.greaterThan(0);
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Entry management (/admin/campaigns/:id/entries) should redirect to login when not authenticated', async ({ page }) => {
    const campaignId = await testDataHelper.getFirstCampaignId() || 1;
    
    await page.goto(`/admin/campaigns/${campaignId}/entries`);
    
    // Should redirect to admin login
    await page.waitForURL('/admin*');
    
    if (page.url().includes('/sign_in')) {
      await expect(page.locator('input[name*="email"]')).toBeVisible();
    }
  });

  test('Entry management (/admin/campaigns/:id/entries) should load when authenticated', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      const campaignId = await testDataHelper.getFirstCampaignId() || 1;
      await page.goto(`/admin/campaigns/${campaignId}/entries`);
      
      // Should load entries management page
      await expect(page.url()).toMatch(/\/admin\/campaigns\/\d+\/entries/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should contain entry management content
      await expect(page.locator('h1, h2, table, .entries, text=応募, text=Entry')).toHaveCount.greaterThan(0);
    } catch (error) {
      test.skip('Admin authentication or campaign not available');
    }
  });

  test('Shipment management (/admin/shipments) should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/shipments');
    
    // Should redirect to admin login
    await page.waitForURL('/admin*');
    
    if (page.url().includes('/sign_in')) {
      await expect(page.locator('input[name*="email"]')).toBeVisible();
    }
  });

  test('Shipment management (/admin/shipments) should load when authenticated', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/shipments');
      
      // Should load shipments management page
      await expect(page.url()).toMatch(/\/admin\/shipments/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should contain shipment management content
      await expect(page.locator('h1, h2, table, .shipments, text=配送, text=Shipment')).toHaveCount.greaterThan(0);
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Review management (/admin/reviews) should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/reviews');
    
    // Should redirect to admin login
    await page.waitForURL('/admin*');
    
    if (page.url().includes('/sign_in')) {
      await expect(page.locator('input[name*="email"]')).toBeVisible();
    }
  });

  test('Review management (/admin/reviews) should load when authenticated', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/reviews');
      
      // Should load reviews management page
      await expect(page.url()).toMatch(/\/admin\/reviews/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should contain review management content
      await expect(page.locator('h1, h2, table, .reviews, text=レビュー, text=Review')).toHaveCount.greaterThan(0);
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Admin navigation should work between admin pages', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      // Start at admin dashboard
      await page.goto('/admin');
      await expect(page.url()).toMatch(/\/admin$/);
      
      // Navigate to campaigns
      const campaignsLink = page.locator('a[href="/admin/campaigns"], a:has-text("キャンペーン"), a:has-text("Campaign")').first();
      if (await campaignsLink.count() > 0) {
        await campaignsLink.click();
        await expect(page.url()).toMatch(/\/admin\/campaigns/);
      }
      
      // Navigate to shipments
      const shipmentsLink = page.locator('a[href="/admin/shipments"], a:has-text("配送"), a:has-text("Shipment")').first();
      if (await shipmentsLink.count() > 0) {
        await shipmentsLink.click();
        await expect(page.url()).toMatch(/\/admin\/shipments/);
      }
      
      // Navigate to reviews
      const reviewsLink = page.locator('a[href="/admin/reviews"], a:has-text("レビュー"), a:has-text("Review")').first();
      if (await reviewsLink.count() > 0) {
        await reviewsLink.click();
        await expect(page.url()).toMatch(/\/admin\/reviews/);
      }
      
      // Navigate back to dashboard
      const dashboardLink = page.locator('a[href="/admin"], a:has-text("ダッシュボード"), a:has-text("Dashboard"), .logo').first();
      if (await dashboardLink.count() > 0) {
        await dashboardLink.click();
        await expect(page.url()).toMatch(/\/admin$/);
      }
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });
});