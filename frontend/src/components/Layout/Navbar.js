import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Avatar } from '@mui/material';
import { Menu as MenuIcon, NotificationsNone, Search } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Navbar = ({ toggleDrawer }) => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton
          color="primary"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ marginRight: 1 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            color: 'primary.main',
            fontWeight: 700,
            letterSpacing: '-0.025em',
          }}
        >
          Battery Management System
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="primary"
            sx={{
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.2)' },
            }}
          >
            <Search />
          </IconButton>
          
          <IconButton
            color="primary"
            sx={{
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              '&:hover': { backgroundColor: 'rgba(37, 99, 235, 0.2)' },
            }}
          >
            <NotificationsNone />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              sx={{ 
                width: 38, 
                height: 38,
                border: '2px solid',
                borderColor: 'primary.main',
              }}
            >
              U
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                User Name
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 