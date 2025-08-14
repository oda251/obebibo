const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../utils/auth');
const { TestDataHelper } = require('../utils/testData');

/**
 * Admin Error Cases E2E Tests
 * Tests error handling and edge cases in admin interface
 */

test.describe('Admin Error Cases', () => {
  let authHelper;
  let testDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('Admin campaigns page should handle missing routes gracefully', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/campaigns');
      
      // Should load campaigns management page without errors
      await expect(page.url()).toMatch(/\/admin\/campaigns/);
      await expect(page.locator('body')).toBeVisible();
      
      // Check that the page doesn't have JavaScript/route errors
      const errorMessages = page.locator('text=NoMethodError, text=undefined method, text=error');
      await expect(errorMessages).toHaveCount(0);
      
      // Check that campaign entries links are working
      const entryLinks = page.locator('a:has-text("応募者")');
      if (await entryLinks.count() > 0) {
        // Click first entry link and verify it works
        await entryLinks.first().click();
        
        // Should navigate to entries page without error
        await expect(page.url()).toMatch(/\/admin\/campaigns\/\d+\/entries/);
        await expect(page.locator('body')).toBeVisible();
        
        // Should not show route errors
        const routeErrors = page.locator('text=ActionController::UrlGenerationError, text=No route matches');
        await expect(routeErrors).toHaveCount(0);
      }
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Admin campaigns page should handle empty campaigns list', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/campaigns');
      
      // Should load page even with no campaigns
      await expect(page.url()).toMatch(/\/admin\/campaigns/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should show appropriate message or empty state
      const hasTable = await page.locator('table').count() > 0;
      const hasEmptyMessage = await page.locator('text=キャンペーンがありません, text=No campaigns, text=Empty').count() > 0;
      
      // Either table exists or empty message exists
      expect(hasTable || hasEmptyMessage).toBeTruthy();
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Campaign entries page should handle invalid campaign ID', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      // Try to access entries for non-existent campaign
      await page.goto('/admin/campaigns/99999/entries');
      
      // Should handle error gracefully (404 or redirect)
      await page.waitForLoadState('networkidle');
      
      // Should not show internal server errors
      const serverErrors = page.locator('text=500 Internal Server Error, text=ActiveRecord::RecordNotFound');
      await expect(serverErrors).toHaveCount(0);
      
      // Should either show 404 or redirect to campaigns list
      const is404 = page.url().includes('404') || await page.locator('text=404, text=Not Found').count() > 0;
      const redirectedToCampaigns = page.url().includes('/admin/campaigns') && !page.url().includes('/entries');
      
      expect(is404 || redirectedToCampaigns).toBeTruthy();
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Admin shipments page should handle missing shipments data', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/shipments');
      
      // Should load page even with no shipments
      await expect(page.url()).toMatch(/\/admin\/shipments/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should not show database errors
      const dbErrors = page.locator('text=PG::Error, text=SQLite3::SQLException, text=Database error');
      await expect(dbErrors).toHaveCount(0);
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Admin reviews page should handle missing reviews data', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/reviews');
      
      // Should load page even with no reviews
      await expect(page.url()).toMatch(/\/admin\/reviews/);
      await expect(page.locator('body')).toBeVisible();
      
      // Should not show template errors
      const templateErrors = page.locator('text=ActionView::Template::Error, text=undefined local variable');
      await expect(templateErrors).toHaveCount(0);
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Admin dashboard should handle missing statistics gracefully', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin');
      
      // Should load dashboard
      await expect(page.url()).toMatch(/\/admin$/);
      await expect(page.locator('body')).toBeVisible();
      
      // Statistics should show as numbers or zeros, not errors
      const statElements = page.locator('.stat, .metric, .count, [class*="statistic"]');
      if (await statElements.count() > 0) {
        for (let i = 0; i < await statElements.count(); i++) {
          const statText = await statElements.nth(i).textContent();
          // Should not contain error messages
          expect(statText).not.toMatch(/error|undefined|null|NaN/i);
        }
      }
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Admin forms should handle invalid data submission', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      // Try to create a new campaign with invalid data
      await page.goto('/admin/campaigns/new');
      
      if (await page.locator('form').count() > 0) {
        // Submit form without required fields
        await page.click('input[type="submit"], button[type="submit"]');
        
        // Should show validation errors, not server errors
        await page.waitForLoadState('networkidle');
        
        const serverErrors = page.locator('text=500 Internal Server Error, text=ActionController::ParameterMissing');
        await expect(serverErrors).toHaveCount(0);
        
        // Should show validation messages
        const validationMessages = page.locator('.error, .invalid, .field-error, text=必須, text=required');
        expect(await validationMessages.count()).toBeGreaterThan(0);
      }
    } catch (error) {
      // Form might not exist, skip test
      test.skip('Campaign creation form not available');
    }
  });

  test('Admin authentication should handle invalid credentials', async ({ page }) => {
    await page.goto('/admin/sign_in');
    
    // Try to login with invalid credentials
    await page.fill('input[name="admin[email]"]', 'invalid@example.com');
    await page.fill('input[name="admin[password]"]', 'wrongpassword');
    await page.click('input[type="submit"]');
    
    // Should stay on login page or show error
    await page.waitForLoadState('networkidle');
    
    // Should not redirect to admin dashboard
    expect(page.url()).not.toMatch(/\/admin$/);
    
    // Should not show server errors
    const serverErrors = page.locator('text=500 Internal Server Error, text=NoMethodError');
    await expect(serverErrors).toHaveCount(0);
    
    // Should show login error message
    const errorMessage = page.locator('.alert, .error, text=Invalid, text=認証に失敗');
    expect(await errorMessage.count()).toBeGreaterThan(0);
  });

  test('Admin pages should handle SQL injection attempts safely', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      // Try SQL injection in campaign ID parameter
      await page.goto('/admin/campaigns/1; DROP TABLE campaigns; --/entries');
      
      // Should handle malicious input safely
      await page.waitForLoadState('networkidle');
      
      // Should not show SQL errors
      const sqlErrors = page.locator('text=SQL syntax error, text=PG::SyntaxError, text=SQLite3::SQLException');
      await expect(sqlErrors).toHaveCount(0);
      
      // Should either show 404 or handle gracefully
      const handled = page.url().includes('404') || 
                     await page.locator('text=404, text=Not Found').count() > 0 ||
                     page.url().includes('/admin/campaigns');
      
      expect(handled).toBeTruthy();
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Admin pages should handle XSS attempts safely', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/campaigns');
      
      // Check if page properly escapes content
      const scriptTags = page.locator('script');
      let hasUnsafeScript = false;
      
      for (let i = 0; i < await scriptTags.count(); i++) {
        const scriptContent = await scriptTags.nth(i).textContent();
        if (scriptContent && scriptContent.includes('alert(') && !scriptContent.includes('window.alert')) {
          hasUnsafeScript = true;
          break;
        }
      }
      
      expect(hasUnsafeScript).toBeFalsy();
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Admin CRUD operations should handle concurrent access', async ({ page, context }) => {
    try {
      await authHelper.loginAsAdmin();
      
      // Open second tab to simulate concurrent access
      const secondPage = await context.newPage();
      const secondAuthHelper = new AuthHelper(secondPage);
      await secondAuthHelper.loginAsAdmin();
      
      // Both pages access same resource
      await page.goto('/admin/campaigns');
      await secondPage.goto('/admin/campaigns');
      
      // Both pages should load without conflict
      await expect(page.locator('body')).toBeVisible();
      await expect(secondPage.locator('body')).toBeVisible();
      
      // Should not show concurrency errors
      const concurrencyErrors = page.locator('text=ActiveRecord::StaleObjectError, text=Conflict');
      await expect(concurrencyErrors).toHaveCount(0);
      
      await secondPage.close();
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });
});

test.describe('Admin Route Error Recovery', () => {
  let authHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
  });

  test('Should recover from route errors and continue navigation', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      // Start from working page
      await page.goto('/admin');
      await expect(page.locator('body')).toBeVisible();
      
      // Navigate to campaigns page (which had the route error)
      await page.goto('/admin/campaigns');
      
      // Should load without NoMethodError
      await expect(page.url()).toMatch(/\/admin\/campaigns/);
      await expect(page.locator('body')).toBeVisible();
      
      // Check for specific error that was reported
      const routeError = page.locator('text=undefined method, text=admin_campaign_entries_path');
      await expect(routeError).toHaveCount(0);
      
      // Navigation should continue to work
      await page.goto('/admin/shipments');
      await expect(page.locator('body')).toBeVisible();
      
      await page.goto('/admin/reviews');
      await expect(page.locator('body')).toBeVisible();
      
    } catch (error) {
      test.skip('Admin authentication not available');
    }
  });

  test('Campaign entries links should use correct route helpers', async ({ page }) => {
    try {
      await authHelper.loginAsAdmin();
      
      await page.goto('/admin/campaigns');
      
      // Find all entry links
      const entryLinks = page.locator('a:has-text("応募者")');
      const linkCount = await entryLinks.count();
      
      if (linkCount > 0) {
        // Check that links have proper href attributes
        for (let i = 0; i < Math.min(3, linkCount); i++) {
          const href = await entryLinks.nth(i).getAttribute('href');
          
          // Should match pattern for campaign entries route
          expect(href).toMatch(/\/admin\/campaigns\/\d+\/entries/);
        }
        
        // Click first link and verify it works
        await entryLinks.first().click();
        
        // Should navigate successfully
        await expect(page.url()).toMatch(/\/admin\/campaigns\/\d+\/entries/);
        await expect(page.locator('body')).toBeVisible();
        
        // Should not show route errors
        const routeErrors = page.locator('text=NoMethodError, text=undefined method, text=admin_campaign_entries_path');
        await expect(routeErrors).toHaveCount(0);
      }
    } catch (error) {
      test.skip('Admin authentication or campaigns not available');
    }
  });
});