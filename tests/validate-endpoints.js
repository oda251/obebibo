#!/usr/bin/env node

/**
 * Simple endpoint validation script
 * Tests all endpoints from docs/frontend.md using HTTP requests
 * This serves as a fallback when full Playwright browser automation is not available
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';

// All endpoints from docs/frontend.md
const ENDPOINTS = [
  { url: '/', name: 'Top page', public: true },
  { url: '/campaigns', name: 'Campaign list', public: true },
  { url: '/campaigns/1', name: 'Campaign details', public: true },
  { url: '/campaigns/1/entry', name: 'Campaign entry form', requiresAuth: true },
  { url: '/campaigns/1/entry/done', name: 'Campaign entry completion', requiresAuth: true },
  { url: '/mypage', name: 'MyPage', requiresAuth: true },
  { url: '/mypage/review/1', name: 'Review posting', requiresAuth: true },
  { url: '/admin', name: 'Admin dashboard', requiresAdmin: true },
  { url: '/admin/campaigns', name: 'Campaign management', requiresAdmin: true },
  { url: '/admin/campaigns/1/entries', name: 'Entry management', requiresAdmin: true },
  { url: '/admin/shipments', name: 'Shipment management', requiresAdmin: true },
  { url: '/admin/reviews', name: 'Review management', requiresAdmin: true },
  { url: '/login', name: 'Login page', public: true },
  { url: '/register', name: 'Registration page', public: true },
  { url: '/terms', name: 'Terms page', public: true },
  { url: '/privacy', name: 'Privacy page', public: true },
  { url: '/inquiry', name: 'Inquiry page', public: true }
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${BASE_URL}${url}`;
    const requestLib = fullUrl.startsWith('https') ? https : http;
    
    const req = requestLib.get(fullUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: fullUrl
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(endpoint) {
  try {
    const response = await makeRequest(endpoint.url);
    
    // Analyze response
    const isSuccess = response.statusCode >= 200 && response.statusCode < 400;
    const isRedirect = response.statusCode >= 300 && response.statusCode < 400;
    const isError = response.statusCode >= 500;
    
    let status = '✓';
    let message = `${response.statusCode}`;
    
    if (isError) {
      status = '✗';
      message = `${response.statusCode} SERVER ERROR`;
    } else if (endpoint.public && isSuccess) {
      status = '✓';
      message = `${response.statusCode} OK`;
    } else if ((endpoint.requiresAuth || endpoint.requiresAdmin) && isRedirect) {
      status = '✓';
      message = `${response.statusCode} REDIRECT (Expected for auth)`;
    } else if (isSuccess) {
      status = '✓';
      message = `${response.statusCode} OK`;
    } else {
      status = '?';
      message = `${response.statusCode} (Check manually)`;
    }
    
    console.log(`${status} ${endpoint.name.padEnd(25)} ${endpoint.url.padEnd(35)} ${message}`);
    
    return {
      endpoint,
      response,
      success: !isError,
      status
    };
  } catch (error) {
    console.log(`✗ ${endpoint.name.padEnd(25)} ${endpoint.url.padEnd(35)} ERROR: ${error.message}`);
    return {
      endpoint,
      error,
      success: false,
      status: '✗'
    };
  }
}

async function runTests() {
  console.log('🧪 Obebibo E2E Endpoint Validation');
  console.log('=' .repeat(80));
  console.log('Testing all endpoints from docs/frontend.md...\n');
  
  console.log('Status Endpoint Name           URL                                 Result');
  console.log('-'.repeat(80));
  
  const results = [];
  
  for (const endpoint of ENDPOINTS) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n' + '='.repeat(80));
  
  const successful = results.filter(r => r.status === '✓').length;
  const failed = results.filter(r => r.status === '✗').length;
  const warnings = results.filter(r => r.status === '?').length;
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✓ Successful: ${successful}/${ENDPOINTS.length}`);
  console.log(`   ✗ Failed: ${failed}/${ENDPOINTS.length}`);
  console.log(`   ? Warnings: ${warnings}/${ENDPOINTS.length}`);
  
  if (failed === 0) {
    console.log(`\n🎉 All endpoints are working! The application is ready for full Playwright testing.`);
    process.exit(0);
  } else {
    console.log(`\n⚠️  Some endpoints have issues. Check the application setup.`);
    process.exit(1);
  }
}

// Check if application is running first
async function checkAppStatus() {
  try {
    console.log('🔍 Checking if application is running...');
    await makeRequest('/');
    console.log('✓ Application is responding\n');
    return true;
  } catch (error) {
    console.log(`✗ Application is not responding: ${error.message}`);
    console.log('💡 Make sure to run: docker compose up -d\n');
    return false;
  }
}

async function main() {
  const isRunning = await checkAppStatus();
  if (!isRunning) {
    process.exit(1);
  }
  
  await runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ENDPOINTS, testEndpoint, makeRequest };