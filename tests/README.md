# Obebibo E2E Tests with Playwright

This directory contains comprehensive End-to-End (E2E) tests for the Obebibo application using Playwright in JavaScript.

## Overview

The test suite covers all endpoints specified in `docs/frontend.md` and includes comprehensive user journey tests to ensure the application meets its specifications and provides excellent user experience.

### Test Structure

```
tests/
├── package.json              # Dependencies and scripts
├── playwright.config.js      # Playwright configuration
├── specs/                    # Test specifications
│   ├── public-pages.spec.js  # Public pages (/, /campaigns, /terms, etc.)
│   ├── user-auth.spec.js     # User authentication and protected pages
│   ├── admin-auth.spec.js    # Admin authentication and admin pages
│   ├── campaign-interactions.spec.js  # Campaign workflows
│   ├── all-endpoints.spec.js # Comprehensive endpoint coverage verification
│   ├── http-based.spec.js    # HTTP-based validation tests
│   └── journeys/             # User journey tests
│       ├── journey-01-user-registration-to-application.spec.js
│       ├── journey-02-company-registration-to-campaign.spec.js
│       ├── journey-03-admin-login-to-dashboard.spec.js
│       ├── journey-04-campaign-discovery-to-application.spec.js
│       ├── journey-05-user-review-submission.spec.js
│       ├── journey-06-admin-campaign-management.spec.js
│       ├── journey-07-admin-shipment-management.spec.js
│       └── journey-08-user-profile-management.spec.js
└── utils/                    # Test utilities
    ├── auth.js               # Authentication helpers
    └── testData.js           # Test data management
```

### User Journey Tests

The test suite includes 8 comprehensive user journey tests that validate end-to-end workflows:

1. **User Registration to Campaign Application** - Complete flow from service discovery to applying for campaigns
2. **Company Registration to Campaign Creation** - Admin-managed company setup and campaign creation workflow  
3. **Admin Login to Dashboard** - Complete admin authentication and dashboard access
4. **Campaign Discovery to Application** - User journey from browsing campaigns to submitting applications
5. **User Review Submission** - Complete review workflow from winning campaigns to posting reviews
6. **Admin Campaign Management** - Comprehensive admin campaign management from creation to completion
7. **Admin Shipment Management** - Full shipment workflow from winner selection to delivery confirmation
8. **User Profile Management** - Complete user profile and account management functionality

### Endpoints Tested

The test suite covers all 17 endpoints from `docs/frontend.md`:

#### Public Endpoints
- `/` - Top page
- `/campaigns` - Campaign listing
- `/campaigns/:id` - Campaign details
- `/terms` - Terms page
- `/privacy` - Privacy policy
- `/inquiry` - Inquiry page
- `/login` - Login form
- `/register` - Registration form

#### User-Protected Endpoints
- `/mypage` - User dashboard
- `/campaigns/:id/entry` - Campaign entry form
- `/campaigns/:id/entry/done` - Entry completion
- `/mypage/review/:id` - Review posting

#### Admin-Protected Endpoints
- `/admin` - Admin dashboard
- `/admin/campaigns` - Campaign management
- `/admin/campaigns/:id/entries` - Entry management
- `/admin/shipments` - Shipment management
- `/admin/reviews` - Review management

## Prerequisites

1. **Application running**: The Obebibo application should be running on `http://localhost:3000`
   ```bash
   cd /path/to/obebibo
   docker compose up -d
   ```

2. **Node.js**: Node.js 16+ installed

## Installation

```bash
cd tests
npm install
npx playwright install
```

## Running Tests

### Quick validation (HTTP-based, no browser required)
```bash
npm run validate
npm test specs/http-based.spec.js
```

### Full E2E tests (requires browsers)
First install browsers:
```bash
npm run install-browsers-chromium  # For Chromium only
# or
npm run install-browsers           # For all browsers
```

Then run tests:
```bash
npm test                           # All tests
npm run test:headed               # With browser visible
npm run test:debug                # Debug mode
npm run test:ui                   # Interactive UI mode
npm run test:journeys             # All user journey tests
```

### Individual journey tests
```bash
npm run test:journey-01           # User registration to application
npm run test:journey-02           # Company registration to campaign
npm run test:journey-03           # Admin login to dashboard
npm run test:journey-04           # Campaign discovery to application
npm run test:journey-05           # User review submission
npm run test:journey-06           # Admin campaign management
npm run test:journey-07           # Admin shipment management
npm run test:journey-08           # User profile management
```

### View test reports
```bash
npm run test:report
```

### Run specific test files
```bash
# HTTP-based tests (fast, no browser needed)
npx playwright test specs/http-based.spec.js

# Full browser automation tests
npx playwright test specs/public-pages.spec.js
npx playwright test specs/user-auth.spec.js
npx playwright test specs/admin-auth.spec.js
npx playwright test specs/campaign-interactions.spec.js
npx playwright test specs/all-endpoints.spec.js
```

## Test Features

### Authentication Testing
- User registration and login flows
- Admin authentication
- Protected route access control
- Session management

### Page Load Testing
- All public pages load without errors
- Proper redirects for protected pages
- Error handling for invalid URLs

### Workflow Testing
- Complete user journey from registration to campaign application
- Admin workflow for campaign and entry management
- Navigation between pages

### Cross-Browser Testing
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

## Test Data

The tests use a combination of:
- Existing seed data from the application
- Dynamically created test accounts (timestamped emails)
- Helper functions for data management

### Authentication Credentials

The tests attempt to use these default credentials:
- **User**: `testuser@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

If these don't exist, tests will skip or create new accounts as needed.

## Configuration

### Playwright Configuration (`playwright.config.js`)
- Base URL: `http://localhost:3000`
- Parallel execution enabled
- HTML reporter for detailed results
- Trace collection on test failures

### Environment Variables
No special environment variables required - tests use the running application.

## Test Philosophy

### Graceful Degradation
Tests are designed to:
- Skip gracefully if authentication is not available
- Handle missing test data appropriately
- Provide meaningful error messages
- Continue testing other endpoints even if some fail

### Comprehensive Coverage
- Every endpoint from `frontend.md` is tested
- Both authenticated and unauthenticated access patterns
- Error conditions and edge cases
- User workflows and admin workflows

## Troubleshooting

### Common Issues

1. **Application not running**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3000
   ```
   Solution: Start the application with `docker compose up -d`

2. **Authentication failures**
   ```
   Test skipped: User authentication not available
   ```
   Solution: Check if seed data includes test accounts or create them manually

3. **Slow tests**
   - Tests include appropriate waits for page loads
   - Increase timeout in `playwright.config.js` if needed

### Debug Mode
Run tests in debug mode to step through interactions:
```bash
npm run test:debug
```

## Continuous Integration

The test suite is configured for CI environments:
- Retry failed tests 2 times on CI
- Single worker mode on CI for stability
- Comprehensive HTML reports generated

## Extending Tests

To add new tests:

1. **Add new spec file** in `specs/` directory
2. **Use existing utilities** from `utils/` for authentication and data
3. **Follow naming convention**: `feature-name.spec.js`
4. **Include in comprehensive test** by updating `all-endpoints.spec.js`

### Example Test Structure
```javascript
const { test, expect } = require('@playwright/test');
const { AuthHelper } = require('../utils/auth');

test.describe('New Feature', () => {
  test('should work correctly', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    await page.goto('/new-endpoint');
    await expect(page.locator('body')).toBeVisible();
  });
});
```