import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import TopNavbar from './TopNavbar';

export default function Layout({ children, title }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, ml: 0 }}>
        <TopNavbar title={title} />
        <Box
          component="main"
          sx={{
            p: 3,
            mt: 8,
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
