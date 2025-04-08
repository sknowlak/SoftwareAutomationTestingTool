import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import SaveIcon from '@mui/icons-material/Save';
import { saveAs } from 'file-saver';
import { generateLeadFormTest } from '../../services/leadFormTestGenerator';

/**
 * DirectTestGenerator Component
 * A simplified test generator that works independently of screenshots
 */
const DirectTestGenerator: React.FC = () => {
  // State
  const [testName, setTestName] = useState<string>('Add_Lead_Test');
  const [testType, setTestType] = useState<'playwright' | 'pytest' | 'cypress'>('playwright');
  const [testScript, setTestScript] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle test type change
  const handleTestTypeChange = (event: SelectChangeEvent) => {
    setTestType(event.target.value as 'playwright' | 'pytest' | 'cypress');
  };

  // Generate test script
  const generateTest = () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Generating lead form test with name:', testName);
      
      // Generate lead form test
      const script = generateLeadFormTest(testType, testName);
      console.log('Generated test script length:', script.length);
      
      setTestScript(script);
      setSuccess('Test case generated successfully!');
    } catch (err) {
      console.error('Error generating test:', err);
      setError(`Failed to generate test: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Fallback with hardcoded script
      try {
        const fallbackScript = `import { test, expect } from '@playwright/test';

test('${testName || 'Add_Lead_Test'}', async ({ page }) => {
  // Navigate to the CRM
  await page.goto('https://crm.example.com/leads');
  
  // Click on Add Lead button
  await page.click('button:has-text("Add Lead")');
  
  // Fill the form
  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.fill('input[name="email"]', 'john.doe@example.com');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Verify success
  await expect(page.locator('.success-message')).toBeVisible();
});`;
        
        setTestScript(fallbackScript);
        setSuccess('Generated fallback test case');
      } catch (fallbackErr) {
        console.error('Even fallback generation failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Save test script
  const saveTestScript = () => {
    try {
      if (!testScript) {
        setError('No test script to save');
        return;
      }

      // Determine file extension based on test type
      let fileExtension = '.js';
      if (testType === 'pytest') {
        fileExtension = '.py';
      } else if (testType === 'cypress') {
        fileExtension = '.cy.js';
      }

      // Create filename
      const fileName = `${testName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_test${fileExtension}`;

      // Create blob and save
      const blob = new Blob([testScript], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, fileName);

      setSuccess(`Test script saved as ${fileName}`);
    } catch (err) {
      console.error('Error saving test script:', err);
      setError('Failed to save test script');
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Lead Form Test Generator
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generate test cases for lead forms without requiring screenshots
      </Typography>

      {/* Error and success messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Test configuration */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Test Name"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          margin="normal"
          variant="outlined"
          placeholder="Add_Lead_Test"
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="test-type-label">Test Type</InputLabel>
          <Select
            labelId="test-type-label"
            value={testType}
            label="Test Type"
            onChange={handleTestTypeChange}
          >
            <MenuItem value="playwright">Playwright</MenuItem>
            <MenuItem value="pytest">Pytest</MenuItem>
            <MenuItem value="cypress">Cypress</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Generate button */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<CodeIcon />}
        onClick={generateTest}
        disabled={loading}
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Generate Lead Form Test'}
      </Button>

      {/* Test script display */}
      {testScript && (
        <>
          <Typography variant="h6" gutterBottom>
            Generated Test Script
          </Typography>
          
          <Box
            sx={{
              backgroundColor: 'background.paper',
              p: 2,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              overflow: 'auto',
              maxHeight: '400px',
              whiteSpace: 'pre-wrap',
              mb: 2
            }}
          >
            {testScript}
          </Box>

          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveTestScript}
          >
            Save Test Script
          </Button>
        </>
      )}
    </Paper>
  );
};

export default DirectTestGenerator;
