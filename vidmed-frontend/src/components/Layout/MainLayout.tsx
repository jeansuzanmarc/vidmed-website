import { useState, useEffect } from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppBar } from './AppBar';
import { Sidebar } from './Sidebar';
import { alertService } from '@/services/dataService';
import { useAuthStore } from '@/stores/authStore';

export const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Charger le nombre d'alertes non résolues
    if (user?.clinic) {
      alertService
        .list({ clinic: user.clinic, is_resolved: false })
        .then((response) => {
          setUnreadAlertsCount(response.count);
        })
        .catch((error) => {
          console.error('Error loading alerts:', error);
        });
    }
  }, [user]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar onMenuClick={handleSidebarToggle} unreadAlertsCount={unreadAlertsCount} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
