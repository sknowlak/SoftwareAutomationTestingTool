# Supabase Setup Guide for Betaboss Testing Tool

This guide will walk you through setting up Supabase as the backend for the Betaboss Testing Tool.

## 1. Create a Supabase Project

1. Go to [https://app.supabase.io](https://app.supabase.io) and sign in or create an account
2. Click "New Project"
3. Enter a name for your project (e.g., "Betaboss Testing Tool")
4. Choose a database password (save this somewhere secure)
5. Choose the region closest to you
6. Click "Create new project"

## 2. Get Your Supabase Credentials

1. Once your project is created, go to the project dashboard
2. Click on the "Settings" icon in the left sidebar
3. Click on "API" in the settings menu
4. You'll see your "Project URL" and "API Keys"
5. Copy the "Project URL" (this is your `VITE_SUPABASE_URL`)
6. Copy the "anon" key (this is your `VITE_SUPABASE_ANON_KEY`)

## 3. Update Environment Variables

1. Create a `.env` file in the root of your project (if it doesn't exist already)
2. Add the following lines to the file:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_API_KEY=your-google-api-key
```

3. Replace `your-project-url` and `your-anon-key` with the values you copied from Supabase
4. Replace `your-google-api-key` with your Google API key (if you have one)

## 4. Set Up the Database Schema

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy the contents of `supabase/migrations/20230515000000_create_tables.sql` into the query editor
4. Click "Run" to create the database tables

## 5. Seed the Database with Sample Data

1. In the SQL Editor, click "New Query" again
2. Copy the contents of `supabase/seed.sql` into the query editor
3. Click "Run" to populate the database with sample data

## 6. Enable Authentication (Optional)

If you want to use Supabase authentication:

1. In your Supabase project dashboard, click on "Authentication" in the left sidebar
2. Click on "Settings"
3. Under "Email Auth", make sure "Enable Email Signup" is turned on
4. You can customize other settings as needed

## 7. Test the Connection

1. Start your application with `npm run dev:win`
2. Open the browser console
3. You should see a message like "Successfully connected to Supabase API"
4. If you see "Error connecting to Supabase", check your credentials and make sure your Supabase project is running

## Troubleshooting

### Connection Issues

- Double-check your Supabase URL and anon key
- Make sure your Supabase project is active
- Check if there are any CORS issues in the browser console

### Database Issues

- Check if the tables were created successfully in the Supabase Table Editor
- Make sure the sample data was inserted correctly
- Check for any SQL errors in the SQL Editor

### Authentication Issues

- Make sure you've enabled the authentication methods you want to use
- Check if you've set up the correct redirect URLs
- Verify that your RLS (Row Level Security) policies are configured correctly

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase JavaScript Client](https://supabase.io/docs/reference/javascript/installing)
- [Supabase Auth Documentation](https://supabase.io/docs/guides/auth)
