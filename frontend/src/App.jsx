import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Workers from './pages/Workers';
import Tasks from './pages/Tasks';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import ProductCatalogue from './pages/ProductCatalogue';

const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' },
    secondary: { main: '#8b5cf6' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    success: { main: '#10b981' },
    background: { default: '#f8fafc' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Redirect root based on user is handled by ProtectedRoute, but for pure aesthetics we map '/' to '/admin/dashboard' */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/inventory" element={<Inventory />} />
              <Route path="/admin/suppliers" element={<Suppliers />} />
              <Route path="/admin/workers" element={<Workers />} />
              <Route path="/admin/tasks" element={<Tasks />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/product-catalogue" element={<ProductCatalogue />} />
            </Route>

            {/* Labour Routes */}
            <Route element={<ProtectedRoute allowedRoles={['LABOUR']} />}>
              <Route path="/labour/tasks" element={<Tasks isLabour={true} />} />
              <Route path="/labour/inventory" element={<Inventory isLabour={true} />} />
              <Route path="/labour/notifications" element={<Notifications isLabour={true} />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
