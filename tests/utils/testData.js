/**
 * Test data helpers and constants
 */

const TEST_DATA = {
  users: {
    validUser: {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123'
    },
    newUser: {
      name: 'New Test User',
      email: 'newuser@example.com',
      password: 'password123'
    }
  },
  
  admins: {
    validAdmin: {
      email: 'admin@example.com',
      password: 'password123'
    }
  },
  
  campaigns: {
    sampleCampaign: {
      title: 'Sample Campaign',
      description: 'This is a sample campaign for testing'
    }
  }
};

/**
 * Utility functions for test data management
 */
class TestDataHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Create test campaign data via admin interface
   */
  async createCampaign(campaignData = TEST_DATA.campaigns.sampleCampaign) {
    // Navigate to admin campaigns
    await this.page.goto('/admin/campaigns');
    
    // Click new campaign button
    await this.page.click('a:has-text("新規作成"), a:has-text("New"), button:has-text("作成")');
    
    // Fill campaign form
    await this.page.fill('input[name*="title"]', campaignData.title);
    await this.page.fill('textarea[name*="description"]', campaignData.description);
    
    // Submit form
    await this.page.click('input[type="submit"], button[type="submit"]');
    
    // Return to campaigns list and get the created campaign ID
    await this.page.waitForURL('/admin/campaigns*');
  }

  /**
   * Get campaign ID from URL or page context
   */
  async getCampaignIdFromPage() {
    const url = this.page.url();
    const match = url.match(/\/campaigns\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Navigate to a specific campaign by ID
   */
  async goToCampaign(campaignId) {
    await this.page.goto(`/campaigns/${campaignId}`);
  }

  /**
   * Get first available campaign ID from campaigns list
   */
  async getFirstCampaignId() {
    await this.page.goto('/campaigns');
    
    // Look for campaign links
    const campaignLink = await this.page.locator('a[href*="/campaigns/"]').first();
    
    if (await campaignLink.count() > 0) {
      const href = await campaignLink.getAttribute('href');
      const match = href.match(/\/campaigns\/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
    
    return null;
  }
}

module.exports = { TEST_DATA, TestDataHelper };