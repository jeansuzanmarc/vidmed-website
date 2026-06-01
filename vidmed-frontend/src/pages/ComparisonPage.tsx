import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { comparisonService } from '../services/dataService';
import { PeriodComparison } from '../types';

export const ComparisonPage: React.FC = () => {
  const [comparisons, setComparisons] = useState<PeriodComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { period };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await comparisonService.get(params);
      setComparisons(Array.isArray(data) ? data : [data]);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement de la comparaison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComparison();
  }, []);

  const handleFilter = () => {
    loadComparison();
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-HT', {
      style: 'currency',
      currency: 'HTG',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const prepareChartData = () => {
    if (!comparisons || comparisons.length === 0) return [];

    return comparisons.map((item) => ({
      period: item.current_period,
      'Revenus actuels': parseFloat(item.current_revenue || '0'),
      'Revenus précédents': parseFloat(item.previous_revenue || '0'),
      'Dépenses actuelles': parseFloat(item.current_expenses || '0'),
      'Dépenses précédentes': parseFloat(item.previous_expenses || '0'),
      'Résultat net actuel':
        parseFloat(item.current_revenue || '0') - parseFloat(item.current_expenses || '0'),
      'Résultat net précédent':
        parseFloat(item.previous_revenue || '0') - parseFloat(item.previous_expenses || '0'),
    }));
  };

  const calculateSummary = () => {
    if (!comparisons || comparisons.length === 0) {
      return {
        totalCurrentRevenue: 0,
        totalPreviousRevenue: 0,
        totalCurrentExpenses: 0,
        totalPreviousExpenses: 0,
        revenueGrowth: 0,
        expensesGrowth: 0,
      };
    }

    const totals = comparisons.reduce(
      (acc, item) => ({
        totalCurrentRevenue: acc.totalCurrentRevenue + parseFloat(item.current_revenue || '0'),
        totalPreviousRevenue: acc.totalPreviousRevenue + parseFloat(item.previous_revenue || '0'),
        totalCurrentExpenses: acc.totalCurrentExpenses + parseFloat(item.current_expenses || '0'),
        totalPreviousExpenses: acc.totalPreviousExpenses + parseFloat(item.previous_expenses || '0'),
      }),
      {
        totalCurrentRevenue: 0,
        totalPreviousRevenue: 0,
        totalCurrentExpenses: 0,
        totalPreviousExpenses: 0,
      }
    );

    const revenueGrowth =
      totals.totalPreviousRevenue > 0
        ? ((totals.totalCurrentRevenue - totals.totalPreviousRevenue) /
            totals.totalPreviousRevenue) *
          100
        : 0;

    const expensesGrowth =
      totals.totalPreviousExpenses > 0
        ? ((totals.totalCurrentExpenses - totals.totalPreviousExpenses) /
            totals.totalPreviousExpenses) *
          100
        : 0;

    return {
      ...totals,
      revenueGrowth,
      expensesGrowth,
    };
  };

  const chartData = prepareChartData();
  const summary = calculateSummary();

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
        Comparaison de Périodes
      </Typography>

      {/* Filtres */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Période"
                select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="week">Semaine</MenuItem>
                <MenuItem value="month">Mois</MenuItem>
                <MenuItem value="quarter">Trimestre</MenuItem>
                <MenuItem value="year">Année</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Date de début"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Date de fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
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

      {/* Résumé */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Revenus actuels
              </Typography>
              <Typography variant="h6" color="success.main">
                {formatCurrency(summary.totalCurrentRevenue)}
              </Typography>
              <Typography
                variant="caption"
                color={summary.revenueGrowth >= 0 ? 'success.main' : 'error.main'}
              >
                {summary.revenueGrowth >= 0 ? '+' : ''}
                {summary.revenueGrowth.toFixed(1)}% vs période précédente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Revenus précédents
              </Typography>
              <Typography variant="h6">
                {formatCurrency(summary.totalPreviousRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Dépenses actuelles
              </Typography>
              <Typography variant="h6" color="error.main">
                {formatCurrency(summary.totalCurrentExpenses)}
              </Typography>
              <Typography
                variant="caption"
                color={summary.expensesGrowth <= 0 ? 'success.main' : 'error.main'}
              >
                {summary.expensesGrowth >= 0 ? '+' : ''}
                {summary.expensesGrowth.toFixed(1)}% vs période précédente
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Dépenses précédentes
              </Typography>
              <Typography variant="h6">
                {formatCurrency(summary.totalPreviousExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphique Revenus vs Dépenses */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Revenus et Dépenses - Comparaison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="Revenus actuels" fill="#4caf50" />
              <Bar dataKey="Revenus précédents" fill="#81c784" />
              <Bar dataKey="Dépenses actuelles" fill="#f44336" />
              <Bar dataKey="Dépenses précédentes" fill="#e57373" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique Résultat net */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Résultat Net - Évolution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Résultat net actuel"
                stroke="#2196f3"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="Résultat net précédent"
                stroke="#90caf9"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
};
