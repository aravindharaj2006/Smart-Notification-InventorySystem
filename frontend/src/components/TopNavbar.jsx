import React, { useEffect, useState, useContext } from 'react';
import {
  AppBar, Toolbar, Typography, Badge, IconButton, Box, Chip,
  Menu, MenuItem, ListItemText, ListItemIcon, Divider
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { DRAWER_WIDTH } from './Sidebar';
import { getDashboardSummary, getMyNotifications, markMyNotificationRead } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TopNavbar({ title }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchUnread = async () => {
    if (!user) return;
    try {
      if (user.role === 'ADMIN') {
        const res = await getDashboardSummary();
        setUnreadCount(res.data.unreadNotifications);
      } else {
        const res = await getMyNotifications();
        const unread = res.data.filter(n => n.status === 'UNREAD');
        setNotifications(unread);
        setUnreadCount(unread.length);
      }
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleOpenMenu = (event) => {
    if (user?.role !== 'ADMIN') {
      setAnchorEl(event.currentTarget);
    } else {
      // Admins can be navigated to global Notification Center
      navigate('/admin/notifications');
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markMyNotificationRead(id);
      fetchUnread();
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        bgcolor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            {title}
          </Typography>
          <Chip
            label="Live"
            size="small"
            sx={{
              bgcolor: '#dcfce7',
              color: '#16a34a',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 22,
              '& .MuiChip-label': { px: 1 },
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 },
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={fetchUnread} sx={{ color: '#64748b' }}>
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={handleOpenMenu} sx={{ color: '#64748b' }}>
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            PaperProps={{
              sx: { width: 320, maxHeight: 400, mt: 1.5, borderRadius: 2, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
              <Chip label={`${unreadCount} Unread`} size="small" color="primary" />
            </Box>
            <Divider />
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">No new notifications</Typography>
              </Box>
            ) : (
              notifications.map((n) => (
                <MenuItem key={n.notificationId} onClick={() => {}} sx={{ py: 1.5, whiteSpace: 'normal', alignItems: 'flex-start' }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 0.5 }}>
                        {n.message.split('\n')[0]}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', whiteSpace: 'pre-line' }}>
                        {n.message.split('\n').slice(1).join('\n')}
                      </Typography>
                    }
                  />
                  <ListItemIcon sx={{ minWidth: 0, ml: 1, mt: 0.5 }}>
                    <IconButton size="small" onClick={(e) => handleMarkAsRead(n.notificationId, e)} title="Mark as read">
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </ListItemIcon>
                </MenuItem>
              ))
            )}
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                onClick={() => { handleCloseMenu(); navigate('/labour/notifications'); }}
              >
                View All Center
              </Typography>
            </Box>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
