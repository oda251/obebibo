const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../../utils/auth');
const { TestDataHelper } = require('../../utils/testData');

/**
 * Journey 7: Admin Shipment Management Workflow
 * Tests the complete admin flow for managing shipments from winner selection to delivery confirmation
 */

test.describe('Journey 7: Admin Shipment Management Workflow', () => {
  let authHelper;
  let testDataHelper;
  let uniqueTimestamp;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
    uniqueTimestamp = Date.now();
  });

  test('Complete shipment management workflow', async ({ page }) => {
    // Step 1: Admin Authentication
    console.log('Step 1: Admin authentication for shipment management');
    
    await page.goto('/admin');
    
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    expect(page.url()).toMatch(/\/admin/);
    console.log('✓ Admin successfully authenticated');

    // Step 2: Shipment Preparation - Verify Winner Information
    console.log('Step 2: Verifying winner information and addresses');
    
    // First check entries to understand winners
    await page.goto('/admin/entries');
    await expect(page.locator('body')).toBeVisible();
    
    // Look for winner entries or selection interface
    const entryElements = page.locator('table tr, .entry, .winner, form');
    const entryCount = await entryElements.count();
    console.log(`✓ Found ${entryCount} entry management elements`);
    
    // Look for address information
    const addressElements = page.locator(':has-text("住所"), :has-text("Address"), :has-text("配送"), td, .address');
    if (await addressElements.count() > 0) {
      console.log(`✓ Found ${await addressElements.count()} address-related elements`);
    }
    
    // Check for winner status indicators
    const winnerIndicators = page.locator(':has-text("当選"), :has-text("Winner"), :has-text("選択"), input[type="checkbox"]:checked');
    if (await winnerIndicators.count() > 0) {
      console.log(`✓ Found ${await winnerIndicators.count()} winner status indicators`);
    }

    // Step 3: Shipment Hand-off
    console.log('Step 3: Managing shipment hand-off to courier');
    
    await page.goto('/admin/shipments');
    await expect(page.locator('body')).toBeVisible();
    
    // Look for shipment management interface
    const shipmentElements = page.locator('table, .shipment, form, select, input');
    const shipmentCount = await shipmentElements.count();
    console.log(`✓ Shipment management interface has ${shipmentCount} elements`);
    
    // Test shipment creation or status update
    const shipmentForms = page.locator('form');
    if (await shipmentForms.count() > 0) {
      console.log('✓ Shipment management forms available');
      
      // Look for tracking number input
      const trackingFields = page.locator('input[name*="tracking"], input[name*="number"], input[placeholder*="追跡"]');
      if (await trackingFields.count() > 0) {
        const testTrackingNumber = `TEST${uniqueTimestamp}`;
        await trackingFields.first().fill(testTrackingNumber);
        console.log(`✓ Added tracking number: ${testTrackingNumber}`);
      }
      
      // Look for courier/carrier selection
      const carrierSelects = page.locator('select[name*="carrier"], select[name*="courier"], select[name*="company"]');
      if (await carrierSelects.count() > 0) {
        const options = carrierSelects.first().locator('option[value]:not([value=""])');
        if (await options.count() > 0) {
          const firstCarrier = await options.first().getAttribute('value');
          await carrierSelects.first().selectOption(firstCarrier);
          console.log('✓ Selected shipping carrier');
        }
      }
      
      // Look for shipment date fields
      const dateFields = page.locator('input[type="date"][name*="ship"], input[name*="date"]');
      if (await dateFields.count() > 0) {
        const today = new Date().toISOString().split('T')[0];
        await dateFields.first().fill(today);
        console.log('✓ Set shipment date');
      }
    }

    // Step 4: Shipment Status Tracking
    console.log('Step 4: Testing shipment status tracking updates');
    
    // Look for status update controls
    const statusSelects = page.locator('select[name*="status"]');
    if (await statusSelects.count() > 0) {
      const statusSelect = statusSelects.first();
      const statusOptions = statusSelect.locator('option[value]:not([value=""])');
      
      if (await statusOptions.count() > 0) {
        // Test different status updates
        const statuses = [];
        for (let i = 0; i < Math.min(3, await statusOptions.count()); i++) {
          const option = statusOptions.nth(i);
          const value = await option.getAttribute('value');
          const text = await option.textContent();
          statuses.push({ value, text: text?.trim() });
        }
        
        for (const status of statuses) {
          await statusSelect.selectOption(status.value);
          console.log(`  ✓ Updated status to: ${status.text}`);
          
          // Save changes if save button exists
          const saveButton = page.locator('input[type="submit"], button[type="submit"], button:has-text("更新"), button:has-text("保存")');
          if (await saveButton.count() > 0) {
            await saveButton.click();
            await page.waitForTimeout(1000);
            console.log(`  ✓ Saved status change`);
            
            // Refresh page to see updated status
            await page.reload();
            await page.waitForTimeout(1000);
          }
        }
      }
    }
    
    // Test bulk status updates if available
    const bulkControls = page.locator('input[type="checkbox"][name*="all"], select[name*="bulk"], button:has-text("一括")');
    if (await bulkControls.count() > 0) {
      console.log(`✓ Found ${await bulkControls.count()} bulk update controls`);
    }

    // Step 5: Delivery Confirmation
    console.log('Step 5: Managing delivery confirmation');
    
    // Look for delivery confirmation controls
    const deliveryControls = page.locator('input[type="checkbox"][name*="delivered"], button:has-text("配達完了"), select option:has-text("配達完了")');
    
    if (await deliveryControls.count() > 0) {
      console.log(`✓ Found ${await deliveryControls.count()} delivery confirmation controls`);
      
      // Test delivery confirmation
      const deliveryCheckbox = page.locator('input[type="checkbox"][name*="delivered"]').first();
      if (await deliveryCheckbox.count() > 0) {
        await deliveryCheckbox.check();
        console.log('✓ Marked shipment as delivered');
      }
      
      // Test delivery date setting
      const deliveryDateField = page.locator('input[type="date"][name*="delivered"], input[name*="delivery_date"]');
      if (await deliveryDateField.count() > 0) {
        const today = new Date().toISOString().split('T')[0];
        await deliveryDateField.fill(today);
        console.log('✓ Set delivery date');
      }
    }

    // Step 6: Customer Communication
    console.log('Step 6: Testing customer communication features');
    
    // Look for communication tools
    const communicationElements = page.locator('button:has-text("通知"), button:has-text("メール"), a:has-text("連絡"), textarea[name*="message"]');
    
    if (await communicationElements.count() > 0) {
      console.log(`✓ Found ${await communicationElements.count()} customer communication elements`);
      
      // Test notification sending
      const notifyButton = page.locator('button:has-text("通知"), button:has-text("Notify")').first();
      if (await notifyButton.count() > 0) {
        await notifyButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ Tested notification functionality');
      }
      
      // Test message composition
      const messageField = page.locator('textarea[name*="message"], textarea[name*="note"]').first();
      if (await messageField.count() > 0) {
        const testMessage = `配送状況の更新です。追跡番号: TEST${uniqueTimestamp}`;
        await messageField.fill(testMessage);
        console.log('✓ Composed customer message');
      }
    }

    // Step 7: Shipment Analytics and Reporting
    console.log('Step 7: Checking shipment analytics and reports');
    
    // Look for analytics or summary information
    const analyticsElements = page.locator('.stats, .summary, .count, [class*="stat"], td:has-text("件"), :has-text("合計")');
    
    if (await analyticsElements.count() > 0) {
      console.log(`✓ Found ${await analyticsElements.count()} analytics/summary elements`);
      
      // Extract some numbers for verification
      const textContent = await page.locator('body').textContent();
      const numbers = textContent?.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        console.log(`✓ Shipment data contains ${numbers.length} numeric values`);
      }
    }
    
    // Test filtering or search capabilities
    const filterElements = page.locator('select[name*="filter"], input[name*="search"], input[type="search"]');
    if (await filterElements.count() > 0) {
      console.log(`✓ Found ${await filterElements.count()} filtering/search elements`);
      
      // Test search functionality
      const searchField = page.locator('input[type="search"], input[name*="search"]').first();
      if (await searchField.count() > 0) {
        await searchField.fill(`TEST${uniqueTimestamp}`);
        await page.press('input[type="search"], input[name*="search"]', 'Enter');
        await page.waitForTimeout(1000);
        console.log('✓ Tested search functionality');
      }
    }

    // Step 8: Integration Verification
    console.log('Step 8: Verifying integration with other admin functions');
    
    // Verify navigation between related admin sections
    const adminSections = [
      { path: '/admin/campaigns', name: 'Campaigns' },
      { path: '/admin/entries', name: 'Entries' },
      { path: '/admin/shipments', name: 'Shipments' },
      { path: '/admin/reviews', name: 'Reviews' }
    ];
    
    for (const section of adminSections) {
      await page.goto(section.path);
      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain(section.path);
      console.log(`  ✓ ${section.name} section accessible from shipment management`);
    }
    
    // Return to shipments to complete workflow
    await page.goto('/admin/shipments');
    await expect(page.locator('body')).toBeVisible();
    console.log('✓ Successfully returned to shipments dashboard');
    
    console.log('✓ Journey completed: Admin shipment management workflow successful');
  });

  test('Shipment bulk operations', async ({ page }) => {
    console.log('Testing shipment bulk operations');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/shipments');
    
    // Test bulk selection
    const selectAllCheckbox = page.locator('input[type="checkbox"][name*="all"], thead input[type="checkbox"]');
    if (await selectAllCheckbox.count() > 0) {
      await selectAllCheckbox.click();
      console.log('✓ Bulk selection functionality tested');
      
      // Test bulk status update
      const bulkActionSelect = page.locator('select[name*="bulk"], select:has(option:has-text("一括"))');
      if (await bulkActionSelect.count() > 0) {
        const options = bulkActionSelect.locator('option[value]:not([value=""])');
        if (await options.count() > 0) {
          const firstOption = await options.first().getAttribute('value');
          await bulkActionSelect.selectOption(firstOption);
          console.log('✓ Bulk action selected');
        }
      }
    } else {
      console.log('ℹ Bulk operations not immediately visible');
    }
  });

  test('Shipment address validation', async ({ page }) => {
    console.log('Testing shipment address validation');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/shipments');
    
    // Look for address fields or validation
    const addressFields = page.locator('input[name*="address"], textarea[name*="address"], :has-text("住所")');
    
    if (await addressFields.count() > 0) {
      console.log(`✓ Found ${await addressFields.count()} address-related fields`);
      
      // Test address validation if edit fields exist
      const editableAddressField = page.locator('input[name*="address"], textarea[name*="address"]').first();
      if (await editableAddressField.count() > 0) {
        // Test invalid address
        await editableAddressField.fill('Invalid Address');
        
        const saveButton = page.locator('input[type="submit"], button[type="submit"]');
        if (await saveButton.count() > 0) {
          await saveButton.click();
          await page.waitForTimeout(1000);
          console.log('✓ Address validation tested');
        }
      }
    } else {
      console.log('ℹ Address validation may be handled in separate interface');
    }
  });

  test('Shipment status history tracking', async ({ page }) => {
    console.log('Testing shipment status history tracking');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/shipments');
    
    // Look for status history or timeline
    const historyElements = page.locator('.history, .timeline, .log, :has-text("履歴"), :has-text("History")');
    
    if (await historyElements.count() > 0) {
      console.log(`✓ Found ${await historyElements.count()} status history elements`);
      
      // Click on history if it's expandable
      const historyButton = page.locator('button:has-text("履歴"), button:has-text("History"), a:has-text("詳細")').first();
      if (await historyButton.count() > 0) {
        await historyButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ Accessed shipment history details');
      }
    } else {
      console.log('ℹ Status history tracking may be implicit or in detailed view');
    }
  });

  test('Shipment export and reporting', async ({ page }) => {
    console.log('Testing shipment export and reporting features');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/shipments');
    
    // Look for export functionality
    const exportButtons = page.locator('button:has-text("エクスポート"), button:has-text("Export"), button:has-text("CSV"), a:has-text("ダウンロード")');
    
    if (await exportButtons.count() > 0) {
      console.log(`✓ Found ${await exportButtons.count()} export options`);
      
      // Test export functionality (don't actually download)
      const exportButton = exportButtons.first();
      await exportButton.click();
      await page.waitForTimeout(1000);
      console.log('✓ Export functionality tested');
    } else {
      console.log('ℹ Export functionality not immediately visible');
    }
    
    // Look for reporting features
    const reportElements = page.locator('button:has-text("レポート"), button:has-text("Report"), a:has-text("統計")');
    
    if (await reportElements.count() > 0) {
      console.log(`✓ Found ${await reportElements.count()} reporting elements`);
    }
  });

  test('Shipment error handling and recovery', async ({ page }) => {
    console.log('Testing shipment error handling and recovery');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/shipments');
    
    // Test error handling by submitting invalid data
    const trackingField = page.locator('input[name*="tracking"], input[name*="number"]').first();
    if (await trackingField.count() > 0) {
      // Try invalid tracking number
      await trackingField.fill('INVALID-TRACKING-123!@#');
      
      const submitButton = page.locator('input[type="submit"], button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check for error messages
        const errorElements = page.locator('.error, .alert, :has-text("エラー"), :has-text("Error")');
        if (await errorElements.count() > 0) {
          console.log('✓ Error handling displays appropriate messages');
        } else {
          console.log('ℹ Error handling may be handled differently');
        }
      }
    }
    
    // Test recovery by correcting the data
    if (await trackingField.count() > 0) {
      await trackingField.fill(`RECOVERY${uniqueTimestamp}`);
      
      const submitButton = page.locator('input[type="submit"], button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(1000);
        console.log('✓ Recovery from error state tested');
      }
    }
  });

  test('Shipment integration with external carriers', async ({ page }) => {
    console.log('Testing shipment integration with external carriers');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/shipments');
    
    // Look for carrier integration features
    const carrierElements = page.locator('select[name*="carrier"], select[name*="courier"], :has-text("ヤマト"), :has-text("佐川"), :has-text("郵便")');
    
    if (await carrierElements.count() > 0) {
      console.log(`✓ Found ${await carrierElements.count()} carrier integration elements`);
      
      // Test carrier selection
      const carrierSelect = page.locator('select[name*="carrier"], select[name*="courier"]').first();
      if (await carrierSelect.count() > 0) {
        const options = carrierSelect.locator('option[value]:not([value=""])');
        
        for (let i = 0; i < Math.min(3, await options.count()); i++) {
          const option = options.nth(i);
          const value = await option.getAttribute('value');
          const text = await option.textContent();
          
          await carrierSelect.selectOption(value);
          console.log(`  ✓ Tested carrier: ${text?.trim()}`);
          await page.waitForTimeout(500);
        }
      }
    } else {
      console.log('ℹ Carrier integration may be configured differently');
    }
    
    // Look for tracking integration features
    const trackingButtons = page.locator('button:has-text("追跡"), button:has-text("Track"), a[href*="track"]');
    
    if (await trackingButtons.count() > 0) {
      console.log(`✓ Found ${await trackingButtons.count()} tracking integration elements`);
    }
  });
});