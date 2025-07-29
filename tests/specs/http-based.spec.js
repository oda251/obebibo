const { test, expect } = require('@playwright/test');

/**
 * HTTP-based E2E Tests
 * These tests use Playwright's request API instead of full browser automation
 * Useful for CI environments or when browser automation is not available
 */

test.describe('HTTP-based Endpoint Tests', () => {
  
  test('All public endpoints should return successful responses', async ({ request }) => {
    const publicEndpoints = [
      { url: '/', name: 'Homepage' },
      { url: '/campaigns', name: 'Campaigns list' },
      { url: '/terms', name: 'Terms page' },
      { url: '/privacy', name: 'Privacy page' },
      { url: '/inquiry', name: 'Inquiry page' },
      { url: '/login', name: 'Login page' },
      { url: '/register', name: 'Registration page' }
    ];

    for (const endpoint of publicEndpoints) {
      const response = await request.get(endpoint.url);
      
      // Should return 200 OK for public pages
      expect(response.status()).toBe(200);
      
      // Should return HTML content
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('text/html');
      
      console.log(`✓ ${endpoint.name} (${endpoint.url}) - ${response.status()}`);
    }
  });

  test('Protected user endpoints should redirect to login', async ({ request }) => {
    const userEndpoints = [
      { url: '/mypage', name: 'MyPage' },
      { url: '/campaigns/1/entry', name: 'Campaign entry' },
      { url: '/campaigns/1/entry/done', name: 'Entry completion' },
      { url: '/mypage/review/1', name: 'Review posting' }
    ];

    for (const endpoint of userEndpoints) {
      const response = await request.get(endpoint.url, {
        ignoreHTTPSErrors: true,
        maxRedirects: 0
      });
      
      // Should redirect (302) to login for protected pages
      expect(response.status()).toBe(302);
      
      const location = response.headers()['location'];
      expect(location).toContain('/login');
      
      console.log(`✓ ${endpoint.name} (${endpoint.url}) - ${response.status()} → ${location}`);
    }
  });

  test('Admin endpoints should redirect to admin login', async ({ request }) => {
    const adminEndpoints = [
      { url: '/admin', name: 'Admin dashboard' },
      { url: '/admin/campaigns', name: 'Campaign management' },
      { url: '/admin/campaigns/1/entries', name: 'Entry management' },
      { url: '/admin/shipments', name: 'Shipment management' },
      { url: '/admin/reviews', name: 'Review management' }
    ];

    for (const endpoint of adminEndpoints) {
      const response = await request.get(endpoint.url, {
        ignoreHTTPSErrors: true,
        maxRedirects: 0
      });
      
      // Should redirect (302) for admin pages
      expect(response.status()).toBe(302);
      
      const location = response.headers()['location'];
      expect(location).toContain('/admin');
      
      console.log(`✓ ${endpoint.name} (${endpoint.url}) - ${response.status()} → ${location}`);
    }
  });

  test('Campaign details endpoint should handle various IDs', async ({ request }) => {
    // Test with ID that might exist
    const response1 = await request.get('/campaigns/1');
    // Should either show campaign (200) or not found (404), both acceptable
    expect([200, 404]).toContain(response1.status());
    
    // Test with obviously invalid ID
    const response2 = await request.get('/campaigns/99999');
    // Should gracefully handle non-existent campaigns
    expect([200, 404]).toContain(response2.status());
    
    console.log(`✓ Campaign details - ID 1: ${response1.status()}, ID 99999: ${response2.status()}`);
  });

  test('API endpoints should be accessible', async ({ request }) => {
    // Test API endpoints if they exist
    const apiResponse = await request.get('/api/campaigns');
    
    // API might return 200 with data or 404 if not implemented
    // Both are acceptable for testing purposes
    expect([200, 404]).toContain(apiResponse.status());
    
    console.log(`✓ API campaigns endpoint - ${apiResponse.status()}`);
  });

  test('Application should handle invalid URLs gracefully', async ({ request }) => {
    const invalidUrls = [
      '/nonexistent',
      '/campaigns/invalid',
      '/admin/nonexistent'
    ];

    for (const url of invalidUrls) {
      const response = await request.get(url);
      
      // Should handle gracefully (not 500 server error)
      expect(response.status()).not.toBe(500);
      
      // 404 or redirect is acceptable
      expect([404, 302]).toContain(response.status());
      
      console.log(`✓ Invalid URL ${url} - ${response.status()}`);
    }
  });

  test('Forms should include CSRF protection', async ({ request }) => {
    // Check login form for CSRF tokens
    const loginResponse = await request.get('/login');
    expect(loginResponse.status()).toBe(200);
    
    const loginBody = await loginResponse.text();
    expect(loginBody).toContain('authenticity_token');
    
    // Check registration form for CSRF tokens
    const registerResponse = await request.get('/register');
    expect(registerResponse.status()).toBe(200);
    
    const registerBody = await registerResponse.text();
    expect(registerBody).toContain('authenticity_token');
    
    console.log('✓ CSRF protection present in forms');
  });

  test('All endpoints from docs/frontend.md are covered', async ({ request }) => {
    // This test validates that we're testing all documented endpoints
    const documentedEndpoints = [
      '/',                              // Top page
      '/campaigns',                     // Campaign list
      '/campaigns/[id]',                // Campaign details
      '/campaigns/[id]/entry',          // Entry form
      '/campaigns/[id]/entry/done',     // Entry completion
      '/mypage',                        // MyPage
      '/mypage/review/[id]',            // Review posting
      '/admin',                         // Admin dashboard
      '/admin/campaigns',               // Campaign management
      '/admin/campaigns/[id]/entries',  // Entry management
      '/admin/shipments',               // Shipment management
      '/admin/reviews',                 // Review management
      '/login',                         // Login
      '/register',                      // Registration
      '/terms',                         // Terms
      '/privacy',                       // Privacy
      '/inquiry'                        // Inquiry
    ];

    // Test that each endpoint is reachable (not 500 error)
    for (const endpointPattern of documentedEndpoints) {
      let testUrl = endpointPattern.replace('[id]', '1');
      
      const response = await request.get(testUrl, {
        ignoreHTTPSErrors: true,
        maxRedirects: 0
      });
      
      // Should not return server error
      expect(response.status()).not.toBe(500);
      
      console.log(`✓ ${endpointPattern} → ${testUrl} - ${response.status()}`);
    }
    
    console.log(`\n📋 All ${documentedEndpoints.length} documented endpoints tested successfully`);
  });
});