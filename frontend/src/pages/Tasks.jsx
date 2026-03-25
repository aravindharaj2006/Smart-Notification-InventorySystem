import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem, IconButton,
  Chip, Snackbar, Alert, Tabs, Tab
} from '@mui/material';
import { Add, Delete, Refresh, CheckCircle, Schedule } from '@mui/icons-material';
import Layout from '../components/Layout';
import { getTasks, getWorkers, createTask, updateTaskStatusAdmin, deleteTask, getMyTasks, updateMyTaskStatus } from '../services/api';

export default function Tasks({ isLabour }) {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({ userId: '', description: '', deadline: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      if (isLabour) {
        const tRes = await getMyTasks();
        setTasks(tRes.data);
      } else {
        // Fetch tasks and workers independently so one failure doesn't block the other
        getTasks().then(res => setTasks(res.data)).catch(e => console.error('Failed to fetch tasks:', e));
        getWorkers().then(res => setWorkers(res.data)).catch(e => console.error('Failed to fetch workers:', e));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    try {
      if (!form.userId || !form.description || !form.deadline) {
        setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
        return;
      }
      await createTask({ ...form, deadline: form.deadline + 'T00:00:00' });
      setDialog(false);
      setForm({ userId: '', description: '', deadline: '' });
      fetchData();
      setSnackbar({ open: true, message: 'Task created', severity: 'success' });
    } catch (e) {
      console.error('Failed to create task:', e);
      // Attempt to extract the true server error reason
      const errorMsg = e.response?.data ? JSON.stringify(e.response.data) : e.message;
      setSnackbar({ open: true, message: `Failed to create task: ${errorMsg}`, severity: 'error' });
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      if (isLabour) {
        await updateMyTaskStatus(id, status);
      } else {
        await updateTaskStatusAdmin(id, status);
      }
      fetchData();
      setSnackbar({ open: true, message: `Task marked as ${status}`, severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update task', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(id);
        fetchData();
        setSnackbar({ open: true, message: 'Task deleted', severity: 'info' });
      } catch (e) {
        setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' });
      }
    }
  };

  const statusConfig = {
    PENDING: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
    COMPLETED: { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
    IN_PROGRESS: { bg: '#dbeafe', color: '#2563eb', label: 'In Progress' },
  };

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  return (
    <Layout title="Task Management">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{isLabour ? 'My Tasks' : 'Worker Tasks'}</Typography>
        <Box>
          <Button startIcon={<Refresh />} onClick={fetchData} sx={{ mr: 1 }}>Refresh</Button>
          {!isLabour && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialog(true)}
              sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Assign Task
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={filter} onChange={(_, v) => setFilter(v)}>
          <Tab label={`All (${tasks.length})`} value="ALL" />
          <Tab label={`Pending (${tasks.filter(t => t.status === 'PENDING').length})`} value="PENDING" />
          <Tab label={`Completed (${tasks.filter(t => t.status === 'COMPLETED').length})`} value="COMPLETED" />
        </Tabs>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              {!isLabour && <TableCell sx={{ fontWeight: 700 }}>Worker</TableCell>}
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Deadline</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((t) => {
              const sc = statusConfig[t.status] || statusConfig.PENDING;
              return (
                <TableRow key={t.taskId} sx={{
                  bgcolor: t.overdue ? '#fef2f2' : 'inherit',
                  '&:hover': { bgcolor: t.overdue ? '#fee2e2' : '#f8fafc' },
                }}>
                  <TableCell>{t.taskId}</TableCell>
                  {!isLabour && <TableCell sx={{ fontWeight: 600 }}>{t.userName}</TableCell>}
                  <TableCell>{t.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {new Date(t.deadline).toLocaleDateString()}
                      {t.overdue && <Chip label="OVERDUE" size="small" sx={{
                        bgcolor: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: '0.6rem', height: 18
                      }} />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>
                    {t.status === 'PENDING' && isLabour && (
                      <IconButton size="small" color="primary" title="Start Progress"
                        onClick={() => handleStatusChange(t.taskId, 'IN_PROGRESS')}>
                        <Schedule fontSize="small" />
                      </IconButton>
                    )}
                    {t.status !== 'COMPLETED' && (
                      <IconButton size="small" color="success" title="Mark Complete"
                        onClick={() => handleStatusChange(t.taskId, 'COMPLETED')}>
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    )}
                    {!isLabour && (
                      <IconButton size="small" color="error" onClick={() => handleDelete(t.taskId)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Assign New Task</DialogTitle>
        <DialogContent>
          <TextField fullWidth select label="Worker" margin="normal" value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}>
            {workers.map((w) => <MenuItem key={w.id} value={w.id}>{w.name} — {w.role}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Task Description" margin="normal" multiline rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextField fullWidth label="Deadline" type="date" margin="normal" InputLabelProps={{ shrink: true }}
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}
            sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>Create Task</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
}
