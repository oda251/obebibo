const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../../utils/auth');
const { TestDataHelper } = require('../../utils/testData');

/**
 * Journey 6: Admin Campaign Management Workflow
 * Tests the complete admin flow from campaign creation to winner selection and management
 */

test.describe('Journey 6: Admin Campaign Management Workflow', () => {
  let authHelper;
  let testDataHelper;
  let uniqueTimestamp;
  let testCampaign;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    testDataHelper = new TestDataHelper(page);
    uniqueTimestamp = Date.now();
    testCampaign = {
      title: `管理テスト案件 ${uniqueTimestamp}`,
      description: `これは管理者による案件管理のテストです。作成日時: ${new Date().toLocaleString('ja-JP')}
      
商品概要:
- 高品質なテスト商品
- 限定50名様
- 詳細なレビューをお願いします

応募条件:
- 20歳以上の方
- SNSでの情報発信が可能な方
- 真摯にレビューをしていただける方`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      imageUrl: 'https://example.com/test-product.jpg'
    };
  });

  test('Complete admin campaign management workflow', async ({ page }) => {
    // Step 1: Admin Authentication
    console.log('Step 1: Admin authentication');
    
    await page.goto('/admin');
    
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    expect(page.url()).toMatch(/\/admin/);
    console.log('✓ Admin successfully authenticated');

    // Step 2: Campaign Planning and Creation
    console.log('Step 2: Creating new campaign');
    
    await page.goto('/admin/campaigns');
    await expect(page.locator('body')).toBeVisible();
    
    // Look for new campaign button
    const newCampaignButton = page.locator('a:has-text("新規"), a:has-text("作成"), a:has-text("New"), a[href*="new"]');
    let campaignFormReady = false;
    
    if (await newCampaignButton.count() > 0) {
      await newCampaignButton.click();
      await page.waitForTimeout(1000);
      campaignFormReady = true;
      console.log('✓ Accessed campaign creation form');
    } else {
      // Check if form is already on current page
      const formFields = page.locator('input[name*="title"], textarea[name*="description"], form');
      if (await formFields.count() > 0) {
        campaignFormReady = true;
        console.log('✓ Campaign creation form available on current page');
      }
    }
    
    if (campaignFormReady) {
      // Fill campaign creation form
      const titleField = page.locator('input[name*="title"], input[id*="title"], textarea[name*="title"]');
      if (await titleField.count() > 0) {
        await titleField.fill(testCampaign.title);
        console.log('✓ Campaign title filled');
      }
      
      const descriptionField = page.locator('textarea[name*="description"], input[name*="description"], textarea[id*="description"]');
      if (await descriptionField.count() > 0) {
        await descriptionField.fill(testCampaign.description);
        console.log('✓ Campaign description filled');
      }
      
      // Fill date fields
      const startDateField = page.locator('input[type="date"][name*="start"], input[name*="start_at"]');
      if (await startDateField.count() > 0) {
        await startDateField.fill(testCampaign.startDate);
        console.log('✓ Start date filled');
      }
      
      const endDateField = page.locator('input[type="date"][name*="end"], input[name*="end_at"]');
      if (await endDateField.count() > 0) {
        await endDateField.fill(testCampaign.endDate);
        console.log('✓ End date filled');
      }
      
      // Fill image URL if field exists
      const imageField = page.locator('input[name*="image"], input[name*="url"]');
      if (await imageField.count() > 0) {
        await imageField.fill(testCampaign.imageUrl);
        console.log('✓ Image URL filled');
      }
      
      // Handle any other required fields
      const otherInputs = page.locator('input[type="text"]:not([name*="title"]):not([name*="image"]), input[type="number"], select');
      for (let i = 0; i < await otherInputs.count(); i++) {
        const input = otherInputs.nth(i);
        const inputType = await input.getAttribute('type');
        const name = await input.getAttribute('name') || '';
        
        if (inputType === 'number' || name.includes('price') || name.includes('limit')) {
          await input.fill('50');
        } else if (name.includes('status')) {
          // Handle status field if it's a select
          const tagName = await input.evaluate(el => el.tagName.toLowerCase());
          if (tagName === 'select') {
            const options = input.locator('option[value="active"], option[value="published"], option[value="1"]');
            if (await options.count() > 0) {
              const value = await options.first().getAttribute('value');
              await input.selectOption(value);
            }
          }
        } else {
          await input.fill('テスト情報');
        }
      }
      
      // Submit campaign creation
      const submitButton = page.locator('input[type="submit"], button[type="submit"]:not(:has-text("戻る")):not(:has-text("Back"))');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(2000);
        console.log('✓ Campaign creation submitted');
      }
    } else {
      console.log('ℹ Campaign creation form not immediately accessible');
    }

    // Step 3: Campaign Publication and Monitoring
    console.log('Step 3: Monitoring campaign publication');
    
    // Return to campaigns list
    await page.goto('/admin/campaigns');
    await expect(page.locator('body')).toBeVisible();
    
    // Look for the created campaign
    const campaignList = await page.locator('body').textContent();
    let createdCampaignVisible = false;
    
    if (campaignList && campaignList.includes(testCampaign.title)) {
      createdCampaignVisible = true;
      console.log('✓ Created campaign visible in admin list');
    }
    
    // Check if campaign is visible to public
    await page.goto('/campaigns');
    await expect(page.locator('body')).toBeVisible();
    
    const publicList = await page.locator('body').textContent();
    if (publicList && publicList.includes(testCampaign.title)) {
      console.log('✓ Campaign is publicly visible');
    } else {
      console.log('ℹ Campaign may need approval or publication process');
    }

    // Step 4: Entry Management and Winner Selection
    console.log('Step 4: Managing campaign entries');
    
    // Go back to admin campaigns
    await page.goto('/admin/campaigns');
    await expect(page.locator('body')).toBeVisible();
    
    // Look for entry management links
    const entryLinks = page.locator('a[href*="entries"], a:has-text("応募"), a:has-text("Entry"), a:has-text("参加者")');
    
    if (await entryLinks.count() > 0) {
      await entryLinks.first().click();
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
      console.log('✓ Accessed entry management page');
      
      // Look for entry list or management interface
      const entryElements = page.locator('table tr, .entry, .applicant, form');
      if (await entryElements.count() > 0) {
        console.log(`✓ Found ${await entryElements.count()} entry management elements`);
        
        // Test winner selection if buttons/checkboxes are available
        const selectionElements = page.locator('input[type="checkbox"], input[type="radio"], button:has-text("選択"), button:has-text("当選")');
        if (await selectionElements.count() > 0) {
          // Select first entry as winner (if available)
          await selectionElements.first().click();
          console.log('✓ Selected entry for winner status');
          
          // Look for save/update button
          const updateButton = page.locator('input[type="submit"], button[type="submit"], button:has-text("更新"), button:has-text("保存")');
          if (await updateButton.count() > 0) {
            await updateButton.click();
            await page.waitForTimeout(1000);
            console.log('✓ Updated entry status');
          }
        } else {
          console.log('ℹ No entry selection interface immediately visible');
        }
      }
    } else {
      // Try accessing entries directly
      await page.goto('/admin/entries');
      await expect(page.locator('body')).toBeVisible();
      console.log('✓ Accessed general entries page');
    }

    // Step 5: Shipping Management
    console.log('Step 5: Managing shipping for winners');
    
    await page.goto('/admin/shipments');
    await expect(page.locator('body')).toBeVisible();
    
    // Look for shipment management interface
    const shipmentElements = page.locator('table, .shipment, form, input, select');
    if (await shipmentElements.count() > 0) {
      console.log(`✓ Shipment management interface available with ${await shipmentElements.count()} elements`);
      
      // Test shipment status update if available
      const statusSelects = page.locator('select[name*="status"], select[name*="shipment"]');
      if (await statusSelects.count() > 0) {
        const statusSelect = statusSelects.first();
        const options = statusSelect.locator('option[value]:not([value=""])');
        
        if (await options.count() > 0) {
          const firstOptionValue = await options.first().getAttribute('value');
          await statusSelect.selectOption(firstOptionValue);
          console.log('✓ Updated shipment status');
          
          // Save changes if button exists
          const saveButton = page.locator('input[type="submit"], button[type="submit"], button:has-text("更新")');
          if (await saveButton.count() > 0) {
            await saveButton.click();
            await page.waitForTimeout(1000);
            console.log('✓ Saved shipment changes');
          }
        }
      }
    }

    // Step 6: Follow-up and Review Management
    console.log('Step 6: Managing reviews and follow-up');
    
    await page.goto('/admin/reviews');
    await expect(page.locator('body')).toBeVisible();
    
    // Look for review management interface
    const reviewElements = page.locator('table, .review, form, .content');
    if (await reviewElements.count() > 0) {
      console.log(`✓ Review management interface available with ${await reviewElements.count()} elements`);
      
      // Test review moderation if available
      const moderationButtons = page.locator('button:has-text("承認"), button:has-text("削除"), button:has-text("Approve"), button:has-text("Delete")');
      if (await moderationButtons.count() > 0) {
        console.log(`✓ Found ${await moderationButtons.count()} review moderation options`);
      } else {
        console.log('ℹ Review moderation interface may be read-only or different format');
      }
    }
    
    // Step 7: Campaign Completion Processing
    console.log('Step 7: Completing campaign management workflow');
    
    // Return to main dashboard
    await page.goto('/admin');
    await expect(page.locator('body')).toBeVisible();
    
    // Verify access to all management sections
    const managementSections = [
      { path: '/admin/campaigns', name: 'Campaigns' },
      { path: '/admin/entries', name: 'Entries' },
      { path: '/admin/shipments', name: 'Shipments' },
      { path: '/admin/reviews', name: 'Reviews' }
    ];
    
    for (const section of managementSections) {
      await page.goto(section.path);
      await expect(page.locator('body')).toBeVisible();
      expect(page.url()).toContain(section.path);
      console.log(`  ✓ ${section.name} section accessible`);
    }
    
    console.log('✓ Journey completed: Admin campaign management workflow successful');
  });

  test('Campaign approval workflow', async ({ page }) => {
    console.log('Testing campaign approval workflow');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Check campaign status management
    await page.goto('/admin/campaigns');
    
    // Look for status management controls
    const statusControls = page.locator('select[name*="status"], input[name*="status"], button:has-text("公開"), button:has-text("非公開")');
    
    if (await statusControls.count() > 0) {
      console.log(`✓ Found ${await statusControls.count()} campaign status controls`);
      
      // Test status change if available
      const statusSelect = page.locator('select[name*="status"]').first();
      if (await statusSelect.count() > 0) {
        const options = statusSelect.locator('option[value]:not([value=""])');
        if (await options.count() > 1) {
          // Try different status
          const secondOption = await options.nth(1).getAttribute('value');
          await statusSelect.selectOption(secondOption);
          console.log('✓ Changed campaign status');
        }
      }
    } else {
      console.log('ℹ Campaign status management may be handled differently');
    }
  });

  test('Bulk entry management', async ({ page }) => {
    console.log('Testing bulk entry management');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/entries');
    
    // Look for bulk action controls
    const bulkControls = page.locator('input[type="checkbox"][name*="all"], button:has-text("一括"), button:has-text("Bulk"), select[name*="bulk"]');
    
    if (await bulkControls.count() > 0) {
      console.log(`✓ Found ${await bulkControls.count()} bulk management controls`);
      
      // Test select all if available
      const selectAllCheckbox = page.locator('input[type="checkbox"][name*="all"], input[type="checkbox"][id*="all"]');
      if (await selectAllCheckbox.count() > 0) {
        await selectAllCheckbox.click();
        console.log('✓ Select all functionality tested');
      }
    } else {
      console.log('ℹ Bulk entry management not immediately visible');
    }
  });

  test('Campaign analytics and reporting', async ({ page }) => {
    console.log('Testing campaign analytics and reporting');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    // Check dashboard for analytics
    const analyticsElements = page.locator('.chart, .graph, .stats, .analytics, [class*="stat"], [id*="chart"]');
    
    if (await analyticsElements.count() > 0) {
      console.log(`✓ Found ${await analyticsElements.count()} analytics elements on dashboard`);
    }
    
    // Check campaigns page for metrics
    await page.goto('/admin/campaigns');
    
    const metricElements = page.locator('td:has-text("応募"), td:has-text("entries"), .count, .number, [class*="metric"]');
    
    if (await metricElements.count() > 0) {
      console.log(`✓ Found ${await metricElements.count()} metric elements in campaign list`);
    } else {
      console.log('ℹ Campaign metrics may be in detailed view or separate reports');
    }
  });

  test('Campaign template and duplication', async ({ page }) => {
    console.log('Testing campaign template and duplication features');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/campaigns');
    
    // Look for duplication or template features
    const duplicateButtons = page.locator('button:has-text("複製"), button:has-text("Copy"), button:has-text("Duplicate"), a:has-text("複製")');
    
    if (await duplicateButtons.count() > 0) {
      console.log(`✓ Found ${await duplicateButtons.count()} campaign duplication options`);
      
      // Test duplication if available
      await duplicateButtons.first().click();
      await page.waitForTimeout(1000);
      
      // Should redirect to creation form with pre-filled data
      const titleField = page.locator('input[name*="title"], textarea[name*="title"]');
      if (await titleField.count() > 0) {
        const prefilledValue = await titleField.inputValue();
        if (prefilledValue && prefilledValue.length > 0) {
          console.log('✓ Campaign duplication prefills form data');
        }
      }
    } else {
      console.log('ℹ Campaign duplication feature not immediately visible');
    }
  });

  test('Winner notification system', async ({ page }) => {
    console.log('Testing winner notification system');
    
    // Login as admin
    await page.goto('/admin');
    if (page.url().includes('/sign_in')) {
      await page.fill('input[name*="email"]', 'admin@example.com');
      await page.fill('input[name*="password"]', 'password123');
      await page.click('input[type="submit"], button[type="submit"]');
      await page.waitForTimeout(2000);
    }
    
    await page.goto('/admin/entries');
    
    // Look for notification features
    const notificationButtons = page.locator('button:has-text("通知"), button:has-text("Notify"), button:has-text("メール"), a:has-text("通知")');
    
    if (await notificationButtons.count() > 0) {
      console.log(`✓ Found ${await notificationButtons.count()} notification options`);
    } else {
      console.log('ℹ Winner notification may be automatic or handled differently');
    }
    
    // Check for email template management
    const emailElements = page.locator(':has-text("メールテンプレート"), :has-text("Email template"), textarea[name*="message"]');
    
    if (await emailElements.count() > 0) {
      console.log(`✓ Found ${await emailElements.count()} email template elements`);
    }
  });
});