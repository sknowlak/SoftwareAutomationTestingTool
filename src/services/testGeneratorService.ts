import { DetectedAction, AnalysisResult } from './videoAnalysisService';

export interface TestCase {
  name: string;
  description: string;
  steps: TestStep[];
}

export interface TestStep {
  id: number;
  description: string;
  code: string;
  type: 'action' | 'assertion';
}

/**
 * Generate test cases from video analysis results
 */
export const generateTestCases = (
  analysisResult: AnalysisResult,
  testName: string,
  testType: 'playwright' | 'pytest' | 'cypress' = 'playwright'
): TestCase => {
  const { actions } = analysisResult;
  
  // Generate test steps from actions
  const steps = actions.map((action, index) => {
    const step = actionToTestStep(action, index + 1, testType);
    
    // Add assertions every few steps
    if ((index + 1) % 3 === 0) {
      return [
        step,
        generateAssertion(index + 1, testType)
      ];
    }
    
    return [step];
  }).flat();
  
  return {
    name: testName,
    description: `Automatically generated test case from screen recording with ${actions.length} actions`,
    steps
  };
};

/**
 * Convert a detected action to a test step
 */
const actionToTestStep = (
  action: DetectedAction,
  stepNumber: number,
  testType: 'playwright' | 'pytest' | 'cypress'
): TestStep => {
  let description = '';
  let code = '';
  
  switch (action.type) {
    case 'click':
      description = `Click on element ${action.element || `at position (${action.x}, ${action.y})`}`;
      code = generateClickCode(action, testType);
      break;
    case 'input':
      description = `Enter text "${action.value}" into ${action.element}`;
      code = generateInputCode(action, testType);
      break;
    case 'navigation':
      description = 'Navigate to a new page';
      code = generateNavigationCode(action, testType);
      break;
    case 'scroll':
      description = `Scroll to position (${action.x}, ${action.y})`;
      code = generateScrollCode(action, testType);
      break;
    case 'hover':
      description = `Hover over element ${action.element || `at position (${action.x}, ${action.y})`}`;
      code = generateHoverCode(action, testType);
      break;
    case 'keypress':
      description = `Press key with code ${action.keyCode}`;
      code = generateKeypressCode(action, testType);
      break;
    default:
      description = `Perform action at timestamp ${action.timestamp.toFixed(2)}s`;
      code = '// Action not supported yet';
  }
  
  return {
    id: stepNumber,
    description,
    code,
    type: 'action'
  };
};

/**
 * Generate an assertion step
 */
const generateAssertion = (
  stepNumber: number,
  testType: 'playwright' | 'pytest' | 'cypress'
): TestStep => {
  const assertions = [
    {
      description: 'Verify page title',
      code: getAssertionCode('title', testType)
    },
    {
      description: 'Verify element is visible',
      code: getAssertionCode('visible', testType)
    },
    {
      description: 'Verify text content',
      code: getAssertionCode('text', testType)
    },
    {
      description: 'Verify URL',
      code: getAssertionCode('url', testType)
    }
  ];
  
  const assertion = assertions[Math.floor(Math.random() * assertions.length)];
  
  return {
    id: stepNumber + 0.5, // Use decimal to indicate it's an assertion related to the previous step
    description: assertion.description,
    code: assertion.code,
    type: 'assertion'
  };
};

/**
 * Generate code for click action
 */
const generateClickCode = (
  action: DetectedAction,
  testType: 'playwright' | 'pytest' | 'cypress'
): string => {
  if (action.element) {
    switch (testType) {
      case 'playwright':
        return `await page.click('${action.element}');`;
      case 'pytest':
        return `page.click("${action.element}")`;
      case 'cypress':
        return `cy.get('${action.element}').click();`;
    }
  } else if (action.x !== undefined && action.y !== undefined) {
    switch (testType) {
      case 'playwright':
        return `await page.mouse.click(${action.x}, ${action.y});`;
      case 'pytest':
        return `page.mouse.click(${action.x}, ${action.y})`;
      case 'cypress':
        return `cy.get('body').click(${action.x}, ${action.y});`;
    }
  }
  
  return '// Click action details missing';
};

/**
 * Generate code for input action
 */
const generateInputCode = (
  action: DetectedAction,
  testType: 'playwright' | 'pytest' | 'cypress'
): string => {
  if (action.element && action.value) {
    switch (testType) {
      case 'playwright':
        return `await page.fill('${action.element}', '${action.value}');`;
      case 'pytest':
        return `page.fill("${action.element}", "${action.value}")`;
      case 'cypress':
        return `cy.get('${action.element}').type('${action.value}');`;
    }
  }
  
  return '// Input action details missing';
};

/**
 * Generate code for navigation action
 */
const generateNavigationCode = (
  action: DetectedAction,
  testType: 'playwright' | 'pytest' | 'cypress'
): string => {
  const url = action.value || 'https://example.com';
  
  switch (testType) {
    case 'playwright':
      return `await page.goto('${url}');`;
    case 'pytest':
      return `page.goto("${url}")`;
    case 'cypress':
      return `cy.visit('${url}');`;
  }
};

/**
 * Generate code for scroll action
 */
const generateScrollCode = (
  action: DetectedAction,
  testType: 'playwright' | 'pytest' | 'cypress'
): string => {
  if (action.x !== undefined && action.y !== undefined) {
    switch (testType) {
      case 'playwright':
        return `await page.evaluate(() => window.scrollTo(${action.x}, ${action.y}));`;
      case 'pytest':
        return `page.evaluate("window.scrollTo(${action.x}, ${action.y})")`;
      case 'cypress':
        return `cy.scrollTo(${action.x}, ${action.y});`;
    }
  }
  
  return '// Scroll action details missing';
};

/**
 * Generate code for hover action
 */
const generateHoverCode = (
  action: DetectedAction,
  testType: 'playwright' | 'pytest' | 'cypress'
): string => {
  if (action.element) {
    switch (testType) {
      case 'playwright':
        return `await page.hover('${action.element}');`;
      case 'pytest':
        return `page.hover("${action.element}")`;
      case 'cypress':
        return `cy.get('${action.element}').trigger('mouseover');`;
    }
  } else if (action.x !== undefined && action.y !== undefined) {
    switch (testType) {
      case 'playwright':
        return `await page.mouse.move(${action.x}, ${action.y});`;
      case 'pytest':
        return `page.mouse.move(${action.x}, ${action.y})`;
      case 'cypress':
        return `cy.get('body').trigger('mouseover', { clientX: ${action.x}, clientY: ${action.y} });`;
    }
  }
  
  return '// Hover action details missing';
};

/**
 * Generate code for keypress action
 */
const generateKeypressCode = (
  action: DetectedAction,
  testType: 'playwright' | 'pytest' | 'cypress'
): string => {
  if (action.keyCode) {
    const key = String.fromCharCode(action.keyCode);
    
    switch (testType) {
      case 'playwright':
        return `await page.keyboard.press('${key}');`;
      case 'pytest':
        return `page.keyboard.press("${key}")`;
      case 'cypress':
        return `cy.get('body').type('${key}');`;
    }
  }
  
  return '// Keypress action details missing';
};

/**
 * Get assertion code based on type and test framework
 */
const getAssertionCode = (
  assertionType: 'title' | 'visible' | 'text' | 'url',
  testType: 'playwright' | 'pytest' | 'cypress'
): string => {
  switch (assertionType) {
    case 'title':
      switch (testType) {
        case 'playwright':
          return `expect(await page.title()).toContain('Expected Title');`;
        case 'pytest':
          return `expect(page).to_have_title(re.compile("Expected Title"))`;
        case 'cypress':
          return `cy.title().should('include', 'Expected Title');`;
      }
      break;
    
    case 'visible':
      const selector = getRandomElement();
      switch (testType) {
        case 'playwright':
          return `expect(await page.isVisible('${selector}')).toBeTruthy();`;
        case 'pytest':
          return `expect(page.locator("${selector}")).to_be_visible()`;
        case 'cypress':
          return `cy.get('${selector}').should('be.visible');`;
      }
      break;
    
    case 'text':
      const textSelector = getRandomElement();
      switch (testType) {
        case 'playwright':
          return `expect(await page.textContent('${textSelector}')).toContain('Expected Text');`;
        case 'pytest':
          return `expect(page.locator("${textSelector}")).to_contain_text("Expected Text")`;
        case 'cypress':
          return `cy.get('${textSelector}').should('contain', 'Expected Text');`;
      }
      break;
    
    case 'url':
      switch (testType) {
        case 'playwright':
          return `expect(page.url()).toContain('/expected-path');`;
        case 'pytest':
          return `expect(page).to_have_url(re.compile(".*/expected-path"))`;
        case 'cypress':
          return `cy.url().should('include', '/expected-path');`;
      }
      break;
  }
  
  return '// Assertion not supported';
};

/**
 * Get a random element selector for simulation
 */
const getRandomElement = (): string => {
  const elements = [
    'button.submit-btn',
    'input#username',
    'input#password',
    'a.nav-link',
    'div.dropdown-menu',
    'span.icon',
    'input[type="checkbox"]',
    'select#country',
    'textarea#comments',
    'label.form-check-label'
  ];
  
  return elements[Math.floor(Math.random() * elements.length)];
};

/**
 * Generate complete test script
 */
export const generateTestScript = (
  testCase: TestCase,
  testType: 'playwright' | 'pytest' | 'cypress' = 'playwright'
): string => {
  const steps = testCase.steps.map(step => `  // ${step.description}\n  ${step.code}`).join('\n\n');
  
  switch (testType) {
    case 'playwright':
      return `
import { test, expect } from '@playwright/test';

test('${testCase.name}', async ({ page }) => {
  // Test description: ${testCase.description}
  
${steps}
});
`;
    
    case 'pytest':
      return `
import re
from playwright.sync_api import expect

def test_${testCase.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}(page):
  # Test description: ${testCase.description}
  
${steps}
`;
    
    case 'cypress':
      return `
describe('${testCase.name}', () => {
  it('should complete the test flow', () => {
    // Test description: ${testCase.description}
    
${steps}
  });
});
`;
  }
};
