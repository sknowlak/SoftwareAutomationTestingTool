import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Box, Alert, AlertTitle } from '@mui/material'

// Import file system service
import { getConfig, isFileSystemInitialized, initializeFileSystem, initializeSampleData } from './services/fileSystemService'
import PathSelector from './components/setup/PathSelector'

// Import our custom components
import Layout from './components/layout/Layout'
import Dashboard from './components/dashboard/Dashboard'
import ScreenRecorder from './components/recorder/ScreenRecorder'
import DirectTestGenerator from './components/testGenerator/DirectTestGenerator'
import MultiScreenshotTestGenerator from './components/testGenerator/MultiScreenshotTestGenerator'
import ReportingModule from './components/reporting/ReportingModule'
import ApiWorkspace from './components/apiTesting/ApiWorkspace'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
  },
})

function App() {
  const [apiKey, setApiKey] = useState('')
  const [currentModule, setCurrentModule] = useState('dashboard')
  const [apiError, setApiError] = useState(false)

  // State for path selector dialog
  const [showPathSelector, setShowPathSelector] = useState(false);

  // Initialize app and fetch config
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if file system is initialized
        const fsInitialized = isFileSystemInitialized();

        if (!fsInitialized) {
          console.log('File system not initialized, showing path selector...');
          setShowPathSelector(true);
          return;
        }

        // Fetch configuration
        const configData = await getConfig();

        if (configData?.googleApiKey) {
          setApiKey(configData.googleApiKey);
          setApiError(false);
          console.log('Successfully loaded configuration');
        } else {
          // If no API key in config, try to use environment variable
          const envApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
          if (envApiKey) {
            setApiKey(envApiKey);
            setApiError(false);
            console.log('Using API key from environment variables');
          } else {
            // Use a default API key
            setApiKey('DEMO_API_KEY');
            setApiError(false);
            console.log('Using demo API key');
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setApiError(true);

        // Use a default API key as fallback
        setApiKey('DEMO_API_KEY');
      }
    };

    initializeApp();
  }, [])

  // Handle path selection
  const handlePathSelected = async (path: string) => {
    try {
      console.log(`Path selected: ${path}`);

      // Initialize file system with selected path
      initializeFileSystem(path);

      // Initialize sample data
      await initializeSampleData();
      console.log('Sample data initialized');

      // Close path selector dialog
      setShowPathSelector(false);

      // Reload configuration
      const configData = await getConfig();
      if (configData?.googleApiKey) {
        setApiKey(configData.googleApiKey);
        setApiError(false);
        console.log('Configuration loaded successfully');
      } else {
        console.log('No API key found in config, using default');
        setApiKey('DEMO_API_KEY');
        setApiError(false);
      }
    } catch (error) {
      console.error('Error initializing file system:', error);
      setApiError(true);

      // Use a default API key as fallback
      setApiKey('DEMO_API_KEY');
    }
  }

  // Handle navigation between modules
  const handleNavigate = (module: string) => {
    setCurrentModule(module)
  }

  // State for test results to pass to reporting module
  const [testScript, setTestScript] = useState<string>('')
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [consoleOutput, setConsoleOutput] = useState<string>('')
  const [currentTestModule, setCurrentTestModule] = useState<string>('Test Module')

  // Handle test completion
  const handleTestComplete = (script: string, module: string) => {
    console.log(`Test script generated for ${module}:`, script.substring(0, 100) + '...')
    setTestScript(script)
    setCurrentTestModule(module)
    // In a real app, we would also capture screenshots and console output here
  }

  // Render the current module
  const renderModule = () => {
    switch (currentModule) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      case 'recorder':
        return <ScreenRecorder />
      case 'screenshot':
        return <MultiScreenshotTestGenerator
          onComplete={(script) => handleTestComplete(script, 'Screenshot Tests')}
        />
      case 'direct':
        return <DirectTestGenerator />
      case 'reporting':
        return <ReportingModule
          testScript={testScript}
          screenshots={screenshots}
          consoleOutput={consoleOutput}
          moduleName={currentTestModule}
        />
      case 'api':
        return <ApiWorkspace />
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <ThemeProvider theme={theme}>
      {/* Path Selector Dialog */}
      <PathSelector
        open={showPathSelector}
        onPathSelected={handlePathSelected}
      />

      <Layout onNavigate={handleNavigate}>
        {apiError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Storage Issue</AlertTitle>
            Could not access file system. Some features may be limited.
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {renderModule()}
        </Box>

        {apiKey && (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Alert severity="info" sx={{ display: 'inline-flex' }}>
              Connected to API with key: {apiKey.substring(0, 6)}...{apiKey.substring(apiKey.length - 4)}
            </Alert>
          </Box>
        )}
      </Layout>
    </ThemeProvider>
  )
}

export default App
