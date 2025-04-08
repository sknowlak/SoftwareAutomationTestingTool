import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab
} from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CodeIcon from '@mui/icons-material/Code';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import EmailIcon from '@mui/icons-material/Email';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Import the TestStatusDashboard component
import TestStatusDashboard from './TestStatusDashboard';
// import TestReportsDashboard from './TestReportsDashboard';


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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

interface DashboardProps {
  onNavigate: (module: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome to Betaboss
          </Typography>

          <Typography variant="subtitle1" color="text.secondary">
            Your all-in-one web automation testing platform. Create, manage, and run tests with ease.
          </Typography>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<AssessmentIcon />} label="Test Status" />
          <Tab icon={<AssessmentIcon />} label="Reports & Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Quick Actions */}
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <VideoCallIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Screen Recording</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Record your screen and generate test cases automatically from your actions.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => onNavigate('recorder')}
                    >
                      Start Recording
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhotoCameraIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Screenshot Tests</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Capture screenshots and generate test cases based on the visual content.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => onNavigate('screenshot')}
                    >
                      Create Tests
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CodeIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Lead Form Tests</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Generate specialized test cases for lead forms and CRM applications.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => onNavigate('direct')}
                    >
                      Generate Tests
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PlayArrowIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Run Tests</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Execute your test cases and view detailed reports of the results.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => onNavigate('testRuns')}
                    >
                      Run Tests
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmailIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6">Gmail Reports</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Receive test reports via Gmail SMTP, immediately or on a schedule.
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => onNavigate('reporting')}
                    >
                      Configure Reports
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Lead Form Test Generated"
                    secondary="Today, 10:30 AM"
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Screenshot Test Generated"
                    secondary="Today, 9:15 AM"
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem>
                  <ListItemIcon>
                    <ErrorIcon color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Test Run Failed"
                    secondary="Yesterday, 4:45 PM"
                  />
                </ListItem>

                <Divider component="li" />

                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Screen Recording Completed"
                    secondary="Yesterday, 2:30 PM"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Test Status Dashboard
          </Typography>
          <Typography variant="body1">
            This feature requires the recharts library to be properly installed. Please check the console for more information.
          </Typography>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Test Reports & Analytics
          </Typography>
          <TestStatusDashboard />
        </Box>
      </TabPanel>
    </Box>
  );
};

export default Dashboard;
