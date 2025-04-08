import { DetectedAction, AnalysisResult } from './videoAnalysisService';

/**
 * Analyzes a screenshot to detect UI elements and generate actions
 * In a real implementation, this would use computer vision or ML
 * For this demo, we'll simulate the analysis
 */
export const analyzeScreenshot = async (
  screenshotDataUrl: string,
  description: string
): Promise<AnalysisResult> => {
  // In a real implementation, this would:
  // 1. Use computer vision to detect UI elements (buttons, inputs, etc.)
  // 2. Analyze the layout and content of the page
  // 3. Generate appropriate actions based on the detected elements

  // For demo purposes, we'll simulate the analysis based on the description
  const actions: DetectedAction[] = generateActionsFromDescription(description);

  return {
    actions,
    duration: actions.length * 2,
    resolution: { width: 1280, height: 720 }
  };
};

/**
 * Generate actions based on the screenshot description
 * This is a simplified simulation - in a real implementation,
 * this would be based on actual image analysis
 */
const generateActionsFromDescription = (description: string): DetectedAction[] => {
  // Always start with a set of actions regardless of description
  // This ensures we always generate test cases even if description is empty
  const actions: DetectedAction[] = [
    // Always start with navigation
    {
      type: 'navigation',
      timestamp: 0,
      x: 0,
      y: 0
    }
  ];

  // If no description is provided, use a default set of comprehensive actions
  if (!description || description.trim() === '') {
    description = 'default comprehensive test';
  }

  const lowerDesc = description.toLowerCase();
  let timestamp = 1; // Start actions after navigation

  // Add specific actions based on description keywords
  // LOGIN SCENARIO
  if (lowerDesc.includes('login') || lowerDesc.includes('sign in') || lowerDesc.includes('signin') || lowerDesc.includes('log in')) {
    actions.push(
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#username',
        value: 'test@example.com',
        x: 400,
        y: 200
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#password',
        value: 'password123',
        x: 400,
        y: 250
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.login-btn',
        x: 400,
        y: 300
      }
    );
  }

  // REGISTRATION SCENARIO
  if (lowerDesc.includes('register') || lowerDesc.includes('sign up') || lowerDesc.includes('signup') || lowerDesc.includes('registration')) {
    actions.push(
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#fullname',
        value: 'Test User',
        x: 400,
        y: 150
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#email',
        value: 'test@example.com',
        x: 400,
        y: 200
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#password',
        value: 'SecurePassword123',
        x: 400,
        y: 250
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#confirm-password',
        value: 'SecurePassword123',
        x: 400,
        y: 300
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'input[type="checkbox"]',
        x: 350,
        y: 350
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.register-btn',
        x: 400,
        y: 400
      }
    );
  }

  // FORM SUBMISSION SCENARIO
  if (lowerDesc.includes('form') || lowerDesc.includes('input') || lowerDesc.includes('field') || lowerDesc.includes('submit')) {
    actions.push(
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input.form-control',
        value: 'Test Input',
        x: 400,
        y: 200
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'textarea.form-control',
        value: 'This is a longer text input for testing purposes',
        x: 400,
        y: 250
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'select.form-control',
        x: 400,
        y: 300
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'option[value="option2"]',
        x: 400,
        y: 320
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.submit-btn',
        x: 400,
        y: 350
      }
    );
  }

  // DASHBOARD/HOME SCENARIO
  if (lowerDesc.includes('dashboard') || lowerDesc.includes('home') || lowerDesc.includes('main') || lowerDesc.includes('overview')) {
    actions.push(
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.dashboard-item',
        x: 300,
        y: 200
      },
      {
        type: 'scroll',
        timestamp: timestamp++,
        x: 0,
        y: 300
      },
      {
        type: 'hover',
        timestamp: timestamp++,
        element: '.chart-element',
        x: 500,
        y: 350
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.action-button',
        x: 500,
        y: 400
      }
    );
  }

  // NAVIGATION/MENU SCENARIO
  if (lowerDesc.includes('menu') || lowerDesc.includes('navigation') || lowerDesc.includes('nav') || lowerDesc.includes('header')) {
    actions.push(
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.menu-item',
        x: 200,
        y: 100
      },
      {
        type: 'hover',
        timestamp: timestamp++,
        element: '.submenu',
        x: 200,
        y: 150
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.submenu-item',
        x: 250,
        y: 150
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.hamburger-menu',
        x: 50,
        y: 50
      }
    );
  }

  // SEARCH FUNCTIONALITY SCENARIO
  if (lowerDesc.includes('search') || lowerDesc.includes('find') || lowerDesc.includes('filter')) {
    actions.push(
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input.search-box',
        value: 'search query',
        x: 500,
        y: 100
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.search-btn',
        x: 600,
        y: 100
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.search-result-item',
        x: 500,
        y: 200
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.filter-dropdown',
        x: 400,
        y: 100
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.filter-option',
        x: 400,
        y: 150
      }
    );
  }

  // PRODUCT/ITEM DETAILS SCENARIO
  if (lowerDesc.includes('product') || lowerDesc.includes('item') || lowerDesc.includes('detail') || lowerDesc.includes('view')) {
    actions.push(
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.product-image',
        x: 300,
        y: 200
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.product-variant',
        x: 350,
        y: 250
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.quantity-increase',
        x: 400,
        y: 300
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.add-to-cart',
        x: 450,
        y: 350
      }
    );
  }

  // CHECKOUT/CART SCENARIO
  if (lowerDesc.includes('checkout') || lowerDesc.includes('cart') || lowerDesc.includes('basket') || lowerDesc.includes('payment')) {
    actions.push(
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.cart-item',
        x: 300,
        y: 200
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#coupon',
        value: 'DISCOUNT20',
        x: 400,
        y: 250
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.apply-coupon',
        x: 500,
        y: 250
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.checkout',
        x: 450,
        y: 350
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#card-number',
        value: '4111111111111111',
        x: 400,
        y: 400
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#card-expiry',
        value: '12/25',
        x: 400,
        y: 450
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#card-cvv',
        value: '123',
        x: 400,
        y: 500
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.pay-now',
        x: 450,
        y: 550
      }
    );
  }

  // SETTINGS/PROFILE SCENARIO
  if (lowerDesc.includes('settings') || lowerDesc.includes('profile') || lowerDesc.includes('account') || lowerDesc.includes('preferences')) {
    actions.push(
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.profile-tab',
        x: 200,
        y: 150
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#display-name',
        value: 'New Display Name',
        x: 400,
        y: 200
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.security-tab',
        x: 200,
        y: 250
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#current-password',
        value: 'CurrentPassword123',
        x: 400,
        y: 300
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#new-password',
        value: 'NewPassword456',
        x: 400,
        y: 350
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input#confirm-new-password',
        value: 'NewPassword456',
        x: 400,
        y: 400
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: 'button.save-changes',
        x: 450,
        y: 450
      }
    );
  }

  // If no specific scenario was matched or we want to ensure we have actions
  if (actions.length <= 1) {
    // Default comprehensive actions for any screenshot
    actions.push(
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.primary-button',
        x: 400,
        y: 300
      },
      {
        type: 'input',
        timestamp: timestamp++,
        element: 'input.form-field',
        value: 'Default Test Value',
        x: 400,
        y: 200
      },
      {
        type: 'click',
        timestamp: timestamp++,
        element: '.secondary-button',
        x: 500,
        y: 300
      }
    );
  }

  return actions;
};

/**
 * Analyzes multiple screenshots to create a sequence of actions
 */
export const analyzeMultipleScreenshots = async (
  screenshots: Array<{ dataUrl: string; description: string }>
): Promise<AnalysisResult> => {
  let allActions: DetectedAction[] = [];
  let timestamp = 0;

  // Process each screenshot in sequence
  for (const screenshot of screenshots) {
    const result = await analyzeScreenshot(screenshot.dataUrl, screenshot.description);

    // Adjust timestamps to create a continuous sequence
    const adjustedActions = result.actions.map(action => ({
      ...action,
      timestamp: timestamp + action.timestamp
    }));

    allActions = [...allActions, ...adjustedActions];

    // Update the timestamp for the next screenshot
    timestamp += result.duration;
  }

  return {
    actions: allActions,
    duration: timestamp,
    resolution: { width: 1280, height: 720 }
  };
};
