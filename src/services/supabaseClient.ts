// Mock Supabase client for development
// In a real app, this would use the actual Supabase client

// Mock Supabase client with basic functionality
export const supabase = {
  from: (table: string) => ({
    select: (columns: string) => ({
      single: async () => {
        console.log(`Mock Supabase: select ${columns} from ${table} (single)`);
        // Return mock data based on the table
        if (table === 'config') {
          return {
            data: {
              googleApiKey: 'MOCK_GOOGLE_API_KEY',
              apiEndpoint: 'https://api.example.com',
              version: '1.0.0',
              environment: 'development'
            },
            error: null
          };
        }
        return { data: null, error: null };
      },
      order: (column: string, options: any) => ({
        async then(callback: Function) {
          console.log(`Mock Supabase: select ${columns} from ${table} order by ${column}`);
          // Return mock data based on the table
          if (table === 'test_results') {
            callback({
              data: [
                { id: 'test-1', name: 'Login Test', status: 'PASSED', timestamp: new Date().toISOString(), duration: 1200 },
                { id: 'test-2', name: 'Add Lead Test', status: 'FAILED', timestamp: new Date().toISOString(), duration: 1500 }
              ],
              error: null
            });
          } else {
            callback({ data: [], error: null });
          }
        }
      })
    }),
    insert: async (data: any) => {
      console.log(`Mock Supabase: insert into ${table}`, data);
      return { data, error: null };
    }
  }),
  auth: {
    signIn: async () => ({ user: null, session: null, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: null, error: null }),
    user: () => null,
    session: () => null,
    role: () => 'authenticated'
  }
};

export default supabase;
