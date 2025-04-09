import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Tooltip,
  Paper,
  Divider,
  Switch,
  FormControlLabel,
  Checkbox,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  CircularProgress,
  styled
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import CodeIcon from '@mui/icons-material/Code';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { parseCurlCommand } from '../../utils/curlParser';
import { ApiRequest, KeyValuePair, ApiResponse } from '../../types/apiTypes';
import { convertToCurl } from '../../utils/curlParser';

// Styled components for Postman-like UI
const RequestContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const UrlBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const SendButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#FF6C37', // Postman orange
  color: 'white',
  '&:hover': {
    backgroundColor: '#E05A2B',
  }
}));

const TabPanel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  overflow: 'auto'
}));

const ResponseContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden'
}));

const ResponseHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const ResponseBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  maxHeight: '400px',
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word'
}));

// Browser tab styled components
const BrowserTabsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.divider}`,
  overflowX: 'auto',
  '&::-webkit-scrollbar': {
    height: '4px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.divider
  }
}));

const BrowserTab = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'active'
})<{ active?: boolean }>(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  minWidth: '150px',
  maxWidth: '200px',
  height: '36px',
  backgroundColor: active ? theme.palette.background.paper : theme.palette.background.default,
  borderRight: `1px solid ${theme.palette.divider}`,
  borderTop: active ? `2px solid ${theme.palette.primary.main}` : 'none',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: active ? theme.palette.background.paper : theme.palette.action.hover
  }
}));

const TabActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto',
  '& > *': {
    marginLeft: theme.spacing(0.5)
  }
}));

const NewTabButton = styled(IconButton)(({ theme }) => ({
  minWidth: '36px',
  height: '36px',
  borderRadius: 0,
  padding: theme.spacing(0.5)
}));

// Component for key-value pair editor with description (headers, params, etc.)
const KeyValueEditor: React.FC<{
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  disabled?: boolean;
  type?: 'headers' | 'params';
}> = ({ pairs, onChange, disabled = false, type = 'params' }) => {
  const handleAddPair = () => {
    onChange([...pairs, { key: '', value: '', description: '', enabled: true }]);
  };

  const handleRemovePair = (index: number) => {
    const newPairs = [...pairs];
    newPairs.splice(index, 1);
    onChange(newPairs);
  };

  const handlePairChange = (index: number, field: 'key' | 'value' | 'description', value: string) => {
    const newPairs = [...pairs];
    if (!newPairs[index]) return;

    if (field === 'key') {
      newPairs[index].key = value;
    } else if (field === 'value') {
      newPairs[index].value = value;
    } else if (field === 'description') {
      newPairs[index].description = value;
    }

    onChange(newPairs);
  };

  const handleTogglePair = (index: number) => {
    const newPairs = [...pairs];
    if (!newPairs[index]) return;

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

  // Responsive design - use grid on small screens, table on larger screens
  return (
    <Box>
      {/* Table header */}
      <Grid container spacing={1} sx={{ mb: 1, px: 1 }}>
        <Grid item xs={1}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>Enabled</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>Key</Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>Value</Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>Description</Typography>
        </Grid>
        <Grid item xs={1}>
          <Typography variant="subtitle2" sx={{ fontSize: '0.75rem' }}>Actions</Typography>
        </Grid>
      </Grid>

      {/* Table body */}
      <Box sx={{ maxHeight: '300px', overflow: 'auto' }}>
        {pairs.map((pair, index) => (
          <Grid container spacing={1} key={index} sx={{ mb: 1, px: 1, alignItems: 'center' }}>
            <Grid item xs={1} sx={{ textAlign: 'center' }}>
              <Checkbox
                checked={pair.enabled !== false}
                onChange={() => handleTogglePair(index)}
                disabled={disabled}
                size="small"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={getKeyPlaceholder(index)}
                value={pair.key}
                onChange={(e) => handlePairChange(index, 'key', e.target.value)}
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder={getValuePlaceholder(pair.key)}
                value={pair.value}
                onChange={(e) => handlePairChange(index, 'value', e.target.value)}
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Description (optional)"
                value={pair.description || ''}
                onChange={(e) => handlePairChange(index, 'description', e.target.value)}
                disabled={disabled}
              />
            </Grid>
            <Grid item xs={1} sx={{ textAlign: 'center' }}>
              <IconButton
                size="small"
                onClick={() => handleRemovePair(index)}
                disabled={disabled}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>
          </Grid>
        ))}
      </Box>

      {/* Add button */}
      <Box sx={{ mt: 1, px: 1 }}>
        <Button
          startIcon={<AddIcon />}
          onClick={handleAddPair}
          disabled={disabled}
          size="small"
          variant="outlined"
          color="primary"
        >
          Add {type === 'headers' ? 'Header' : 'Parameter'}
        </Button>
      </Box>
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

// Interface for browser tab
interface BrowserTabItem {
  id: string;
  name: string;
  request: ApiRequest;
  active: boolean;
}

// Component for request editor
const PostmanStyleRequestEditor: React.FC<{
  request: ApiRequest;
  onSave: (request: ApiRequest) => void;
  onRun: (request: ApiRequest) => void;
  response: ApiResponse | null;
  loading: boolean;
  disabled?: boolean;
  onImportCurl?: () => void;
}> = ({ request, onSave, onRun, response, loading, disabled = false, onImportCurl }) => {
  const [editedRequest, setEditedRequest] = useState<ApiRequest>(request);
  const [activeTab, setActiveTab] = useState(0);
  const [curlCommand, setCurlCommand] = useState('');
  const [curlCopied, setCurlCopied] = useState(false);
  const [responseExpanded, setResponseExpanded] = useState(true);
  const [browserTabs, setBrowserTabs] = useState<BrowserTabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [curlInputValue, setCurlInputValue] = useState('');
  const [showCurlInput, setShowCurlInput] = useState(false);
  const curlInputRef = useRef<HTMLInputElement>(null);

  // Initialize browser tabs with the current request
  useEffect(() => {
    if (!browserTabs.length) {
      const newTab: BrowserTabItem = {
        id: `tab-${Date.now()}`,
        name: request.name || 'New Request',
        request: { ...request },
        active: true
      };
      setBrowserTabs([newTab]);
      setActiveTabId(newTab.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update edited request when the request prop changes
  useEffect(() => {
    setEditedRequest(request);

    // Update the active tab with the new request
    if (activeTabId) {
      setBrowserTabs(prev => prev.map(tab =>
        tab.id === activeTabId ? { ...tab, request: { ...request } } : tab
      ));
    }
  }, [request, activeTabId]);

  // Update cURL command when edited request changes
  useEffect(() => {
    setCurlCommand(convertToCurl(editedRequest));
  }, [editedRequest]);

  // Handle adding a new browser tab
  const handleAddTab = () => {
    const newTab: BrowserTabItem = {
      id: `tab-${Date.now()}`,
      name: 'New Request',
      request: {
        id: `req-${Date.now()}`,
        name: 'New Request',
        url: '',
        method: 'GET',
        headers: [],
        params: [],
        body: '',
        tests: []
      },
      active: true
    };

    // Deactivate all other tabs
    const updatedTabs = browserTabs.map(tab => ({ ...tab, active: false }));
    setBrowserTabs([...updatedTabs, newTab]);
    setActiveTabId(newTab.id);
    setEditedRequest(newTab.request);
  };

  // Handle closing a browser tab
  const handleCloseTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    // Don't allow closing the last tab
    if (browserTabs.length <= 1) return;

    const tabIndex = browserTabs.findIndex(tab => tab.id === tabId);
    const isActiveTab = browserTabs[tabIndex].active;

    // Remove the tab
    const newTabs = browserTabs.filter(tab => tab.id !== tabId);

    // If we closed the active tab, activate another one
    if (isActiveTab) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      newTabs[newActiveIndex].active = true;
      setActiveTabId(newTabs[newActiveIndex].id);
      setEditedRequest(newTabs[newActiveIndex].request);
    }

    setBrowserTabs(newTabs);
  };

  // Handle selecting a browser tab
  const handleSelectTab = (tabId: string) => {
    // Save current request to current tab
    const updatedTabs = browserTabs.map(tab => ({
      ...tab,
      request: tab.id === activeTabId ? editedRequest : tab.request,
      active: tab.id === tabId
    }));

    setBrowserTabs(updatedTabs);
    setActiveTabId(tabId);

    // Load the selected tab's request
    const selectedTab = updatedTabs.find(tab => tab.id === tabId);
    if (selectedTab) {
      setEditedRequest(selectedTab.request);
    }
  };

  // Handle importing cURL
  const handleImportCurl = () => {
    if (!curlInputValue.trim()) return;

    try {
      const parsedRequest = parseCurlCommand(curlInputValue);
      if (parsedRequest) {
        // Create a new tab with the imported request
        const newTab: BrowserTabItem = {
          id: `tab-${Date.now()}`,
          name: parsedRequest.name || 'Imported Request',
          request: parsedRequest,
          active: true
        };

        // Deactivate all other tabs
        const updatedTabs = browserTabs.map(tab => ({ ...tab, active: false }));
        setBrowserTabs([...updatedTabs, newTab]);
        setActiveTabId(newTab.id);
        setEditedRequest(parsedRequest);

        // Clear and hide the input
        setCurlInputValue('');
        setShowCurlInput(false);
      }
    } catch (error) {
      console.error('Error parsing cURL:', error);
    }
  };

  // Toggle cURL input visibility
  const toggleCurlInput = () => {
    setShowCurlInput(!showCurlInput);
    // Focus the input when shown
    if (!showCurlInput) {
      setTimeout(() => {
        curlInputRef.current?.focus();
      }, 100);
    }
  };

  // Handle request field changes
  const handleRequestChange = (field: keyof ApiRequest, value: any) => {
    setEditedRequest(prev => ({ ...prev, [field]: value }));
  };

  // Handle save button click
  const handleSave = () => {
    onSave(editedRequest);
  };

  // Handle run button click
  const handleRun = () => {
    onRun(editedRequest);
  };

  // Handle copy cURL command
  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCurlCopied(true);
    setTimeout(() => setCurlCopied(false), 2000);
  };

  // Format response status
  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return '#4CAF50'; // Green for success
    if (status >= 300 && status < 400) return '#2196F3'; // Blue for redirection
    if (status >= 400 && status < 500) return '#FF9800'; // Orange for client errors
    if (status >= 500) return '#F44336'; // Red for server errors
    return '#757575'; // Grey for unknown
  };

  // Format response time
  const formatResponseTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  // Format response size
  const formatResponseSize = (size: number) => {
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`;
    return `${(size / (1024 * 1024)).toFixed(2)}MB`;
  };

  // Format response body based on content type
  const formatResponseBody = (body: string, contentType: string) => {
    if (contentType.includes('application/json')) {
      try {
        const jsonObj = JSON.parse(body);
        return JSON.stringify(jsonObj, null, 2);
      } catch (e) {
        return body;
      }
    }
    return body;
  };

  return (
    <RequestContainer>
      {/* Browser Tabs */}
      <BrowserTabsContainer>
        {browserTabs.map((tab) => (
          <BrowserTab
            key={tab.id}
            active={tab.active}
            onClick={() => handleSelectTab(tab.id)}
          >
            <Typography
              variant="body2"
              noWrap
              sx={{ flex: 1, fontWeight: tab.active ? 'bold' : 'normal' }}
            >
              {tab.name}
            </Typography>
            <IconButton
              size="small"
              onClick={(e) => handleCloseTab(tab.id, e)}
              sx={{ ml: 1, p: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </BrowserTab>
        ))}
        <NewTabButton onClick={handleAddTab}>
          <AddCircleOutlineIcon fontSize="small" />
        </NewTabButton>
        <NewTabButton onClick={toggleCurlInput}>
          <ImportExportIcon fontSize="small" />
        </NewTabButton>
        {onImportCurl && (
          <NewTabButton onClick={onImportCurl}>
            <OpenInBrowserIcon fontSize="small" />
          </NewTabButton>
        )}
      </BrowserTabsContainer>

      {/* cURL Input */}
      {showCurlInput && (
        <Box sx={{ display: 'flex', p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Paste cURL command here"
            value={curlInputValue}
            onChange={(e) => setCurlInputValue(e.target.value)}
            inputRef={curlInputRef}
            sx={{ mr: 1 }}
            InputProps={{
              sx: { fontFamily: 'monospace', fontSize: '0.875rem' }
            }}
          />
          <Button
            variant="contained"
            onClick={handleImportCurl}
            disabled={!curlInputValue.trim()}
          >
            Import
          </Button>
        </Box>
      )}
      {/* URL Bar */}
      <UrlBar>
        <FormControl size="small" sx={{ width: 120, mr: 1 }}>
          <Select
            value={editedRequest.method}
            onChange={(e) => handleRequestChange('method', e.target.value)}
            disabled={disabled || loading}
            sx={{ height: '40px' }}
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
          disabled={disabled || loading}
          sx={{ mr: 1 }}
          InputProps={{
            sx: { height: '40px' }
          }}
        />

        <Tooltip title="Save">
          <IconButton
            onClick={handleSave}
            disabled={disabled || loading}
            sx={{ mr: 1 }}
          >
            <SaveIcon />
          </IconButton>
        </Tooltip>

        <SendButton
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          onClick={handleRun}
          disabled={disabled || loading}
        >
          {loading ? 'Sending...' : 'Send'}
        </SendButton>
      </UrlBar>

      {/* Request Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Params" />
          <Tab label="Authorization" />
          <Tab label="Headers" />
          <Tab label="Body" />
          <Tab label="Tests" />
          <Tab label="Settings" />
          <Tab label="Cookies" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Params Tab */}
        {activeTab === 0 && (
          <TabPanel>
            <Typography variant="subtitle1" gutterBottom>
              Query Params
            </Typography>
            <KeyValueEditor
              pairs={editedRequest.params}
              onChange={(params) => handleRequestChange('params', params)}
              disabled={disabled || loading}
              type="params"
            />
          </TabPanel>
        )}

        {/* Authorization Tab */}
        {activeTab === 1 && (
          <TabPanel>
            <Typography variant="subtitle1" gutterBottom>
              Authorization
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value="bearer"
                label="Type"
                disabled={disabled || loading}
              >
                <MenuItem value="none">No Auth</MenuItem>
                <MenuItem value="basic">Basic Auth</MenuItem>
                <MenuItem value="bearer">Bearer Token</MenuItem>
                <MenuItem value="oauth2">OAuth 2.0</MenuItem>
                <MenuItem value="apikey">API Key</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Token"
              placeholder="Enter your token here"
              disabled={disabled || loading}
              sx={{ mb: 2 }}
            />

            <Typography variant="caption" color="text.secondary">
              This authorization will be automatically added to the request headers.
            </Typography>
          </TabPanel>
        )}

        {/* Headers Tab */}
        {activeTab === 2 && (
          <TabPanel>
            <Typography variant="subtitle1" gutterBottom>
              Headers
            </Typography>
            <KeyValueEditor
              pairs={editedRequest.headers}
              onChange={(headers) => handleRequestChange('headers', headers)}
              disabled={disabled || loading}
              type="headers"
            />
          </TabPanel>
        )}

        {/* Body Tab */}
        {activeTab === 3 && (
          <TabPanel>
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={editedRequest.headers.find(h => h.key.toLowerCase() === 'content-type')?.value || 'application/json'}
                  label="Content Type"
                  onChange={(e) => {
                    // Update or add Content-Type header
                    const headerIndex = editedRequest.headers.findIndex(h => h.key.toLowerCase() === 'content-type');
                    const newHeaders = [...editedRequest.headers];

                    if (headerIndex >= 0) {
                      newHeaders[headerIndex].value = e.target.value as string;
                    } else {
                      newHeaders.push({ key: 'Content-Type', value: e.target.value as string, enabled: true });
                    }

                    handleRequestChange('headers', newHeaders);
                  }}
                  disabled={disabled || loading}
                >
                  <MenuItem value="application/json">JSON</MenuItem>
                  <MenuItem value="application/x-www-form-urlencoded">Form URL Encoded</MenuItem>
                  <MenuItem value="multipart/form-data">Form Data</MenuItem>
                  <MenuItem value="text/plain">Plain Text</MenuItem>
                  <MenuItem value="application/xml">XML</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                rows={10}
                placeholder={getBodyPlaceholder(editedRequest.headers)}
                value={editedRequest.body}
                onChange={(e) => handleRequestChange('body', e.target.value)}
                disabled={disabled || loading}
                InputProps={{
                  sx: {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
            </Box>
          </TabPanel>
        )}

        {/* Tests Tab */}
        {activeTab === 4 && (
          <TabPanel>
            <Typography variant="subtitle1" gutterBottom>
              Tests
            </Typography>
            {editedRequest.tests.map((test, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Test Name"
                  placeholder="Status code is 200"
                  value={test.name}
                  onChange={(e) => {
                    const newTests = [...editedRequest.tests];
                    newTests[index].name = e.target.value;
                    handleRequestChange('tests', newTests);
                  }}
                  disabled={disabled || loading}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Test Script"
                  placeholder="pm.test('Status code is 200', function() { pm.response.to.have.status(200); });"
                  value={test.script}
                  onChange={(e) => {
                    const newTests = [...editedRequest.tests];
                    newTests[index].script = e.target.value;
                    handleRequestChange('tests', newTests);
                  }}
                  disabled={disabled || loading}
                  InputProps={{
                    sx: {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                const newTests = [...editedRequest.tests, { name: '', script: '' }];
                handleRequestChange('tests', newTests);
              }}
              disabled={disabled || loading}
              variant="outlined"
              size="small"
            >
              Add Test
            </Button>
          </TabPanel>
        )}

        {/* Settings Tab */}
        {activeTab === 5 && (
          <TabPanel>
            <Typography variant="subtitle1" gutterBottom>
              Request Settings
            </Typography>
            <FormControlLabel
              control={<Switch />}
              label="Follow redirects"
              disabled={disabled || loading}
            />
            <FormControlLabel
              control={<Switch />}
              label="Enable SSL certificate verification"
              disabled={disabled || loading}
            />
          </TabPanel>
        )}

        {/* Cookies Tab */}
        {activeTab === 6 && (
          <TabPanel>
            <Typography variant="subtitle1" gutterBottom>
              Cookies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cookies will be automatically sent with the request based on domain and path.
            </Typography>
          </TabPanel>
        )}
      </Box>

      {/* Response Section */}
      <ResponseContainer>
        <ResponseHeader>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 1 }}>
              Response
            </Typography>
            <IconButton size="small" onClick={() => setResponseExpanded(!responseExpanded)}>
              {responseExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          {response && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 'bold',
                  color: getStatusColor(response.status),
                  mr: 2
                }}
              >
                Status: {response.status} {response.statusText}
              </Typography>

              <Typography variant="body2" sx={{ mr: 2 }}>
                Time: {formatResponseTime(response.time)}
              </Typography>

              <Typography variant="body2">
                Size: {formatResponseSize(response.size)}
              </Typography>
            </Box>
          )}
        </ResponseHeader>

        <Collapse in={responseExpanded}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : response ? (
            <Box>
              <Tabs value={0} variant="scrollable" scrollButtons="auto">
                <Tab label="Body" />
                <Tab label="Headers" />
                <Tab label="Cookies" />
                <Tab label="Test Results" />
              </Tabs>

              <ResponseBody>
                {formatResponseBody(response.body, response.headers['content-type'] || '')}
              </ResponseBody>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Send a request to see the response
              </Typography>
            </Box>
          )}
        </Collapse>
      </ResponseContainer>
    </RequestContainer>
  );
};

export default PostmanStyleRequestEditor;
