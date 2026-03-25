import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Chip, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Button, Snackbar, Alert
} from '@mui/material';
import { getNotifications, getNotificationsByType, markNotificationReadAdmin, dismissNotificationAdmin, getMyNotifications, markMyNotificationRead, dismissMyNotification, markAllNotificationsReadAdmin, deleteAllNotificationsAdmin, markAllMyNotificationsRead, deleteAllMyNotifications } from '../services/api';
import { Refresh, MarkEmailRead, Close, DoneAll, DeleteSweep } from '@mui/icons-material';
import Layout from '../components/Layout';

const priorityConfig = {
  CRITICAL: { bg: '#fee2e2', color: '#dc2626', icon: '🚨' },
  HIGH: { bg: '#fef3c7', color: '#d97706', icon: '⚠️' },
  MEDIUM: { bg: '#dbeafe', color: '#2563eb', icon: '📋' },
  LOW: { bg: '#dcfce7', color: '#16a34a', icon: '📊' },
};

const typeFilters = ['ALL', 'LOW_STOCK', 'OUT_OF_STOCK', 'TASK_REMINDER', 'DAILY_REPORT', 'SYSTEM'];

export default function Notifications({ isLabour }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      let res;
      if (isLabour) {
        res = await getMyNotifications();
        if (filter !== 'ALL') {
          res.data = res.data.filter(n => n.type === filter);
        }
      } else {
        if (filter === 'ALL') {
          res = await getNotifications();
        } else {
          res = await getNotificationsByType(filter);
        }
      }
      setNotifications(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleRead = async (id) => {
    try {
      if (isLabour) {
        await markMyNotificationRead(id);
      } else {
        await markNotificationReadAdmin(id);
      }
      fetchData();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to mark as read', severity: 'error' });
    }
  };

  const handleDismiss = async (id) => {
    try {
      if (isLabour) {
        await dismissMyNotification(id);
      } else {
        await dismissNotificationAdmin(id);
      }
      fetchData();
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to dismiss', severity: 'error' });
    }
  };

  const handleReadAll = async () => {
    try {
      if (isLabour) await markAllMyNotificationsRead();
      else await markAllNotificationsReadAdmin();
      fetchData();
      setSnackbar({ open: true, message: 'All notifications marked as read', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to mark all as read', severity: 'error' });
    }
  };

  const handleDeleteAll = async () => {
    try {
      if (isLabour) await deleteAllMyNotifications();
      else await deleteAllNotificationsAdmin();
      fetchData();
      setSnackbar({ open: true, message: 'All notifications deleted', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to delete all', severity: 'error' });
    }
  };

  return (
    <Layout title="Notification Center">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>All Notifications</Typography>
        <Box>
          <Button startIcon={<DoneAll />} onClick={handleReadAll} color="primary" sx={{ mr: 1, fontWeight: 'bold' }}>Read All</Button>
          <Button startIcon={<DeleteSweep />} onClick={handleDeleteAll} color="error" sx={{ mr: 1, fontWeight: 'bold' }}>Delete All</Button>
          <Button startIcon={<Refresh />} onClick={fetchData} variant="outlined">Refresh</Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={filter} onChange={(_, v) => setFilter(v)} variant="scrollable" scrollButtons="auto">
          {typeFilters.map((t) => (
            <Tab key={t} label={t.replace('_', ' ')} value={t} sx={{ textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Message</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              {!isLabour && <TableCell sx={{ fontWeight: 700 }}>Recipient</TableCell>}
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((n) => {
              const pc = priorityConfig[n.priority] || priorityConfig.LOW;
              return (
                <TableRow key={n.notificationId} sx={{
                  bgcolor: n.status === 'UNREAD' ? `${pc.bg}50` : 'inherit',
                  opacity: n.status === 'DISMISSED' ? 0.5 : 1,
                  '&:hover': { bgcolor: '#f8fafc' },
                }}>
                  <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 350 }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', fontSize: '0.8rem', color: '#334155' }}>
                      {n.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={`${pc.icon} ${n.priority}`} size="small"
                      sx={{ bgcolor: pc.bg, color: pc.color, fontWeight: 700, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={n.type.replace('_', ' ')} size="small"
                      sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 500 }} />
                  </TableCell>
                  {!isLabour && <TableCell>{n.recipient}</TableCell>}
                  <TableCell>
                    <Chip label={n.status} size="small" sx={{
                      bgcolor: n.status === 'UNREAD' ? '#dbeafe' : n.status === 'READ' ? '#dcfce7' : '#f1f5f9',
                      color: n.status === 'UNREAD' ? '#2563eb' : n.status === 'READ' ? '#16a34a' : '#94a3b8',
                      fontWeight: 600, fontSize: '0.7rem',
                    }} />
                  </TableCell>
                  <TableCell>
                    {n.status === 'UNREAD' && (
                      <IconButton size="small" color="primary" title="Mark as Read" onClick={() => handleRead(n.notificationId)}>
                        <MarkEmailRead fontSize="small" />
                      </IconButton>
                    )}
                    {n.status !== 'DISMISSED' && (
                      <IconButton size="small" color="default" title="Dismiss" onClick={() => handleDismiss(n.notificationId)}>
                        <Close fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            {notifications.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No notifications found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
}
