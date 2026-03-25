import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, TextField, Typography, Container, 
  Paper, Alert, CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { loginAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await loginAPI({ email, password });
      login(data.token, {
        userId: data.userId,
        role: data.role,
        name: data.name
      });
      // Redirect based on role
      if (data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/labour/tasks');
      }
    } catch (err) {
      setError(err.response?.data || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box 
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box sx={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 64, height: 64,
              background: 'linear-gradient(135deg, #2563eb 0%, #1e293b 100%)', 
              borderRadius: '20%', 
              mb: 2,
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)'
            }}>
              <NotificationsActiveIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography component="h1" variant="h5" fontWeight="bold" align="center" sx={{ mb: 1, color: '#1e293b' }}>
              SmartNotify Inventory System
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Sign in to your account
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
            </Button>
            
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
