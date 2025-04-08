/**
 * Direct Test Generation Service
 * This service provides a simplified, direct approach to generating test cases
 * without complex analysis that might fail
 */

/**
 * Generate a test script directly from a screenshot description
 * This bypasses the analysis step to ensure reliable test generation
 */
export const generateDirectTestScript = (
  description: string,
  testType: 'playwright' | 'pytest' | 'cypress' = 'playwright'
): string => {
  // Clean up and normalize the description
  const cleanDescription = description?.trim() || 'Screenshot Test';
  const testName = cleanDescription.replace(/[^a-zA-Z0-9]/g, '_');
  
  // Determine which template to use based on keywords in the description
  const lowerDesc = cleanDescription.toLowerCase();
  
  if (lowerDesc.includes('login') || lowerDesc.includes('sign in')) {
    return generateLoginTest(testName, testType);
  } else if (lowerDesc.includes('register') || lowerDesc.includes('sign up')) {
    return generateRegistrationTest(testName, testType);
  } else if (lowerDesc.includes('form') || lowerDesc.includes('input')) {
    return generateFormTest(testName, testType);
  } else if (lowerDesc.includes('search') || lowerDesc.includes('find')) {
    return generateSearchTest(testName, testType);
  } else if (lowerDesc.includes('cart') || lowerDesc.includes('checkout')) {
    return generateCheckoutTest(testName, testType);
  } else if (lowerDesc.includes('dashboard') || lowerDesc.includes('home')) {
    return generateDashboardTest(testName, testType);
  } else {
    // Default test for any other type of screenshot
    return generateDefaultTest(testName, testType);
  }
};

/**
 * Generate a test script for multiple screenshots
 */
export const generateMultiScreenshotTestScript = (
  screenshots: Array<{ description: string }>,
  testType: 'playwright' | 'pytest' | 'cypress' = 'playwright'
): string => {
  const testName = 'Multi_Screenshot_Test';
  
  // Generate a test that combines elements from all screenshots
  switch (testType) {
    case 'playwright':
      return generatePlaywrightMultiTest(testName, screenshots);
    case 'pytest':
      return generatePytestMultiTest(testName, screenshots);
    case 'cypress':
      return generateCypressMultiTest(testName, screenshots);
    default:
      return generatePlaywrightMultiTest(testName, screenshots);
  }
};

// Login test templates
const generateLoginTest = (testName: string, testType: string): string => {
  switch (testType) {
    case 'playwright':
      return `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  // Navigate to the login page
  await page.goto('https://example.com/login');
  
  // Fill in the login form
  await page.fill('input[name="username"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Click the login button
  await page.click('button[type="submit"]');
  
  // Verify successful login
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.locator('.welcome-message')).toContainText('Welcome');
});`;

    case 'pytest':
      return `import pytest
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the login page
    page.goto('https://example.com/login')
    
    # Fill in the login form
    page.fill('input[name="username"]', 'test@example.com')
    page.fill('input[name="password"]', 'password123')
    
    # Click the login button
    page.click('button[type="submit"]')
    
    # Verify successful login
    expect(page).to_have_url(re.compile('dashboard'))
    expect(page.locator('.welcome-message')).to_contain_text('Welcome')`;

    case 'cypress':
      return `describe('${testName}', () => {
  it('should login successfully', () => {
    // Navigate to the login page
    cy.visit('https://example.com/login');
    
    // Fill in the login form
    cy.get('input[name="username"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    
    // Click the login button
    cy.get('button[type="submit"]').click();
    
    // Verify successful login
    cy.url().should('include', 'dashboard');
    cy.get('.welcome-message').should('contain', 'Welcome');
  });
});`;

    default:
      return generatePlaywrightMultiTest(testName, [{ description: 'Login Test' }]);
  }
};

// Registration test templates
const generateRegistrationTest = (testName: string, testType: string): string => {
  switch (testType) {
    case 'playwright':
      return `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  // Navigate to the registration page
  await page.goto('https://example.com/register');
  
  // Fill in the registration form
  await page.fill('input[name="fullname"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'SecurePassword123');
  await page.fill('input[name="confirmPassword"]', 'SecurePassword123');
  
  // Accept terms and conditions
  await page.check('input[type="checkbox"]#terms');
  
  // Click the register button
  await page.click('button[type="submit"]');
  
  // Verify successful registration
  await expect(page).toHaveURL(/confirmation/);
  await expect(page.locator('.success-message')).toContainText('Registration successful');
});`;

    case 'pytest':
      return `import pytest
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the registration page
    page.goto('https://example.com/register')
    
    # Fill in the registration form
    page.fill('input[name="fullname"]', 'Test User')
    page.fill('input[name="email"]', 'test@example.com')
    page.fill('input[name="password"]', 'SecurePassword123')
    page.fill('input[name="confirmPassword"]', 'SecurePassword123')
    
    # Accept terms and conditions
    page.check('input[type="checkbox"]#terms')
    
    # Click the register button
    page.click('button[type="submit"]')
    
    # Verify successful registration
    expect(page).to_have_url(re.compile('confirmation'))
    expect(page.locator('.success-message')).to_contain_text('Registration successful')`;

    case 'cypress':
      return `describe('${testName}', () => {
  it('should register a new user', () => {
    // Navigate to the registration page
    cy.visit('https://example.com/register');
    
    // Fill in the registration form
    cy.get('input[name="fullname"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('SecurePassword123');
    cy.get('input[name="confirmPassword"]').type('SecurePassword123');
    
    // Accept terms and conditions
    cy.get('input[type="checkbox"]#terms').check();
    
    // Click the register button
    cy.get('button[type="submit"]').click();
    
    // Verify successful registration
    cy.url().should('include', 'confirmation');
    cy.get('.success-message').should('contain', 'Registration successful');
  });
});`;

    default:
      return generatePlaywrightMultiTest(testName, [{ description: 'Registration Test' }]);
  }
};

// Form test templates
const generateFormTest = (testName: string, testType: string): string => {
  switch (testType) {
    case 'playwright':
      return `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  // Navigate to the form page
  await page.goto('https://example.com/form');
  
  // Fill in text fields
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  
  // Fill in textarea
  await page.fill('textarea[name="message"]', 'This is a test message for the form submission.');
  
  // Select from dropdown
  await page.selectOption('select[name="category"]', 'option2');
  
  // Check radio button
  await page.check('input[type="radio"]#option1');
  
  // Check checkbox
  await page.check('input[type="checkbox"]#agree');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Verify successful submission
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page.locator('.success-message')).toContainText('Form submitted successfully');
});`;

    case 'pytest':
      return `import pytest
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the form page
    page.goto('https://example.com/form')
    
    # Fill in text fields
    page.fill('input[name="name"]', 'Test User')
    page.fill('input[name="email"]', 'test@example.com')
    
    # Fill in textarea
    page.fill('textarea[name="message"]', 'This is a test message for the form submission.')
    
    # Select from dropdown
    page.select_option('select[name="category"]', 'option2')
    
    # Check radio button
    page.check('input[type="radio"]#option1')
    
    # Check checkbox
    page.check('input[type="checkbox"]#agree')
    
    # Submit the form
    page.click('button[type="submit"]')
    
    # Verify successful submission
    expect(page.locator('.success-message')).to_be_visible()
    expect(page.locator('.success-message')).to_contain_text('Form submitted successfully')`;

    case 'cypress':
      return `describe('${testName}', () => {
  it('should submit the form successfully', () => {
    // Navigate to the form page
    cy.visit('https://example.com/form');
    
    // Fill in text fields
    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test@example.com');
    
    // Fill in textarea
    cy.get('textarea[name="message"]').type('This is a test message for the form submission.');
    
    // Select from dropdown
    cy.get('select[name="category"]').select('option2');
    
    // Check radio button
    cy.get('input[type="radio"]#option1').check();
    
    // Check checkbox
    cy.get('input[type="checkbox"]#agree').check();
    
    // Submit the form
    cy.get('button[type="submit"]').click();
    
    // Verify successful submission
    cy.get('.success-message').should('be.visible');
    cy.get('.success-message').should('contain', 'Form submitted successfully');
  });
});`;

    default:
      return generatePlaywrightMultiTest(testName, [{ description: 'Form Test' }]);
  }
};

// Search test templates
const generateSearchTest = (testName: string, testType: string): string => {
  switch (testType) {
    case 'playwright':
      return `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  // Navigate to the search page
  await page.goto('https://example.com/search');
  
  // Enter search query
  await page.fill('input[name="q"]', 'test query');
  
  // Click search button
  await page.click('button[type="submit"]');
  
  // Verify search results
  await expect(page.locator('.search-results')).toBeVisible();
  
  // Apply filters
  await page.click('.filter-dropdown');
  await page.click('.filter-option:has-text("Option 1")');
  
  // Click on a search result
  await page.click('.search-result-item:first-child');
  
  // Verify navigation to detail page
  await expect(page).toHaveURL(/detail/);
});`;

    case 'pytest':
      return `import pytest
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the search page
    page.goto('https://example.com/search')
    
    # Enter search query
    page.fill('input[name="q"]', 'test query')
    
    # Click search button
    page.click('button[type="submit"]')
    
    # Verify search results
    expect(page.locator('.search-results')).to_be_visible()
    
    # Apply filters
    page.click('.filter-dropdown')
    page.click('.filter-option:has-text("Option 1")')
    
    # Click on a search result
    page.click('.search-result-item:first-child')
    
    # Verify navigation to detail page
    expect(page).to_have_url(re.compile('detail'))`;

    case 'cypress':
      return `describe('${testName}', () => {
  it('should perform a search and view results', () => {
    // Navigate to the search page
    cy.visit('https://example.com/search');
    
    // Enter search query
    cy.get('input[name="q"]').type('test query');
    
    // Click search button
    cy.get('button[type="submit"]').click();
    
    // Verify search results
    cy.get('.search-results').should('be.visible');
    
    // Apply filters
    cy.get('.filter-dropdown').click();
    cy.get('.filter-option').contains('Option 1').click();
    
    // Click on a search result
    cy.get('.search-result-item').first().click();
    
    // Verify navigation to detail page
    cy.url().should('include', 'detail');
  });
});`;

    default:
      return generatePlaywrightMultiTest(testName, [{ description: 'Search Test' }]);
  }
};

// Checkout test templates
const generateCheckoutTest = (testName: string, testType: string): string => {
  switch (testType) {
    case 'playwright':
      return `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  // Navigate to the cart page
  await page.goto('https://example.com/cart');
  
  // Verify cart items
  await expect(page.locator('.cart-item')).toHaveCount(2);
  
  // Update quantity
  await page.fill('.cart-item:first-child input[name="quantity"]', '2');
  await page.click('.update-cart');
  
  // Apply coupon
  await page.fill('input[name="coupon"]', 'DISCOUNT20');
  await page.click('.apply-coupon');
  
  // Proceed to checkout
  await page.click('.checkout-button');
  
  // Fill shipping information
  await page.fill('input[name="firstName"]', 'Test');
  await page.fill('input[name="lastName"]', 'User');
  await page.fill('input[name="address"]', '123 Test St');
  await page.fill('input[name="city"]', 'Test City');
  await page.fill('input[name="zipCode"]', '12345');
  
  // Fill payment information
  await page.fill('input[name="cardNumber"]', '4111111111111111');
  await page.fill('input[name="cardExpiry"]', '12/25');
  await page.fill('input[name="cardCvv"]', '123');
  
  // Complete order
  await page.click('.place-order-button');
  
  // Verify order confirmation
  await expect(page).toHaveURL(/confirmation/);
  await expect(page.locator('.order-confirmation')).toContainText('Thank you for your order');
});`;

    case 'pytest':
      return `import pytest
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the cart page
    page.goto('https://example.com/cart')
    
    # Verify cart items
    expect(page.locator('.cart-item')).to_have_count(2)
    
    # Update quantity
    page.fill('.cart-item:first-child input[name="quantity"]', '2')
    page.click('.update-cart')
    
    # Apply coupon
    page.fill('input[name="coupon"]', 'DISCOUNT20')
    page.click('.apply-coupon')
    
    # Proceed to checkout
    page.click('.checkout-button')
    
    # Fill shipping information
    page.fill('input[name="firstName"]', 'Test')
    page.fill('input[name="lastName"]', 'User')
    page.fill('input[name="address"]', '123 Test St')
    page.fill('input[name="city"]', 'Test City')
    page.fill('input[name="zipCode"]', '12345')
    
    # Fill payment information
    page.fill('input[name="cardNumber"]', '4111111111111111')
    page.fill('input[name="cardExpiry"]', '12/25')
    page.fill('input[name="cardCvv"]', '123')
    
    # Complete order
    page.click('.place-order-button')
    
    # Verify order confirmation
    expect(page).to_have_url(re.compile('confirmation'))
    expect(page.locator('.order-confirmation')).to_contain_text('Thank you for your order')`;

    case 'cypress':
      return `describe('${testName}', () => {
  it('should complete the checkout process', () => {
    // Navigate to the cart page
    cy.visit('https://example.com/cart');
    
    // Verify cart items
    cy.get('.cart-item').should('have.length', 2);
    
    // Update quantity
    cy.get('.cart-item').first().find('input[name="quantity"]').clear().type('2');
    cy.get('.update-cart').click();
    
    // Apply coupon
    cy.get('input[name="coupon"]').type('DISCOUNT20');
    cy.get('.apply-coupon').click();
    
    // Proceed to checkout
    cy.get('.checkout-button').click();
    
    // Fill shipping information
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="address"]').type('123 Test St');
    cy.get('input[name="city"]').type('Test City');
    cy.get('input[name="zipCode"]').type('12345');
    
    // Fill payment information
    cy.get('input[name="cardNumber"]').type('4111111111111111');
    cy.get('input[name="cardExpiry"]').type('12/25');
    cy.get('input[name="cardCvv"]').type('123');
    
    // Complete order
    cy.get('.place-order-button').click();
    
    // Verify order confirmation
    cy.url().should('include', 'confirmation');
    cy.get('.order-confirmation').should('contain', 'Thank you for your order');
  });
});`;

    default:
      return generatePlaywrightMultiTest(testName, [{ description: 'Checkout Test' }]);
  }
};

// Dashboard test templates
const generateDashboardTest = (testName: string, testType: string): string => {
  switch (testType) {
    case 'playwright':
      return `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  // Navigate to the dashboard
  await page.goto('https://example.com/dashboard');
  
  // Verify dashboard elements
  await expect(page.locator('.dashboard-header')).toBeVisible();
  await expect(page.locator('.dashboard-widget')).toHaveCount.greaterThan(0);
  
  // Interact with dashboard widgets
  await page.click('.dashboard-widget:first-child');
  
  // Verify widget details
  await expect(page.locator('.widget-details')).toBeVisible();
  
  // Navigate to another section
  await page.click('.nav-item:has-text("Reports")');
  
  // Verify navigation
  await expect(page).toHaveURL(/reports/);
  
  // Filter reports
  await page.selectOption('select[name="period"]', 'last30days');
  await page.click('.apply-filter');
  
  // Verify filtered results
  await expect(page.locator('.report-item')).toHaveCount.greaterThan(0);
});`;

    case 'pytest':
      return `import pytest
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the dashboard
    page.goto('https://example.com/dashboard')
    
    # Verify dashboard elements
    expect(page.locator('.dashboard-header')).to_be_visible()
    expect(page.locator('.dashboard-widget').count()).to_be_greater_than(0)
    
    # Interact with dashboard widgets
    page.click('.dashboard-widget:first-child')
    
    # Verify widget details
    expect(page.locator('.widget-details')).to_be_visible()
    
    # Navigate to another section
    page.click('.nav-item:has-text("Reports")')
    
    # Verify navigation
    expect(page).to_have_url(re.compile('reports'))
    
    # Filter reports
    page.select_option('select[name="period"]', 'last30days')
    page.click('.apply-filter')
    
    # Verify filtered results
    expect(page.locator('.report-item').count()).to_be_greater_than(0)`;

    case 'cypress':
      return `describe('${testName}', () => {
  it('should navigate and interact with the dashboard', () => {
    // Navigate to the dashboard
    cy.visit('https://example.com/dashboard');
    
    // Verify dashboard elements
    cy.get('.dashboard-header').should('be.visible');
    cy.get('.dashboard-widget').should('have.length.greaterThan', 0);
    
    // Interact with dashboard widgets
    cy.get('.dashboard-widget').first().click();
    
    // Verify widget details
    cy.get('.widget-details').should('be.visible');
    
    // Navigate to another section
    cy.get('.nav-item').contains('Reports').click();
    
    // Verify navigation
    cy.url().should('include', 'reports');
    
    // Filter reports
    cy.get('select[name="period"]').select('last30days');
    cy.get('.apply-filter').click();
    
    // Verify filtered results
    cy.get('.report-item').should('have.length.greaterThan', 0);
  });
});`;

    default:
      return generatePlaywrightMultiTest(testName, [{ description: 'Dashboard Test' }]);
  }
};

// Default test template for any screenshot
const generateDefaultTest = (testName: string, testType: string): string => {
  switch (testType) {
    case 'playwright':
      return `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
  // Navigate to the page
  await page.goto('https://example.com');
  
  // Verify page loaded
  await expect(page).toHaveTitle(/Example/);
  
  // Click on a button
  await page.click('.primary-button');
  
  // Fill in a form field
  await page.fill('input.form-field', 'Test Value');
  
  // Submit a form
  await page.click('button[type="submit"]');
  
  // Verify success message
  await expect(page.locator('.success-message')).toBeVisible();
});`;

    case 'pytest':
      return `import pytest
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
    # Navigate to the page
    page.goto('https://example.com')
    
    # Verify page loaded
    expect(page).to_have_title(re.compile('Example'))
    
    # Click on a button
    page.click('.primary-button')
    
    # Fill in a form field
    page.fill('input.form-field', 'Test Value')
    
    # Submit a form
    page.click('button[type="submit"]')
    
    # Verify success message
    expect(page.locator('.success-message')).to_be_visible()`;

    case 'cypress':
      return `describe('${testName}', () => {
  it('should perform basic interactions', () => {
    // Navigate to the page
    cy.visit('https://example.com');
    
    // Verify page loaded
    cy.title().should('match', /Example/);
    
    // Click on a button
    cy.get('.primary-button').click();
    
    // Fill in a form field
    cy.get('input.form-field').type('Test Value');
    
    // Submit a form
    cy.get('button[type="submit"]').click();
    
    // Verify success message
    cy.get('.success-message').should('be.visible');
  });
});`;

    default:
      return generatePlaywrightMultiTest(testName, [{ description: 'Default Test' }]);
  }
};

// Multi-screenshot test templates
const generatePlaywrightMultiTest = (testName: string, screenshots: Array<{ description: string }>): string => {
  const steps = screenshots.map((screenshot, index) => {
    const desc = screenshot.description?.trim() || `Step ${index + 1}`;
    return `  // Step ${index + 1}: ${desc}
  await page.goto('https://example.com/${desc.toLowerCase().replace(/[^a-z0-9]/g, '-')}');
  await expect(page).toHaveTitle(/${desc.split(' ')[0]}/i);
  ${index % 2 === 0 
    ? `await page.fill('input.form-field-${index + 1}', 'Test Value ${index + 1}');
  await page.click('button.action-button-${index + 1}');`
    : `await page.click('.element-${index + 1}');
  await expect(page.locator('.result-${index + 1}')).toBeVisible();`}`;
  }).join('\n\n');

  return `import { test, expect } from '@playwright/test';

test('${testName}', async ({ page }) => {
${steps}
});`;
};

const generatePytestMultiTest = (testName: string, screenshots: Array<{ description: string }>): string => {
  const steps = screenshots.map((screenshot, index) => {
    const desc = screenshot.description?.trim() || `Step ${index + 1}`;
    return `    # Step ${index + 1}: ${desc}
    page.goto('https://example.com/${desc.toLowerCase().replace(/[^a-z0-9]/g, '-')}')
    expect(page).to_have_title(re.compile('${desc.split(' ')[0]}', re.IGNORECASE))
    ${index % 2 === 0 
      ? `page.fill('input.form-field-${index + 1}', 'Test Value ${index + 1}')
    page.click('button.action-button-${index + 1}')`
      : `page.click('.element-${index + 1}')
    expect(page.locator('.result-${index + 1}')).to_be_visible()`}`;
  }).join('\n\n');

  return `import pytest
import re
from playwright.sync_api import Page, expect

def test_${testName}(page: Page):
${steps}`;
};

const generateCypressMultiTest = (testName: string, screenshots: Array<{ description: string }>): string => {
  const steps = screenshots.map((screenshot, index) => {
    const desc = screenshot.description?.trim() || `Step ${index + 1}`;
    return `    // Step ${index + 1}: ${desc}
    cy.visit('https://example.com/${desc.toLowerCase().replace(/[^a-z0-9]/g, '-')}');
    cy.title().should('match', /${desc.split(' ')[0]}/i);
    ${index % 2 === 0 
      ? `cy.get('input.form-field-${index + 1}').type('Test Value ${index + 1}');
    cy.get('button.action-button-${index + 1}').click();`
      : `cy.get('.element-${index + 1}').click();
    cy.get('.result-${index + 1}').should('be.visible');`}`;
  }).join('\n\n');

  return `describe('${testName}', () => {
  it('should complete the multi-step process', () => {
${steps}
  });
});`;
};
