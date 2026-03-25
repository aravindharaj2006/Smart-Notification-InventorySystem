import React, { useEffect, useState, useRef } from 'react';
import {
  Grid, Paper, Typography, Box, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, MenuItem, IconButton,
  Tab, Tabs, Snackbar, Alert
} from '@mui/material';
import { Add, Edit, Delete, Refresh, FileUpload, FileDownload } from '@mui/icons-material';
import Layout from '../components/Layout';
import {
  getProducts, getVariants, createProduct, createVariant, updateStock,
  deleteProduct, deleteVariant, getSuppliers,
  getLabourProducts, getLabourVariants, updateLabourStock
} from '../services/api';

export default function Inventory({ isLabour }) {
  const [tab, setTab] = useState(0);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productDialog, setProductDialog] = useState(false);
  const [variantDialog, setVariantDialog] = useState(false);
  const [stockDialog, setStockDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [newProduct, setNewProduct] = useState({ category: '', productName: '', supplierId: '' });
  const [newVariant, setNewVariant] = useState({ productId: '', variantName: '', stock: 0, threshold: 10 });
  const [newStock, setNewStock] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [labourStockDialog, setLabourStockDialog] = useState({ open: false, type: 'IMPORT' });
  const [labourStockForm, setLabourStockForm] = useState({ variantId: '', quantity: 1 });

  const fetchData = async () => {
    try {
      if (isLabour) {
        const [pRes, vRes] = await Promise.all([getLabourProducts(), getLabourVariants()]);
        setProducts(pRes.data);
        setVariants(vRes.data);
      } else {
        const [pRes, vRes, sRes] = await Promise.all([getProducts(), getVariants(), getSuppliers()]);
        setProducts(pRes.data);
        setVariants(vRes.data);
        setSuppliers(sRes.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateProduct = async () => {
    try {
      await createProduct(newProduct);
      setProductDialog(false);
      setNewProduct({ category: '', productName: '', supplierId: '' });
      fetchData();
      setSnackbar({ open: true, message: 'Product created successfully', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create product', severity: 'error' });
    }
  };

  const handleCreateVariant = async () => {
    try {
      await createVariant(newVariant);
      setVariantDialog(false);
      setNewVariant({ productId: '', variantName: '', stock: 0, threshold: 10 });
      fetchData();
      setSnackbar({ open: true, message: 'Variant created successfully', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to create variant', severity: 'error' });
    }
  };

  const handleUpdateStock = async () => {
    try {
      await updateStock(selectedVariant.variantId, newStock);
      setStockDialog(false);
      fetchData();
      setSnackbar({ open: true, message: 'Stock updated successfully', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update stock', severity: 'error' });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product and all its variants?')) {
      try {
        await deleteProduct(id);
        fetchData();
        setSnackbar({ open: true, message: 'Product deleted', severity: 'info' });
      } catch (e) {
        setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
      }
    }
  };

  const handleDeleteVariant = async (id) => {
    if (window.confirm('Delete this variant?')) {
      try {
        await deleteVariant(id);
        fetchData();
        setSnackbar({ open: true, message: 'Variant deleted', severity: 'info' });
      } catch (e) {
        setSnackbar({ open: true, message: 'Failed to delete variant', severity: 'error' });
      }
    }
  };

  const handleSubmitLabourStock = async () => {
    try {
      if (!labourStockForm.variantId || labourStockForm.quantity <= 0) {
        setSnackbar({ open: true, message: 'Please select a variant and valid quantity', severity: 'warning' });
        return;
      }
      const variant = variants.find(v => v.variantId === labourStockForm.variantId);
      const newStock = labourStockDialog.type === 'IMPORT' 
          ? variant.stock + labourStockForm.quantity 
          : variant.stock - labourStockForm.quantity;
          
      if (newStock < 0) {
        setSnackbar({ open: true, message: 'Not enough stock to export', severity: 'error' });
        return;
      }
      
      await updateLabourStock(variant.variantId, newStock);
      setLabourStockDialog({ ...labourStockDialog, open: false });
      setLabourStockForm({ variantId: '', quantity: 1 });
      fetchData();
      setSnackbar({ open: true, message: `Goods ${labourStockDialog.type === 'IMPORT' ? 'imported' : 'exported'} successfully`, severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: 'Failed to update stock', severity: 'error' });
    }
  };

  const stockColor = (status) => {
    if (status === 'OUT_OF_STOCK') return { bg: '#fee2e2', color: '#dc2626' };
    if (status === 'LOW_STOCK') return { bg: '#fef3c7', color: '#d97706' };
    return { bg: '#dcfce7', color: '#16a34a' };
  };

  return (
    <Layout title="Inventory Management">
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Products" />
          <Tab label="Product Variants" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Products</Typography>
            <Box>
              <Button startIcon={<Refresh />} onClick={fetchData} sx={{ mr: 1 }}>Refresh</Button>
              {isLabour && (
                <>
                  <Button variant="outlined" startIcon={<FileUpload />} color="primary"
                    onClick={() => setLabourStockDialog({ open: true, type: 'IMPORT' })}
                    sx={{ mr: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                    Import Goods
                  </Button>
                  <Button variant="outlined" startIcon={<FileDownload />} color="secondary"
                    onClick={() => setLabourStockDialog({ open: true, type: 'EXPORT' })}
                    sx={{ mr: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                    Export Goods
                  </Button>
                </>
              )}
              {!isLabour && (
                <Button variant="contained" startIcon={<Add />} onClick={() => setProductDialog(true)}
                  sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                  Add Product
                </Button>
              )}
            </Box>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Variants</TableCell>
                  {!isLabour && <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.productId} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                    <TableCell>{p.productId}</TableCell>
                    <TableCell>{p.category || 'Uncategorized'}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.productName}</TableCell>
                    <TableCell>{p.supplierName || '—'}</TableCell>
                    <TableCell><Chip label={p.variantCount} size="small" /></TableCell>
                    {!isLabour && (
                      <TableCell>
                        <IconButton size="small" color="error" onClick={() => handleDeleteProduct(p.productId)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {tab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Product Variants</Typography>
            <Box>
              <Button startIcon={<Refresh />} onClick={fetchData} sx={{ mr: 1 }}>Refresh</Button>
              {!isLabour && (
                <Button variant="contained" startIcon={<Add />} onClick={() => setVariantDialog(true)}
                  sx={{ bgcolor: '#3b82f6', borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                  Add Variant
                </Button>
              )}
            </Box>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Variant</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Threshold</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  {!isLabour && <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {variants.map((v) => {
                  const sc = stockColor(v.stockStatus);
                  return (
                    <TableRow key={v.variantId} sx={{
                      bgcolor: v.stockStatus === 'OUT_OF_STOCK' ? '#fef2f2' : v.stockStatus === 'LOW_STOCK' ? '#fffbeb' : 'inherit',
                      '&:hover': { bgcolor: v.stockStatus === 'OUT_OF_STOCK' ? '#fee2e2' : v.stockStatus === 'LOW_STOCK' ? '#fef3c7' : '#f8fafc' },
                    }}>
                      <TableCell>{v.category || 'Uncategorized'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{v.productName}</TableCell>
                      <TableCell>{v.variantName}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: sc.color }}>{v.stock}</TableCell>
                      <TableCell>{v.threshold}</TableCell>
                      <TableCell>
                        <Chip label={v.stockStatus.replace('_', ' ')} size="small"
                          sx={{ bgcolor: sc.bg, color: sc.color, fontWeight: 600, fontSize: '0.7rem' }} />
                      </TableCell>
                      {!isLabour && (
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => {
                            setSelectedVariant(v);
                            setNewStock(v.stock);
                            setStockDialog(true);
                          }}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteVariant(v.variantId)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Add Product Dialog */}
      {!isLabour && (
        <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Product</DialogTitle>
          <DialogContent>
            <TextField fullWidth label="Category (e.g., Mobile, Electronics)" margin="normal"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
            <TextField fullWidth label="Product Name" margin="normal"
              value={newProduct.productName}
              onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })} />
            <TextField fullWidth select label="Supplier" margin="normal"
              value={newProduct.supplierId}
              onChange={(e) => setNewProduct({ ...newProduct, supplierId: e.target.value })}>
              <MenuItem value="">None</MenuItem>
              {suppliers.map((s) => <MenuItem key={s.supplierId} value={s.supplierId}>{s.name}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateProduct}
              sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>Create</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Add Variant Dialog */}
      {!isLabour && (
        <Dialog open={variantDialog} onClose={() => setVariantDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Add Product Variant</DialogTitle>
          <DialogContent>
            <TextField fullWidth select label="Product" margin="normal"
              value={newVariant.productId}
              onChange={(e) => setNewVariant({ ...newVariant, productId: e.target.value })}>
              {products.map((p) => <MenuItem key={p.productId} value={p.productId}>{p.productName}</MenuItem>)}
            </TextField>
            <TextField fullWidth label="Variant Name" margin="normal"
              value={newVariant.variantName}
              onChange={(e) => setNewVariant({ ...newVariant, variantName: e.target.value })} />
            <TextField fullWidth label="Initial Stock" type="number" margin="normal"
              value={newVariant.stock}
              onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })} />
            <TextField fullWidth label="Threshold" type="number" margin="normal"
              value={newVariant.threshold}
              onChange={(e) => setNewVariant({ ...newVariant, threshold: parseInt(e.target.value) || 0 })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVariantDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreateVariant}
              sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>Create</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Update Stock Dialog */}
      {!isLabour && (
        <Dialog open={stockDialog} onClose={() => setStockDialog(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Update Stock</DialogTitle>
          <DialogContent>
            {selectedVariant && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                <Typography variant="body2"><strong>Product:</strong> {selectedVariant.productName}</Typography>
                <Typography variant="body2"><strong>Variant:</strong> {selectedVariant.variantName}</Typography>
                <Typography variant="body2"><strong>Current Stock:</strong> {selectedVariant.stock}</Typography>
              </Box>
            )}
            <TextField fullWidth label="New Stock Level" type="number" margin="normal"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStockDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleUpdateStock}
              sx={{ bgcolor: '#3b82f6', textTransform: 'none' }}>Update</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Labour Import/Export Dialog */}
      {isLabour && (
        <Dialog open={labourStockDialog.open} onClose={() => setLabourStockDialog({ ...labourStockDialog, open: false })} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {labourStockDialog.type === 'IMPORT' ? 'Import Goods' : 'Export Goods'}
          </DialogTitle>
          <DialogContent>
            <TextField fullWidth select label="Select Product Variant" margin="normal"
              value={labourStockForm.variantId}
              onChange={(e) => setLabourStockForm({ ...labourStockForm, variantId: e.target.value })}>
              {variants.map((v) => (
                <MenuItem key={v.variantId} value={v.variantId}>
                  {v.productName} - {v.variantName} (Current Stock: {v.stock})
                </MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Quantity" type="number" margin="normal"
              InputProps={{ inputProps: { min: 1 } }}
              value={labourStockForm.quantity}
              onChange={(e) => setLabourStockForm({ ...labourStockForm, quantity: parseInt(e.target.value) || '' })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLabourStockDialog({ ...labourStockDialog, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmitLabourStock}
              sx={{ bgcolor: labourStockDialog.type === 'IMPORT' ? '#3b82f6' : '#d97706', textTransform: 'none' }}>
              Confirm {labourStockDialog.type === 'IMPORT' ? 'Import' : 'Export'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}
