/**
 * Local Storage Service
 * Handles data persistence using browser's localStorage
 */
import { TestCase, TestSuite, TestStatus, TestSeverity, TestPriority } from './testMetricsService';

// Storage keys
const STORAGE_KEYS = {
  CONFIG: 'betaboss_config',
  TEST_CASES: 'betaboss_test_cases',
  TEST_SUITES: 'betaboss_test_suites',
  TEST_RESULTS: 'betaboss_test_results',
  EMAIL_NOTIFICATIONS: 'betaboss_email_notifications',
  FIRST_RUN: 'betaboss_first_run'
};

/**
 * Check if this is the first run of the application
 */
export const isFirstRun = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.FIRST_RUN) === null;
};

/**
 * Mark the application as having been run
 */
export const markAsRun = (): void => {
  localStorage.setItem(STORAGE_KEYS.FIRST_RUN, 'false');
};

/**
 * Get configuration data
 */
export const getConfig = async (): Promise<any> => {
  try {
    const configData = localStorage.getItem(STORAGE_KEYS.CONFIG);
    
    if (configData) {
      return JSON.parse(configData);
    }
    
    // Default config if none exists
    const defaultConfig = {
      googleApiKey: 'DEMO_API_KEY',
      apiEndpoint: 'http://localhost:8000',
      version: '1.0.0',
      environment: 'development'
    };
    
    // Save default config
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(defaultConfig));
    
    return defaultConfig;
  } catch (error) {
    console.error('Error getting config from localStorage:', error);
    throw error;
  }
};

/**
 * Save configuration data
 */
export const saveConfig = async (config: any): Promise<boolean> => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving config to localStorage:', error);
    return false;
  }
};

/**
 * Get all test cases
 */
export const getTestCases = async (): Promise<TestCase[]> => {
  try {
    const testCasesData = localStorage.getItem(STORAGE_KEYS.TEST_CASES);
    
    if (testCasesData) {
      return JSON.parse(testCasesData);
    }
    
    // If no test cases exist, return empty array
    return [];
  } catch (error) {
    console.error('Error getting test cases from localStorage:', error);
    return [];
  }
};

/**
 * Save test cases
 */
export const saveTestCases = async (testCases: TestCase[]): Promise<boolean> => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_CASES, JSON.stringify(testCases));
    return true;
  } catch (error) {
    console.error('Error saving test cases to localStorage:', error);
    return false;
  }
};

/**
 * Get all test suites
 */
export const getTestSuites = async (): Promise<TestSuite[]> => {
  try {
    const testSuitesData = localStorage.getItem(STORAGE_KEYS.TEST_SUITES);
    
    if (testSuitesData) {
      return JSON.parse(testSuitesData);
    }
    
    // If no test suites exist, return empty array
    return [];
  } catch (error) {
    console.error('Error getting test suites from localStorage:', error);
    return [];
  }
};

/**
 * Save test suites
 */
export const saveTestSuites = async (testSuites: TestSuite[]): Promise<boolean> => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_SUITES, JSON.stringify(testSuites));
    return true;
  } catch (error) {
    console.error('Error saving test suites to localStorage:', error);
    return false;
  }
};

/**
 * Get test results
 */
export const getTestResults = async (): Promise<any[]> => {
  try {
    const testResultsData = localStorage.getItem(STORAGE_KEYS.TEST_RESULTS);
    
    if (testResultsData) {
      return JSON.parse(testResultsData);
    }
    
    // If no test results exist, return empty array
    return [];
  } catch (error) {
    console.error('Error getting test results from localStorage:', error);
    return [];
  }
};

/**
 * Save test results
 */
export const saveTestResults = async (testResults: any[]): Promise<boolean> => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_RESULTS, JSON.stringify(testResults));
    return true;
  } catch (error) {
    console.error('Error saving test results to localStorage:', error);
    return false;
  }
};

/**
 * Save email notification
 */
export const saveEmailNotification = async (notification: any): Promise<boolean> => {
  try {
    // Get existing notifications
    const notificationsData = localStorage.getItem(STORAGE_KEYS.EMAIL_NOTIFICATIONS);
    let notifications = [];
    
    if (notificationsData) {
      notifications = JSON.parse(notificationsData);
    }
    
    // Add new notification
    notifications.push({
      ...notification,
      id: `notification-${Date.now()}`,
      created_at: new Date().toISOString()
    });
    
    // Save updated notifications
    localStorage.setItem(STORAGE_KEYS.EMAIL_NOTIFICATIONS, JSON.stringify(notifications));
    
    return true;
  } catch (error) {
    console.error('Error saving email notification to localStorage:', error);
    return false;
  }
};

/**
 * Get email notifications
 */
export const getEmailNotifications = async (): Promise<any[]> => {
  try {
    const notificationsData = localStorage.getItem(STORAGE_KEYS.EMAIL_NOTIFICATIONS);
    
    if (notificationsData) {
      return JSON.parse(notificationsData);
    }
    
    // If no notifications exist, return empty array
    return [];
  } catch (error) {
    console.error('Error getting email notifications from localStorage:', error);
    return [];
  }
};

/**
 * Initialize sample data if none exists
 */
export const initializeSampleData = async (): Promise<void> => {
  try {
    // Check if test cases already exist
    const existingTestCases = await getTestCases();
    
    if (existingTestCases.length === 0) {
      // Sample test cases
      const sampleTestCases: TestCase[] = [
        {
          id: 'TC001',
          name: 'Verify user login with valid credentials',
          module: 'Authentication',
          status: TestStatus.PASSED,
          severity: TestSeverity.CRITICAL,
          priority: TestPriority.P0,
          executionTime: 1200,
          lastRun: new Date(Date.now() - 3600000), // 1 hour ago
          steps: [
            { id: 'TS001', description: 'Navigate to login page', status: TestStatus.PASSED },
            { id: 'TS002', description: 'Enter valid username', status: TestStatus.PASSED },
            { id: 'TS003', description: 'Enter valid password', status: TestStatus.PASSED },
            { id: 'TS004', description: 'Click login button', status: TestStatus.PASSED },
            { id: 'TS005', description: 'Verify user is logged in', status: TestStatus.PASSED }
          ]
        },
        {
          id: 'TC002',
          name: 'Verify user login with invalid credentials',
          module: 'Authentication',
          status: TestStatus.PASSED,
          severity: TestSeverity.HIGH,
          priority: TestPriority.P1,
          executionTime: 950,
          lastRun: new Date(Date.now() - 3600000), // 1 hour ago
          steps: [
            { id: 'TS006', description: 'Navigate to login page', status: TestStatus.PASSED },
            { id: 'TS007', description: 'Enter invalid username', status: TestStatus.PASSED },
            { id: 'TS008', description: 'Enter invalid password', status: TestStatus.PASSED },
            { id: 'TS009', description: 'Click login button', status: TestStatus.PASSED },
            { id: 'TS010', description: 'Verify error message is displayed', status: TestStatus.PASSED }
          ]
        },
        {
          id: 'TC003',
          name: 'Add lead form submission',
          module: 'Lead Management',
          status: TestStatus.FAILED,
          severity: TestSeverity.CRITICAL,
          priority: TestPriority.P0,
          executionTime: 1500,
          lastRun: new Date(Date.now() - 1800000), // 30 minutes ago
          errorMessage: 'Form submission timeout after 10 seconds',
          steps: [
            { id: 'TS011', description: 'Navigate to add lead page', status: TestStatus.PASSED },
            { id: 'TS012', description: 'Fill in lead details', status: TestStatus.PASSED },
            { id: 'TS013', description: 'Click submit button', status: TestStatus.PASSED },
            { id: 'TS014', description: 'Verify lead is added to database', status: TestStatus.FAILED, errorMessage: 'Form submission timeout after 10 seconds' }
          ],
          assignedTo: 'QA Team'
        },
        {
          id: 'TC004',
          name: 'Edit existing lead',
          module: 'Lead Management',
          status: TestStatus.FAILED,
          severity: TestSeverity.HIGH,
          priority: TestPriority.P1,
          executionTime: 1300,
          lastRun: new Date(Date.now() - 1800000), // 30 minutes ago
          errorMessage: 'Element not found: #edit-button',
          steps: [
            { id: 'TS015', description: 'Navigate to lead details page', status: TestStatus.PASSED },
            { id: 'TS016', description: 'Click edit button', status: TestStatus.FAILED, errorMessage: 'Element not found: #edit-button' }
          ],
          assignedTo: 'QA Team'
        },
        {
          id: 'TC005',
          name: 'Delete lead',
          module: 'Lead Management',
          status: TestStatus.PASSED,
          severity: TestSeverity.MEDIUM,
          priority: TestPriority.P2,
          executionTime: 1100,
          lastRun: new Date(Date.now() - 1800000), // 30 minutes ago
          steps: [
            { id: 'TS017', description: 'Navigate to lead details page', status: TestStatus.PASSED },
            { id: 'TS018', description: 'Click delete button', status: TestStatus.PASSED },
            { id: 'TS019', description: 'Confirm deletion', status: TestStatus.PASSED },
            { id: 'TS020', description: 'Verify lead is removed from database', status: TestStatus.PASSED }
          ]
        }
      ];
      
      // Save sample test cases
      await saveTestCases(sampleTestCases);
      
      // Sample test suites
      const sampleTestSuites: TestSuite[] = [
        {
          id: 'TS001',
          name: 'Authentication Tests',
          testCases: sampleTestCases.filter(tc => tc.module === 'Authentication'),
          lastRun: new Date(Date.now() - 3600000), // 1 hour ago
          executionTime: 2150
        },
        {
          id: 'TS002',
          name: 'Lead Management Tests',
          testCases: sampleTestCases.filter(tc => tc.module === 'Lead Management'),
          lastRun: new Date(Date.now() - 1800000), // 30 minutes ago
          executionTime: 3900
        }
      ];
      
      // Save sample test suites
      await saveTestSuites(sampleTestSuites);
      
      console.log('Sample data initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
};

export default {
  isFirstRun,
  markAsRun,
  getConfig,
  saveConfig,
  getTestCases,
  saveTestCases,
  getTestSuites,
  saveTestSuites,
  getTestResults,
  saveTestResults,
  saveEmailNotification,
  getEmailNotifications,
  initializeSampleData
};
