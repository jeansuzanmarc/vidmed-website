import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import { Delete, CheckCircle, Refresh } from '@mui/icons-material';
import { alertService } from '../services/dataService';
import { Alert as AlertType } from '../types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await alertService.list();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      setError(null);
      await alertService.update(id, { is_read: true });
      loadAlerts();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour de l\'alerte');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette alerte?')) {
      return;
    }

    try {
      setError(null);
      await alertService.delete(id);
      loadAlerts();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'alerte');
    }
  };

  const getAlertTypeChip = (type: string) => {
    const typeConfig = {
      MISSING_REPORT: { label: 'Rapport manquant', color: 'error' as const },
      OVERDUE_DEBT: { label: 'Dette en retard', color: 'warning' as const },
      LOW_CASH: { label: 'Trésorerie basse', color: 'info' as const },
      MONTHLY_SUMMARY: { label: 'Résumé mensuel', color: 'success' as const },
    };
    const config = typeConfig[type as keyof typeof typeConfig];
    return <Chip label={config?.label || type} color={config?.color || 'default'} size="small" />;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Alertes
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Refresh />}
          onClick={loadAlerts}
        >
          Actualiser
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Envoyé WhatsApp</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucune alerte disponible
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  hover
                  sx={{
                    backgroundColor: alert.is_read ? 'transparent' : 'action.hover',
                  }}
                >
                  <TableCell>
                    {new Date(alert.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>{getAlertTypeChip(alert.alert_type)}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={alert.is_read ? 'normal' : 'bold'}
                    >
                      {alert.message}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {alert.is_read ? (
                      <Chip label="Lu" color="default" size="small" />
                    ) : (
                      <Chip label="Non lu" color="primary" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    {alert.whatsapp_sent ? (
                      <Chip label="Envoyé" color="success" size="small" />
                    ) : (
                      <Chip label="Non envoyé" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {!alert.is_read && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleMarkAsRead(alert.id)}
                        title="Marquer comme lu"
                      >
                        <CheckCircle />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(alert.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
