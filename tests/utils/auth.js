const { expect } = require('@playwright/test');

/**
 * Authentication helpers for E2E tests
 */
class AuthHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Login as a regular user
   */
  async loginAsUser(email = 'testuser@example.com', password = 'password123') {
    await this.page.goto('/login');
    await this.page.fill('input[name="user[email]"]', email);
    await this.page.fill('input[name="user[password]"]', password);
    await this.page.click('input[type="submit"]');
    
    // Wait for redirect after login
    await this.page.waitForURL(/(?:\/|\/mypage|\/campaigns)/);
  }

  /**
   * Login as an admin
   */
  async loginAsAdmin(email = 'admin@example.com', password = 'password123') {
    await this.page.goto('/admin/sign_in');
    await this.page.fill('input[name="admin[email]"]', email);
    await this.page.fill('input[name="admin[password]"]', password);
    await this.page.click('input[type="submit"]');
    
    // Wait for redirect to admin dashboard
    await this.page.waitForURL('/admin');
  }

  /**
   * Register a new user account
   */
  async registerUser(email = 'newuser@example.com', password = 'password123', name = 'Test User') {
    await this.page.goto('/register');
    await this.page.fill('input[name="user[name]"]', name);
    await this.page.fill('input[name="user[email]"]', email);
    await this.page.fill('input[name="user[password]"]', password);
    await this.page.fill('input[name="user[password_confirmation]"]', password);
    await this.page.click('input[type="submit"]');
    
    // Wait for redirect after registration
    await this.page.waitForURL(/(?:\/|\/mypage)/);
  }

  /**
   * Logout current user
   */
  async logout() {
    // Look for logout link/button and click it
    const logoutSelector = 'a[href*="sign_out"], button[type="submit"][formaction*="sign_out"], a:has-text("ログアウト"), a:has-text("Logout")';
    
    try {
      await this.page.click(logoutSelector);
      await this.page.waitForURL('/');
    } catch (error) {
      // If logout link not found, might already be logged out
      console.warn('Logout link not found, user might already be logged out');
    }
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn() {
    // Look for user-specific elements that indicate login status
    const loginIndicators = [
      'a:has-text("マイページ")',
      'a:has-text("ログアウト")',
      'a[href="/mypage"]',
      '.user-menu'
    ];

    for (const selector of loginIndicators) {
      try {
        await this.page.waitForSelector(selector, { timeout: 1000 });
        return true;
      } catch {
        // Continue to next selector
      }
    }
    return false;
  }

  /**
   * Check if admin is logged in
   */
  async isAdminLoggedIn() {
    try {
      await this.page.goto('/admin');
      await this.page.waitForSelector('h1, .admin-dashboard', { timeout: 3000 });
      return !this.page.url().includes('/admin/sign_in');
    } catch {
      return false;
    }
  }
}

module.exports = { AuthHelper };