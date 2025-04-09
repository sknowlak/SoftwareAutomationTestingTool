import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import HttpIcon from '@mui/icons-material/Http';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CodeIcon from '@mui/icons-material/Code';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import PublicIcon from '@mui/icons-material/Public';
import CollectionsIcon from '@mui/icons-material/Collections';
import ImportDialog from './ImportDialog';
import RequestEditorComponent from './RequestEditor';

import {
  ApiCollection,
  ApiRequest,
  ApiResponse,
  ApiEnvironment,
  KeyValuePair
} from '../../types/apiTypes';
import {
  getAllApiCollections,
  saveApiCollection,
  getAllEnvironments,
  saveEnvironment
} from '../../services/fileSystemService';

// Request Methods with colors
const REQUEST_METHODS = [
  { method: 'GET', color: '#61affe' },
  { method: 'POST', color: '#49cc90' },
  { method: 'PUT', color: '#fca130' },
  { method: 'DELETE', color: '#f93e3e' },
  { method: 'PATCH', color: '#50e3c2' },
  { method: 'HEAD', color: '#9012fe' },
  { method: 'OPTIONS', color: '#0d5aa7' }
];

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
  const [showCurl, setShowCurl] = useState(false);
  const [curlCommand, setCurlCommand] = useState('');

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
            {REQUEST_METHODS.map((method) => (
              <MenuItem key={method.method} value={method.method}>
                <Box sx={{ color: method.color, fontWeight: 'bold' }}>
                  {method.method}
                </Box>
              </MenuItem>
            ))}
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
                <Typography variant="subtitle2">cURL Command</Typography>
                <Tooltip title="Copy to clipboard">
                  <IconButton size="small">
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                value="curl -X GET 'https://api.example.com'"
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

// Component for response viewer
const ResponseViewer: React.FC<{
  response: ApiResponse | null;
}> = ({ response }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!response) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Send a request to see the response
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="body1"
          sx={{
            color:
              response.statusCode >= 200 && response.statusCode < 300
                ? 'success.main'
                : response.statusCode >= 400
                ? 'error.main'
                : 'warning.main',
            fontWeight: 'bold',
            mr: 2
          }}
        >
          Status: {response.statusCode} {response.statusText}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
          Time: {response.time}ms
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Size: {response.size} bytes
        </Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Body" />
          <Tab label="Headers" />
          <Tab label="Test Results" />
        </Tabs>

        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderTop: 0 }}>
          {activeTab === 0 && (
            <TextField
              fullWidth
              multiline
              rows={15}
              value={response.body}
              InputProps={{ readOnly: true }}
            />
          )}
          {activeTab === 1 && (
            <List dense>
              {response.headers.map((header, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={header.key}
                    secondary={header.value}
                  />
                </ListItem>
              ))}
            </List>
          )}
          {activeTab === 2 && (
            <List dense>
              {response.testResults?.map((result, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {result.passed ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <DeleteIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={result.name}
                    secondary={result.error}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Main API Workspace component
const ApiWorkspace: React.FC = () => {
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<ApiCollection | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // New state variables for additional features
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'collection' | 'request', id: string } | null>(null);
  const [collectionMenuAnchor, setCollectionMenuAnchor] = useState<null | HTMLElement>(null);
  const [requestMenuAnchor, setRequestMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Load collections and environments
  useEffect(() => {
    const loadData = () => {
      const loadedCollections = getAllApiCollections();
      const loadedEnvironments = getAllEnvironments();

      setCollections(loadedCollections);
      setEnvironments(loadedEnvironments);

      if (loadedCollections.length > 0) {
        setSelectedCollection(loadedCollections[0]);

        if (loadedCollections[0].requests.length > 0) {
          setSelectedRequest(loadedCollections[0].requests[0]);
        }
      }

      if (loadedEnvironments.length > 0) {
        setSelectedEnvironment(loadedEnvironments[0].id);
      }
    };

    loadData();
  }, []);

  // Handle collection selection
  const handleCollectionSelect = (collection: ApiCollection) => {
    setSelectedCollection(collection);

    if (collection.requests.length > 0) {
      setSelectedRequest(collection.requests[0]);
    } else {
      setSelectedRequest(null);
    }
  };

  // Handle request selection
  const handleRequestSelect = (request: ApiRequest) => {
    setSelectedRequest(request);
    setResponse(null);
  };

  // Handle environment selection
  const handleEnvironmentChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedEnvironment(event.target.value as string);
  };

  // Handle request save
  const handleRequestSave = (updatedRequest: ApiRequest) => {
    if (!selectedCollection) return;

    const updatedCollection = { ...selectedCollection };
    const requestIndex = updatedCollection.requests.findIndex(r => r.id === updatedRequest.id);

    if (requestIndex >= 0) {
      updatedCollection.requests[requestIndex] = updatedRequest;
    } else {
      updatedCollection.requests.push(updatedRequest);
    }

    saveApiCollection(updatedCollection);
    setSelectedCollection(updatedCollection);
    setSelectedRequest(updatedRequest);

    // Update collections list
    const collectionsIndex = collections.findIndex(c => c.id === updatedCollection.id);
    if (collectionsIndex >= 0) {
      const updatedCollections = [...collections];
      updatedCollections[collectionsIndex] = updatedCollection;
      setCollections(updatedCollections);
    }
  };

  // Handle request run
  const handleRequestRun = async (request: ApiRequest) => {
    setLoading(true);

    try {
      // In a real app, this would make an actual HTTP request
      // For this demo, we'll simulate a response

      // Apply environment variables
      let processedUrl = request.url;
      let processedHeaders = [...request.headers];
      let processedBody = request.body;

      if (selectedEnvironment) {
        const environment = environments.find(e => e.id === selectedEnvironment);

        if (environment) {
          environment.variables.forEach(variable => {
            const regex = new RegExp(`{{${variable.key}}}`, 'g');
            processedUrl = processedUrl.replace(regex, variable.value);

            processedHeaders = processedHeaders.map(header => ({
              ...header,
              value: header.value.replace(regex, variable.value)
            }));

            processedBody = processedBody.replace(regex, variable.value);
          });
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate mock response
      const mockResponse: ApiResponse = {
        statusCode: 200,
        statusText: 'OK',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
          { key: 'Server', value: 'Betaboss Mock Server' },
          { key: 'Date', value: new Date().toUTCString() }
        ],
        body: JSON.stringify({ message: 'Success', data: { id: '123', name: 'Test' } }, null, 2),
        time: Math.floor(Math.random() * 500) + 100,
        size: Math.floor(Math.random() * 1000) + 500,
        testResults: request.tests.map(test => ({
          name: test.name,
          passed: Math.random() > 0.2, // 80% chance of passing
          error: Math.random() > 0.2 ? undefined : 'Test assertion failed'
        }))
      };

      setResponse(mockResponse);
    } catch (error) {
      console.error('Error running request:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle new collection
  const handleNewCollection = () => {
    const newCollection: ApiCollection = {
      id: `COL${Date.now()}`,
      name: 'New Collection',
      description: 'New API collection',
      requests: []
    };

    saveApiCollection(newCollection);
    setCollections([...collections, newCollection]);
    setSelectedCollection(newCollection);
    setSelectedRequest(null);
  };

  // Handle new request
  const handleNewRequest = () => {
    if (!selectedCollection) return;

    const newRequest: ApiRequest = {
      id: `REQ${Date.now()}`,
      name: 'New Request',
      url: 'https://api.example.com',
      method: 'GET',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      params: [],
      body: '',
      tests: [{ name: 'Status code is 200', script: 'pm.test("Status code is 200", function() { pm.response.to.have.status(200); });' }]
    };

    const updatedCollection = { ...selectedCollection };
    updatedCollection.requests.push(newRequest);

    saveApiCollection(updatedCollection);
    setSelectedCollection(updatedCollection);
    setSelectedRequest(newRequest);

    // Update collections list
    const collectionsIndex = collections.findIndex(c => c.id === updatedCollection.id);
    if (collectionsIndex >= 0) {
      const updatedCollections = [...collections];
      updatedCollections[collectionsIndex] = updatedCollection;
      setCollections(updatedCollections);
    }
  };

  // Handle collection menu open
  const handleCollectionMenuOpen = (event: React.MouseEvent<HTMLElement>, collectionId: string) => {
    event.stopPropagation();
    setCollectionMenuAnchor(event.currentTarget);
    setActiveCollectionId(collectionId);
  };

  // Handle collection menu close
  const handleCollectionMenuClose = () => {
    setCollectionMenuAnchor(null);
    setActiveCollectionId(null);
  };

  // Handle request menu open
  const handleRequestMenuOpen = (event: React.MouseEvent<HTMLElement>, requestId: string) => {
    event.stopPropagation();
    setRequestMenuAnchor(event.currentTarget);
    setActiveRequestId(requestId);
  };

  // Handle request menu close
  const handleRequestMenuClose = () => {
    setRequestMenuAnchor(null);
    setActiveRequestId(null);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = (type: 'collection' | 'request', id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
    handleCollectionMenuClose();
    handleRequestMenuClose();
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'collection') {
      // Delete collection
      const updatedCollections = collections.filter(c => c.id !== itemToDelete.id);
      setCollections(updatedCollections);

      // If the deleted collection was selected, clear selection
      if (selectedCollection?.id === itemToDelete.id) {
        setSelectedCollection(updatedCollections.length > 0 ? updatedCollections[0] : null);
        setSelectedRequest(null);
      }

      // Show success message
      setSnackbarMessage('Collection deleted successfully');
      setSnackbarOpen(true);
    } else {
      // Delete request
      if (!selectedCollection) return;

      const updatedCollection = { ...selectedCollection };
      updatedCollection.requests = updatedCollection.requests.filter(r => r.id !== itemToDelete.id);

      saveApiCollection(updatedCollection);
      setSelectedCollection(updatedCollection);

      // If the deleted request was selected, clear selection
      if (selectedRequest?.id === itemToDelete.id) {
        setSelectedRequest(updatedCollection.requests.length > 0 ? updatedCollection.requests[0] : null);
      }

      // Update collections list
      const collectionsIndex = collections.findIndex(c => c.id === updatedCollection.id);
      if (collectionsIndex >= 0) {
        const updatedCollections = [...collections];
        updatedCollections[collectionsIndex] = updatedCollection;
        setCollections(updatedCollections);
      }

      // Show success message
      setSnackbarMessage('Request deleted successfully');
      setSnackbarOpen(true);
    }

    handleDeleteDialogClose();
  };

  // Handle import dialog open
  const handleImportDialogOpen = () => {
    setImportDialogOpen(true);
  };

  // Handle import dialog close
  const handleImportDialogClose = () => {
    setImportDialogOpen(false);
  };

  // Handle import request
  const handleImportRequest = (request: ApiRequest) => {
    if (!selectedCollection) {
      // Create a new collection if none is selected
      const newCollection: ApiCollection = {
        id: `COL${Date.now()}`,
        name: 'Imported Collection',
        description: 'Collection created from imported request',
        requests: [request]
      };

      saveApiCollection(newCollection);
      setCollections([...collections, newCollection]);
      setSelectedCollection(newCollection);
      setSelectedRequest(request);

      // Show success message
      setSnackbarMessage('Request imported to new collection');
      setSnackbarOpen(true);
    } else {
      // Add to selected collection
      const updatedCollection = { ...selectedCollection };
      updatedCollection.requests.push(request);

      saveApiCollection(updatedCollection);
      setSelectedCollection(updatedCollection);
      setSelectedRequest(request);

      // Update collections list
      const collectionsIndex = collections.findIndex(c => c.id === updatedCollection.id);
      if (collectionsIndex >= 0) {
        const updatedCollections = [...collections];
        updatedCollections[collectionsIndex] = updatedCollection;
        setCollections(updatedCollections);
      }

      // Show success message
      setSnackbarMessage('Request imported successfully');
      setSnackbarOpen(true);
    }
  };

  // Handle import collection
  const handleImportCollection = (collection: ApiCollection) => {
    saveApiCollection(collection);
    setCollections([...collections, collection]);
    setSelectedCollection(collection);

    if (collection.requests.length > 0) {
      setSelectedRequest(collection.requests[0]);
    } else {
      setSelectedRequest(null);
    }

    // Show success message
    setSnackbarMessage('Collection imported successfully');
    setSnackbarOpen(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        API Testing
      </Typography>

      {/* Import Dialog */}
      <ImportDialog
        open={importDialogOpen}
        onClose={handleImportDialogClose}
        onImportRequest={handleImportRequest}
        onImportCollection={handleImportCollection}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>
          {itemToDelete?.type === 'collection' ? 'Delete Collection' : 'Delete Request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={2}>
        {/* Left sidebar - Collections */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Collections</Typography>
              <Box>
                <Tooltip title="Import from cURL or Swagger">
                  <IconButton onClick={handleImportDialogOpen}>
                    <ImportExportIcon />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={handleNewCollection}>
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            <List>
              {collections.map((collection) => (
                <React.Fragment key={collection.id}>
                  <ListItem
                    button
                    selected={selectedCollection?.id === collection.id}
                    onClick={() => handleCollectionSelect(collection)}
                  >
                    <ListItemIcon>
                      <CollectionsIcon />
                    </ListItemIcon>
                    <ListItemText primary={collection.name} />
                    <IconButton
                      size="small"
                      onClick={(e) => handleCollectionMenuOpen(e, collection.id)}
                      aria-label="collection options"
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </ListItem>

                  {selectedCollection?.id === collection.id && (
                    <List component="div" disablePadding>
                      {collection.requests.map((request) => (
                        <ListItem
                          key={request.id}
                          button
                          selected={selectedRequest?.id === request.id}
                          onClick={() => handleRequestSelect(request)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon>
                            <HttpIcon sx={{
                              color: REQUEST_METHODS.find(m => m.method === request.method)?.color
                            }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={decodeURIComponent(request.name)}
                            secondary={request.method + ' ' + (request.url.length > 20 ? request.url.substring(0, 20) + '...' : request.url)}
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => handleRequestMenuOpen(e, request.id)}
                            aria-label="request options"
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </ListItem>
                      ))}

                      <ListItem
                        button
                        onClick={handleNewRequest}
                        sx={{ pl: 4 }}
                      >
                        <ListItemIcon>
                          <AddIcon />
                        </ListItemIcon>
                        <ListItemText primary="New Request" />
                      </ListItem>
                    </List>
                  )}
                </React.Fragment>
              ))}

              {collections.length === 0 && (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No collections found
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<ImportExportIcon />}
                    onClick={handleImportDialogOpen}
                    size="small"
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Import
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleNewCollection}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Create New
                  </Button>
                </Box>
              )}
            </List>

            {/* Collection Menu */}
            <Menu
              anchorEl={collectionMenuAnchor}
              open={Boolean(collectionMenuAnchor)}
              onClose={handleCollectionMenuClose}
            >
              <MenuItem onClick={() => {
                const collection = collections.find(c => c.id === activeCollectionId);
                if (collection) {
                  handleCollectionSelect(collection);
                  handleNewRequest();
                }
                handleCollectionMenuClose();
              }}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add Request</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                if (activeCollectionId) {
                  handleDeleteDialogOpen('collection', activeCollectionId);
                }
              }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete Collection</ListItemText>
              </MenuItem>
            </Menu>

            {/* Request Menu */}
            <Menu
              anchorEl={requestMenuAnchor}
              open={Boolean(requestMenuAnchor)}
              onClose={handleRequestMenuClose}
            >
              <MenuItem onClick={() => {
                const collection = collections.find(c => c.id === selectedCollection?.id);
                const request = collection?.requests.find(r => r.id === activeRequestId);
                if (request) {
                  handleRequestSelect(request);
                }
                handleRequestMenuClose();
              }}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit Request</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => {
                if (activeRequestId) {
                  handleDeleteDialogOpen('request', activeRequestId);
                }
              }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Delete Request</ListItemText>
              </MenuItem>
            </Menu>
          </Paper>
        </Grid>

        {/* Main content - Request/Response */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {selectedRequest ? selectedRequest.name : 'Request'}
              </Typography>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Environment</InputLabel>
                <Select
                  value={selectedEnvironment}
                  label="Environment"
                  onChange={handleEnvironmentChange as any}
                >
                  {environments.map((env) => (
                    <MenuItem key={env.id} value={env.id}>
                      {env.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {selectedRequest ? (
              <RequestEditorComponent
                request={selectedRequest}
                onSave={handleRequestSave}
                onRun={handleRequestRun}
                onImportCurl={() => setImportDialogOpen(true)}
                disabled={loading}
              />
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Select a request from the sidebar or create a new one
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Response
            </Typography>

            <ResponseViewer response={response} />
          </Paper>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApiWorkspace;
