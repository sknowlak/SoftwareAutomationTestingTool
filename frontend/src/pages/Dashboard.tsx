import { useState, useEffect } from 'react'
import { Typography, Grid, Paper, Box } from '@mui/material'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'

const Dashboard = () => {
  const [stats, setStats] = useState({
    testCases: 0,
    testRuns: 0,
    passedTests: 0,
    failedTests: 0,
  })

  useEffect(() => {
    // In a real app, you would fetch this data from the API
    setStats({
      testCases: 12,
      testRuns: 48,
      passedTests: 42,
      failedTests: 6,
    })
  }, [])

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
            }}
          >
            <PlaylistPlayIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography component="h2" variant="h5">
              {stats.testCases}
            </Typography>
            <Typography color="text.secondary">Test Cases</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
            }}
          >
            <PlayArrowIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography component="h2" variant="h5">
              {stats.testRuns}
            </Typography>
            <Typography color="text.secondary">Test Runs</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography component="h2" variant="h5">
              {stats.passedTests}
            </Typography>
            <Typography color="text.secondary">Passed Tests</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: 140,
            }}
          >
            <ErrorIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
            <Typography component="h2" variant="h5">
              {stats.failedTests}
            </Typography>
            <Typography color="text.secondary">Failed Tests</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No recent activity to display.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
