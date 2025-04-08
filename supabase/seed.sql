-- Insert sample test cases
INSERT INTO test_cases (id, name, module, status, severity, priority, execution_time, last_run)
VALUES
  ('TC001', 'Verify user login with valid credentials', 'Authentication', 'PASSED', 'CRITICAL', 'P0', 1200, NOW() - INTERVAL '1 HOUR'),
  ('TC002', 'Verify user login with invalid credentials', 'Authentication', 'PASSED', 'HIGH', 'P1', 950, NOW() - INTERVAL '1 HOUR'),
  ('TC003', 'Add lead form submission', 'Lead Management', 'FAILED', 'CRITICAL', 'P0', 1500, NOW() - INTERVAL '30 MINUTES'),
  ('TC004', 'Edit existing lead', 'Lead Management', 'FAILED', 'HIGH', 'P1', 1300, NOW() - INTERVAL '30 MINUTES'),
  ('TC005', 'Delete lead', 'Lead Management', 'PASSED', 'MEDIUM', 'P2', 1100, NOW() - INTERVAL '30 MINUTES'),
  ('TC006', 'Export leads to CSV', 'Reporting', 'SKIPPED', 'MEDIUM', 'P2', NULL, NOW() - INTERVAL '1 DAY'),
  ('TC007', 'Generate lead performance report', 'Reporting', 'BLOCKED', 'MEDIUM', 'P2', NULL, NOW() - INTERVAL '1 DAY'),
  ('TC008', 'Filter leads by status', 'Lead Management', 'IN_PROGRESS', 'LOW', 'P3', NULL, NOW() - INTERVAL '5 MINUTES'),
  ('TC009', 'Search leads by name', 'Lead Management', 'PASSED', 'MEDIUM', 'P2', 800, NOW() - INTERVAL '2 HOURS'),
  ('TC010', 'Assign lead to user', 'Lead Management', 'FAILED', 'HIGH', 'P1', 1200, NOW() - INTERVAL '2 HOURS')
ON CONFLICT (id) DO NOTHING;

-- Insert sample test steps
INSERT INTO test_steps (id, test_case_id, description, status)
VALUES
  ('TS001', 'TC001', 'Navigate to login page', 'PASSED'),
  ('TS002', 'TC001', 'Enter valid username', 'PASSED'),
  ('TS003', 'TC001', 'Enter valid password', 'PASSED'),
  ('TS004', 'TC001', 'Click login button', 'PASSED'),
  ('TS005', 'TC001', 'Verify user is logged in', 'PASSED'),
  ('TS006', 'TC002', 'Navigate to login page', 'PASSED'),
  ('TS007', 'TC002', 'Enter invalid username', 'PASSED'),
  ('TS008', 'TC002', 'Enter invalid password', 'PASSED'),
  ('TS009', 'TC002', 'Click login button', 'PASSED'),
  ('TS010', 'TC002', 'Verify error message is displayed', 'PASSED'),
  ('TS011', 'TC003', 'Navigate to add lead page', 'PASSED'),
  ('TS012', 'TC003', 'Fill in lead details', 'PASSED'),
  ('TS013', 'TC003', 'Click submit button', 'PASSED'),
  ('TS014', 'TC003', 'Verify lead is added to database', 'FAILED')
ON CONFLICT (id) DO NOTHING;

-- Insert sample test suites
INSERT INTO test_suites (id, name, last_run, execution_time)
VALUES
  ('TS001', 'Authentication Tests', NOW() - INTERVAL '1 HOUR', 2150),
  ('TS002', 'Lead Management Tests', NOW() - INTERVAL '30 MINUTES', 4900),
  ('TS003', 'Reporting Tests', NOW() - INTERVAL '1 DAY', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert sample test suite cases
INSERT INTO test_suite_cases (test_suite_id, test_case_id)
VALUES
  ('TS001', 'TC001'),
  ('TS001', 'TC002'),
  ('TS002', 'TC003'),
  ('TS002', 'TC004'),
  ('TS002', 'TC005'),
  ('TS002', 'TC008'),
  ('TS002', 'TC009'),
  ('TS002', 'TC010'),
  ('TS003', 'TC006'),
  ('TS003', 'TC007')
ON CONFLICT DO NOTHING;

-- Insert sample test results
INSERT INTO test_results (test_case_id, test_suite_id, status, execution_time, created_at)
VALUES
  ('TC001', 'TS001', 'PASSED', 1200, NOW() - INTERVAL '1 HOUR'),
  ('TC002', 'TS001', 'PASSED', 950, NOW() - INTERVAL '1 HOUR'),
  ('TC003', 'TS002', 'FAILED', 1500, NOW() - INTERVAL '30 MINUTES'),
  ('TC004', 'TS002', 'FAILED', 1300, NOW() - INTERVAL '30 MINUTES'),
  ('TC005', 'TS002', 'PASSED', 1100, NOW() - INTERVAL '30 MINUTES'),
  ('TC009', 'TS002', 'PASSED', 800, NOW() - INTERVAL '2 HOURS'),
  ('TC010', 'TS002', 'FAILED', 1200, NOW() - INTERVAL '2 HOURS');
