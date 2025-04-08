import { useState, useEffect } from 'react'
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'

interface TestRun {
  id: number
  test_case_name: string
  start_time: string
  end_time: string | null
  status: 'running' | 'passed' | 'failed' | 'error'
  browser: string
  duration: number | null
}

const TestRuns = () => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from the API
    // const fetchTestRuns = async () => {
    //   try {
    //     const response = await api.get('/api/test-runs')
    //     setTestRuns(response.data)
    //   } catch (err) {
    //     console.error(err)
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchTestRuns()

    // Simulating API call
    setTimeout(() => {
      setTestRuns([
        {
          id: 1,
          test_case_name: 'Login Test',
          start_time: '2023-10-15T14:30:00Z',
          end_time: '2023-10-15T14:31:05Z',
          status: 'passed',
          browser: 'chromium',
          duration: 65,
        },
        {
          id: 2,
          test_case_name: 'Registration Test',
          start_time: '2023-10-15T13:45:00Z',
          end_time: '2023-10-15T13:46:30Z',
          status: 'failed',
          browser: 'firefox',
          duration: 90,
        },
        {
          id: 3,
          test_case_name: 'Product Search',
          start_time: '2023-10-15T12:15:00Z',
          end_time: '2023-10-15T12:15:45Z',
          status: 'passed',
          browser: 'webkit',
          duration: 45,
        },
        {
          id: 4,
          test_case_name: 'Checkout Process',
          start_time: '2023-10-15T11:30:00Z',
          end_time: null,
          status: 'running',
          browser: 'chromium',
          duration: null,
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'success'
      case 'failed':
        return 'error'
      case 'error':
        return 'warning'
      case 'running':
        return 'info'
      default:
        return 'default'
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'In progress'
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const handleViewResults = (id: number) => {
    console.log(`Viewing results for test run ${id}`)
    // In a real app, you would navigate to the results page
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Test Runs
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test Case</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Browser</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : testRuns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No test runs found
                  </TableCell>
                </TableRow>
              ) : (
                testRuns.map((testRun) => (
                  <TableRow key={testRun.id}>
                    <TableCell>{testRun.test_case_name}</TableCell>
                    <TableCell>{new Date(testRun.start_time).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={testRun.status}
                        color={getStatusColor(testRun.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{testRun.browser}</TableCell>
                    <TableCell>{formatDuration(testRun.duration)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewResults(testRun.id)}
                        disabled={testRun.status === 'running'}
                      >
                        View Results
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default TestRuns
