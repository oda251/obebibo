#!/bin/bash

# Comprehensive test runner for Obebibo E2E tests
# This script runs all available tests and provides a summary

set -e

echo "🧪 Obebibo E2E Test Suite"
echo "========================="
echo ""

# Check if application is running
echo "🔍 Checking application status..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Application is running on localhost:3000"
else
    echo "❌ Application is not running!"
    echo "💡 Please start the application with: docker compose up -d"
    exit 1
fi

echo ""
# Navigate to tests directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing test dependencies..."
    npm install
    echo ""
fi

# Playwrightブラウザのインストールチェック（最初に実施）
echo "🌍 Checking Playwright browser availability..."
if ! npx playwright install --dry-run &>/dev/null; then
    echo "⚠️  Playwright browsers not found - installing..."
    if npx playwright install &>/dev/null; then
        echo "✅ Browsers installed successfully"
    else
        echo "❌ Browser installation failed. Exiting."
        exit 1
    fi
else
    echo "✅ Playwright browsers are available"
fi

echo ""

# Run HTTP-based tests
echo "🧪 Running HTTP-based E2E tests..."
echo "   (These tests validate all endpoints without requiring browser automation)"
npx playwright test specs/http-based.spec.js --reporter=line
echo ""

# Run basic E2E tests
echo "🎭 Running basic E2E tests..."
npx playwright test specs/public-pages.spec.js specs/user-auth.spec.js specs/admin-auth.spec.js specs/campaign-interactions.spec.js specs/all-endpoints.spec.js --reporter=line

echo ""
echo "🛤️  Running user journey tests..."
npx playwright test specs/journeys/ --reporter=html

echo "📊 Test report generated - run 'npm run test:report' to view"

echo ""
echo "✅ Test suite completed!"
echo ""
echo "📋 Summary:"
echo "   • All 17 endpoints from docs/frontend.md are validated ✅"
echo "   • Public pages load correctly ✅"
echo "   • Authentication redirects work properly ✅"
echo "   • Admin routes are protected ✅"
echo "   • CSRF protection is in place ✅"
echo "   • Error handling is working ✅"
echo "   • Full browser automation completed ✅"
echo ""
echo "🎯 Next steps:"
echo "   • Run 'npm run test:ui' for interactive testing"
echo "   • Run 'npm run test:headed' to see browser automation"
echo "   • Run 'npm run test:report' to view detailed results"