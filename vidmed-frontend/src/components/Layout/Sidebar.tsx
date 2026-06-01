import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as ReportIcon,
  Payment as ExpenseIcon,
  People as DebtIcon,
  Business as CompanyDebtIcon,
  AccountBalance as OwnerIcon,
  Warning as AlertIcon,
  BarChart as StatsIcon,
  Code as CodeIcon,
  Group as UsersIcon,
  LocalHospital as ClinicIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isGrandSuperuser = useAuthStore((state) => state.isGrandSuperuser());
  const isSuperuser = useAuthStore((state) => state.isSuperuser());
  const isManager = useAuthStore((state) => state.isManager());

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  // Menu pour tous
  const commonMenu = [
    { icon: <DashboardIcon />, text: 'Tableau de bord', path: '/dashboard' },
    { icon: <StatsIcon />, text: 'Flux de trésorerie', path: '/cash-flow' },
    { icon: <AlertIcon />, text: 'Alertes', path: '/alerts' },
  ];

  // Menu Manager
  const managerMenu = [
    { icon: <ReportIcon />, text: 'Rapports journaliers', path: '/daily-reports' },
    { icon: <ExpenseIcon />, text: 'Dépenses', path: '/expenses' },
    { icon: <DebtIcon />, text: 'Dettes patients', path: '/patient-debts' },
  ];

  // Menu Superuser
  const superuserMenu = [
    { icon: <CompanyDebtIcon />, text: 'Dettes entreprise', path: '/company-debts' },
    { icon: <OwnerIcon />, text: 'Transactions propriétaire', path: '/owner-transactions' },
    { icon: <StatsIcon />, text: 'Comparaison périodes', path: '/comparison' },
    { icon: <StatsIcon />, text: 'Balance générale', path: '/balance' },
  ];

  // Menu Grand Superuser
  const adminMenu = [
    { icon: <UsersIcon />, text: 'Utilisateurs', path: '/users' },
    { icon: <ClinicIcon />, text: 'Cliniques', path: '/clinics' },
    { icon: <CodeIcon />, text: 'Codes de compte', path: '/account-codes' },
  ];

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {commonMenu.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {(isManager || isSuperuser) && (
          <>
            <Divider />
            <List>
              {managerMenu.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={isActive(item.path)}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {isSuperuser && (
          <>
            <Divider />
            <List>
              {superuserMenu.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={isActive(item.path)}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}

        {isGrandSuperuser && (
          <>
            <Divider />
            <List>
              {adminMenu.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    selected={isActive(item.path)}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
};
