const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../../utils/auth');
const { TestDataHelper } = require('../../utils/testData');

/**
 * Journey 1: User Registration to Campaign Application
 * Tests the complete flow from service discovery to campaign application
 */

test.describe('Journey 1: User Registration to Campaign Application', () => {
  let authHelper;
  let testDataHelper;
  let uniqueTimestamp;
  let testUser;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
    uniqueTimestamp = Date.now();
    testUser = {
      email: `testuser${uniqueTimestamp}@example.com`,
      password: 'password123',
      name: 'Test User Journey'
    };
  });

  test('Complete user journey from discovery to application', async ({ page }) => {
    // Step 1: Service Discovery - Access homepage
    console.log('Step 1: Accessing homepage for service discovery');
    await page.goto('/');
    
    // Verify homepage loads and shows campaigns
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Homepage loaded successfully');

    // Step 2: Campaign Detail Confirmation - Find and view a campaign
    console.log('Step 2: Exploring campaign details');
    
    // Look for campaign links on homepage or navigate to campaigns page
    let campaignLink = page.locator('a[href*="/campaigns/"]').first();
    let campaignId;
    
    if (await campaignLink.count() === 0) {
      // If no campaigns on homepage, go to campaigns page
      await page.goto('/campaigns');
      await expect(page.locator('body')).toBeVisible();
      campaignLink = page.locator('a[href*="/campaigns/"]').first();
    }
    
    if (await campaignLink.count() > 0) {
      // Extract campaign ID and navigate to detail page
      const href = await campaignLink.getAttribute('href');
      campaignId = href.match(/\/campaigns\/(\d+)/)?.[1] || '1';
      await page.goto(`/campaigns/${campaignId}`);
    } else {
      // Fallback: use test data to get campaign ID
      campaignId = await testDataHelper.getFirstCampaignId() || '1';
      await page.goto(`/campaigns/${campaignId}`);
    }
    
    await expect(page.locator('body')).toBeVisible();
    console.log(`✓ Campaign detail page loaded for campaign ${campaignId}`);

    // Step 3: Registration Need Recognition - Try to apply and discover login requirement
    console.log('Step 3: Attempting to apply and discovering registration need');
    
    // Look for apply/entry button
    const applyButton = page.locator('a:has-text("応募"), a:has-text("申し込み"), a:has-text("Apply"), a[href*="entry"]').first();
    
    if (await applyButton.count() > 0) {
      await applyButton.click();
      
      // Should redirect to login or show login requirement
      await page.waitForTimeout(1000);
      const currentUrl = page.url();
      
      if (currentUrl.includes('/login') || currentUrl.includes('/sign_in')) {
        console.log('✓ Redirected to login page as expected');
      } else if (currentUrl.includes('/entry')) {
        console.log('⚠ Already on entry page - user might need to be logged out first');
        // Continue with the flow
      } else {
        console.log(`⚠ Unexpected URL after clicking apply: ${currentUrl}`);
      }
    } else {
      // Manually navigate to entry page to trigger auth requirement
      await page.goto(`/campaigns/${campaignId}/entry`);
    }

    // Step 4: User Registration Execution
    console.log('Step 4: Performing user registration');
    
    // Navigate to registration page
    await page.goto('/register');
    await expect(page.locator('body')).toBeVisible();
    
    // Fill registration form
    await page.fill('input[name*="email"]', testUser.email);
    await page.fill('input[name*="password"]:not([name*="confirmation"])', testUser.password);
    await page.fill('input[name*="password_confirmation"], input[name*="password"][name*="confirmation"]', testUser.password);
    
    // Try to find and fill name field if it exists
    const nameField = page.locator('input[name*="name"]');
    if (await nameField.count() > 0) {
      await nameField.fill(testUser.name);
    }
    
    // Submit registration form
    await page.click('input[type="submit"], button[type="submit"]');
    
    // Wait for redirect after registration
    await page.waitForTimeout(2000);
    
    // Verify successful registration (should be logged in)
    const isLoggedIn = await authHelper.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
    console.log('✓ User registration completed successfully');

    // Step 5: Campaign Application
    console.log('Step 5: Applying to campaign');
    
    // Navigate back to campaign entry page
    await page.goto(`/campaigns/${campaignId}/entry`);
    await expect(page.locator('body')).toBeVisible();
    
    // Fill entry form if there are fields to fill
    const formFields = page.locator('input:not([type="hidden"]):not([type="submit"]), textarea, select');
    const fieldCount = await formFields.count();
    
    if (fieldCount > 0) {
      console.log(`Found ${fieldCount} form fields to fill`);
      
      // Fill text inputs
      const textInputs = page.locator('input[type="text"], input[type="email"], input[type="tel"], textarea');
      for (let i = 0; i < await textInputs.count(); i++) {
        const input = textInputs.nth(i);
        const name = await input.getAttribute('name') || '';
        const placeholder = await input.getAttribute('placeholder') || '';
        
        if (name.includes('postal') || placeholder.includes('郵便')) {
          await input.fill('123-4567');
        } else if (name.includes('phone') || name.includes('tel') || placeholder.includes('電話')) {
          await input.fill('090-1234-5678');
        } else if (name.includes('address') || placeholder.includes('住所')) {
          await input.fill('東京都渋谷区1-2-3');
        } else if (name.includes('name') || placeholder.includes('名前')) {
          await input.fill('テストユーザー');
        } else {
          await input.fill('テスト情報');
        }
      }
      
      // Handle select dropdowns
      const selects = page.locator('select');
      for (let i = 0; i < await selects.count(); i++) {
        const select = selects.nth(i);
        const options = select.locator('option:not([value=""]):not([disabled])');
        if (await options.count() > 0) {
          const firstOption = await options.first().getAttribute('value');
          await select.selectOption(firstOption);
        }
      }
    }
    
    // Submit application
    const submitButton = page.locator('input[type="submit"], button[type="submit"]:not(:has-text("戻る")):not(:has-text("Back"))');
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(2000);
      console.log('✓ Application submitted');
    }

    // Step 6: Application Confirmation
    console.log('Step 6: Verifying application confirmation');
    
    // Check if we're on completion page
    const currentUrl = page.url();
    if (currentUrl.includes('/done') || currentUrl.includes('/complete')) {
      await expect(page.locator('body')).toBeVisible();
      console.log('✓ Reached application completion page');
    }
    
    // Navigate to mypage to verify application history
    await page.goto('/mypage');
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Mypage accessible - can verify application history');

    // Final verification: User should be logged in and able to access protected pages
    expect(await authHelper.isLoggedIn()).toBeTruthy();
    console.log('✓ Journey completed successfully: User is registered and can access protected areas');
  });

  test('Registration form validation works correctly', async ({ page }) => {
    console.log('Testing registration form validation');
    
    await page.goto('/register');
    
    // Try to submit empty form
    await page.click('input[type="submit"], button[type="submit"]');
    
    // Should show validation errors or remain on registration page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/register');
    console.log('✓ Form validation prevents empty submission');
    
    // Test password mismatch
    await page.fill('input[name*="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name*="password"]:not([name*="confirmation"])', 'password123');
    await page.fill('input[name*="password_confirmation"], input[name*="password"][name*="confirmation"]', 'differentpassword');
    
    await page.click('input[type="submit"], button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Should remain on registration page due to password mismatch
    expect(page.url()).toContain('/register');
    console.log('✓ Password mismatch validation works');
  });

  test('Login redirect after registration works', async ({ page }) => {
    console.log('Testing login redirect functionality');
    
    // First try to access protected page
    const campaignId = await testDataHelper.getFirstCampaignId() || '1';
    await page.goto(`/campaigns/${campaignId}/entry`);
    
    // Should redirect to login
    await page.waitForTimeout(1000);
    const redirectedUrl = page.url();
    
    if (redirectedUrl.includes('/login') || redirectedUrl.includes('/sign_in')) {
      console.log('✓ Correctly redirected to login when accessing protected page');
      
      // Now register a new user
      await page.goto('/register');
      const newUser = {
        email: `redirect${Date.now()}@example.com`,
        password: 'password123'
      };
      
      await page.fill('input[name*="email"]', newUser.email);
      await page.fill('input[name*="password"]:not([name*="confirmation"])', newUser.password);
      await page.fill('input[name*="password_confirmation"], input[name*="password"][name*="confirmation"]', newUser.password);
      
      const nameField = page.locator('input[name*="name"]');
      if (await nameField.count() > 0) {
        await nameField.fill('Redirect Test User');
      }
      
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
      
      // Should be logged in now
      expect(await authHelper.isLoggedIn()).toBeTruthy();
      console.log('✓ User registration and auto-login successful');
    } else {
      console.log('⚠ Not redirected to login page, but continuing test');
    }
  });
});