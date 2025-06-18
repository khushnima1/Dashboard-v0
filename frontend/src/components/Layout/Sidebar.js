import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  DeviceHub as DeviceIcon,
  Battery90 as BatteryIcon,
  DirectionsRun as MovementIcon,
  Timeline as AnalyticsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 280;

const menuItems = [
  { text: 'Main Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Devices', icon: <DeviceIcon />, path: '/devices' },
  { text: 'Battery Dashboard', icon: <BatteryIcon />, path: '/battery' },
  { text: 'Movement Dashboard', icon: <MovementIcon />, path: '/movement' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open }) => {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      }}
      open={open}
    >
      <Toolbar sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BatteryIcon sx={{ color: '#fff' }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              letterSpacing: '-0.025em',
            }}
          >
            BatteryMS
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ px: 2, mb: 2 }}>
        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            letterSpacing: '0.05em',
          }}
        >
          MAIN MENU
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: isActive ? 'primary.main' : 'transparent',
                color: isActive ? 'white' : 'text.primary',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive ? 'white' : 'primary.main',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar; 