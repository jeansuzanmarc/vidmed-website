import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Card,
  CardContent,
  TextField,
  Button,
} from '@mui/material';
import { cashFlowService } from '../services/dataService';
import { CashFlow } from '../types';

export const CashFlowPage: React.FC = () => {
  const [cashFlow, setCashFlow] = useState<CashFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadCashFlow = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await cashFlowService.list(params);
      setCashFlow(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement du flux de trésorerie');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCashFlow();
  }, []);

  const handleFilter = () => {
    loadCashFlow();
  };

  const formatCurrency = (value: string | number) => {
    return parseFloat(value.toString()).toLocaleString('fr-HT', {
      style: 'currency',
      currency: 'HTG',
    });
  };

  const calculateTotals = () => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalPatientPayments = 0;
    let totalCompanyPayments = 0;
    let totalOwnerDeposits = 0;
    let totalOwnerWithdrawals = 0;

    cashFlow.forEach((item) => {
      totalRevenue += parseFloat(item.total_revenue || '0');
      totalExpenses += parseFloat(item.total_expenses || '0');
      totalPatientPayments += parseFloat(item.total_patient_payments || '0');
      totalCompanyPayments += parseFloat(item.total_company_payments || '0');
      totalOwnerDeposits += parseFloat(item.total_owner_deposits || '0');
      totalOwnerWithdrawals += parseFloat(item.total_owner_withdrawals || '0');
    });

    const netCashFlow =
      totalRevenue -
      totalExpenses +
      totalPatientPayments +
      totalCompanyPayments +
      totalOwnerDeposits -
      totalOwnerWithdrawals;

    return {
      totalRevenue,
      totalExpenses,
      totalPatientPayments,
      totalCompanyPayments,
      totalOwnerDeposits,
      totalOwnerWithdrawals,
      netCashFlow,
    };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        Flux de Trésorerie
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleFilter}
                fullWidth
              >
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

      {/* Résumé */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Revenus Totaux
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(totals.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Dépenses Totales
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(totals.totalExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Paiements Reçus
              </Typography>
              <Typography variant="h6" color="info.main">
                {formatCurrency(
                  totals.totalPatientPayments + totals.totalCompanyPayments
                )}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Flux Net
              </Typography>
              <Typography
                variant="h6"
                color={totals.netCashFlow >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(totals.netCashFlow)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tableau détaillé */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Revenus</TableCell>
              <TableCell align="right">Dépenses</TableCell>
              <TableCell align="right">Paiements Patients</TableCell>
              <TableCell align="right">Paiements Entreprise</TableCell>
              <TableCell align="right">Apports Proprio.</TableCell>
              <TableCell align="right">Retraits Proprio.</TableCell>
              <TableCell align="right">Flux Net</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cashFlow.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucune donnée disponible pour cette période
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              cashFlow.map((item, index) => {
                const netFlow =
                  parseFloat(item.total_revenue || '0') -
                  parseFloat(item.total_expenses || '0') +
                  parseFloat(item.total_patient_payments || '0') +
                  parseFloat(item.total_company_payments || '0') +
                  parseFloat(item.total_owner_deposits || '0') -
                  parseFloat(item.total_owner_withdrawals || '0');

                return (
                  <TableRow key={index} hover>
                    <TableCell>
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      {formatCurrency(item.total_revenue || 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      {formatCurrency(item.total_expenses || 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'info.main' }}>
                      {formatCurrency(item.total_patient_payments || 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'info.main' }}>
                      {formatCurrency(item.total_company_payments || 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'success.main' }}>
                      {formatCurrency(item.total_owner_deposits || 0)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'error.main' }}>
                      {formatCurrency(item.total_owner_withdrawals || 0)}
                    </TableCell>
                    <TableCell align="right">
                      <strong
                        style={{
                          color: netFlow >= 0 ? 'green' : 'red',
                        }}
                      >
                        {formatCurrency(netFlow)}
                      </strong>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
