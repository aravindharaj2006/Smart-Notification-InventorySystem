import React, { useEffect, useState } from 'react';
import {
  Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, IconButton, Snackbar, Alert
} from '@mui/material';
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';
import Layout from '../components/Layout';
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../services/api';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAddDialog = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '' });
    setDialog(true);
  };

  const openEditDialog = (s) => {
    setEditing(s.supplierId);
    setForm({ name: s.name, email: s.email, phone: s.phone });
    setDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateSupplier(editing, form);
        setSnackbar({ open: true, message: 'Supplier updated', severity: 'success' });
      } else {
        await createSupplier(form);
        setSnackbar({ open: true, message: 'Supplier created', severity: 'success' });
      }
      setDialog(false);
      fetchData();
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.response?.data || e.message || 'Operation failed';
      setSnackbar({ open: true, message: typeof errorMsg === 'string' ? errorMsg : 'Operation failed', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this supplier?')) {
      try {
        await deleteSupplier(id);
        fetchData();
        setSnackbar({ open: true, message: 'Supplier deleted', severity: 'info' });
      } catch (e) {
        setSnackbar({ open: true, message: 'Failed to delete supplier', severity: 'error' });
      }
    }
  };

  return (
    <Layout title="Supplier Management">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Suppliers</Typography>
        <Box>
          <Button startIcon={<Refresh />} onClick={fetchData} sx={{ mr: 1 }}>Refresh</Button>
          <Button variant="contained" startIcon={<Add />} onClick={openAddDialog}
            sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            Add Supplier
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
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Products</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.supplierId} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                <TableCell>{s.supplierId}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.productCount}</TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => openEditDialog(s)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(s.supplierId)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" margin="normal" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField fullWidth label="Email" margin="normal" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField fullWidth label="Phone" margin="normal" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}
            sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
}
