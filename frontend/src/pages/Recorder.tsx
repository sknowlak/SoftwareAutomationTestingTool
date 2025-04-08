import { useState } from 'react'
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import StopIcon from '@mui/icons-material/Stop'
import SaveIcon from '@mui/icons-material/Save'

const Recorder = () => {
  const [url, setUrl] = useState('')
  const [browser, setBrowser] = useState('chromium')
  const [recording, setRecording] = useState(false)
  const [recordingId, setRecordingId] = useState('')
  const [testName, setTestName] = useState('')
  const [testType, setTestType] = useState('playwright')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleStartRecording = async () => {
    if (!url) {
      setError('Please enter a URL')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // In a real app, you would call the API to start recording
      // const response = await api.post('/api/recordings/start', { url, browser })
      // setRecordingId(response.data.recording_id)
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRecordingId(`recording_${Date.now()}`)
      setRecording(true)
      setSuccess('Recording started successfully')
    } catch (err) {
      setError('Failed to start recording')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStopRecording = async () => {
    if (!recordingId) {
      setError('No active recording')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // In a real app, you would call the API to stop recording
      // const response = await api.post('/api/recordings/stop', { recording_id: recordingId })
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRecording(false)
      setSuccess('Recording stopped successfully')
    } catch (err) {
      setError('Failed to stop recording')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTest = async () => {
    if (!recordingId) {
      setError('No recording available')
      return
    }

    if (!testName) {
      setError('Please enter a test name')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // In a real app, you would call the API to generate a test
      // const response = await api.post('/api/test-generator/generate', {
      //   recording_id: recordingId,
      //   test_name: testName,
      //   test_type: testType,
      // })
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess('Test generated successfully')
    } catch (err) {
      setError('Failed to generate test')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Web Recorder
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Record Web Interactions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="URL to Record"
              variant="outlined"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={recording}
              placeholder="https://example.com"
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Browser</InputLabel>
              <Select
                value={browser}
                label="Browser"
                onChange={(e) => setBrowser(e.target.value)}
                disabled={recording}
              >
                <MenuItem value="chromium">Chromium</MenuItem>
                <MenuItem value="firefox">Firefox</MenuItem>
                <MenuItem value="webkit">WebKit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {!recording ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleStartRecording}
                  disabled={loading || !url}
                >
                  Start Recording
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<StopIcon />}
                  onClick={handleStopRecording}
                  disabled={loading}
                >
                  Stop Recording
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Test
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Test Name"
              variant="outlined"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              disabled={loading || recording}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Test Type</InputLabel>
              <Select
                value={testType}
                label="Test Type"
                onChange={(e) => setTestType(e.target.value)}
                disabled={loading || recording}
              >
                <MenuItem value="playwright">Playwright</MenuItem>
                <MenuItem value="pytest">Pytest</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<SaveIcon />}
                onClick={handleGenerateTest}
                disabled={loading || recording || !recordingId || !testName}
              >
                Generate Test
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mt: 3 }}>
          {success}
        </Alert>
      )}
    </Box>
  )
}

export default Recorder
