-- Create config table
CREATE TABLE IF NOT EXISTS config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_api_key TEXT,
  api_endpoint TEXT,
  version TEXT,
  environment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_cases table
CREATE TABLE IF NOT EXISTS test_cases (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  status TEXT NOT NULL,
  severity TEXT NOT NULL,
  priority TEXT NOT NULL,
  execution_time INTEGER,
  last_run TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_steps table
CREATE TABLE IF NOT EXISTS test_steps (
  id TEXT PRIMARY KEY,
  test_case_id TEXT REFERENCES test_cases(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  screenshot TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_suites table
CREATE TABLE IF NOT EXISTS test_suites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  last_run TIMESTAMP WITH TIME ZONE,
  execution_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create test_suite_cases junction table
CREATE TABLE IF NOT EXISTS test_suite_cases (
  test_suite_id TEXT REFERENCES test_suites(id) ON DELETE CASCADE,
  test_case_id TEXT REFERENCES test_cases(id) ON DELETE CASCADE,
  PRIMARY KEY (test_suite_id, test_case_id)
);

-- Create test_results table
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_case_id TEXT REFERENCES test_cases(id),
  test_suite_id TEXT REFERENCES test_suites(id),
  status TEXT NOT NULL,
  execution_time INTEGER,
  error_message TEXT,
  screenshot TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial config
INSERT INTO config (google_api_key, api_endpoint, version, environment)
VALUES ('your-google-api-key', 'https://api.example.com', '1.0.0', 'development')
ON CONFLICT DO NOTHING;

-- Create RLS policies
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_suite_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users full access to config" ON config
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to test_cases" ON test_cases
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to test_steps" ON test_steps
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to test_suites" ON test_suites
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to test_suite_cases" ON test_suite_cases
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to test_results" ON test_results
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to email_notifications" ON email_notifications
  FOR ALL USING (auth.role() = 'authenticated');
