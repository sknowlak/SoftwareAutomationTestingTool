import { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  Alert, 
  Collapse, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Menu, 
  MenuItem, 
  Tabs, 
  Tab 
} from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import StopIcon from '@mui/icons-material/Stop';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import CodeIcon from '@mui/icons-material/Code';
import UploadIcon from '@mui/icons-material/Upload';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CollectionsIcon from '@mui/icons-material/Collections';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

import TestGenerator from '../testGenerator/TestGenerator';
import MultiScreenshotTestGenerator from '../testGenerator/MultiScreenshotTestGenerator';

interface ScreenRecorderProps {
  targetSelector?: string; // CSS selector for the element to record (default: document.body)
  onRecordingComplete?: (blob: Blob) => void;
}

const ScreenRecorder: React.FC<ScreenRecorderProps> = ({
  targetSelector = 'body',
  onRecordingComplete
}) => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [showTestGenerator, setShowTestGenerator] = useState(false);
  const [testName, setTestName] = useState('');
  const [testType, setTestType] = useState<'playwright' | 'pytest' | 'cypress'>('playwright');
  const [screenshotMenuAnchor, setScreenshotMenuAnchor] = useState<null | HTMLElement>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showMultiScreenshotDialog, setShowMultiScreenshotDialog] = useState(false);
  const [testGenerationMode, setTestGenerationMode] = useState<'video' | 'screenshots'>('video');
  const [tabValue, setTabValue] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      setSuccess(null);
      setRecordedChunks([]);

      // Get the screen to record
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Create a new MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      // Handle data available event
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };

      // Handle recording stop
      recorder.onstop = () => {
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        setRecording(false);
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        setSuccess('Recording completed successfully');
      };

      // Start recording
      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setRecording(true);
      
      // Start timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setSuccess('Recording started. Perform the actions you want to record.');
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Make sure you have granted screen recording permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
    }
  };

  const saveRecording = () => {
    if (recordedChunks.length === 0) {
      setError('No recording to save');
      return;
    }

    try {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      setVideoBlob(blob);
      
      // Call the callback if provided
      if (onRecordingComplete) {
        onRecordingComplete(blob);
      }
      
      // Save the file
      const fileName = `screen-recording-${new Date().toISOString().replace(/[:.]/g, '-')}.webm`;
      saveAs(blob, fileName);
      
      setSuccess(`Recording saved as ${fileName}`);
      
      // Display the recording in the video element
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(blob);
      }
      
      // Generate a default test name based on timestamp
      if (!testName) {
        setTestName(`Test_${new Date().toISOString().substring(0, 10)}`);
      }
    } catch (err) {
      console.error('Error saving recording:', err);
      setError('Failed to save recording');
    }
  };

  const handleScreenshotMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setScreenshotMenuAnchor(event.currentTarget);
  };

  const handleScreenshotMenuClose = () => {
    setScreenshotMenuAnchor(null);
  };

  const takeScreenshot = async () => {
    try {
      setError(null);
      setSuccess(null);
      handleScreenshotMenuClose();
      
      // Get the target element
      const targetElement = document.querySelector(targetSelector) || document.body;
      
      // Take screenshot using html2canvas
      const canvas = await html2canvas(targetElement as HTMLElement);
      
      // Convert to blob
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          // Save the file
          const fileName = `screenshot-${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
          saveAs(blob, fileName);
          setSuccess(`Screenshot saved as ${fileName}`);

          // Create a preview URL
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          const newPreviewUrl = URL.createObjectURL(blob);
          setPreviewUrl(newPreviewUrl);
        } else {
          setError('Failed to create screenshot');
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error taking screenshot:', err);
      setError('Failed to take screenshot');
    }
  };

  const handleUploadScreenshot = () => {
    handleScreenshotMenuClose();
    setShowUploadDialog(true);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      // Create a preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      
      setSuccess(`Screenshot uploaded: ${file.name}`);
    }
    setShowUploadDialog(false);
  };

  const handleUploadDialogClose = () => {
    setShowUploadDialog(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateTest = () => {
    if (testGenerationMode === 'video') {
      if (videoBlob) {
        setShowTestGenerator(true);
      } else {
        setError('No recording available. Please record and save your screen first.');
      }
    } else {
      setShowMultiScreenshotDialog(true);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setTestGenerationMode(newValue === 0 ? 'video' : 'screenshots');
  };

  const handleCloseMultiScreenshotDialog = () => {
    setShowMultiScreenshotDialog(false);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="test generation mode">
          <Tab label="Record Video" icon={<VideocamIcon />} iconPosition="start" />
          <Tab label="Multiple Screenshots" icon={<CollectionsIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Typography variant="h6" gutterBottom>
          Screen Recording
        </Typography>
      )}

      {tabValue === 1 && (
        <Typography variant="h6" gutterBottom>
          Screenshot-Based Testing
        </Typography>
      )}

      {tabValue === 0 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {!recording ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<VideocamIcon />}
              onClick={startRecording}
            >
              Start Recording
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopRecording}
            >
              Stop Recording ({formatTime(recordingTime)})
            </Button>
          )}

          <Box sx={{ position: 'relative' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PhotoCameraIcon />}
              onClick={handleScreenshotMenuOpen}
              disabled={recording}
              endIcon={<ArrowDropDownIcon />}
            >
              Screenshot
            </Button>
            <Menu
              anchorEl={screenshotMenuAnchor}
              open={Boolean(screenshotMenuAnchor)}
              onClose={handleScreenshotMenuClose}
            >
              <MenuItem onClick={takeScreenshot}>
                <PhotoCameraIcon fontSize="small" sx={{ mr: 1 }} />
                Capture Screen
              </MenuItem>
              <MenuItem onClick={handleUploadScreenshot}>
                <UploadIcon fontSize="small" sx={{ mr: 1 }} />
                Upload from Storage
              </MenuItem>
            </Menu>
          </Box>

          <Button
            variant="outlined"
            color="secondary"
            startIcon={<SaveIcon />}
            onClick={saveRecording}
            disabled={recording || recordedChunks.length === 0}
          >
            Save Recording
          </Button>

          <Button
            variant="outlined"
            color="info"
            startIcon={<CodeIcon />}
            onClick={handleGenerateTest}
            disabled={recording || !videoBlob}
          >
            Generate Test
          </Button>
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CollectionsIcon />}
            onClick={handleGenerateTest}
          >
            Start Screenshot-Based Testing
          </Button>
        </Box>
      )}

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

      {recordedChunks.length > 0 && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Preview:
          </Typography>
          <video
            ref={videoRef}
            controls
            style={{ maxWidth: '100%', maxHeight: '300px', border: '1px solid #ccc' }}
          />
        </Box>
      )}

      {/* File input for screenshot upload */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileInputChange}
      />

      {/* Upload dialog */}
      <Dialog open={showUploadDialog} onClose={handleUploadDialogClose}>
        <DialogTitle>Upload Screenshot</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Select an image file from your system to use as a screenshot.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={triggerFileInput}
            >
              Choose File
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Screenshot preview */}
      {previewUrl && (
        <Box sx={{ mt: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Screenshot Preview:
          </Typography>
          <Box
            component="img"
            src={previewUrl}
            alt="Screenshot"
            sx={{
              maxWidth: '100%',
              maxHeight: '300px',
              border: '1px solid #ccc',
              borderRadius: 1
            }}
          />
        </Box>
      )}

      <Collapse in={showTestGenerator && testGenerationMode === 'video'}>
        {videoBlob && (
          <Box sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <TestGenerator
              videoBlob={videoBlob}
              testName={testName || `Test_${new Date().toISOString().substring(0, 10)}`}
              testType={testType}
            />
          </Box>
        )}
      </Collapse>

      {/* Multi-screenshot test generator dialog */}
      <Dialog
        open={showMultiScreenshotDialog}
        onClose={handleCloseMultiScreenshotDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Screenshot-Based Test Generator</DialogTitle>
        <DialogContent>
          <MultiScreenshotTestGenerator
            testName={testName || `Test_${new Date().toISOString().substring(0, 10)}`}
            testType={testType}
            onComplete={() => setShowMultiScreenshotDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ScreenRecorder;
