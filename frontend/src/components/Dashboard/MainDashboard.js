import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Divider,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Battery90 as BatteryIcon,
  Phone as DeviceIcon,
  DirectionsRun as MovementIcon,
  Timeline as AnalyticsIcon,
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

const DashboardCard = ({ title, value, icon, color, trend, trendValue }) => (
  <Card elevation={0}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}15`,
            borderRadius: '12px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon, { sx: { color: color } })}
        </Box>
        <IconButton size="small">
          <MoreVertIcon />
        </IconButton>
      </Box>
      
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
        {value}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        {trend && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: trend === 'up' ? 'success.main' : 'error.main',
              backgroundColor: trend === 'up' ? 'success.main' : 'error.main',
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95))',
              borderRadius: 1,
              px: 1,
              py: 0.5,
            }}
          >
            {trend === 'up' ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
            <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 500 }}>
              {trendValue}
            </Typography>
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);

const ActivityItem = ({ title, time, avatar, color }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
    <Avatar sx={{ bgcolor: `${color}15`, color: color }}>{avatar}</Avatar>
    <Box sx={{ flex: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {time}
      </Typography>
    </Box>
  </Box>
);

const MainDashboard = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Active Devices"
            value="24"
            icon={<DeviceIcon />}
            color="#2563eb"
            trend="up"
            trendValue="12%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Battery Status"
            value="85%"
            icon={<BatteryIcon />}
            color="#10b981"
            trend="down"
            trendValue="3%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Movement Activity"
            value="12"
            icon={<MovementIcon />}
            color="#f59e0b"
            trend="up"
            trendValue="8%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            title="Analytics"
            value="89%"
            icon={<AnalyticsIcon />}
            color="#7c3aed"
            trend="up"
            trendValue="24%"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, height: '400px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Activity Overview</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">Daily</Typography>
                <Typography variant="caption" color="text.secondary">|</Typography>
                <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>Weekly</Typography>
                <Typography variant="caption" color="text.secondary">|</Typography>
                <Typography variant="caption" color="text.secondary">Monthly</Typography>
              </Box>
            </Box>
            <Box sx={{ height: 'calc(100% - 48px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Chart placeholder - Add your preferred charting library
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Recent Activities
            </Typography>
            <Box sx={{ height: 'calc(100% - 48px)' }}>
              <ActivityItem
                title="Device ABC1 battery level critical"
                time="2 minutes ago"
                avatar="B"
                color="#ef4444"
              />
              <ActivityItem
                title="Movement detected in Zone 2"
                time="15 minutes ago"
                avatar="M"
                color="#f59e0b"
              />
              <ActivityItem
                title="New device connected"
                time="1 hour ago"
                avatar="D"
                color="#10b981"
              />
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  System Status
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                  Healthy
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={92}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#10b981',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MainDashboard; 