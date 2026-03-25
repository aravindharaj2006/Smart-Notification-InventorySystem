import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Card, CardContent, Skeleton
} from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  Warning as WarningIcon,
  Assignment as TaskIcon,
  Notifications as NotifIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../components/Layout';
import { getDashboardSummary, getActiveAlerts, getNotifications } from '../services/api';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444'];

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card elevation={0} sx={{
    borderRadius: 3,
    border: '1px solid rgba(0,0,0,0.06)',
    transition: 'all 0.3s ease',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' },
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{
          width: 48, height: 48, borderRadius: 2.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          bgcolor: `${color}15`,
          color: color,
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const priorityColor = (p) => {
  switch (p) {
    case 'CRITICAL': return '#ef4444';
    case 'HIGH': return '#f59e0b';
    case 'MEDIUM': return '#3b82f6';
    case 'LOW': return '#10b981';
    default: return '#94a3b8';
  }
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, alertRes, notifRes] = await Promise.all([
          getDashboardSummary(),
          getActiveAlerts(),
          getNotifications(),
        ]);
        setSummary(sumRes.data);
        setActiveAlerts(alertRes.data);
        setNotifications(notifRes.data.slice(0, 8));
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Layout>
    );
  }

  const stockData = [
    { name: 'OK', value: Math.max(0, (summary?.totalVariants || 0) - (summary?.lowStockVariants || 0) - (summary?.outOfStockVariants || 0)) },
    { name: 'Low Stock', value: summary?.lowStockVariants || 0 },
    { name: 'Out of Stock', value: summary?.outOfStockVariants || 0 },
  ];

  const taskData = [
    { name: 'Pending', count: summary?.pendingTasks || 0 },
    { name: 'Overdue', count: summary?.overdueTasks || 0 },
  ];

  return (
    <Layout title="Dashboard">
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Products" value={summary?.totalProducts || 0}
            icon={<InventoryIcon />} color="#3b82f6" subtitle={`${summary?.totalVariants || 0} variants`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Low Stock Alerts" value={summary?.lowStockVariants || 0}
            icon={<WarningIcon />} color="#f59e0b" subtitle={`${summary?.outOfStockVariants || 0} out of stock`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Tasks" value={summary?.pendingTasks || 0}
            icon={<TaskIcon />} color="#8b5cf6" subtitle={`${summary?.overdueTasks || 0} overdue`} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Notifications Today" value={summary?.notificationsToday || 0}
            icon={<NotifIcon />} color="#10b981" subtitle={`${summary?.unreadNotifications || 0} unread`} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Stock Distribution Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
              Stock Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stockData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                  paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {stockData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Active Supplier Alerts */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                ⚠️ Active Automated Alerts
              </Typography>
              <Chip label={`${activeAlerts.length} items`} size="small"
                sx={{ bgcolor: '#fef3c7', color: '#d97706', fontWeight: 600 }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Variant</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Stock / Thr</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>Supplier & Sent Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: '#64748b' }}>No active automatic alerts</TableCell>
                    </TableRow>
                  ) : activeAlerts.slice(0, 6).map((v) => (
                    <TableRow key={v.alertId} sx={{
                      bgcolor: v.status === 'OUT_OF_STOCK' ? '#fef2f2' : '#fffbeb'
                    }}>
                      <TableCell>{v.productName}</TableCell>
                      <TableCell>{v.variantName}</TableCell>
                      <TableCell sx={{
                        fontWeight: 700,
                        color: v.status === 'OUT_OF_STOCK' ? '#ef4444' : '#f59e0b'
                      }}>{v.stock} / {v.threshold}</TableCell>
                      <TableCell>
                        <Chip
                          label={v.status === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : 'LOW STOCK'}
                          size="small"
                          sx={{
                            bgcolor: v.status === 'OUT_OF_STOCK' ? '#fee2e2' : '#fef3c7',
                            color: v.status === 'OUT_OF_STOCK' ? '#dc2626' : '#d97706',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>{v.supplierEmail}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>{new Date(v.createdAt).toLocaleDateString()}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Notifications */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
              🔔 Recent Notifications
            </Typography>
            {notifications.length === 0 ? (
              <Typography color="text.secondary">No notifications yet.</Typography>
            ) : (
              notifications.map((n) => (
                <Box key={n.notificationId} sx={{
                  p: 1.5, mb: 1, borderRadius: 2,
                  bgcolor: '#f8fafc',
                  borderLeft: `3px solid ${priorityColor(n.priority)}`,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Chip label={n.priority} size="small" sx={{
                      bgcolor: `${priorityColor(n.priority)}15`,
                      color: priorityColor(n.priority),
                      fontWeight: 700, fontSize: '0.65rem', height: 20,
                    }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#334155', whiteSpace: 'pre-line', fontSize: '0.8rem' }}>
                    {n.message}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Grid>

        {/* Task Overview Chart */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', height: '100%' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
              Task Overview
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
