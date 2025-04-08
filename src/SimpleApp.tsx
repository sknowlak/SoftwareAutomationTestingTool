import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const SimpleApp: React.FC = () => {
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h2" gutterBottom>
        Betaboss Testing Tool
      </Typography>
      <Typography variant="h5" gutterBottom>
        Simple Test Page
      </Typography>
      <Typography variant="body1" paragraph>
        If you can see this page, React is working correctly.
      </Typography>
      <Button variant="contained" color="primary">
        Test Button
      </Button>
    </Box>
  );
};

export default SimpleApp;
