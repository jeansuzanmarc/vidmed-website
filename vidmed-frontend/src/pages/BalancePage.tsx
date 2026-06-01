import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import { balanceService } from '../services/dataService';
import { Balance } from '../types';

export const BalancePage: React.FC = () => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadBalance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await balanceService.get(params);
      setBalance(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handleFilter = () => {
    loadBalance();
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

  if (!balance) {
    return (
      <Box>
        <Typography variant="h4" component="h1" mb={3}>
          Balance Générale
        </Typography>
        <Alert severity="info">Aucune donnée disponible pour cette période</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        Balance Générale
      </Typography>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                label="Date de début"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Date de fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="contained" color="primary" onClick={handleFilter} fullWidth>
                Filtrer
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Résumé financier */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Revenus
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(balance.total_revenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Dépenses
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(balance.total_expenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Actifs
              </Typography>
              <Typography variant="h6" color="info.main">
                {formatCurrency(balance.total_assets)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Passifs
              </Typography>
              <Typography variant="h6" color="warning.main">
                {formatCurrency(balance.total_liabilities)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau des comptes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code Comptable</TableCell>
              <TableCell>Nom du Compte</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell align="right">Débit</TableCell>
              <TableCell align="right">Crédit</TableCell>
              <TableCell align="right">Solde</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {balance.accounts && balance.accounts.length > 0 ? (
              balance.accounts.map((account: any) => (
                <TableRow key={account.code}>
                  <TableCell>
                    <strong>{account.code}</strong>
                  </TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.category}</TableCell>
                  <TableCell align="right">{formatCurrency(account.debit || 0)}</TableCell>
                  <TableCell align="right">{formatCurrency(account.credit || 0)}</TableCell>
                  <TableCell align="right">
                    <strong
                      style={{
                        color:
                          parseFloat(account.balance || '0') >= 0 ? 'green' : 'red',
                      }}
                    >
                      {formatCurrency(account.balance || 0)}
                    </strong>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucun compte disponible
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Résultat net */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Résultat de l'Exercice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenus: {formatCurrency(balance.total_revenue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Dépenses: {formatCurrency(balance.total_expenses)}
              </Typography>
              <Typography variant="h5" color="primary" mt={1}>
                Résultat Net:{' '}
                <strong
                  style={{
                    color:
                      parseFloat(balance.total_revenue) -
                        parseFloat(balance.total_expenses) >=
                      0
                        ? 'green'
                        : 'red',
                  }}
                >
                  {formatCurrency(
                    parseFloat(balance.total_revenue) -
                      parseFloat(balance.total_expenses)
                  )}
                </strong>
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Situation Patrimoniale
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Actifs: {formatCurrency(balance.total_assets)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Passifs: {formatCurrency(balance.total_liabilities)}
              </Typography>
              <Typography variant="h5" color="primary" mt={1}>
                Capitaux Propres:{' '}
                <strong
                  style={{
                    color:
                      parseFloat(balance.total_assets) -
                        parseFloat(balance.total_liabilities) >=
                      0
                        ? 'green'
                        : 'red',
                  }}
                >
                  {formatCurrency(
                    parseFloat(balance.total_assets) -
                      parseFloat(balance.total_liabilities)
                  )}
                </strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
