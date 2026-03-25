import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, InputAdornment, Button, Autocomplete
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import Layout from '../components/Layout';
import { getVariants } from '../services/api';

export default function ProductCatalogue() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    productName: '',
    variantName: '',
    supplierName: ''
  });

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const res = await getVariants();
        setVariants(res.data);
      } catch (err) {
        console.error('Failed to fetch catalogue:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ category: '', productName: '', variantName: '', supplierName: '' });
  };

  const filteredVariants = variants.filter(v => {
    const matchCat = (v.category || 'Uncategorized').toLowerCase().includes(filters.category.toLowerCase());
    const matchProd = (v.productName || '').toLowerCase().includes(filters.productName.toLowerCase());
    const matchVar = (v.variantName || '').toLowerCase().includes(filters.variantName.toLowerCase());
    const matchSup = (v.supplierName || '—').toLowerCase().includes(filters.supplierName.toLowerCase());
    return matchCat && matchProd && matchVar && matchSup;
  });

  return (
    <Layout title="Product Catalogue">
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={[...new Set(filteredVariants.map(v => v.category || 'Uncategorized'))].sort()}
              value={filters.category || null}
              onChange={(_, newValue) => handleFilterChange('category', newValue || '')}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Category" variant="outlined" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={[...new Set(filteredVariants.map(v => v.productName || ''))].filter(Boolean).sort()}
              value={filters.productName || null}
              onChange={(_, newValue) => handleFilterChange('productName', newValue || '')}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Product Name" variant="outlined" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Autocomplete
              options={[...new Set(filteredVariants.map(v => v.variantName || ''))].filter(Boolean).sort()}
              value={filters.variantName || null}
              onChange={(_, newValue) => handleFilterChange('variantName', newValue || '')}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Variant Name" variant="outlined" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Autocomplete
              options={[...new Set(filteredVariants.map(v => v.supplierName || '—'))].sort()}
              value={filters.supplierName || null}
              onChange={(_, newValue) => handleFilterChange('supplierName', newValue || '')}
              renderInput={(params) => (
                <TextField {...params} size="small" label="Supplier" variant="outlined" />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
             <Button variant="outlined" color="secondary" onClick={handleClearFilters} sx={{ minWidth: 'auto', p: 1, height: 40 }} title="Clear Filters">
               <ClearIcon />
             </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Variant Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'right' }}>Threshold</TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: '#64748b' }}>Loading catalogue...</TableCell></TableRow>
            ) : filteredVariants.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: '#64748b' }}>No products match the filters.</TableCell></TableRow>
            ) : (
              filteredVariants.map((v) => (
                <TableRow key={v.variantId} sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>{v.category || 'Uncategorized'}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{v.productName}</TableCell>
                  <TableCell>{v.variantName}</TableCell>
                  <TableCell>{v.supplierName || '—'}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600 }}>{v.stock}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>{v.threshold}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{
                      display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 600,
                      bgcolor: v.stockStatus === 'OUT_OF_STOCK' ? '#fee2e2' : v.stockStatus === 'LOW_STOCK' ? '#fef3c7' : '#dcfce7',
                      color: v.stockStatus === 'OUT_OF_STOCK' ? '#dc2626' : v.stockStatus === 'LOW_STOCK' ? '#d97706' : '#16a34a'
                    }}>
                      {v.stockStatus.replace('_', ' ')}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
}
