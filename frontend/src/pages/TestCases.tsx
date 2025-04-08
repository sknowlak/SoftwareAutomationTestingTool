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
  IconButton,
  Chip,
} from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

interface TestCase {
  id: number
  name: string
  description: string
  base_url: string
  created_at: string
  updated_at: string
  steps_count: number
  last_run_status: 'passed' | 'failed' | 'error' | null
}

const TestCases = () => {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch this data from the API
    // const fetchTestCases = async () => {
    //   try {
    //     const response = await api.get('/api/test-cases')
    //     setTestCases(response.data)
    //   } catch (err) {
    //     console.error(err)
    //   } finally {
    //     setLoading(false)
    //   }
    // }
    // fetchTestCases()

    // Simulating API call
    setTimeout(() => {
      setTestCases([
        {
          id: 1,
          name: 'Login Test',
          description: 'Test user login functionality',
          base_url: 'https://example.com/login',
          created_at: '2023-10-15T10:30:00Z',
          updated_at: '2023-10-15T14:45:00Z',
          steps_count: 5,
          last_run_status: 'passed',
        },
        {
          id: 2,
          name: 'Registration Test',
          description: 'Test user registration process',
          base_url: 'https://example.com/register',
          created_at: '2023-10-14T09:15:00Z',
          updated_at: '2023-10-14T11:20:00Z',
          steps_count: 8,
          last_run_status: 'failed',
        },
        {
          id: 3,
          name: 'Product Search',
          description: 'Test product search functionality',
          base_url: 'https://example.com/products',
          created_at: '2023-10-13T13:45:00Z',
          updated_at: '2023-10-13T16:30:00Z',
          steps_count: 4,
          last_run_status: 'passed',
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'passed':
        return 'success'
      case 'failed':
        return 'error'
      case 'error':
        return 'warning'
      default:
        return 'default'
    }
  }

  const handleRunTest = (id: number) => {
    console.log(`Running test case ${id}`)
    // In a real app, you would call the API to run the test
  }

  const handleEditTest = (id: number) => {
    console.log(`Editing test case ${id}`)
    // In a real app, you would navigate to the edit page
  }

  const handleDeleteTest = (id: number) => {
    console.log(`Deleting test case ${id}`)
    // In a real app, you would call the API to delete the test
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Test Cases
      </Typography>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Steps</TableCell>
                <TableCell>Last Run</TableCell>
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
              ) : testCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No test cases found
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((testCase) => (
                  <TableRow key={testCase.id}>
                    <TableCell>{testCase.name}</TableCell>
                    <TableCell>{testCase.description}</TableCell>
                    <TableCell>{testCase.base_url}</TableCell>
                    <TableCell>{testCase.steps_count}</TableCell>
                    <TableCell>
                      {testCase.last_run_status ? (
                        <Chip
                          label={testCase.last_run_status}
                          color={getStatusColor(testCase.last_run_status) as any}
                          size="small"
                        />
                      ) : (
                        'Never run'
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => handleRunTest(testCase.id)}
                        >
                          Run
                        </Button>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleEditTest(testCase.id)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteTest(testCase.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
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

export default TestCases
