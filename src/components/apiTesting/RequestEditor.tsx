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
import { ApiRequest, KeyValuePair } from '../../types/apiTypes';
import { convertToCurl } from '../../utils/curlParser';

// Component for key-value pair editor (headers, params, etc.)
const KeyValueEditor: React.FC<{
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  disabled?: boolean;
}> = ({ pairs, onChange, disabled = false }) => {
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

  return (
    <Box>
      {pairs.map((pair, index) => (
        <Box key={index} sx={{ display: 'flex', mb: 1 }}>
          <TextField
            size="small"
            placeholder="Key"
            value={pair.key}
            onChange={(e) => handlePairChange(index, 'key', e.target.value)}
            disabled={disabled}
            sx={{ mr: 1, flex: 1 }}
          />
          <TextField
            size="small"
            placeholder="Value"
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
        Add
      </Button>
    </Box>
  );
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
          placeholder="URL"
          value={editedRequest.url}
          onChange={(e) => handleRequestChange('url', e.target.value)}
          disabled={disabled}
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
            />
          )}
          {activeTab === 1 && (
            <KeyValueEditor
              pairs={editedRequest.headers}
              onChange={(headers) => handleRequestChange('headers', headers)}
              disabled={disabled}
            />
          )}
          {activeTab === 2 && (
            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder="Request Body (JSON, XML, etc.)"
              value={editedRequest.body}
              onChange={(e) => handleRequestChange('body', e.target.value)}
              disabled={disabled}
            />
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
              <TextField
                fullWidth
                multiline
                rows={8}
                value={curlCommand}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{ 
                  fontFamily: 'monospace',
                  '& .MuiInputBase-input': { 
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
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
