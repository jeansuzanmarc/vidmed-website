import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { dailyReportService } from '../services/dataService';
import { DailyReport } from '../types';
import { useAuthStore } from '../stores/authStore';

interface DailyReportFormData {
  date: string;
  consultation_revenue: string;
  medicines_revenue: string;
  patient_count: number;
  notes?: string;
}

export const DailyReportsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<DailyReport | null>(null);
  const [viewReport, setViewReport] = useState<DailyReport | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DailyReportFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      consultation_revenue: '0',
      medicines_revenue: '0',
      patient_count: 0,
      notes: '',
    },
  });

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dailyReportService.list();
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des rapports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleOpenDialog = (report?: DailyReport) => {
    if (report) {
      setEditingReport(report);
      reset({
        date: report.date,
        consultation_revenue: report.consultation_revenue,
        medicines_revenue: report.medicines_revenue,
        patient_count: report.patient_count,
        notes: report.notes || '',
      });
    } else {
      setEditingReport(null);
      reset({
        date: new Date().toISOString().split('T')[0],
        consultation_revenue: '0',
        medicines_revenue: '0',
        patient_count: 0,
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingReport(null);
  };

  const onSubmit = async (data: DailyReportFormData) => {
    try {
      setError(null);
      const payload = {
        ...data,
        clinic: user?.clinic || 1,
        submitted_by: user?.id || 0,
      };

      if (editingReport) {
        await dailyReportService.update(editingReport.id, payload);
      } else {
        await dailyReportService.create(payload);
      }

      handleCloseDialog();
      loadReports();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du rapport');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce rapport?')) {
      return;
    }

    try {
      setError(null);
      await dailyReportService.delete(id);
      loadReports();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du rapport');
    }
  };

  const handleView = (report: DailyReport) => {
    setViewReport(report);
  };

  const formatCurrency = (value: string | number) => {
    return parseFloat(value.toString()).toLocaleString('fr-HT', {
      style: 'currency',
      currency: 'HTG',
    });
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
          Rapports Journaliers
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Rapport
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
              <TableCell align="right">Consultations</TableCell>
              <TableCell align="right">Médicaments</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Patients</TableCell>
              <TableCell align="right">Rev./Patient</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucun rapport disponible
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    {new Date(report.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(report.consultation_revenue)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(report.medicines_revenue)}
                  </TableCell>
                  <TableCell align="right">
                    <strong>{formatCurrency(report.total_revenue)}</strong>
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={report.patient_count} color="primary" size="small" />
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(report.revenue_per_patient)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(report)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(report)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(report.id)}
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

      {/* Dialog Formulaire */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingReport ? 'Modifier le Rapport' : 'Nouveau Rapport Journalier'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: 'La date est requise' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date"
                      type="date"
                      fullWidth
                      error={!!errors.date}
                      helperText={errors.date?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="patient_count"
                  control={control}
                  rules={{
                    required: 'Le nombre de patients est requis',
                    min: { value: 0, message: 'Minimum: 0' },
                    max: { value: 500, message: 'Maximum: 500 patients/jour' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nombre de Patients"
                      type="number"
                      fullWidth
                      error={!!errors.patient_count}
                      helperText={errors.patient_count?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="consultation_revenue"
                  control={control}
                  rules={{
                    required: 'Le revenu consultations est requis',
                    min: { value: 0, message: 'Minimum: 0' },
                    max: { value: 5000000, message: 'Maximum: 5,000,000 HTG' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Revenu Consultations (HTG)"
                      type="number"
                      fullWidth
                      error={!!errors.consultation_revenue}
                      helperText={errors.consultation_revenue?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="medicines_revenue"
                  control={control}
                  rules={{
                    required: 'Le revenu médicaments est requis',
                    min: { value: 0, message: 'Minimum: 0' },
                    max: { value: 10000000, message: 'Maximum: 10,000,000 HTG' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Revenu Médicaments (HTG)"
                      type="number"
                      fullWidth
                      error={!!errors.medicines_revenue}
                      helperText={errors.medicines_revenue?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (optionnel)"
                      multiline
                      rows={3}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingReport ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={!!viewReport} onClose={() => setViewReport(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails du Rapport</DialogTitle>
        <DialogContent>
          {viewReport && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(viewReport.date).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Patients
                  </Typography>
                  <Typography variant="body1">
                    {viewReport.patient_count}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Consultations
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(viewReport.consultation_revenue)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Médicaments
                  </Typography>
                  <Typography variant="body1">
                    {formatCurrency(viewReport.medicines_revenue)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(viewReport.total_revenue)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Revenu/Patient
                  </Typography>
                  <Typography variant="h6" color="secondary">
                    {formatCurrency(viewReport.revenue_per_patient)}
                  </Typography>
                </Grid>
                {viewReport.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{viewReport.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewReport(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
