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
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { clinicService } from '../services/dataService';
import { Clinic } from '../types';

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  tax_id?: string;
  notes?: string;
}

export const ClinicsPage: React.FC = () => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [viewClinic, setViewClinic] = useState<Clinic | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ClinicFormData>();

  const loadClinics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clinicService.list();
      setClinics(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des cliniques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinics();
  }, []);

  const handleOpenDialog = (clinic?: Clinic) => {
    if (clinic) {
      setEditingClinic(clinic);
      reset({
        name: clinic.name,
        address: clinic.address || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        tax_id: clinic.tax_id || '',
        notes: clinic.notes || '',
      });
    } else {
      setEditingClinic(null);
      reset({
        name: '',
        address: '',
        phone: '',
        email: '',
        tax_id: '',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClinic(null);
  };

  const onSubmit = async (data: ClinicFormData) => {
    try {
      setError(null);

      if (editingClinic) {
        await clinicService.update(editingClinic.id, data);
      } else {
        await clinicService.create(data);
      }

      handleCloseDialog();
      loadClinics();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de la clinique');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette clinique?')) {
      return;
    }

    try {
      setError(null);
      await clinicService.delete(id);
      loadClinics();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de la clinique');
    }
  };

  const handleView = (clinic: Clinic) => {
    setViewClinic(clinic);
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
          Cliniques
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouvelle Clinique
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
              <TableCell>Nom</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>NIF</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clinics.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucune clinique disponible
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clinics.map((clinic) => (
                <TableRow key={clinic.id} hover>
                  <TableCell>{clinic.name}</TableCell>
                  <TableCell>{clinic.address || '-'}</TableCell>
                  <TableCell>{clinic.phone || '-'}</TableCell>
                  <TableCell>{clinic.email || '-'}</TableCell>
                  <TableCell>{clinic.tax_id || '-'}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(clinic)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(clinic)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(clinic.id)}
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
          {editingClinic ? 'Modifier la Clinique' : 'Nouvelle Clinique'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Le nom est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom de la Clinique"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Adresse"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Téléphone"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="tax_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="NIF (Numéro d'Identification Fiscale)"
                      fullWidth
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
              {editingClinic ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={!!viewClinic} onClose={() => setViewClinic(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails de la Clinique</DialogTitle>
        <DialogContent>
          {viewClinic && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Nom
                  </Typography>
                  <Typography variant="h6">{viewClinic.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Adresse
                  </Typography>
                  <Typography variant="body1">{viewClinic.address || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Téléphone
                  </Typography>
                  <Typography variant="body1">{viewClinic.phone || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{viewClinic.email || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    NIF
                  </Typography>
                  <Typography variant="body1">{viewClinic.tax_id || '-'}</Typography>
                </Grid>
                {viewClinic.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{viewClinic.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewClinic(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
