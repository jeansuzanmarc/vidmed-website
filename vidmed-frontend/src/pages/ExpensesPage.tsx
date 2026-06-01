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
  MenuItem,
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { expenseService } from '../services/dataService';
import { Expense } from '../types';
import { useAuthStore } from '../stores/authStore';

interface ExpenseFormData {
  date: string;
  category: string;
  description: string;
  amount: string;
  payment_method: string;
  notes?: string;
}

const CATEGORIES = [
  { value: 'SALARIES', label: 'Salaires' },
  { value: 'RENT', label: 'Loyer' },
  { value: 'SUPPLIES', label: 'Fournitures médicales' },
  { value: 'UTILITIES', label: 'Services publics' },
  { value: 'MAINTENANCE', label: 'Entretien' },
  { value: 'OTHER', label: 'Autre' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Espèces' },
  { value: 'BANK_TRANSFER', label: 'Virement bancaire' },
  { value: 'CHECK', label: 'Chèque' },
  { value: 'MOBILE_MONEY', label: 'Argent mobile' },
];

export const ExpensesPage: React.FC = () => {
  const { user } = useAuthStore();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewExpense, setViewExpense] = useState<Expense | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'OTHER',
      description: '',
      amount: '0',
      payment_method: 'CASH',
      notes: '',
    },
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.list();
      setExpenses(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des dépenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      reset({
        date: expense.date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        payment_method: expense.payment_method,
        notes: expense.notes || '',
      });
    } else {
      setEditingExpense(null);
      reset({
        date: new Date().toISOString().split('T')[0],
        category: 'OTHER',
        description: '',
        amount: '0',
        payment_method: 'CASH',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingExpense(null);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      setError(null);
      const payload = {
        ...data,
        clinic: user?.clinic || 1,
        submitted_by: user?.id || 0,
      };

      if (editingExpense) {
        await expenseService.update(editingExpense.id, payload);
      } else {
        await expenseService.create(payload);
      }

      handleCloseDialog();
      loadExpenses();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de la dépense');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette dépense?')) {
      return;
    }

    try {
      setError(null);
      await expenseService.delete(id);
      loadExpenses();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la dépense');
    }
  };

  const handleView = (expense: Expense) => {
    setViewExpense(expense);
  };

  const formatCurrency = (value: string | number) => {
    return parseFloat(value.toString()).toLocaleString('fr-HT', {
      style: 'currency',
      currency: 'HTG',
    });
  };

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category)?.label || category;
  };

  const getPaymentMethodLabel = (method: string) => {
    return PAYMENT_METHODS.find(pm => pm.value === method)?.label || method;
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
          Dépenses
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouvelle Dépense
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
              <TableCell>Catégorie</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Montant</TableCell>
              <TableCell>Mode de paiement</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucune dépense disponible
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} hover>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getCategoryLabel(expense.category)}
                      size="small"
                      color="secondary"
                    />
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell align="right">
                    <strong>{formatCurrency(expense.amount)}</strong>
                  </TableCell>
                  <TableCell>{getPaymentMethodLabel(expense.payment_method)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(expense)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(expense)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(expense.id)}
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
          {editingExpense ? 'Modifier la Dépense' : 'Nouvelle Dépense'}
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
                  name="category"
                  control={control}
                  rules={{ required: 'La catégorie est requise' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Catégorie"
                      select
                      fullWidth
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    >
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: 'La description est requise' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{
                    required: 'Le montant est requis',
                    min: { value: 0, message: 'Minimum: 0' },
                    max: { value: 10000000, message: 'Maximum: 10,000,000 HTG' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Montant (HTG)"
                      type="number"
                      fullWidth
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="payment_method"
                  control={control}
                  rules={{ required: 'Le mode de paiement est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Mode de paiement"
                      select
                      fullWidth
                      error={!!errors.payment_method}
                      helperText={errors.payment_method?.message}
                    >
                      {PAYMENT_METHODS.map((pm) => (
                        <MenuItem key={pm.value} value={pm.value}>
                          {pm.label}
                        </MenuItem>
                      ))}
                    </TextField>
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
              {editingExpense ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={!!viewExpense} onClose={() => setViewExpense(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails de la Dépense</DialogTitle>
        <DialogContent>
          {viewExpense && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(viewExpense.date).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Catégorie
                  </Typography>
                  <Typography variant="body1">
                    {getCategoryLabel(viewExpense.category)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{viewExpense.description}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Montant
                  </Typography>
                  <Typography variant="h6" color="error">
                    {formatCurrency(viewExpense.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mode de paiement
                  </Typography>
                  <Typography variant="body1">
                    {getPaymentMethodLabel(viewExpense.payment_method)}
                  </Typography>
                </Grid>
                {viewExpense.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{viewExpense.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewExpense(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
