import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Chip, Snackbar, Alert,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import Layout from '../components/Layout';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../services/api';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'LABOUR' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      const res = await getWorkers();
      setWorkers(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddDialog = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', role: 'LABOUR' });
    setDialog(true);
  };

  const openEditDialog = (w) => {
    setEditing(w.id || w.workerId);
    setForm({ name: w.name, email: w.email || '', password: '', role: w.role || 'LABOUR' });
    setDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateWorker(editing, { name: form.name, role: form.role });
        setSnackbar({ open: true, message: 'Worker updated', severity: 'success' });
      } else {
        await createWorker(form);
        setSnackbar({ open: true, message: 'Worker added successfully! They can now log in with their email and password.', severity: 'success' });
      }
      setDialog(false);
      fetchData();
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.response?.data || e.message || 'Operation failed';
      setSnackbar({ open: true, message: typeof errorMsg === 'string' ? errorMsg : 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this worker?')) {
      try {
        await deleteWorker(id);
        fetchData();
        setSnackbar({ open: true, message: 'Worker deleted', severity: 'info' });
      } catch (e) {
        setSnackbar({ open: true, message: 'Cannot delete worker with active tasks', severity: 'error' });
      }
    }
  };

  const roleColor = (role) => {
    if (role === 'ADMIN') return { bg: '#ede9fe', color: '#7c3aed' };
    if (role === 'LABOUR') return { bg: '#dbeafe', color: '#2563eb' };
    return { bg: '#f1f5f9', color: '#475569' };
  };

  return (
    <Layout title="Worker Management">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Workers</Typography>
        <Box>
          <Button startIcon={<Refresh />} onClick={fetchData} sx={{ mr: 1 }}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}
            sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Add Worker
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tasks</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workers.map((w) => {
              const rc = roleColor(w.role);
              return (
                <TableRow key={w.id || w.workerId} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>{w.id || w.workerId}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{w.name}</TableCell>
                  <TableCell>{w.email}</TableCell>
                  <TableCell>
                    <Chip label={w.role} size="small" sx={{ bgcolor: rc.bg, color: rc.color, fontWeight: 600 }} />
                  </TableCell>
                  <TableCell>{w.taskCount}</TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => openEditDialog(w)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(w.id || w.workerId)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Full Name" margin="normal" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required />
          {!editing && (
            <>
              <TextField fullWidth label="Email" margin="normal" value={form.email}
                type="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                helperText="Worker will use this email to log in"
                required />
              <TextField fullWidth label="Password" margin="normal" value={form.password}
                type="password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                helperText="Worker will use this password to log in. Leave blank for default 'password'"
              />
            </>
          )}
          <TextField fullWidth select label="Role" margin="normal" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <MenuItem value="LABOUR">Labour</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            disabled={!form.name || (!editing && !form.email)}
            sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>{editing ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
}
