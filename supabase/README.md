# Supabase Setup for Betaboss Testing Tool

This directory contains the SQL scripts needed to set up the Supabase backend for the Betaboss Testing Tool.

## Setup Instructions

1. Create a new Supabase project at [https://app.supabase.io](https://app.supabase.io)

2. Get your Supabase URL and anon key from the project settings

3. Update the `.env` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-supabase-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GOOGLE_API_KEY=your-google-api-key
```

4. Run the migration script in the Supabase SQL editor:
   - Go to your Supabase project dashboard
   - Click on "SQL Editor"
   - Create a new query
   - Copy and paste the contents of `migrations/20230515000000_create_tables.sql`
   - Run the query

5. Run the seed script to populate the database with sample data:
   - Create another new query
   - Copy and paste the contents of `seed.sql`
   - Run the query

## Database Schema

The database consists of the following tables:

- `config`: Application configuration settings
- `test_cases`: Test case definitions
- `test_steps`: Steps within test cases
- `test_suites`: Collections of test cases
- `test_suite_cases`: Junction table linking test suites and test cases
- `test_results`: Results of test executions
- `email_notifications`: Email notification history

## Authentication

The application uses Supabase's built-in authentication system. Row-level security policies are set up to ensure that only authenticated users can access the data.

## API Integration

The application communicates with Supabase using the Supabase JavaScript client. The client is configured in `src/services/supabaseClient.ts`.

## Troubleshooting

If you encounter any issues with the Supabase setup:

1. Check that your Supabase URL and anon key are correct in the `.env` file
2. Ensure that the SQL scripts ran successfully without errors
3. Verify that the tables were created and populated with data
4. Check the browser console for any API errors
