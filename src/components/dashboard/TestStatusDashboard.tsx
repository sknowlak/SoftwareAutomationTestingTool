import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EmailIcon from '@mui/icons-material/Email';

import {
  calculateTestMetrics,
  getFailedTestCases,
  getHighPriorityFailures,
  TestStatus,
  TestSeverity,
  TestPriority,
  TestCase
} from '../../services/testMetricsService';
import { checkAndNotifyHighPriorityFailures } from '../../services/notificationService';

interface TestStatusDashboardProps {
  onNavigate: (module: string) => void;
  recipientEmail?: string;
  recipientName?: string;
}

const TestStatusDashboard: React.FC<TestStatusDashboardProps> = ({
  onNavigate,
  recipientEmail = 'nowlaksk2019@gmail.com',
  recipientName = 'Betaboss User'
}) => {
  const [metrics, setMetrics] = useState<any>({totalTests: 0, passed: 0, failed: 0, skipped: 0, blocked: 0, inProgress: 0, passRate: 0, criticalFailures: 0, highPriorityFailures: 0, avgExecutionTime: 0, testSuites: []});
  const [failedTests, setFailedTests] = useState<TestCase[]>([]);
  const [highPriorityFailures, setHighPriorityFailures] = useState<TestCase[]>([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const metricsData = await calculateTestMetrics();
        const failedTestsData = await getFailedTestCases();
        const highPriorityFailuresData = await getHighPriorityFailures();

        setMetrics(metricsData);
        setFailedTests(failedTestsData);
        setHighPriorityFailures(highPriorityFailuresData);
      } catch (error) {
        console.error('Error loading test data:', error);
      }
    };

    loadData();
  }, []);
  const [loading, setLoading] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh metrics
  const refreshMetrics = async () => {
    setRefreshing(true);

    try {
      const metricsData = await calculateTestMetrics();
      const failedTestsData = await getFailedTestCases();
      const highPriorityFailuresData = await getHighPriorityFailures();

      setMetrics(metricsData);
      setFailedTests(failedTestsData);
      setHighPriorityFailures(highPriorityFailuresData);
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Send notification for high priority failures
  const sendNotification = async () => {
    setLoading(true);

    try {
      const result = await checkAndNotifyHighPriorityFailures(
        highPriorityFailures,
        recipientEmail,
        recipientName
      );

      if (result) {
        setNotificationSent(true);

        // Reset notification sent status after 5 seconds
        setTimeout(() => {
          setNotificationSent(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Get status icon
  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case TestStatus.PASSED:
        return <CheckCircleIcon color="success" />;
      case TestStatus.FAILED:
        return <ErrorIcon color="error" />;
      case TestStatus.SKIPPED:
        return <PauseCircleOutlineIcon color="disabled" />;
      case TestStatus.BLOCKED:
        return <WarningIcon color="warning" />;
      case TestStatus.IN_PROGRESS:
        return <HourglassEmptyIcon color="info" />;
      default:
        return null;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: TestSeverity) => {
    switch (severity) {
      case TestSeverity.CRITICAL:
        return 'error';
      case TestSeverity.HIGH:
        return 'error';
      case TestSeverity.MEDIUM:
        return 'warning';
      case TestSeverity.LOW:
        return 'info';
      default:
        return 'default';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: TestPriority) => {
    switch (priority) {
      case TestPriority.P0:
        return 'error';
      case TestPriority.P1:
        return 'error';
      case TestPriority.P2:
        return 'warning';
      case TestPriority.P3:
        return 'info';
      default:
        return 'default';
    }
  };

  // Prepare data for pie chart
  const pieChartData = [
    { name: 'Passed', value: metrics.passed, color: '#4caf50' },
    { name: 'Failed', value: metrics.failed, color: '#f44336' },
    { name: 'Skipped', value: metrics.skipped, color: '#9e9e9e' },
    { name: 'Blocked', value: metrics.blocked, color: '#ff9800' },
    { name: 'In Progress', value: metrics.inProgress, color: '#2196f3' }
  ];

  // Prepare data for module bar chart
  const moduleData = metrics.testSuites.map(suite => ({
    name: suite.name,
    passed: suite.testCases.filter(tc => tc.status === TestStatus.PASSED).length,
    failed: suite.testCases.filter(tc => tc.status === TestStatus.FAILED).length,
    skipped: suite.testCases.filter(tc => tc.status === TestStatus.SKIPPED).length,
    blocked: suite.testCases.filter(tc => tc.status === TestStatus.BLOCKED).length,
    inProgress: suite.testCases.filter(tc => tc.status === TestStatus.IN_PROGRESS).length
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test Status Dashboard
        </Typography>

        <Box>
          <Tooltip title="Refresh Data">
            <IconButton
              color="primary"
              onClick={refreshMetrics}
              disabled={refreshing}
            >
              {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>

          {highPriorityFailures.length > 0 && (
            <Tooltip title="Send Email Notification for High Priority Failures">
              <IconButton
                color="error"
                onClick={sendNotification}
                disabled={loading || notificationSent}
                sx={{ ml: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : <EmailIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Total Tests
              </Typography>
              <Typography variant="h3">
                {metrics.totalTests}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Last Run: {metrics.testSuites.length > 0 ? formatDate(metrics.testSuites[0].lastRun!) : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Pass Rate
              </Typography>
              <Typography variant="h3">
                {metrics.passRate.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={metrics.passRate}
                color={metrics.passRate > 80 ? 'success' : metrics.passRate > 60 ? 'warning' : 'error'}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: metrics.failed > 0 ? 'error.dark' : 'success.dark' }}>
            <CardContent>
              <Typography variant="h6" color="white" gutterBottom>
                Failed Tests
              </Typography>
              <Typography variant="h3" color="white">
                {metrics.failed}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`${metrics.criticalFailures} Critical`}
                  size="small"
                  color="error"
                  sx={{ mr: 1, bgcolor: 'white', fontWeight: 'bold' }}
                />
                <Chip
                  label={`${metrics.highPriorityFailures} High Priority`}
                  size="small"
                  color="error"
                  sx={{ bgcolor: 'white', fontWeight: 'bold' }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Avg. Execution Time
              </Typography>
              <Typography variant="h3">
                {(metrics.avgExecutionTime / 1000).toFixed(1)}s
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Total Execution: {(metrics.testSuites.reduce((sum, suite) => sum + (suite.executionTime || 0), 0) / 1000).toFixed(1)}s
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* High Priority Failures Alert */}
      {highPriorityFailures.length > 0 && (
        <Alert
          severity="error"
          sx={{ mb: 4 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<EmailIcon />}
              onClick={sendNotification}
              disabled={loading || notificationSent}
            >
              {notificationSent ? 'Notification Sent' : 'Send Email Alert'}
            </Button>
          }
        >
          <AlertTitle>High Priority Failures Detected</AlertTitle>
          <Typography variant="body2">
            {highPriorityFailures.length} high priority test failures require immediate attention.
            These failures may impact critical functionality.
          </Typography>
        </Alert>
      )}

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Status Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Results by Module
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={moduleData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="passed" stackId="a" fill="#4caf50" name="Passed" />
                  <Bar dataKey="failed" stackId="a" fill="#f44336" name="Failed" />
                  <Bar dataKey="skipped" stackId="a" fill="#9e9e9e" name="Skipped" />
                  <Bar dataKey="blocked" stackId="a" fill="#ff9800" name="Blocked" />
                  <Bar dataKey="inProgress" stackId="a" fill="#2196f3" name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Failed Tests Table */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Failed Tests ({failedTests.length})
        </Typography>

        {failedTests.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Test ID</TableCell>
                  <TableCell>Test Name</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Error Message</TableCell>
                  <TableCell>Last Run</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedTests.map((test) => (
                  <TableRow key={test.id} hover>
                    <TableCell>{test.id}</TableCell>
                    <TableCell>{test.name}</TableCell>
                    <TableCell>{test.module}</TableCell>
                    <TableCell>
                      <Chip
                        label={test.severity}
                        size="small"
                        color={getSeverityColor(test.severity) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={test.priority}
                        size="small"
                        color={getPriorityColor(test.priority) as any}
                      />
                    </TableCell>
                    <TableCell>{test.errorMessage || 'No error message'}</TableCell>
                    <TableCell>{test.lastRun ? formatDate(test.lastRun) : 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="success" sx={{ mt: 2 }}>
            No failed tests! All tests are passing.
          </Alert>
        )}
      </Paper>

      {/* Test Suites Summary */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Suites Summary
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Suite Name</TableCell>
                <TableCell>Total Tests</TableCell>
                <TableCell>Passed</TableCell>
                <TableCell>Failed</TableCell>
                <TableCell>Pass Rate</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Execution Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.testSuites.map((suite) => {
                const totalTests = suite.testCases.length;
                const passed = suite.testCases.filter(tc => tc.status === TestStatus.PASSED).length;
                const failed = suite.testCases.filter(tc => tc.status === TestStatus.FAILED).length;
                const passRate = totalTests > 0 ? (passed / totalTests) * 100 : 0;

                return (
                  <TableRow key={suite.id} hover>
                    <TableCell>{suite.name}</TableCell>
                    <TableCell>{totalTests}</TableCell>
                    <TableCell>{passed}</TableCell>
                    <TableCell>{failed}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LinearProgress
                          variant="determinate"
                          value={passRate}
                          color={passRate > 80 ? 'success' : passRate > 60 ? 'warning' : 'error'}
                          sx={{ width: 100, mr: 2, height: 8, borderRadius: 4 }}
                        />
                        {passRate.toFixed(1)}%
                      </Box>
                    </TableCell>
                    <TableCell>{suite.lastRun ? formatDate(suite.lastRun) : 'N/A'}</TableCell>
                    <TableCell>{suite.executionTime ? `${(suite.executionTime / 1000).toFixed(1)}s` : 'N/A'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default TestStatusDashboard;
