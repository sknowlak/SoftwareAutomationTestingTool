import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material'
import { Link } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import SettingsIcon from '@mui/icons-material/Settings'

interface SidebarProps {
  open: boolean
}

const Sidebar = ({ open }: SidebarProps) => {
  const drawerWidth = open ? 240 : 60

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: 'width 0.2s',
          overflowX: 'hidden',
        },
      }}
    >
      <Toolbar />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Dashboard" />}
        </ListItem>
        <ListItem button component={Link} to="/recorder">
          <ListItemIcon>
            <VideoCallIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Recorder" />}
        </ListItem>
        <ListItem button component={Link} to="/test-cases">
          <ListItemIcon>
            <PlaylistPlayIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Test Cases" />}
        </ListItem>
        <ListItem button component={Link} to="/test-runs">
          <ListItemIcon>
            <PlayArrowIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Test Runs" />}
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/settings">
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          {open && <ListItemText primary="Settings" />}
        </ListItem>
      </List>
    </Drawer>
  )
}

export default Sidebar
