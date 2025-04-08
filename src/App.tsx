import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'

// Import our custom components
import ScreenRecorder from './components/recorder/ScreenRecorder'
import DirectTestGenerator from './components/testGenerator/DirectTestGenerator'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
})

function App() {
  const [apiKey, setApiKey] = useState('')

  // Fetch API key from backend
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config')
        const data = await response.json()
        if (data.googleApiKey) {
          setApiKey(data.googleApiKey)
        }
      } catch (error) {
        console.error('Error fetching API key:', error)
      }
    }

    fetchConfig()
  }, [])

  // No handlers needed as they're now in the ScreenRecorder component

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Web Automation Testing Tool
        </Typography>

        <Typography variant="h4" gutterBottom>
          Web Automation Testing Tool with Screen Recording
        </Typography>
        <Typography variant="body1" paragraph>
          This tool allows you to record your screen, capture screenshots, and automatically generate test cases from your recordings.
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Screen Recording and Screenshots
          </Typography>
          <ScreenRecorder />
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Direct Test Generator - Works independently of screenshots */}
        <DirectTestGenerator />

        {apiKey && (
          <Typography variant="caption" color="text.secondary">
            Using Google API Key: {apiKey.substring(0, 6)}...{apiKey.substring(apiKey.length - 4)}
          </Typography>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default App
