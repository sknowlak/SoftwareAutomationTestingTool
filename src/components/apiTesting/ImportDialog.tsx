import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress
} from '@mui/material';
import { parseCurlCommand } from '../../utils/curlParser';
import { parseSwaggerSpec } from '../../utils/swaggerParser';
import { ApiRequest, ApiCollection } from '../../types/apiTypes';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-tabpanel-${index}`}
      aria-labelledby={`import-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onImportRequest: (request: ApiRequest) => void;
  onImportCollection: (collection: ApiCollection) => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({
  open,
  onClose,
  onImportRequest,
  onImportCollection
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [curlCommand, setCurlCommand] = useState('');
  const [swaggerSpec, setSwaggerSpec] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleCurlChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurlCommand(event.target.value);
    setError(null);
  };

  const handleSwaggerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSwaggerSpec(event.target.value);
    setError(null);
  };

  const handleImportCurl = () => {
    setLoading(true);
    setError(null);

    try {
      const request = parseCurlCommand(curlCommand);
      
      if (request) {
        onImportRequest(request);
        setCurlCommand('');
        onClose();
      } else {
        setError('Failed to parse cURL command. Please check the format and try again.');
      }
    } catch (err: any) {
      setError(`Error parsing cURL: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSwagger = () => {
    setLoading(true);
    setError(null);

    try {
      const collection = parseSwaggerSpec(swaggerSpec);
      
      if (collection) {
        onImportCollection(collection);
        setSwaggerSpec('');
        onClose();
      } else {
        setError('Failed to parse Swagger/OpenAPI specification. Please check the format and try again.');
      }
    } catch (err: any) {
      setError(`Error parsing Swagger: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSwaggerFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setError(null);

    const file = event.target.files?.[0];
    if (!file) {
      setError('No file selected');
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setSwaggerSpec(content);
        
        // Auto-import if content is loaded
        const collection = parseSwaggerSpec(content);
        if (collection) {
          onImportCollection(collection);
          setSwaggerSpec('');
          onClose();
        } else {
          setError('Failed to parse Swagger/OpenAPI specification. Please check the file and try again.');
        }
      } catch (err: any) {
        setError(`Error reading file: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import API Request</DialogTitle>
      
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="cURL" />
        <Tab label="Swagger/OpenAPI" />
      </Tabs>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body2" gutterBottom>
            Paste a cURL command below to import it as an API request.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={10}
            placeholder="curl -X GET 'https://api.example.com/users' -H 'Authorization: Bearer token'"
            value={curlCommand}
            onChange={handleCurlChange}
            variant="outlined"
            disabled={loading}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Example: curl -X POST "https://api.example.com/users" -H "Content-Type: application/json" -d '{"name":"John","email":"john@example.com"}'
          </Typography>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body2" gutterBottom>
            Paste a Swagger/OpenAPI specification (JSON format) or upload a file.
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              disabled={loading}
            >
              Upload Swagger File
              <input
                type="file"
                hidden
                accept=".json,.yaml,.yml"
                onChange={handleImportSwaggerFile}
              />
            </Button>
          </Box>
          
          <TextField
            fullWidth
            multiline
            rows={10}
            placeholder='{"openapi":"3.0.0","info":{"title":"Example API","version":"1.0.0"},"paths":{...}}'
            value={swaggerSpec}
            onChange={handleSwaggerChange}
            variant="outlined"
            disabled={loading}
          />
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {tabValue === 0 ? (
          <Button 
            onClick={handleImportCurl} 
            variant="contained" 
            color="primary"
            disabled={!curlCommand.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Import cURL'}
          </Button>
        ) : (
          <Button 
            onClick={handleImportSwagger} 
            variant="contained" 
            color="primary"
            disabled={!swaggerSpec.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Import Swagger'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
