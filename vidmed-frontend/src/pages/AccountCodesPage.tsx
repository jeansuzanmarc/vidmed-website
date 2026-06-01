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
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { accountCodeService } from '../services/dataService';
import { AccountCode } from '../types';

interface AccountCodeFormData {
  code: string;
  name: string;
  description: string;
  category: 'REVENUE' | 'EXPENSE' | 'ASSET' | 'LIABILITY' | 'EQUITY';
  is_active: boolean;
}

export const AccountCodesPage: React.FC = () => {
  const [codes, setCodes] = useState<AccountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCode, setEditingCode] = useState<AccountCode | null>(null);
  const [viewCode, setViewCode] = useState<AccountCode | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AccountCodeFormData>();

  const loadCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountCodeService.list();
      setCodes(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des codes comptables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  const handleOpenDialog = (code?: AccountCode) => {
    if (code) {
      setEditingCode(code);
      reset({
        code: code.code,
        name: code.name,
        description: code.description || '',
        category: code.category,
        is_active: code.is_active,
      });
    } else {
      setEditingCode(null);
      reset({
        code: '',
        name: '',
        description: '',
        category: 'REVENUE',
        is_active: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCode(null);
  };

  const onSubmit = async (data: AccountCodeFormData) => {
    try {
      setError(null);

      if (editingCode) {
        await accountCodeService.update(editingCode.id, data);
      } else {
        await accountCodeService.create(data);
      }

      handleCloseDialog();
      loadCodes();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde du code comptable');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce code comptable?')) {
      return;
    }

    try {
      setError(null);
      await accountCodeService.delete(id);
      loadCodes();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression du code comptable');
    }
  };

  const handleView = (code: AccountCode) => {
    setViewCode(code);
  };

  const getCategoryChip = (category: string) => {
    const categoryConfig = {
      REVENUE: { label: 'Revenu', color: 'success' as const },
      EXPENSE: { label: 'Dépense', color: 'error' as const },
      ASSET: { label: 'Actif', color: 'info' as const },
      LIABILITY: { label: 'Passif', color: 'warning' as const },
      EQUITY: { label: 'Capitaux propres', color: 'primary' as const },
    };
    const config = categoryConfig[category as keyof typeof categoryConfig];
    return <Chip label={config.label} color={config.color} size="small" />;
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
          Codes Comptables
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Code
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
              <TableCell>Code</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {codes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucun code comptable disponible
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              codes.map((code) => (
                <TableRow key={code.id} hover>
                  <TableCell>
                    <strong>{code.code}</strong>
                  </TableCell>
                  <TableCell>{code.name}</TableCell>
                  <TableCell>{getCategoryChip(code.category)}</TableCell>
                  <TableCell>{code.description || '-'}</TableCell>
                  <TableCell>
                    {code.is_active ? (
                      <Chip label="Actif" color="success" size="small" />
                    ) : (
                      <Chip label="Inactif" color="default" size="small" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(code)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(code)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(code.id)}
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
          {editingCode ? 'Modifier le Code Comptable' : 'Nouveau Code Comptable'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: 'Le code est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Code"
                      fullWidth
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      placeholder="Ex: REV_CONSULTATION"
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
                      SelectProps={{ native: true }}
                    >
                      <option value="REVENUE">Revenu</option>
                      <option value="EXPENSE">Dépense</option>
                      <option value="ASSET">Actif</option>
                      <option value="LIABILITY">Passif</option>
                      <option value="EQUITY">Capitaux propres</option>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Le nom est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      placeholder="Ex: Revenus de consultation"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
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
              {editingCode ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={!!viewCode} onClose={() => setViewCode(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails du Code Comptable</DialogTitle>
        <DialogContent>
          {viewCode && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Code
                  </Typography>
                  <Typography variant="h6">{viewCode.code}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Catégorie
                  </Typography>
                  <Box mt={0.5}>{getCategoryChip(viewCode.category)}</Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Nom
                  </Typography>
                  <Typography variant="body1">{viewCode.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{viewCode.description || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Statut
                  </Typography>
                  <Box mt={0.5}>
                    {viewCode.is_active ? (
                      <Chip label="Actif" color="success" size="small" />
                    ) : (
                      <Chip label="Inactif" color="default" size="small" />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewCode(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
