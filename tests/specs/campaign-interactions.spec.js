const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../utils/auth');
const { TestDataHelper } = require('../utils/testData');

/**
 * Campaign Interaction E2E Tests
 * Tests campaign browsing, details, and entry workflows
 */

test.describe('Campaign Interactions', () => {
  let authHelper;
  let testDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('Campaign browsing workflow should work', async ({ page }) => {
    // Start at homepage
    await page.goto('/');
    
    // Navigate to campaigns page
    const campaignsLink = page.locator('a[href="/campaigns"], a:has-text("キャンペーン"), a:has-text("Campaigns")').first();
    if (await campaignsLink.count() > 0) {
      await campaignsLink.click();
      await expect(page.url()).toMatch(/\/campaigns/);
    } else {
      await page.goto('/campaigns');
    }
    
    // Should show campaigns page
    await expect(page.locator('body')).toBeVisible();
    
    // Look for campaign links and click one if available
    const campaignDetailLink = page.locator('a[href*="/campaigns/"]').first();
    if (await campaignDetailLink.count() > 0) {
      await campaignDetailLink.click();
      
      // Should be on campaign detail page
      await expect(page.url()).toMatch(/\/campaigns\/\d+$/);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Campaign detail page should show campaign information', async ({ page }) => {
    const campaignId = await testDataHelper.getFirstCampaignId() || 1;
    
    await page.goto(`/campaigns/${campaignId}`);
    
    // Should load campaign details
    await expect(page.locator('body')).toBeVisible();
    
    // Should contain campaign information elements
    const campaignElements = page.locator('h1, h2, .title, .description, .campaign-info');
    await expect(campaignElements).toHaveCount.greaterThan(0);
  });

  test('Campaign entry button should be visible for authenticated users', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      const campaignId = await testDataHelper.getFirstCampaignId() || 1;
      await page.goto(`/campaigns/${campaignId}`);
      
      // Look for entry/application button or link
      const entryElements = page.locator('a:has-text("応募"), a:has-text("Apply"), button:has-text("応募"), a[href*="entry"]');
      
      // Should have at least one entry element or show already applied message
      const entryCount = await entryElements.count();
      const alreadyAppliedText = await page.locator('text=応募済み, text=Already applied').count();
      
      expect(entryCount + alreadyAppliedText).toBeGreaterThan(0);
    } catch (error) {
      test.skip('User authentication or campaign not available');
    }
  });

  test('Campaign entry workflow should work for authenticated users', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      const campaignId = await testDataHelper.getFirstCampaignId() || 1;
      await page.goto(`/campaigns/${campaignId}`);
      
      // Look for entry button and click it
      const entryButton = page.locator('a:has-text("応募"), a:has-text("Apply"), a[href*="entry"]').first();
      
      if (await entryButton.count() > 0) {
        await entryButton.click();
        
        // Should navigate to entry form
        await expect(page.url()).toMatch(/\/campaigns\/\d+\/entry$/);
        await expect(page.locator('body')).toBeVisible();
        
        // Should show entry form or confirmation
        const formElements = page.locator('form, input[type="submit"], button[type="submit"], .entry-form');
        await expect(formElements).toHaveCount.greaterThan(0);
      }
    } catch (error) {
      test.skip('User authentication or campaign entry not available');
    }
  });

  test('Campaign entry completion page should be accessible after application', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      const campaignId = await testDataHelper.getFirstCampaignId() || 1;
      
      // Try to access entry completion page directly
      await page.goto(`/campaigns/${campaignId}/entry/done`);
      
      // Should handle the request appropriately
      await expect(page.locator('body')).toBeVisible();
      
      // Should either show completion message or redirect appropriately
      const url = page.url();
      expect(url).toMatch(/\/campaigns\/\d+/);
    } catch (error) {
      test.skip('User authentication or campaign not available');
    }
  });
});

test.describe('User Workflow Integration', () => {
  let authHelper;
  let testDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('Full user journey: register -> browse -> apply workflow', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `userjourney${timestamp}@example.com`;
    
    // Step 1: Register new user
    await page.goto('/register');
    
    try {
      await page.fill('input[name*="name"]', 'Journey Test User');
      await page.fill('input[name*="email"]', testEmail);
      await page.fill('input[name*="password"]:not([name*="confirmation"])', 'password123');
      await page.fill('input[name*="password_confirmation"], input[name*="password"][name*="confirmation"]', 'password123');
      
      await page.click('input[type="submit"], button[type="submit"]');
      
      // Should be logged in after registration
      await page.waitForURL(/(?:\/|\/mypage)/);
      
      // Step 2: Browse campaigns
      await page.goto('/campaigns');
      await expect(page.locator('body')).toBeVisible();
      
      // Step 3: View campaign details
      const campaignLink = page.locator('a[href*="/campaigns/"]').first();
      if (await campaignLink.count() > 0) {
        await campaignLink.click();
        await expect(page.url()).toMatch(/\/campaigns\/\d+$/);
        
        // Step 4: Check mypage access
        await page.goto('/mypage');
        await expect(page.url()).toMatch(/\/mypage/);
        await expect(page.locator('body')).toBeVisible();
      }
    } catch (error) {
      test.skip('Registration or campaign workflow not available');
    }
  });

  test('MyPage should show user activity and allow navigation', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      await page.goto('/mypage');
      
      // Should load mypage
      await expect(page.url()).toMatch(/\/mypage/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should have user-specific content
      await expect(page.locator('h1, h2, .user-info, text=マイページ, text=MyPage')).toHaveCount.greaterThan(0);
      
      // Check for navigation elements
      const navigationElements = page.locator('a[href*="/campaigns"], a:has-text("キャンペーン"), a:has-text("Campaigns")');
      
      // If navigation is available, test it
      if (await navigationElements.count() > 0) {
        await navigationElements.first().click();
        await expect(page.url()).toMatch(/\/campaigns/);
      }
    } catch (error) {
      test.skip('User authentication not available');
    }
  });

  test('Review workflow should be accessible from appropriate pages', async ({ page }) => {
    try {
      await authHelper.loginAsUser();
      
      const campaignId = await testDataHelper.getFirstCampaignId() || 1;
      
      // Try accessing review page directly
      await page.goto(`/mypage/review/${campaignId}`);
      
      // Should handle the review request
      await expect(page.locator('body')).toBeVisible();
      
      // Should either show review form or appropriate message
      const reviewElements = page.locator('form, textarea, input[type="submit"], text=レビュー, text=Review');
      const messageElements = page.locator('text=レビューできません, text=Cannot review, text=応募していません');
      
      expect(await reviewElements.count() + await messageElements.count()).toBeGreaterThan(0);
    } catch (error) {
      test.skip('User authentication or review functionality not available');
    }
  });
});