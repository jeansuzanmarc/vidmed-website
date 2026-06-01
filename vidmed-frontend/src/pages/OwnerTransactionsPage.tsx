import React, { useState, useEffect } from 'react';
import {
  Box,
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
import { Add, Edit, Delete, Visibility, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { ownerTransactionService } from '../services/dataService';
import { OwnerTransaction } from '../types';
import { useAuthStore } from '../stores/authStore';

interface OwnerTransactionFormData {
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  amount: string;
  description: string;
  notes?: string;
}

export const OwnerTransactionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<OwnerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<OwnerTransaction | null>(null);
  const [viewTransaction, setViewTransaction] = useState<OwnerTransaction | null>(null);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<OwnerTransactionFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'DEPOSIT',
      amount: '0',
      description: '',
      notes: '',
    },
  });

  const transactionType = watch('type');

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ownerTransactionService.list();
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleOpenDialog = (transaction?: OwnerTransaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      reset({
        date: transaction.date,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        notes: transaction.notes || '',
      });
    } else {
      setEditingTransaction(null);
      reset({
        date: new Date().toISOString().split('T')[0],
        type: 'DEPOSIT',
        amount: '0',
        description: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const onSubmit = async (data: OwnerTransactionFormData) => {
    try {
      setError(null);
      const payload = {
        ...data,
        clinic: user?.clinic || 1,
      };

      if (editingTransaction) {
        await ownerTransactionService.update(editingTransaction.id, payload);
      } else {
        await ownerTransactionService.create(payload);
      }

      handleCloseDialog();
      loadTransactions();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de la transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette transaction?')) {
      return;
    }

    try {
      setError(null);
      await ownerTransactionService.delete(id);
      loadTransactions();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la transaction');
    }
  };

  const handleView = (transaction: OwnerTransaction) => {
    setViewTransaction(transaction);
  };

  const formatCurrency = (value: string | number) => {
    return parseFloat(value.toString()).toLocaleString('fr-HT', {
      style: 'currency',
      currency: 'HTG',
    });
  };

  const getTypeChip = (type: string) => {
    if (type === 'DEPOSIT') {
      return (
        <Chip
          icon={<TrendingUp />}
          label="Apport"
          color="success"
          size="small"
        />
      );
    }
    return (
      <Chip
        icon={<TrendingDown />}
        label="Retrait"
        color="error"
        size="small"
      />
    );
  };

  const calculateBalance = () => {
    let balance = 0;
    transactions.forEach((txn) => {
      const amount = parseFloat(txn.amount);
      if (txn.type === 'DEPOSIT') {
        balance += amount;
      } else {
        balance -= amount;
      }
    });
    return balance;
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
        <Box>
          <Typography variant="h4" component="h1">
            Transactions Propriétaire
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Balance nette: <strong>{formatCurrency(calculateBalance())}</strong>
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouvelle Transaction
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
              <TableCell>Description</TableCell>
              <TableCell align="right">Montant</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucune transaction disponible
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    {new Date(transaction.date).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>{getTypeChip(transaction.type)}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell align="right">
                    <strong
                      style={{
                        color: transaction.type === 'DEPOSIT' ? 'green' : 'red',
                      }}
                    >
                      {transaction.type === 'DEPOSIT' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </strong>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(transaction)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(transaction)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(transaction.id)}
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
          {editingTransaction ? 'Modifier la Transaction' : 'Nouvelle Transaction Propriétaire'}
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
                  name="type"
                  control={control}
                  rules={{ required: 'Le type est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Type de Transaction"
                      select
                      fullWidth
                      error={!!errors.type}
                      helperText={errors.type?.message}
                    >
                      <MenuItem value="DEPOSIT">Apport (Dépôt)</MenuItem>
                      <MenuItem value="WITHDRAWAL">Retrait</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="amount"
                  control={control}
                  rules={{
                    required: 'Le montant est requis',
                    min: { value: 0.01, message: 'Minimum: 0.01' },
                    max: { value: 50000000, message: 'Maximum: 50,000,000 HTG' },
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
                      placeholder={
                        transactionType === 'DEPOSIT'
                          ? 'Ex: Apport en capital pour achat équipement'
                          : 'Ex: Retrait pour frais personnels'
                      }
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
              {editingTransaction ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={!!viewTransaction} onClose={() => setViewTransaction(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails de la Transaction</DialogTitle>
        <DialogContent>
          {viewTransaction && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(viewTransaction.date).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Box mt={0.5}>{getTypeChip(viewTransaction.type)}</Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Montant
                  </Typography>
                  <Typography
                    variant="h5"
                    color={viewTransaction.type === 'DEPOSIT' ? 'success.main' : 'error.main'}
                  >
                    {viewTransaction.type === 'DEPOSIT' ? '+' : '-'}
                    {formatCurrency(viewTransaction.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{viewTransaction.description}</Typography>
                </Grid>
                {viewTransaction.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{viewTransaction.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewTransaction(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
