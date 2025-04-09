import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ApiRequest, KeyValuePair } from '../../types/apiTypes';
import { convertToCurl } from '../../utils/curlParser';

// Component for key-value pair editor (headers, params, etc.)
const KeyValueEditor: React.FC<{
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  disabled?: boolean;
  type?: 'headers' | 'params';
}> = ({ pairs, onChange, disabled = false, type = 'params' }) => {
  const handleAddPair = () => {
    onChange([...pairs, { key: '', value: '', enabled: true }]);
  };

  const handleRemovePair = (index: number) => {
    const newPairs = [...pairs];
    newPairs.splice(index, 1);
    onChange(newPairs);
  };

  const handlePairChange = (index: number, field: 'key' | 'value', value: string) => {
    const newPairs = [...pairs];
    newPairs[index][field] = value;
    onChange(newPairs);
  };

  const handleTogglePair = (index: number) => {
    const newPairs = [...pairs];
    newPairs[index].enabled = !newPairs[index].enabled;
    onChange(newPairs);
  };

  // Define placeholders based on common use cases
  const getKeyPlaceholder = (index: number) => {
    if (type === 'headers') {
      const commonHeaders = ['Content-Type', 'Authorization', 'Accept', 'User-Agent'];
      const usedKeys = pairs.map(p => p.key);
      const suggestion = commonHeaders.find(k => !usedKeys.includes(k));
      return suggestion || 'Header name';
    } else {
      const commonParams = ['id', 'page', 'limit', 'sort', 'filter'];
      const usedKeys = pairs.map(p => p.key);
      const suggestion = commonParams.find(k => !usedKeys.includes(k));
      return suggestion || 'Parameter name';
    }
  };

  const getValuePlaceholder = (key: string) => {
    // Provide helpful placeholders based on key
    const lowerKey = key.toLowerCase();

    if (type === 'headers') {
      if (lowerKey === 'content-type') return 'application/json';
      if (lowerKey === 'authorization') return 'Bearer token';
      if (lowerKey === 'accept') return '*/*';
      if (lowerKey === 'user-agent') return 'Mozilla/5.0';
      return 'Header value';
    } else {
      if (lowerKey.includes('id')) return '12345';
      if (lowerKey.includes('page')) return '1';
      if (lowerKey.includes('limit')) return '10';
      if (lowerKey.includes('sort')) return 'asc';
      return 'Parameter value';
    }
  };

  return (
    <Box>
      {pairs.map((pair, index) => (
        <Box key={index} sx={{ display: 'flex', mb: 1 }}>
          <TextField
            size="small"
            placeholder={getKeyPlaceholder(index)}
            value={pair.key}
            onChange={(e) => handlePairChange(index, 'key', e.target.value)}
            disabled={disabled}
            sx={{ mr: 1, flex: 1 }}
          />
          <TextField
            size="small"
            placeholder={getValuePlaceholder(pair.key)}
            value={pair.value}
            onChange={(e) => handlePairChange(index, 'value', e.target.value)}
            disabled={disabled}
            sx={{ mr: 1, flex: 2 }}
          />
          <IconButton
            size="small"
            onClick={() => handleRemovePair(index)}
            disabled={disabled}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={handleAddPair}
        disabled={disabled}
        size="small"
      >
        Add {type === 'headers' ? 'Header' : 'Parameter'}
      </Button>
    </Box>
  );
};

// Helper function to get body placeholder based on content type
const getBodyPlaceholder = (headers: KeyValuePair[]): string => {
  const contentTypeHeader = headers.find(h => h.key.toLowerCase() === 'content-type');
  const contentType = contentTypeHeader?.value || 'application/json';

  if (contentType.includes('json')) {
    return `{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true
}`;
  } else if (contentType.includes('x-www-form-urlencoded')) {
    return 'name=John%20Doe&email=john%40example.com&age=30&isActive=true';
  } else if (contentType.includes('form-data')) {
    return 'Use form data for file uploads and multipart requests';
  } else if (contentType.includes('xml')) {
    return `<user>
  <name>John Doe</name>
  <email>john@example.com</email>
  <age>30</age>
  <isActive>true</isActive>
</user>`;
  } else {
    return 'Enter request body here...';
  }
};

// Component for request editor
const RequestEditor: React.FC<{
  request: ApiRequest;
  onSave: (request: ApiRequest) => void;
  onRun: (request: ApiRequest) => void;
  onImportCurl?: () => void;
  disabled?: boolean;
}> = ({ request, onSave, onRun, onImportCurl, disabled = false }) => {
  const [editedRequest, setEditedRequest] = useState<ApiRequest>(request);
  const [activeTab, setActiveTab] = useState(0);
  const [curlCommand, setCurlCommand] = useState('');
  const [curlCopied, setCurlCopied] = useState(false);

  // Update curl command when request changes
  useEffect(() => {
    try {
      const curl = convertToCurl(editedRequest);
      setCurlCommand(curl);
    } catch (error) {
      console.error('Error generating cURL command:', error);
    }
  }, [editedRequest]);

  const handleRequestChange = (field: keyof ApiRequest, value: any) => {
    setEditedRequest({ ...editedRequest, [field]: value });
  };

  const handleSave = () => {
    onSave(editedRequest);
  };

  const handleRun = () => {
    onRun(editedRequest);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Request Name"
          value={editedRequest.name}
          onChange={(e) => handleRequestChange('name', e.target.value)}
          disabled={disabled}
          sx={{ mr: 2, flex: 1 }}
        />
        <Box sx={{ display: 'flex' }}>
          <Tooltip title="Import from cURL">
            <IconButton
              onClick={onImportCurl}
              disabled={disabled}
              sx={{ mr: 1 }}
            >
              <CodeIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={disabled}
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrowIcon />}
            onClick={handleRun}
            disabled={disabled}
          >
            Send
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FormControl size="small" sx={{ width: 120, mr: 1 }}>
          <InputLabel>Method</InputLabel>
          <Select
            value={editedRequest.method}
            label="Method"
            onChange={(e) => handleRequestChange('method', e.target.value)}
            disabled={disabled}
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="DELETE">DELETE</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
            <MenuItem value="HEAD">HEAD</MenuItem>
            <MenuItem value="OPTIONS">OPTIONS</MenuItem>
          </Select>
        </FormControl>
        <TextField
          fullWidth
          size="small"
          placeholder="https://api.example.com/users/profile"
          value={editedRequest.url}
          onChange={(e) => handleRequestChange('url', e.target.value)}
          disabled={disabled}
          helperText={editedRequest.url ? '' : 'Enter request URL (e.g., https://api.example.com/users/profile)'}
        />
      </Box>

      <Box sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Params" />
          <Tab label="Headers" />
          <Tab label="Body" />
          <Tab label="Tests" />
          <Tab label="Pre-request Script" />
          <Tab label="cURL" />
        </Tabs>

        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderTop: 0 }}>
          {activeTab === 0 && (
            <KeyValueEditor
              pairs={editedRequest.params}
              onChange={(params) => handleRequestChange('params', params)}
              disabled={disabled}
              type="params"
            />
          )}
          {activeTab === 1 && (
            <KeyValueEditor
              pairs={editedRequest.headers}
              onChange={(headers) => handleRequestChange('headers', headers)}
              disabled={disabled}
              type="headers"
            />
          )}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">
                  Request Body
                </Typography>
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel>Content Type</InputLabel>
                  <Select
                    value={editedRequest.headers.find(h => h.key.toLowerCase() === 'content-type')?.value || 'application/json'}
                    label="Content Type"
                    onChange={(e) => {
                      // Update or add Content-Type header
                      const headerIndex = editedRequest.headers.findIndex(h => h.key.toLowerCase() === 'content-type');
                      const newHeaders = [...editedRequest.headers];

                      if (headerIndex >= 0) {
                        newHeaders[headerIndex].value = e.target.value;
                      } else {
                        newHeaders.push({ key: 'Content-Type', value: e.target.value, enabled: true });
                      }

                      handleRequestChange('headers', newHeaders);
                    }}
                    disabled={disabled}
                  >
                    <MenuItem value="application/json">JSON</MenuItem>
                    <MenuItem value="application/x-www-form-urlencoded">Form URL Encoded</MenuItem>
                    <MenuItem value="multipart/form-data">Form Data</MenuItem>
                    <MenuItem value="text/plain">Plain Text</MenuItem>
                    <MenuItem value="application/xml">XML</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={10}
                placeholder={getBodyPlaceholder(editedRequest.headers)}
                value={editedRequest.body}
                onChange={(e) => handleRequestChange('body', e.target.value)}
                disabled={disabled}
                InputProps={{
                  sx: {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>
          )}
          {activeTab === 3 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tests
              </Typography>
              {editedRequest.tests.map((test, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Test Name"
                    value={test.name}
                    onChange={(e) => {
                      const newTests = [...editedRequest.tests];
                      newTests[index].name = e.target.value;
                      handleRequestChange('tests', newTests);
                    }}
                    disabled={disabled}
                    sx={{ mb: 1 }}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Test Script"
                    value={test.script}
                    onChange={(e) => {
                      const newTests = [...editedRequest.tests];
                      newTests[index].script = e.target.value;
                      handleRequestChange('tests', newTests);
                    }}
                    disabled={disabled}
                  />
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  const newTests = [...editedRequest.tests, { name: '', script: '' }];
                  handleRequestChange('tests', newTests);
                }}
                disabled={disabled}
                size="small"
              >
                Add Test
              </Button>
            </Box>
          )}
          {activeTab === 4 && (
            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder="Pre-request Script"
              value={editedRequest.preRequestScript || ''}
              onChange={(e) => handleRequestChange('preRequestScript', e.target.value)}
              disabled={disabled}
            />
          )}
          {activeTab === 5 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">
                  cURL Command
                </Typography>
                <Tooltip title={curlCopied ? "Copied!" : "Copy to clipboard"}>
                  <IconButton onClick={handleCopyCurl} size="small">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  backgroundColor: '#f5f5f5',
                  padding: 2,
                  borderRadius: 1,
                  overflowX: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  border: '1px solid #e0e0e0'
                }}
              >
                {curlCommand}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This cURL command represents your current request configuration.
                You can copy it to use in terminal or share with others.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default RequestEditor;
