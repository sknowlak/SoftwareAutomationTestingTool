import React, { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert, Paper, CircularProgress } from '@mui/material';

const SimpleApp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [count, setCount] = useState(0);

  const handleButtonClick = () => {
    setLoading(true);

    // Simulate an API call
    setTimeout(() => {
      setCount(prevCount => prevCount + 1);
      setAlertMessage(`Button clicked ${count + 1} times!`);
      setShowAlert(true);
      setLoading(false);
    }, 1000);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}>
        <Typography variant="h2" gutterBottom>
          Betaboss Testing Tool
        </Typography>
        <Typography variant="h5" gutterBottom>
          Simple Test Page
        </Typography>
        <Typography variant="body1" paragraph>
          If you can see this page, React is working correctly.
        </Typography>
        <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
          Click the button below to test interactivity.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleButtonClick}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : `Test Button (Clicked: ${count})`}
        </Button>
      </Paper>

      <Snackbar open={showAlert} autoHideDuration={3000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SimpleApp;
