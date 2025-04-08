/**
 * Notification Service
 * Handles notifications for test failures and other events
 */
import { TestCase, TestPriority, TestSeverity } from './testMetricsService';
import { sendGmailReport } from './gmailService';

/**
 * Send email notification for high priority test failures
 */
export const sendHighPriorityFailureNotification = async (
  testCases: TestCase[],
  recipientEmail: string,
  recipientName: string
): Promise<boolean> => {
  if (testCases.length === 0) {
    console.log('No high priority failures to notify about');
    return true;
  }

  try {
    console.log(`Sending high priority failure notification for ${testCases.length} test cases`);

    // Create email subject
    const subject = `🚨 ALERT: ${testCases.length} High Priority Test Failures`;

    // Create email content
    let content = `
# High Priority Test Failures Alert

**${testCases.length} high priority tests have failed and require immediate attention.**

## Failed Tests Summary

| Test ID | Test Name | Module | Severity | Priority | Error Message |
|---------|-----------|--------|----------|----------|---------------|
`;

    // Add each test case to the content
    testCases.forEach(tc => {
      content += `| ${tc.id} | ${tc.name} | ${tc.module} | ${tc.severity} | ${tc.priority} | ${tc.errorMessage || 'No error message'} |\n`;
    });

    // Add additional information
    content += `
## Action Required

Please investigate these failures immediately as they are affecting critical functionality.

**Assigned To:** ${testCases[0].assignedTo || 'QA Team'}

---
This is an automated notification from Betaboss Testing Tool.
`;

    // Send the email
    const result = await sendGmailReport(
      recipientEmail,
      recipientName,
      subject,
      content
    );

    return result;
  } catch (error) {
    console.error('Error sending high priority failure notification:', error);
    return false;
  }
};

/**
 * Check for high priority failures and send notifications if needed
 */
export const checkAndNotifyHighPriorityFailures = async (
  testCases: TestCase[],
  recipientEmail: string,
  recipientName: string
): Promise<boolean> => {
  // Filter for high priority failures (P0 or P1 with CRITICAL or HIGH severity)
  const highPriorityFailures = testCases.filter(tc =>
    tc.status === 'FAILED' &&
    (tc.priority === TestPriority.P0 ||
     (tc.priority === TestPriority.P1 &&
      (tc.severity === TestSeverity.CRITICAL || tc.severity === TestSeverity.HIGH)))
  );

  if (highPriorityFailures.length > 0) {
    return await sendHighPriorityFailureNotification(
      highPriorityFailures,
      recipientEmail,
      recipientName
    );
  }

  return true;
};

export default {
  sendHighPriorityFailureNotification,
  checkAndNotifyHighPriorityFailures
};
