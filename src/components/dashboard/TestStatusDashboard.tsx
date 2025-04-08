import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Mock data for test status
const testStatusData = [
  { name: 'Passed', value: 65, color: '#4caf50' },
  { name: 'Failed', value: 15, color: '#f44336' },
  { name: 'Skipped', value: 10, color: '#ff9800' },
  { name: 'Pending', value: 10, color: '#2196f3' }
];

// Mock data for test execution time
const testExecutionData = [
  { name: 'Login Tests', time: 1.2 },
  { name: 'Profile Tests', time: 2.5 },
  { name: 'Dashboard Tests', time: 3.1 },
  { name: 'Settings Tests', time: 0.8 },
  { name: 'API Tests', time: 4.2 }
];

// Simple component to display test status without recharts
const TestStatusDashboard: React.FC = () => {
  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Status Distribution
            </Typography>
            <Box sx={{ mt: 3 }}>
              {testStatusData.map((item) => (
                <Box key={item.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                      width: 16, 
                      height: 16, 
                      bgcolor: item.color, 
                      borderRadius: '50%',
                      mr: 1 
                    }} />
                    <Typography variant="body2">
                      {item.name}: {item.value}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.value} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.color
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                <CheckCircleIcon color="success" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Passed</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Failed</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Skipped</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                <HourglassEmptyIcon color="info" sx={{ mr: 0.5 }} />
                <Typography variant="body2">Pending</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Test Execution Time (seconds)
            </Typography>
            <Box sx={{ mt: 3 }}>
              {testExecutionData.map((item) => (
                <Box key={item.name} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="body2">{item.time}s</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.time * 10} 
                    sx={{ 
                      height: 10, 
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#2196f3'
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TestStatusDashboard;
