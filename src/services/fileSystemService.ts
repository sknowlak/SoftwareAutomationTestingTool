/**
 * File System Service
 * Handles data persistence using the local file system
 */
import { TestCase, TestSuite, TestStatus, TestSeverity, TestPriority } from './testMetricsService';
import { ApiRequest, ApiResponse, ApiCollection, ApiEnvironment } from '../types/apiTypes';

// Node.js modules for file system operations
// Note: In a real app, these would use actual file system APIs
// For this demo, we'll use localStorage with error handling
const fs = {
  existsSync: (path: string): boolean => {
    try {
      // Simulate checking if a file/directory exists
      const storedData = localStorage.getItem('betaboss_fs_registry') || '{}';
      const registry = JSON.parse(storedData);
      return !!registry[path];
    } catch (error) {
      console.error(`Error checking if path exists: ${path}`, error);
      return false;
    }
  },

  mkdirSync: (path: string, options?: any): void => {
    try {
      // Simulate creating a directory
      const storedData = localStorage.getItem('betaboss_fs_registry') || '{}';
      const registry = JSON.parse(storedData);
      registry[path] = { type: 'directory', created: new Date().toISOString() };
      localStorage.setItem('betaboss_fs_registry', JSON.stringify(registry));
      console.log(`Created directory: ${path}`);
    } catch (error) {
      console.error(`Error creating directory: ${path}`, error);
    }
  },

  writeFileSync: (path: string, data: string, options?: any): void => {
    try {
      // Simulate writing to a file
      const storedData = localStorage.getItem('betaboss_fs_registry') || '{}';
      const registry = JSON.parse(storedData);
      registry[path] = { type: 'file', created: new Date().toISOString(), modified: new Date().toISOString() };
      localStorage.setItem('betaboss_fs_registry', JSON.stringify(registry));
      localStorage.setItem(`betaboss_fs_${path}`, data);
      console.log(`Wrote to file: ${path}`);
    } catch (error) {
      console.error(`Error writing to file: ${path}`, error);
    }
  },

  readFileSync: (path: string, options?: any): string => {
    try {
      // Simulate reading from a file
      const data = localStorage.getItem(`betaboss_fs_${path}`);
      if (data === null) {
        console.warn(`File not found: ${path}`);
        return '';
      }
      return data;
    } catch (error) {
      console.error(`Error reading file: ${path}`, error);
      return '';
    }
  },

  readdirSync: (path: string, options?: any): string[] => {
    try {
      // Simulate reading directory contents
      const storedData = localStorage.getItem('betaboss_fs_registry') || '{}';
      const registry = JSON.parse(storedData);
      const result: string[] = [];

      // Find all entries that are direct children of the path
      for (const key in registry) {
        if (key !== path && key.startsWith(path) && !key.slice(path.length + 1).includes('/')) {
          result.push(key.slice(path.length + 1));
        }
      }

      return result;
    } catch (error) {
      console.error(`Error reading directory: ${path}`, error);
      return [];
    }
  }
};

// Path utilities
const path = {
  join: (...paths: string[]): string => {
    // Simulate path joining
    return paths.join('/').replace(/\/+/g, '/');
  },

  dirname: (path: string): string => {
    // Simulate getting directory name
    return path.split('/').slice(0, -1).join('/');
  }
};

// Default base path
let basePath = 'C:/Betaboss';

/**
 * Initialize the file system
 * @param customPath Custom path for Betaboss data
 */
export const initializeFileSystem = (customPath?: string): void => {
  try {
    if (customPath) {
      basePath = customPath;
    }

    console.log(`Initializing file system at ${basePath}`);

    // Create base directory if it doesn't exist
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath);
      console.log(`Created base directory: ${basePath}`);
    }

    // Create subdirectories
    const directories = [
      'TestCases',
      'TestSuites',
      'TestResults',
      'ApiCollections',
      'Environments',
      'Reports',
      'module' // Added module subfolder as requested
    ];

    directories.forEach(dir => {
      const dirPath = path.join(basePath, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
        console.log(`Created directory: ${dirPath}`);
      }
    });

    // Save base path to localStorage for persistence
    localStorage.setItem('betaboss_base_path', basePath);

    console.log(`File system initialized successfully at ${basePath}`);
  } catch (error) {
    console.error('Error initializing file system:', error);
    // Use default path as fallback
    basePath = 'C:/Betaboss';
    localStorage.setItem('betaboss_base_path', basePath);
  }
};

/**
 * Get the base path
 */
export const getBasePath = (): string => {
  const storedPath = localStorage.getItem('betaboss_base_path');
  return storedPath || basePath;
};

/**
 * Set the base path
 */
export const setBasePath = (newPath: string): void => {
  basePath = newPath;
  localStorage.setItem('betaboss_base_path', basePath);
};

/**
 * Check if the file system has been initialized
 */
export const isFileSystemInitialized = (): boolean => {
  return localStorage.getItem('betaboss_base_path') !== null;
};

/**
 * Save test case
 */
export const saveTestCase = (testCase: TestCase): void => {
  const filePath = path.join(basePath, 'TestCases', `${testCase.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(testCase, null, 2));
};

/**
 * Get test case
 */
export const getTestCase = (id: string): TestCase | null => {
  const filePath = path.join(basePath, 'TestCases', `${id}.json`);

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }

  return null;
};

/**
 * Get all test cases
 */
export const getAllTestCases = (): TestCase[] => {
  const dirPath = path.join(basePath, 'TestCases');

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const testCases: TestCase[] = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      const data = fs.readFileSync(filePath);
      testCases.push(JSON.parse(data));
    }
  });

  return testCases;
};

/**
 * Save test suite
 */
export const saveTestSuite = (testSuite: TestSuite): void => {
  const filePath = path.join(basePath, 'TestSuites', `${testSuite.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(testSuite, null, 2));
};

/**
 * Get test suite
 */
export const getTestSuite = (id: string): TestSuite | null => {
  const filePath = path.join(basePath, 'TestSuites', `${id}.json`);

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }

  return null;
};

/**
 * Get all test suites
 */
export const getAllTestSuites = (): TestSuite[] => {
  const dirPath = path.join(basePath, 'TestSuites');

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const testSuites: TestSuite[] = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      const data = fs.readFileSync(filePath);
      testSuites.push(JSON.parse(data));
    }
  });

  return testSuites;
};

/**
 * Save API collection
 */
export const saveApiCollection = (collection: ApiCollection): void => {
  const filePath = path.join(basePath, 'ApiCollections', `${collection.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(collection, null, 2));
};

/**
 * Get API collection
 */
export const getApiCollection = (id: string): ApiCollection | null => {
  const filePath = path.join(basePath, 'ApiCollections', `${id}.json`);

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }

  return null;
};

/**
 * Get all API collections
 */
export const getAllApiCollections = (): ApiCollection[] => {
  const dirPath = path.join(basePath, 'ApiCollections');

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const collections: ApiCollection[] = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      const data = fs.readFileSync(filePath);
      collections.push(JSON.parse(data));
    }
  });

  return collections;
};

/**
 * Save environment
 */
export const saveEnvironment = (environment: ApiEnvironment): void => {
  const filePath = path.join(basePath, 'Environments', `${environment.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(environment, null, 2));
};

/**
 * Get environment
 */
export const getEnvironment = (id: string): ApiEnvironment | null => {
  const filePath = path.join(basePath, 'Environments', `${id}.json`);

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return JSON.parse(data);
  }

  return null;
};

/**
 * Get all environments
 */
export const getAllEnvironments = (): ApiEnvironment[] => {
  const dirPath = path.join(basePath, 'Environments');

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const environments: ApiEnvironment[] = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      const data = fs.readFileSync(filePath);
      environments.push(JSON.parse(data));
    }
  });

  return environments;
};

/**
 * Save test result
 */
export const saveTestResult = (testResult: any): void => {
  const filePath = path.join(basePath, 'TestResults', `${testResult.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(testResult, null, 2));
};

/**
 * Get all test results
 */
export const getAllTestResults = (): any[] => {
  const dirPath = path.join(basePath, 'TestResults');

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);
  const results: any[] = [];

  files.forEach(file => {
    if (file.endsWith('.json')) {
      const filePath = path.join(dirPath, file);
      const data = fs.readFileSync(filePath);
      results.push(JSON.parse(data));
    }
  });

  return results;
};

/**
 * Initialize sample data
 */
export const initializeSampleData = (): void => {
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
    }
  ];

  // Save sample test cases
  sampleTestCases.forEach(testCase => {
    saveTestCase(testCase);
  });

  // Sample test suites
  const sampleTestSuites: TestSuite[] = [
    {
      id: 'TS001',
      name: 'Authentication Tests',
      testCases: sampleTestCases.filter(tc => tc.module === 'Authentication'),
      lastRun: new Date(Date.now() - 3600000), // 1 hour ago
      executionTime: 2150
    }
  ];

  // Save sample test suites
  sampleTestSuites.forEach(testSuite => {
    saveTestSuite(testSuite);
  });

  // Sample API collections
  const sampleApiCollections: ApiCollection[] = [
    {
      id: 'COL001',
      name: 'User API',
      description: 'API endpoints for user management',
      requests: [
        {
          id: 'REQ001',
          name: 'Get User Profile',
          url: 'https://api.example.com/users/profile',
          method: 'GET',
          headers: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer {{token}}' }
          ],
          params: [],
          body: '',
          tests: [
            { name: 'Status code is 200', script: 'pm.test("Status code is 200", function() { pm.response.to.have.status(200); });' },
            { name: 'Response has user data', script: 'pm.test("Response has user data", function() { pm.expect(pm.response.json()).to.have.property("user"); });' }
          ]
        },
        {
          id: 'REQ002',
          name: 'Create User',
          url: 'https://api.example.com/users',
          method: 'POST',
          headers: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer {{token}}' }
          ],
          params: [],
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'user'
          }, null, 2),
          tests: [
            { name: 'Status code is 201', script: 'pm.test("Status code is 201", function() { pm.response.to.have.status(201); });' },
            { name: 'Response has user ID', script: 'pm.test("Response has user ID", function() { pm.expect(pm.response.json()).to.have.property("id"); });' }
          ]
        }
      ]
    }
  ];

  // Save sample API collections
  sampleApiCollections.forEach(collection => {
    saveApiCollection(collection);
  });

  // Sample environments
  const sampleEnvironments: ApiEnvironment[] = [
    {
      id: 'ENV001',
      name: 'Development',
      variables: [
        { key: 'baseUrl', value: 'https://dev-api.example.com' },
        { key: 'token', value: 'dev-token-123' }
      ]
    },
    {
      id: 'ENV002',
      name: 'Production',
      variables: [
        { key: 'baseUrl', value: 'https://api.example.com' },
        { key: 'token', value: 'prod-token-456' }
      ]
    }
  ];

  // Save sample environments
  sampleEnvironments.forEach(environment => {
    saveEnvironment(environment);
  });

  console.log('Sample data initialized successfully');
};

/**
 * Get configuration
 */
export const getConfig = async (): Promise<any> => {
  try {
    const configPath = path.join(basePath, 'config.json');

    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath);
      return JSON.parse(configData);
    }

    // Return default config if file doesn't exist
    return {
      googleApiKey: 'DEMO_API_KEY',
      theme: 'dark',
      notifications: true
    };
  } catch (error) {
    console.error('Error getting config:', error);
    return null;
  }
};

export default {
  initializeFileSystem,
  getBasePath,
  setBasePath,
  isFileSystemInitialized,
  saveTestCase,
  getTestCase,
  getAllTestCases,
  saveTestSuite,
  getTestSuite,
  getAllTestSuites,
  saveApiCollection,
  getApiCollection,
  getAllApiCollections,
  saveEnvironment,
  getEnvironment,
  getAllEnvironments,
  saveTestResult,
  getAllTestResults,
  initializeSampleData,
  getConfig
};
