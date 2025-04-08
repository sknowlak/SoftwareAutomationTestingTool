import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'

import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Recorder from './pages/Recorder'
import TestCases from './pages/TestCases'
import TestRuns from './pages/TestRuns'
import Settings from './pages/Settings'

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
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Navbar toggleSidebar={toggleSidebar} />
        <Sidebar open={sidebarOpen} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: 8,
            ml: sidebarOpen ? 30 : 7,
            transition: 'margin 0.2s',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/recorder" element={<Recorder />} />
            <Route path="/test-cases" element={<TestCases />} />
            <Route path="/test-runs" element={<TestRuns />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
