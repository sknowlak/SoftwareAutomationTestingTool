/**
 * Lead Form Test Generator
 * This service specifically handles test generation for lead forms and CRM screenshots
 */

/**
 * Generate a test script for lead form screenshots
 */
export const generateLeadFormTest = (
  testType: 'playwright' | 'pytest' | 'cypress' = 'playwright',
  testName: string = 'Lead_Form_Test'
): string => {
  // Normalize test name
  const normalizedTestName = testName.replace(/[^a-zA-Z0-9]/g, '_') || 'Lead_Form_Test';
  
  // Generate appropriate test based on the test type
  switch (testType) {
    case 'playwright':
      return generatePlaywrightLeadTest(normalizedTestName);
    case 'pytest':
      return generatePytestLeadTest(normalizedTestName);
    case 'cypress':
      return generateCypressLeadTest(normalizedTestName);
    default:
      return generatePlaywrightLeadTest(normalizedTestName);
  }
};

/**
 * Generate a Playwright test script for lead forms
 */
const generatePlaywrightLeadTest = (testName: string): string => {
  return `import { test, expect } from '@playwright/test';

/**
 * ${testName}
 * Auto-generated test script for lead form testing
 */
test('${testName}', async ({ page }) => {
  // Navigate to the CRM/lead management system
  await page.goto('https://crm.example.com/leads');
  
  // Verify page loaded
  await expect(page).toHaveTitle(/Leads/);
  
  // Click on "Add Lead" button
  await page.click('button:has-text("Add Lead")');
  
  // Wait for the lead form to appear
  await page.waitForSelector('form.lead-form');
  
  // Fill in lead information
  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.fill('input[name="email"]', 'john.doe@example.com');
  await page.fill('input[name="phone"]', '555-123-4567');
  await page.fill('input[name="company"]', 'Acme Corporation');
  
  // Select lead source from dropdown
  await page.selectOption('select[name="source"]', 'Website');
  
  // Select lead status
  await page.selectOption('select[name="status"]', 'New');
  
  // Add notes
  await page.fill('textarea[name="notes"]', 'Initial contact via website form');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Verify lead was added successfully
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page.locator('.success-message')).toContainText('Lead added successfully');
  
  // Verify lead appears in the lead list
  await page.click('a:has-text("All Leads")');
  await expect(page.locator('table.leads-table')).toContainText('John Doe');
  
  // Open the lead details
  await page.click('tr:has-text("John Doe")');
  
  // Verify lead details page
  await expect(page.locator('.lead-details')).toBeVisible();
  await expect(page.locator('.lead-details')).toContainText('john.doe@example.com');
});`;
};

/**
 * Generate a Pytest test script for lead forms
 */
const generatePytestLeadTest = (testName: string): string => {
  return `import pytest
import re
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the CRM/lead management system
    page.goto('https://crm.example.com/leads')
    
    # Verify page loaded
    expect(page).to_have_title(re.compile('Leads'))
    
    # Click on "Add Lead" button
    page.click('button:has-text("Add Lead")')
    
    # Wait for the lead form to appear
    page.wait_for_selector('form.lead-form')
    
    # Fill in lead information
    page.fill('input[name="firstName"]', 'John')
    page.fill('input[name="lastName"]', 'Doe')
    page.fill('input[name="email"]', 'john.doe@example.com')
    page.fill('input[name="phone"]', '555-123-4567')
    page.fill('input[name="company"]', 'Acme Corporation')
    
    # Select lead source from dropdown
    page.select_option('select[name="source"]', 'Website')
    
    # Select lead status
    page.select_option('select[name="status"]', 'New')
    
    # Add notes
    page.fill('textarea[name="notes"]', 'Initial contact via website form')
    
    # Submit the form
    page.click('button[type="submit"]')
    
    # Verify lead was added successfully
    expect(page.locator('.success-message')).to_be_visible()
    expect(page.locator('.success-message')).to_contain_text('Lead added successfully')
    
    # Verify lead appears in the lead list
    page.click('a:has-text("All Leads")')
    expect(page.locator('table.leads-table')).to_contain_text('John Doe')
    
    # Open the lead details
    page.click('tr:has-text("John Doe")')
    
    # Verify lead details page
    expect(page.locator('.lead-details')).to_be_visible()
    expect(page.locator('.lead-details')).to_contain_text('john.doe@example.com')`;
};

/**
 * Generate a Cypress test script for lead forms
 */
const generateCypressLeadTest = (testName: string): string => {
  return `describe('${testName}', () => {
  it('should add a new lead and verify details', () => {
    // Navigate to the CRM/lead management system
    cy.visit('https://crm.example.com/leads');
    
    // Verify page loaded
    cy.title().should('match', /Leads/);
    
    // Click on "Add Lead" button
    cy.contains('button', 'Add Lead').click();
    
    // Wait for the lead form to appear
    cy.get('form.lead-form').should('be.visible');
    
    // Fill in lead information
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('john.doe@example.com');
    cy.get('input[name="phone"]').type('555-123-4567');
    cy.get('input[name="company"]').type('Acme Corporation');
    
    // Select lead source from dropdown
    cy.get('select[name="source"]').select('Website');
    
    // Select lead status
    cy.get('select[name="status"]').select('New');
    
    // Add notes
    cy.get('textarea[name="notes"]').type('Initial contact via website form');
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify lead was added successfully
    cy.get('.success-message').should('be.visible');
    cy.get('.success-message').should('contain', 'Lead added successfully');
    
    // Verify lead appears in the lead list
    cy.contains('a', 'All Leads').click();
    cy.get('table.leads-table').should('contain', 'John Doe');
    
    // Open the lead details
    cy.contains('tr', 'John Doe').click();
    
    // Verify lead details page
    cy.get('.lead-details').should('be.visible');
    cy.get('.lead-details').should('contain', 'john.doe@example.com');
  });
});`;
};
