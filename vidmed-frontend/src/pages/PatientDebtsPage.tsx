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
  LinearProgress,
} from '@mui/material';
import { Add, Edit, Delete, Payment, Visibility } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { patientDebtService, debtPaymentService } from '../services/dataService';
import { Debt, DebtPayment } from '../types';
import { useAuthStore } from '../stores/authStore';

interface DebtFormData {
  patient_name: string;
  patient_phone: string;
  initial_amount: string;
  due_date: string;
  description: string;
  notes?: string;
}

interface PaymentFormData {
  amount: string;
  payment_date: string;
  notes?: string;
}

export const PatientDebtsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDebtDialog, setOpenDebtDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [viewDebt, setViewDebt] = useState<Debt | null>(null);
  const [payments, setPayments] = useState<DebtPayment[]>([]);

  const { control: debtControl, handleSubmit: handleDebtSubmit, reset: resetDebt, formState: { errors: debtErrors } } = useForm<DebtFormData>({
    defaultValues: {
      patient_name: '',
      patient_phone: '',
      initial_amount: '0',
      due_date: '',
      description: '',
      notes: '',
    },
  });

  const { control: paymentControl, handleSubmit: handlePaymentSubmit, reset: resetPayment, formState: { errors: paymentErrors } } = useForm<PaymentFormData>({
    defaultValues: {
      amount: '0',
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  const loadDebts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await patientDebtService.list();
      setDebts(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des dettes');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (debtId: number) => {
    try {
      const data = await debtPaymentService.list();
      setPayments(data.filter((p: DebtPayment) => p.debt === debtId));
    } catch (err: any) {
      console.error('Erreur lors du chargement des paiements:', err);
    }
  };

  useEffect(() => {
    loadDebts();
  }, []);

  const handleOpenDebtDialog = (debt?: Debt) => {
    if (debt) {
      setEditingDebt(debt);
      resetDebt({
        patient_name: debt.patient_name,
        patient_phone: debt.patient_phone,
        initial_amount: debt.initial_amount,
        due_date: debt.due_date,
        description: debt.description,
        notes: debt.notes || '',
      });
    } else {
      setEditingDebt(null);
      resetDebt({
        patient_name: '',
        patient_phone: '',
        initial_amount: '0',
        due_date: '',
        description: '',
        notes: '',
      });
    }
    setOpenDebtDialog(true);
  };

  const handleCloseDebtDialog = () => {
    setOpenDebtDialog(false);
    setEditingDebt(null);
  };

  const handleOpenPaymentDialog = (debt: Debt) => {
    setSelectedDebt(debt);
    resetPayment({
      amount: debt.remaining_amount,
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setOpenPaymentDialog(true);
  };

  const handleClosePaymentDialog = () => {
    setOpenPaymentDialog(false);
    setSelectedDebt(null);
  };

  const onDebtSubmit = async (data: DebtFormData) => {
    try {
      setError(null);
      const payload = {
        ...data,
        clinic: user?.clinic || 1,
      };

      if (editingDebt) {
        await patientDebtService.update(editingDebt.id, payload);
      } else {
        await patientDebtService.create(payload);
      }

      handleCloseDebtDialog();
      loadDebts();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de la dette');
    }
  };

  const onPaymentSubmit = async (data: PaymentFormData) => {
    if (!selectedDebt) return;

    try {
      setError(null);
      const payload = {
        ...data,
        debt: selectedDebt.id,
        clinic: user?.clinic || 1,
      };

      await debtPaymentService.create(payload);
      handleClosePaymentDialog();
      loadDebts();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du paiement');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette dette?')) {
      return;
    }

    try {
      setError(null);
      await patientDebtService.delete(id);
      loadDebts();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la dette');
    }
  };

  const handleView = async (debt: Debt) => {
    setViewDebt(debt);
    await loadPayments(debt.id);
  };

  const formatCurrency = (value: string | number) => {
    return parseFloat(value.toString()).toLocaleString('fr-HT', {
      style: 'currency',
      currency: 'HTG',
    });
  };

  const getStatusChip = (debt: Debt) => {
    if (debt.is_paid) {
      return <Chip label="Payé" color="success" size="small" />;
    }
    const dueDate = new Date(debt.due_date);
    const today = new Date();
    if (dueDate < today) {
      return <Chip label="En retard" color="error" size="small" />;
    }
    return <Chip label="En cours" color="warning" size="small" />;
  };

  const getPaymentProgress = (debt: Debt) => {
    const initial = parseFloat(debt.initial_amount);
    const remaining = parseFloat(debt.remaining_amount);
    const paid = initial - remaining;
    const percentage = (paid / initial) * 100;
    return Math.round(percentage);
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
          Dettes Patients
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDebtDialog()}
        >
          Nouvelle Dette
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
              <TableCell>Patient</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell align="right">Montant Initial</TableCell>
              <TableCell align="right">Reste</TableCell>
              <TableCell>Échéance</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Progression</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucune dette disponible
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              debts.map((debt) => (
                <TableRow key={debt.id} hover>
                  <TableCell>{debt.patient_name}</TableCell>
                  <TableCell>{debt.patient_phone}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(debt.initial_amount)}
                  </TableCell>
                  <TableCell align="right">
                    <strong>{formatCurrency(debt.remaining_amount)}</strong>
                  </TableCell>
                  <TableCell>
                    {new Date(debt.due_date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{getStatusChip(debt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={getPaymentProgress(debt)}
                        sx={{ width: 60 }}
                      />
                      <Typography variant="caption">
                        {getPaymentProgress(debt)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(debt)}
                    >
                      <Visibility />
                    </IconButton>
                    {!debt.is_paid && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleOpenPaymentDialog(debt)}
                      >
                        <Payment />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDebtDialog(debt)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(debt.id)}
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

      {/* Dialog Formulaire Dette */}
      <Dialog open={openDebtDialog} onClose={handleCloseDebtDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDebt ? 'Modifier la Dette' : 'Nouvelle Dette Patient'}
        </DialogTitle>
        <form onSubmit={handleDebtSubmit(onDebtSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="patient_name"
                  control={debtControl}
                  rules={{ required: 'Le nom du patient est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom du Patient"
                      fullWidth
                      error={!!debtErrors.patient_name}
                      helperText={debtErrors.patient_name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="patient_phone"
                  control={debtControl}
                  rules={{ required: 'Le téléphone est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Téléphone"
                      fullWidth
                      error={!!debtErrors.patient_phone}
                      helperText={debtErrors.patient_phone?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="initial_amount"
                  control={debtControl}
                  rules={{
                    required: 'Le montant est requis',
                    min: { value: 0, message: 'Minimum: 0' },
                    max: { value: 1000000, message: 'Maximum: 1,000,000 HTG' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Montant (HTG)"
                      type="number"
                      fullWidth
                      error={!!debtErrors.initial_amount}
                      helperText={debtErrors.initial_amount?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="due_date"
                  control={debtControl}
                  rules={{ required: 'La date d\'échéance est requise' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date d'échéance"
                      type="date"
                      fullWidth
                      error={!!debtErrors.due_date}
                      helperText={debtErrors.due_date?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={debtControl}
                  rules={{ required: 'La description est requise' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      error={!!debtErrors.description}
                      helperText={debtErrors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={debtControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (optionnel)"
                      multiline
                      rows={2}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDebtDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingDebt ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Formulaire Paiement */}
      <Dialog open={openPaymentDialog} onClose={handleClosePaymentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Enregistrer un Paiement</DialogTitle>
        <form onSubmit={handlePaymentSubmit(onPaymentSubmit)}>
          <DialogContent>
            {selectedDebt && (
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Patient: {selectedDebt.patient_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Reste à payer: {formatCurrency(selectedDebt.remaining_amount)}
                </Typography>
              </Box>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="amount"
                  control={paymentControl}
                  rules={{
                    required: 'Le montant est requis',
                    min: { value: 0.01, message: 'Minimum: 0.01' },
                    max: {
                      value: selectedDebt ? parseFloat(selectedDebt.remaining_amount) : 0,
                      message: 'Montant supérieur au reste dû',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Montant (HTG)"
                      type="number"
                      fullWidth
                      error={!!paymentErrors.amount}
                      helperText={paymentErrors.amount?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="payment_date"
                  control={paymentControl}
                  rules={{ required: 'La date est requise' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Date du paiement"
                      type="date"
                      fullWidth
                      error={!!paymentErrors.payment_date}
                      helperText={paymentErrors.payment_date?.message}
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={paymentControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Notes (optionnel)"
                      multiline
                      rows={2}
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePaymentDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="success">
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={!!viewDebt} onClose={() => setViewDebt(null)} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la Dette</DialogTitle>
        <DialogContent>
          {viewDebt && (
            <Box>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Patient
                  </Typography>
                  <Typography variant="body1">{viewDebt.patient_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Téléphone
                  </Typography>
                  <Typography variant="body1">{viewDebt.patient_phone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Montant Initial
                  </Typography>
                  <Typography variant="h6" color="error">
                    {formatCurrency(viewDebt.initial_amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Reste à Payer
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {formatCurrency(viewDebt.remaining_amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date d'échéance
                  </Typography>
                  <Typography variant="body1">
                    {new Date(viewDebt.due_date).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Box>{getStatusChip(viewDebt)}</Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{viewDebt.description}</Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom>
                Historique des Paiements
              </Typography>
              {payments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucun paiement enregistré
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Montant</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.payment_date).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>{payment.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDebt(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
