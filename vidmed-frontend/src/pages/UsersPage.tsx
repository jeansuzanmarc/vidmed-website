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
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { userService } from '../services/dataService';
import { User } from '../types';

interface UserFormData {
  username: string;
  email: string;
  phone_number: string;
  role: 'MANAGER' | 'SUPERUSER' | 'GRAND_SUPERUSER';
  first_name: string;
  last_name: string;
  password?: string;
}

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.list();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      reset({
        username: user.username,
        email: user.email,
        phone_number: user.phone_number || '',
        role: user.role,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    } else {
      setEditingUser(null);
      reset({
        username: '',
        email: '',
        phone_number: '',
        role: 'MANAGER',
        first_name: '',
        last_name: '',
        password: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      setError(null);

      if (editingUser) {
        const payload: any = { ...data };
        if (!payload.password || payload.password === '') {
          delete payload.password;
        }
        await userService.update(editingUser.id, payload);
      } else {
        await userService.create(data);
      }

      handleCloseDialog();
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde de l\'utilisateur');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur?')) {
      return;
    }

    try {
      setError(null);
      await userService.delete(id);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression de l\'utilisateur');
    }
  };

  const handleView = (user: User) => {
    setViewUser(user);
  };

  const getRoleChip = (role: string) => {
    const roleConfig = {
      GRAND_SUPERUSER: { label: 'Grand Superuser', color: 'error' as const },
      SUPERUSER: { label: 'Superuser', color: 'warning' as const },
      MANAGER: { label: 'Manager', color: 'info' as const },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'default' as const };
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
          Utilisateurs
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouvel Utilisateur
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
              <TableCell>Nom d'utilisateur</TableCell>
              <TableCell>Nom complet</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucun utilisateur disponible
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.first_name} {user.last_name}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number || '-'}</TableCell>
                  <TableCell>{getRoleChip(user.role)}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => handleView(user)}
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(user.id)}
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
          {editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="username"
                  control={control}
                  rules={{ required: 'Le nom d\'utilisateur est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom d'utilisateur"
                      fullWidth
                      error={!!errors.username}
                      helperText={errors.username?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'L\'email est requis',
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

              <Grid item xs={12} sm={6}>
                <Controller
                  name="first_name"
                  control={control}
                  rules={{ required: 'Le prénom est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Prénom"
                      fullWidth
                      error={!!errors.first_name}
                      helperText={errors.first_name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="last_name"
                  control={control}
                  rules={{ required: 'Le nom est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nom"
                      fullWidth
                      error={!!errors.last_name}
                      helperText={errors.last_name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone_number"
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
                  name="role"
                  control={control}
                  rules={{ required: 'Le rôle est requis' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Rôle"
                      select
                      fullWidth
                      error={!!errors.role}
                      helperText={errors.role?.message}
                    >
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="SUPERUSER">Superuser</MenuItem>
                      <MenuItem value="GRAND_SUPERUSER">Grand Superuser</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: editingUser ? false : 'Le mot de passe est requis',
                    minLength: {
                      value: 8,
                      message: 'Minimum 8 caractères',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                      type="password"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog Détails */}
      <Dialog open={!!viewUser} onClose={() => setViewUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Détails de l'Utilisateur</DialogTitle>
        <DialogContent>
          {viewUser && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nom d'utilisateur
                  </Typography>
                  <Typography variant="body1">{viewUser.username}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Rôle
                  </Typography>
                  <Box mt={0.5}>{getRoleChip(viewUser.role)}</Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Nom complet
                  </Typography>
                  <Typography variant="body1">
                    {viewUser.first_name} {viewUser.last_name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{viewUser.email}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Téléphone
                  </Typography>
                  <Typography variant="body1">{viewUser.phone_number || '-'}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUser(null)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
