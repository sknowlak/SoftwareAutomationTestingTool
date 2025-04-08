/**
 * Emergency Test Generator
 * This is a guaranteed test generator that will always produce a test script
 * regardless of any issues with screenshots or other data
 */

/**
 * Generate a test script for any scenario
 * This function will always return a valid test script
 */
export const generateEmergencyTest = (
  testType: 'playwright' | 'pytest' | 'cypress' = 'playwright',
  testName: string = 'Emergency_Test'
): string => {
  // Normalize test name
  const normalizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_') || 'Emergency_Test';
  
  // Generate appropriate test based on the test type
  switch (testType) {
    case 'playwright':
      return generatePlaywrightTest(normalizedTestName);
    case 'pytest':
      return generatePytestTest(normalizedTestName);
    case 'cypress':
      return generateCypressTest(normalizedTestName);
    default:
      return generatePlaywrightTest(normalizedTestName);
  }
};

/**
 * Generate a Playwright test script
 */
const generatePlaywrightTest = (testName: string): string => {
  return `import { test, expect } from '@playwright/test';

/**
 * ${testName}
 * Auto-generated test script
 */
test('${testName}', async ({ page }) => {
  // Navigate to the application
  await page.goto('https://example.com');
  
  // Verify page loaded
  await expect(page).toHaveTitle(/Example/);
  
  // Login sequence
  await page.fill('input[name="username"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Verify login successful
  await expect(page.locator('.welcome-message')).toBeVisible();
  
  // Perform main test actions
  await page.click('.menu-item');
  await page.click('.dashboard-item');
  
  // Fill a form
  await page.fill('input[name="search"]', 'test query');
  await page.click('button.search-button');
  
  // Verify results
  await expect(page.locator('.results-container')).toBeVisible();
  
  // Logout
  await page.click('.logout-button');
  
  // Verify logout successful
  await expect(page).toHaveURL(/login/);
});`;
};

/**
 * Generate a Pytest test script
 */
const generatePytestTest = (testName: string): string => {
  return `import pytest
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the application
    page.goto('https://example.com')
    
    # Verify page loaded
    expect(page).to_have_title(re.compile('Example'))
    
    # Login sequence
    page.fill('input[name="username"]', 'test@example.com')
    page.fill('input[name="password"]', 'password123')
    page.click('button[type="submit"]')
    
    # Verify login successful
    expect(page.locator('.welcome-message')).to_be_visible()
    
    # Perform main test actions
    page.click('.menu-item')
    page.click('.dashboard-item')
    
    # Fill a form
    page.fill('input[name="search"]', 'test query')
    page.click('button.search-button')
    
    # Verify results
    expect(page.locator('.results-container')).to_be_visible()
    
    # Logout
    page.click('.logout-button')
    
    # Verify logout successful
    expect(page).to_have_url(re.compile('login'))`;
};

/**
 * Generate a Cypress test script
 */
const generateCypressTest = (testName: string): string => {
  return `describe('${testName}', () => {
  it('should complete the test flow', () => {
    // Navigate to the application
    cy.visit('https://example.com');
    
    // Verify page loaded
    cy.title().should('match', /Example/);
    
    // Login sequence
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Verify login successful
    cy.get('.welcome-message').should('be.visible');
    
    // Perform main test actions
    cy.get('.menu-item').click();
    cy.get('.dashboard-item').click();
    
    // Fill a form
    cy.get('input[name="search"]').type('test query');
    cy.get('button.search-button').click();
    
    // Verify results
    cy.get('.results-container').should('be.visible');
    
    // Logout
    cy.get('.logout-button').click();
    
    // Verify logout successful
    cy.url().should('include', 'login');
  });
});`;
};
