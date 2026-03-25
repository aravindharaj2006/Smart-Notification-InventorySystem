import React, { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar, Button
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { AuthContext } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

const adminNavItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/admin/inventory' },
  { text: 'Catalogue', icon: <MenuBookIcon />, path: '/admin/product-catalogue' },
  { text: 'Suppliers', icon: <LocalShippingIcon />, path: '/admin/suppliers' },
  { text: 'Workers', icon: <PeopleIcon />, path: '/admin/workers' },
  { text: 'Tasks', icon: <AssignmentIcon />, path: '/admin/tasks' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications' },
  { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
];

const labourNavItems = [
  { text: 'My Tasks', icon: <AssignmentIcon />, path: '/labour/tasks' },
  { text: 'Inventory', icon: <InventoryIcon />, path: '/labour/inventory' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/labour/notifications' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  const navItems = user.role === 'ADMIN' ? adminNavItems : labourNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          color: '#e2e8f0',
          borderRight: '1px solid rgba(148, 163, 184, 0.1)',
        },
      }}
    >
      {/* Brand */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 42, height: 42, flexShrink: 0,
          background: 'linear-gradient(135deg, #2563eb 0%, #1e293b 100%)', 
          borderRadius: '20%', 
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
        }}>
          <NotificationsActiveIcon sx={{ color: 'white', fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f1f5f9', lineHeight: 1.2 }}>
            SmartNotify
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
            Inventory System
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)', mx: 2 }} />

      {/* Profile Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: 'rgba(0,0,0,0.2)', mx: 1.5, mt: 1.5, borderRadius: 2 }}>
        <Avatar sx={{ bgcolor: '#475569', width: 36, height: 36 }}>
          <PersonIcon />
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {user.name || 'User Profile'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
            {user.role}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ px: 1.5, mt: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: '10px',
                mb: 0.5,
                py: 1.2,
                transition: 'all 0.2s ease',
                bgcolor: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                '&:hover': {
                  bgcolor: 'rgba(59, 130, 246, 0.1)',
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{
                color: isActive ? '#3b82f6' : '#94a3b8',
                minWidth: 40,
                transition: 'color 0.2s',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? '#f1f5f9' : '#cbd5e1',
                }}
              />
              {isActive && (
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  bgcolor: '#3b82f6',
                  boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button 
          fullWidth 
          variant="outlined" 
          color="error" 
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', mb: 2 }}
        >
          Logout
        </Button>
        <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.1)', mb: 2 }} />
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block', textAlign: 'center' }}>
          © 2026 SmartNotify Inventory System
        </Typography>
      </Box>
    </Drawer>
  );
}

export { DRAWER_WIDTH };
