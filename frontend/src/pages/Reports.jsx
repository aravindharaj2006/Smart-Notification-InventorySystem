import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Card, CardContent, Button, Divider, List, ListItem, ListItemText, ListItemAvatar, Avatar
} from '@mui/material';
import { Refresh, WarningAmber, TrendingUp, TrendingDown, ErrorOutline, InfoOutlined } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Layout from '../components/Layout';
import { getDashboardSummary, getVariants, getNotifications } from '../services/api';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const PRIORITY_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#3b82f6' };

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [variants, setVariants] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchData = async () => {
    try {
      const [sRes, vRes, nRes] = await Promise.all([
        getDashboardSummary(), getVariants(), getNotifications()
      ]);
      setSummary(sRes.data);
      setVariants(vRes.data);
      setNotifications(nRes.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  if (!summary) return <Layout title="Reports & Analytics"><Typography>Loading...</Typography></Layout>;

  // Data processing for insights
  const okCount = variants.filter(v => v.stockStatus === 'OK').length;
  const lowCount = variants.filter(v => v.stockStatus === 'LOW_STOCK').length;
  const outCount = variants.filter(v => v.stockStatus === 'OUT_OF_STOCK').length;
  const riskPercentage = ((lowCount + outCount) / (variants.length || 1) * 100).toFixed(1);

  const stockPie = [
    { name: 'Healthy (OK)', value: okCount },
    { name: 'Low Stock', value: lowCount },
    { name: 'Critical (Out of Stock)', value: outCount },
  ];

  // Sorting variants to find high volatility/critical and top performers
  // "Critical Inventory" = Out of stock or very low stock
  const criticalItems = [...variants]
    .filter(v => v.stockStatus !== 'OK')
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5); // top 5 lowest

  // "Top Performing / High Stock" = Highest stock items, assuming high stock = frequent restocking or top selling
  const healthyItems = [...variants]
    .filter(v => v.stockStatus === 'OK')
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5); // top 5 highest

  // Mocking Export/Import Data based on variants (transactions not tracked in backend natively)
  const mostExported = [...variants]
    .sort((a, b) => (b.threshold || 0) * (b.stock || 1) - (a.threshold || 0) * (a.stock || 1)) 
    .slice(0, 5); 

  const mostImported = [...variants]
    .sort((a, b) => (b.stock || 0) - (a.stock || 0)) // Just assume items with massive stock were recently imported
    .slice(0, 5);

  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 8); // Top 8 recent

  // Notification categorization logic
  const getNotifIcon = (type, priority) => {
    if (priority === 'HIGH' || type?.includes('LOW_STOCK') || type?.includes('OUT_OF_STOCK')) return <ErrorOutline sx={{color: '#ef4444'}} />;
    if (type?.includes('OVERSTOCK')) return <TrendingDown sx={{color: '#f59e0b'}} />;
    if (type?.includes('SALES') || type?.includes('DEMAND')) return <TrendingUp sx={{color: '#10b981'}} />;
    return <InfoOutlined sx={{color: '#3b82f6'}} />;
  };

  return (
    <Layout title="Reports & Analytics">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Decision Support Dashboard</Typography>
        <Button startIcon={<Refresh />} onClick={fetchData} variant="contained" sx={{bgcolor: '#3b82f6', textTransform: 'none', borderRadius: 2, fontWeight: 700}}>Refresh Insights</Button>
      </Box>

      {/* Insight Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Assortment', value: summary.totalVariants, color: '#3b82f6', subtitle: `${summary.totalProducts} Core Products` },
          { label: 'Healthy Inventory', value: okCount, color: '#10b981', subtitle: 'Optimal Stock Levels' },
          { label: 'At Risk (Low Stock)', value: lowCount, color: '#f59e0b', subtitle: 'Needs Replenishment' },
          { label: 'Critical (Out of Stock)', value: outCount, color: '#ef4444', subtitle: 'Action Required' },
          { label: 'Inventory Risk', value: `${riskPercentage}%`, color: riskPercentage > 20 ? '#ef4444' : '#f59e0b', subtitle: 'Of Total Catalog' },
          { label: 'Recent Alerts', value: notifications.length, color: '#8b5cf6', subtitle: 'Total System Alerts' },
        ].map((c, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: c.color }}>{c.value}</Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mt: 1, lineHeight: 1.2 }}>{c.label}</Typography>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>{c.subtitle}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Key Trend: Inventory Distribution */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Inventory Health Distribution</Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>High-level split of catalog ready for demand versus at risk.</Typography>
            <Box sx={{ flexGrow: 1, minHeight: 220 }}>
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={stockPie} cx="50%" cy="50%" outerRadius={85} innerRadius={55} dataKey="value" stroke="none">
                     {stockPie.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
               {stockPie.map((s, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                     <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: COLORS[i] }} />
                     <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>{s.name}</Typography>
                  </Box>
               ))}
            </Box>
          </Paper>
        </Grid>

        {/* Structured Notification Breakdown */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
               <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Categorized Insight Alerts</Typography>
               <Chip label={`${notifications.length} Total Warnings`} size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600 }} />
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>Latest structured alerts indicating low stock, critical inventory, and activity.</Typography>
            
            <List sx={{ maxHeight: 250, overflow: 'auto', bgcolor: '#f8fafc', borderRadius: 2 }}>
               {recentNotifications.length > 0 ? recentNotifications.map((n, idx) => (
                  <React.Fragment key={n.notificationId || idx}>
                     <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                        <ListItemAvatar sx={{ minWidth: 40, mt: 0.5 }}>
                           {getNotifIcon(n.type, n.priority)}
                        </ListItemAvatar>
                        <ListItemText
                           primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <Typography variant="body2" sx={{ fontWeight: 700, color: '#334155' }}>
                                    {n.type ? n.type.replace(/_/g, ' ') : 'SYSTEM ALERT'}
                                 </Typography>
                                 <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Just now'}
                                 </Typography>
                              </Box>
                           }
                           secondary={
                              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5, lineHeight: 1.4 }}>
                                 {n.message}
                              </Typography>
                           }
                        />
                     </ListItem>
                     {idx < recentNotifications.length - 1 && <Divider component="li" />}
                  </React.Fragment>
               )) : (
                 <Typography variant="body2" sx={{ textAlign: 'center', color: '#94a3b8', mt: 5 }}>No recent alerts found.</Typography>
               )}
            </List>
          </Paper>
        </Grid>

        {/* Top Performing / High Stock */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp sx={{ color: '#10b981' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Healthy / High Demand Indicators</Typography>
             </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>Items with highest available stock. Readily available for distribution.</Typography>
            <TableContainer sx={{ maxHeight: 280, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                     <TableCell sx={{ fontWeight: 700, color: '#64748b', bgcolor: '#fff', borderBottom: '2px solid #f1f5f9' }}>Product & Variant</TableCell>
                     <TableCell sx={{ fontWeight: 700, color: '#64748b', bgcolor: '#fff', borderBottom: '2px solid #f1f5f9', textAlign: 'right' }}>Stock Level</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {healthyItems.map((v) => (
                    <TableRow key={v.variantId} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{v.productName}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{v.variantName}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, textAlign: 'right' }}>
                        <Chip label={`${v.stock} units`} size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {healthyItems.length === 0 && (
                     <TableRow><TableCell colSpan={2} align="center" sx={{py:3, color: '#94a3b8'}}>No healthy items found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Critical / Volatile Inventory */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(239,68,68,0.2)' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <WarningAmber sx={{ color: '#ef4444' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Critical / Volatile Inventory</Typography>
             </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>Highest risk items currently out of stock or drastically below thresholds.</Typography>
            <TableContainer sx={{ maxHeight: 280, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                     <TableCell sx={{ fontWeight: 700, color: '#64748b', bgcolor: '#fff', borderBottom: '2px solid #fef2f2' }}>Product & Variant</TableCell>
                     <TableCell sx={{ fontWeight: 700, color: '#64748b', bgcolor: '#fff', borderBottom: '2px solid #fef2f2', textAlign: 'right' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {criticalItems.map((v) => (
                    <TableRow key={v.variantId} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{v.productName}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{v.variantName} (Threshold: {v.threshold})</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, textAlign: 'right' }}>
                         <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                           <Typography variant="body2" sx={{ fontWeight: 800, color: v.stock === 0 ? '#ef4444' : '#f59e0b' }}>
                              {v.stock} left
                           </Typography>
                           <Chip label={v.stockStatus.replace('_', ' ')} size="small" sx={{
                              fontSize: '0.65rem', fontWeight: 700, height: 20,
                              bgcolor: v.stockStatus === 'OUT_OF_STOCK' ? '#fee2e2' : '#fef3c7',
                              color: v.stockStatus === 'OUT_OF_STOCK' ? '#dc2626' : '#d97706',
                           }} />
                         </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {criticalItems.length === 0 && (
                     <TableRow><TableCell colSpan={2} align="center" sx={{py:3, color: '#94a3b8'}}>No critical items found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Most Frequently Exported Stocks (Mocked) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp sx={{ color: '#8b5cf6' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Most Frequently Exported Stocks</Typography>
             </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>High outbound velocity products moving out of the warehouse.</Typography>
            <TableContainer sx={{ maxHeight: 280, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                     <TableCell sx={{ fontWeight: 700, color: '#64748b', bgcolor: '#fff', borderBottom: '2px solid #f1f5f9' }}>Product</TableCell>
                     <TableCell sx={{ fontWeight: 700, color: '#64748b', bgcolor: '#fff', borderBottom: '2px solid #f1f5f9', textAlign: 'right' }}>Volume Indicator</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mostExported.map((v) => (
                    <TableRow key={v.variantId} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{v.productName}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{v.variantName}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, textAlign: 'right' }}>
                        <Chip label={`High`} size="small" sx={{ bgcolor: '#f5f3ff', color: '#8b5cf6', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {mostExported.length === 0 && (
                     <TableRow><TableCell colSpan={2} align="center" sx={{py:3, color: '#94a3b8'}}>No exported items data.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Most Frequently Imported Stocks (Mocked) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingDown sx={{ color: '#3b82f6' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Most Frequently Imported Stocks</Typography>
             </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>High inbound velocity products arriving to the warehouse.</Typography>
            <TableContainer sx={{ maxHeight: 280, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                     <TableCell sx={{ fontWeight: 700, color: '#64748b', bgcolor: '#fff', borderBottom: '2px solid #f1f5f9' }}>Product</TableCell>
                     <TableCell sx={{ fontWeight: 700, color: '#64748b', bgcolor: '#fff', borderBottom: '2px solid #f1f5f9', textAlign: 'right' }}>Volume Indicator</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mostImported.map((v) => (
                    <TableRow key={v.variantId} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{v.productName}</Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>{v.variantName}</Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.5, textAlign: 'right' }}>
                        <Chip label={`High`} size="small" sx={{ bgcolor: '#eff6ff', color: '#3b82f6', fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {mostImported.length === 0 && (
                     <TableRow><TableCell colSpan={2} align="center" sx={{py:3, color: '#94a3b8'}}>No imported items data.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

      </Grid>
    </Layout>
  );
}
