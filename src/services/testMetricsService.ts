/**
 * Test Metrics Service
 * Handles test case metrics, status tracking, and failure analysis
 */

export enum TestStatus {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  BLOCKED = 'BLOCKED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export enum TestSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum TestPriority {
  P0 = 'P0', // Must fix immediately
  P1 = 'P1', // High priority
  P2 = 'P2', // Medium priority
  P3 = 'P3'  // Low priority
}

export interface TestCase {
  id: string;
  name: string;
  module: string;
  status: TestStatus;
  severity: TestSeverity;
  priority: TestPriority;
  executionTime?: number; // in milliseconds
  lastRun?: Date;
  errorMessage?: string;
  steps?: TestStep[];
  assignedTo?: string;
}

export interface TestStep {
  id: string;
  description: string;
  status: TestStatus;
  screenshot?: string;
  errorMessage?: string;
}

export interface TestSuite {
  id: string;
  name: string;
  testCases: TestCase[];
  lastRun?: Date;
  executionTime?: number; // in milliseconds
}

export interface TestMetrics {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  blocked: number;
  inProgress: number;
  passRate: number; // percentage
  criticalFailures: number;
  highPriorityFailures: number;
  avgExecutionTime: number; // in milliseconds
  testSuites: TestSuite[];
}

// Sample test data for demonstration
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
  },
  {
    id: 'TC006',
    name: 'Export leads to CSV',
    module: 'Reporting',
    status: TestStatus.SKIPPED,
    severity: TestSeverity.MEDIUM,
    priority: TestPriority.P2,
    lastRun: new Date(Date.now() - 86400000), // 1 day ago
  },
  {
    id: 'TC007',
    name: 'Generate lead performance report',
    module: 'Reporting',
    status: TestStatus.BLOCKED,
    severity: TestSeverity.MEDIUM,
    priority: TestPriority.P2,
    lastRun: new Date(Date.now() - 86400000), // 1 day ago
    errorMessage: 'Blocked by TC003: Add lead form submission',
  },
  {
    id: 'TC008',
    name: 'Filter leads by status',
    module: 'Lead Management',
    status: TestStatus.IN_PROGRESS,
    severity: TestSeverity.LOW,
    priority: TestPriority.P3,
    lastRun: new Date(Date.now() - 300000), // 5 minutes ago
  },
  {
    id: 'TC009',
    name: 'Search leads by name',
    module: 'Lead Management',
    status: TestStatus.PASSED,
    severity: TestSeverity.MEDIUM,
    priority: TestPriority.P2,
    executionTime: 800,
    lastRun: new Date(Date.now() - 7200000), // 2 hours ago
  },
  {
    id: 'TC010',
    name: 'Assign lead to user',
    module: 'Lead Management',
    status: TestStatus.FAILED,
    severity: TestSeverity.HIGH,
    priority: TestPriority.P1,
    executionTime: 1200,
    lastRun: new Date(Date.now() - 7200000), // 2 hours ago
    errorMessage: 'User assignment failed: API returned 500 error',
  }
];

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
    executionTime: 4900
  },
  {
    id: 'TS003',
    name: 'Reporting Tests',
    testCases: sampleTestCases.filter(tc => tc.module === 'Reporting'),
    lastRun: new Date(Date.now() - 86400000), // 1 day ago
    executionTime: 0
  }
];

import { getTestCases, getTestSuites } from './supabaseApiService';

/**
 * Get all test cases
 */
export const getAllTestCases = async (): Promise<TestCase[]> => {
  try {
    // Try to fetch from Supabase
    const testCases = await getTestCases();
    if (testCases && testCases.length > 0) {
      return testCases;
    }
  } catch (error) {
    console.error('Error fetching test cases from Supabase:', error);
  }

  // Fall back to sample data if Supabase fails
  return sampleTestCases;
};

/**
 * Get all test suites
 */
export const getAllTestSuites = async (): Promise<TestSuite[]> => {
  try {
    // Try to fetch from Supabase
    const testSuites = await getTestSuites();
    if (testSuites && testSuites.length > 0) {
      return testSuites;
    }
  } catch (error) {
    console.error('Error fetching test suites from Supabase:', error);
  }

  // Fall back to sample data if Supabase fails
  return sampleTestSuites;
};

/**
 * Calculate test metrics
 */
export const calculateTestMetrics = async (): Promise<TestMetrics> => {
  const testCases = await getAllTestCases();
  const testSuites = await getAllTestSuites();

  const totalTests = testCases.length;
  const passed = testCases.filter(tc => tc.status === TestStatus.PASSED).length;
  const failed = testCases.filter(tc => tc.status === TestStatus.FAILED).length;
  const skipped = testCases.filter(tc => tc.status === TestStatus.SKIPPED).length;
  const blocked = testCases.filter(tc => tc.status === TestStatus.BLOCKED).length;
  const inProgress = testCases.filter(tc => tc.status === TestStatus.IN_PROGRESS).length;

  const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;

  const criticalFailures = testCases.filter(tc =>
    tc.status === TestStatus.FAILED && tc.severity === TestSeverity.CRITICAL
  ).length;

  const highPriorityFailures = testCases.filter(tc =>
    tc.status === TestStatus.FAILED &&
    (tc.priority === TestPriority.P0 || tc.priority === TestPriority.P1)
  ).length;

  const executionTimes = testCases
    .filter(tc => tc.executionTime !== undefined)
    .map(tc => tc.executionTime as number);

  const avgExecutionTime = executionTimes.length > 0
    ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
    : 0;

  return {
    totalTests,
    passed,
    failed,
    skipped,
    blocked,
    inProgress,
    passRate,
    criticalFailures,
    highPriorityFailures,
    avgExecutionTime,
    testSuites
  };
};

/**
 * Get failed test cases
 */
export const getFailedTestCases = async (): Promise<TestCase[]> => {
  const testCases = await getAllTestCases();
  return testCases.filter(tc => tc.status === TestStatus.FAILED);
};

/**
 * Get high priority failures
 */
export const getHighPriorityFailures = async (): Promise<TestCase[]> => {
  const testCases = await getAllTestCases();
  return testCases.filter(tc =>
    tc.status === TestStatus.FAILED &&
    (tc.priority === TestPriority.P0 || tc.priority === TestPriority.P1)
  );
};

/**
 * Get test cases by module
 */
export const getTestCasesByModule = async (module: string): Promise<TestCase[]> => {
  const testCases = await getAllTestCases();
  return testCases.filter(tc => tc.module === module);
};

/**
 * Get test cases by status
 */
export const getTestCasesByStatus = async (status: TestStatus): Promise<TestCase[]> => {
  const testCases = await getAllTestCases();
  return testCases.filter(tc => tc.status === status);
};

/**
 * Get test cases by severity
 */
export const getTestCasesBySeverity = async (severity: TestSeverity): Promise<TestCase[]> => {
  const testCases = await getAllTestCases();
  return testCases.filter(tc => tc.severity === severity);
};

/**
 * Get test cases by priority
 */
export const getTestCasesByPriority = async (priority: TestPriority): Promise<TestCase[]> => {
  const testCases = await getAllTestCases();
  return testCases.filter(tc => tc.priority === priority);
};

export default {
  getAllTestCases,
  getAllTestSuites,
  calculateTestMetrics,
  getFailedTestCases,
  getHighPriorityFailures,
  getTestCasesByModule,
  getTestCasesByStatus,
  getTestCasesBySeverity,
  getTestCasesByPriority
};
