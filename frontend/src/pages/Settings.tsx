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
  Divider,
  Alert,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'

const Settings = () => {
  const [dbHost, setDbHost] = useState('localhost')
  const [dbPort, setDbPort] = useState('5432')
  const [dbName, setDbName] = useState('automation_tool')
  const [dbUser, setDbUser] = useState('postgres')
  const [dbPassword, setDbPassword] = useState('password')
  
  const [defaultBrowser, setDefaultBrowser] = useState('chromium')
  const [headless, setHeadless] = useState('false')
  const [screenshotQuality, setScreenshotQuality] = useState('high')
  
  const [success, setSuccess] = useState('')

  const handleSaveSettings = () => {
    // In a real app, you would call the API to save the settings
    setSuccess('Settings saved successfully')
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Database Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Host"
              variant="outlined"
              value={dbHost}
              onChange={(e) => setDbHost(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Port"
              variant="outlined"
              value={dbPort}
              onChange={(e) => setDbPort(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Database Name"
              variant="outlined"
              value={dbName}
              onChange={(e) => setDbName(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={dbUser}
              onChange={(e) => setDbUser(e.target.value)}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              value={dbPassword}
              onChange={(e) => setDbPassword(e.target.value)}
              margin="normal"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Browser Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Default Browser</InputLabel>
              <Select
                value={defaultBrowser}
                label="Default Browser"
                onChange={(e) => setDefaultBrowser(e.target.value)}
              >
                <MenuItem value="chromium">Chromium</MenuItem>
                <MenuItem value="firefox">Firefox</MenuItem>
                <MenuItem value="webkit">WebKit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Headless Mode</InputLabel>
              <Select
                value={headless}
                label="Headless Mode"
                onChange={(e) => setHeadless(e.target.value)}
              >
                <MenuItem value="true">Enabled</MenuItem>
                <MenuItem value="false">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Screenshot Quality</InputLabel>
              <Select
                value={screenshotQuality}
                label="Screenshot Quality"
                onChange={(e) => setScreenshotQuality(e.target.value)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  )
}

export default Settings
