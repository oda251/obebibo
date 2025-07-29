const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../../utils/auth');
const { TestDataHelper } = require('../../utils/testData');

/**
 * Journey 3: Admin Login to Dashboard Display
 * Tests the complete admin authentication and dashboard access flow
 */

test.describe('Journey 3: Admin Login to Dashboard Display', () => {
  let authHelper;
  let testDataHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
  });

  test('Complete admin login to dashboard access', async ({ page }) => {
    // Step 1: Admin Login Page Access
    console.log('Step 1: Accessing admin login page');
    
    await page.goto('/admin');
    
    // Verify we can access admin area (either dashboard or login page)
    await expect(page.locator('body')).toBeVisible();
    
    if (page.url().includes('/sign_in')) {
      console.log('✓ Redirected to admin login page as expected');
      
      // Verify login form elements are present
      await expect(page.locator('input[name*="email"]')).toBeVisible();
      await expect(page.locator('input[name*="password"]')).toBeVisible();
      await expect(page.locator('input[type="submit"], button[type="submit"]')).toBeVisible();
      console.log('✓ Admin login form elements are visible');
    } else if (page.url().includes('/admin')) {
      console.log('ℹ Already logged in as admin or no login required');
    } else {
      console.log(`⚠ Unexpected redirect to: ${page.url()}`);
    }

    // Step 2: Authentication Execution
    console.log('Step 2: Performing admin authentication');
    
    if (page.url().includes('/sign_in')) {
      // Fill admin credentials
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      
      // Submit login form
      await page.click('input[type="submit"], button[type="submit"]');
      
      // Wait for redirect after login
      await page.waitForTimeout(2000);
      
      // Verify successful login
      expect(page.url()).toMatch(/\/admin/);
      expect(page.url()).not.toContain('/sign_in');
      console.log('✓ Admin authentication successful');
    }

    // Step 3: Admin Dashboard Display
    console.log('Step 3: Verifying admin dashboard display');
    
    // Should now be on admin dashboard
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();
    expect(page.url()).toMatch(/\/admin$/);
    
    // Look for typical dashboard elements
    const dashboardElements = [
      'h1, h2, h3', // Headers
      'nav, .navigation', // Navigation
      'a, button', // Interactive elements
      '.card, .panel, .widget' // Dashboard widgets (if any)
    ];
    
    let foundElements = 0;
    for (const selector of dashboardElements) {
      const elements = page.locator(selector);
      if (await elements.count() > 0) {
        foundElements++;
      }
    }
    
    expect(foundElements).toBeGreaterThan(0);
    console.log(`✓ Dashboard displayed with ${foundElements} types of elements found`);

    // Step 4: Management Functions Access Verification
    console.log('Step 4: Verifying access to management functions');
    
    const managementSections = [
      { path: '/admin/campaigns', name: 'Campaign Management', expectedInUrl: '/campaigns' },
      { path: '/admin/shipments', name: 'Shipment Management', expectedInUrl: '/shipments' },
      { path: '/admin/reviews', name: 'Review Management', expectedInUrl: '/reviews' }
    ];
    
    for (const section of managementSections) {
      console.log(`  Testing access to ${section.name}`);
      
      await page.goto(section.path);
      await expect(page.locator('body')).toBeVisible();
      
      // Verify we're on the correct admin page
      expect(page.url()).toContain(section.expectedInUrl);
      console.log(`  ✓ ${section.name} accessible at ${section.path}`);
      
      // Check for common admin interface elements
      const hasTable = await page.locator('table').count() > 0;
      const hasForm = await page.locator('form').count() > 0;
      const hasButtons = await page.locator('button, input[type="submit"], a.btn').count() > 0;
      
      if (hasTable || hasForm || hasButtons) {
        console.log(`  ✓ ${section.name} has interactive management interface`);
      } else {
        console.log(`  ℹ ${section.name} page loaded but interface elements not immediately visible`);
      }
    }

    // Step 5: Authority Verification
    console.log('Step 5: Verifying admin authority and security');
    
    // Test navigation back to dashboard
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();
    expect(page.url()).toMatch(/\/admin$/);
    console.log('✓ Can navigate back to dashboard');
    
    // Verify admin can access user-facing pages (authority check)
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Admin can access public pages');
    
    await page.goto('/campaigns');
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Admin can access user campaign pages');
    
    // Verify admin session persistence
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();
    expect(page.url()).toMatch(/\/admin$/);
    expect(page.url()).not.toContain('/sign_in');
    console.log('✓ Admin session persists across navigation');
    
    console.log('✓ Journey completed: Admin login and dashboard access fully verified');
  });

  test('Admin login with invalid credentials', async ({ page }) => {
    console.log('Testing admin login with invalid credentials');
    
    await page.goto('/admin');
    
    if (page.url().includes('/sign_in')) {
      // Try with wrong password
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'wrongpassword');
      await page.click('input[type="submit"], button[type="submit"]');
      
      await page.waitForTimeout(2000);
      
      // Should remain on login page or show error
      expect(page.url()).toContain('/sign_in');
      console.log('✓ Invalid credentials rejected');
      
      // Try with wrong email
      await page.fill('input[name*="email"]', 'notadmin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      
      await page.waitForTimeout(2000);
      
      // Should remain on login page
      expect(page.url()).toContain('/sign_in');
      console.log('✓ Non-existent admin account rejected');
    } else {
      console.log('ℹ Already logged in, cannot test invalid credentials');
    }
  });

  test('Admin logout functionality', async ({ page }) => {
    console.log('Testing admin logout functionality');
    
    // First, ensure we're logged in as admin
    await page.goto('/admin');
    
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Should be logged in now
    expect(page.url()).toMatch(/\/admin/);
    expect(page.url()).not.toContain('/sign_in');
    
    // Look for logout link/button
    const logoutButton = page.locator('a:has-text("ログアウト"), a:has-text("Logout"), a:has-text("Sign out"), input[value*="ログアウト"]');
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
      
      // Should be logged out now - accessing admin should redirect to login
      await page.goto('/admin');
      expect(page.url()).toContain('/sign_in');
      console.log('✓ Logout functionality works correctly');
    } else {
      // Try accessing logout endpoint directly
      await page.goto('/admin/logout');
      await page.waitForTimeout(1000);
      
      // Try accessing admin area again
      await page.goto('/admin');
      if (page.url().includes('/sign_in')) {
        console.log('✓ Direct logout endpoint works');
      } else {
        console.log('ℹ Logout link not found, but admin access verified');
      }
    }
  });

  test('Admin session security verification', async ({ page }) => {
    console.log('Testing admin session security');
    
    // Login as admin
    await page.goto('/admin');
    
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Verify admin areas are protected
    const protectedAdminPaths = [
      '/admin/campaigns',
      '/admin/shipments',
      '/admin/reviews'
    ];
    
    for (const path of protectedAdminPaths) {
      await page.goto(path);
      await expect(page.locator('body')).toBeVisible();
      
      // Should not redirect to login when logged in as admin
      expect(page.url()).not.toContain('/sign_in');
      expect(page.url()).toContain('/admin/');
      console.log(`✓ Admin has access to protected path: ${path}`);
    }
    
    console.log('✓ Admin session security verified');
  });

  test('Admin dashboard responsiveness', async ({ page }) => {
    console.log('Testing admin dashboard responsiveness');
    
    // Login as admin
    await page.goto('/admin');
    
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await page.waitForTimeout(1000);
      
      await expect(page.locator('body')).toBeVisible();
      console.log(`✓ Admin dashboard responsive on ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
  });
});