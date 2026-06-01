import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  People,
  Business,
  Warning,
} from '@mui/icons-material';
import { dashboardService } from '@/services/dashboardService';
import { useAuthStore } from '@/stores/authStore';
import { formatCurrency } from '@/utils/format';
import { getErrorMessage } from '@/services/api';
import type { DashboardStats } from '@/types';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            backgroundColor: `${color}.light`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user?.clinic) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user?.clinic) return;

    setLoading(true);
    setError('');

    try {
      const data = await dashboardService.getStats(user.clinic);
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) return null;

  const netResultColor = parseFloat(stats.net_result) >= 0 ? 'success' : 'error';
  const netResultIcon = parseFloat(stats.net_result) >= 0 ? <TrendingUp /> : <TrendingDown />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tableau de bord
      </Typography>

      <Grid container spacing={3}>
        {/* Revenus */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenus du mois"
            value={formatCurrency(stats.total_revenue)}
            icon={<TrendingUp sx={{ color: 'success.main', fontSize: 32 }} />}
            color="success"
          />
        </Grid>

        {/* Dépenses */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dépenses du mois"
            value={formatCurrency(stats.total_expenses)}
            icon={<TrendingDown sx={{ color: 'error.main', fontSize: 32 }} />}
            color="error"
          />
        </Grid>

        {/* Résultat net */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Résultat net"
            value={formatCurrency(stats.net_result)}
            icon={netResultIcon}
            color={netResultColor}
          />
        </Grid>

        {/* Solde */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Solde de trésorerie"
            value={formatCurrency(stats.cash_balance)}
            icon={<AccountBalance sx={{ color: 'primary.main', fontSize: 32 }} />}
            color="primary"
          />
        </Grid>

        {/* Dettes patients */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dettes patients"
            value={formatCurrency(stats.total_patient_debts)}
            icon={<People sx={{ color: 'info.main', fontSize: 32 }} />}
            color="info"
          />
        </Grid>

        {/* Dettes entreprise */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dettes entreprise"
            value={formatCurrency(stats.total_company_debts)}
            icon={<Business sx={{ color: 'warning.main', fontSize: 32 }} />}
            color="warning"
          />
        </Grid>

        {/* Rapports manquants */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Rapports manquants
                  </Typography>
                  <Typography variant="h4" color={stats.missing_reports_count > 0 ? 'error' : 'success'}>
                    {stats.missing_reports_count}
                  </Typography>
                </Box>
                <Warning sx={{ color: stats.missing_reports_count > 0 ? 'error.main' : 'text.secondary', fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Dettes en retard */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="overline">
                    Dettes en retard
                  </Typography>
                  <Typography variant="h4" color={stats.overdue_debts_count > 0 ? 'warning' : 'success'}>
                    {stats.overdue_debts_count}
                  </Typography>
                </Box>
                <Warning sx={{ color: stats.overdue_debts_count > 0 ? 'warning.main' : 'text.secondary', fontSize: 32 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alertes */}
      {(stats.missing_reports_count > 0 || stats.overdue_debts_count > 0) && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="warning">
            {stats.missing_reports_count > 0 && (
              <Typography>
                ⚠️ {stats.missing_reports_count} rapport(s) journalier(s) manquant(s) ce mois
              </Typography>
            )}
            {stats.overdue_debts_count > 0 && (
              <Typography>
                ⚠️ {stats.overdue_debts_count} dette(s) en retard
              </Typography>
            )}
          </Alert>
        </Box>
      )}
    </Box>
  );
};
