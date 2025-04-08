import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { initializeFileSystem, getBasePath } from '../../services/fileSystemService';

interface PathSelectorProps {
  onPathSelected: (path: string) => void;
  open: boolean;
}

const PathSelector: React.FC<PathSelectorProps> = ({ onPathSelected, open }) => {
  const [path, setPath] = useState('C:/Betaboss');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePathChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPath(event.target.value);
    setError(null);
  };

  const handleBrowse = () => {
    // In a real app, this would open a file browser dialog
    // For this demo, we'll just simulate it
    alert('In a real app, this would open a file browser dialog');
  };

  const handleConfirm = () => {
    if (!path) {
      setError('Please enter a valid path');
      return;
    }

    setLoading(true);
    
    try {
      // Initialize the file system with the selected path
      initializeFileSystem(path);
      
      setSuccess(true);
      setError(null);
      
      // Wait a bit to show the success message
      setTimeout(() => {
        onPathSelected(path);
      }, 1500);
    } catch (err) {
      setError(`Failed to initialize file system: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5">Select Storage Location</Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Typography variant="body1" paragraph>
            Betaboss needs a location on your system to store test data, API collections, and other files.
            Please select a directory where you want to store this data.
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Success</AlertTitle>
              Storage location set successfully! Initializing Betaboss...
            </Alert>
          )}
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Storage Location
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                fullWidth
                label="Path"
                variant="outlined"
                value={path}
                onChange={handlePathChange}
                disabled={loading || success}
                sx={{ mr: 2 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<FolderIcon />}
                onClick={handleBrowse}
                disabled={loading || success}
              >
                Browse
              </Button>
            </Box>
            
            <Typography variant="body2" color="text.secondary">
              A folder named "Betaboss" will be created at this location if it doesn't exist.
              All application data will be stored in this folder.
            </Typography>
          </Paper>
          
          <Typography variant="body2" color="text.secondary">
            You can change this location later in the application settings.
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={loading || success || !path}
          startIcon={loading ? <CircularProgress size={20} /> : success ? <CheckCircleIcon /> : null}
        >
          {loading ? 'Initializing...' : success ? 'Initialized' : 'Confirm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PathSelector;
