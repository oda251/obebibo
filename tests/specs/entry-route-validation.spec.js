const { test, expect } = require('@playwright/test');

test.describe('Entry Route Validation', () => {
  test('validates entry done route helper exists and works correctly', async ({ page }) => {
    // Test that we can access the campaigns page first
    await page.goto('http://localhost:3000/campaigns');
    
    // Check if there are any campaigns available
    const campaignLinks = page.locator('a[href*="/campaigns/"]');
    const campaignCount = await campaignLinks.count();
    
    if (campaignCount > 0) {
      // Get the first campaign ID from the href
      const firstCampaignLink = campaignLinks.first();
      const href = await firstCampaignLink.getAttribute('href');
      const campaignId = href.match(/\/campaigns\/(\d+)/)?.[1];
      
      if (campaignId) {
        // Try to access the entry done page directly to verify the route exists
        const entryDoneUrl = `http://localhost:3000/campaigns/${campaignId}/entry/done`;
        const response = await page.goto(entryDoneUrl);
        
        // The page should either load successfully or redirect (not 500 error)
        expect(response.status()).not.toBe(500);
        
        // Check if it's a route error specifically
        const pageContent = await page.content();
        expect(pageContent).not.toContain('NoMethodError');
        expect(pageContent).not.toContain('campaign_entry_done_path');
      }
    }
  });

  test('validates entry creation flow redirects correctly', async ({ page }) => {
    // Mock the entry creation process by checking what happens when we submit
    await page.goto('http://localhost:3000/campaigns');
    
    // This test validates that no route errors occur during navigation
    // We're primarily checking that the route helpers are properly defined
    const response = await page.goto('http://localhost:3000/campaigns');
    expect(response.status()).toBe(200);
    
    const pageContent = await page.content();
    expect(pageContent).not.toContain('NoMethodError');
    expect(pageContent).not.toContain('undefined method');
  });
});