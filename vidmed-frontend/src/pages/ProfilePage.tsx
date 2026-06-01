import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { userService } from '../services/dataService';

interface ProfileFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
    },
  });

  const { control: passwordControl, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordFormData>({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {
      setError(null);
      setSuccess(null);
      await userService.update(user.id, data);
      updateUser({ ...user, ...data });
      setSuccess('Profil mis à jour avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;

    try {
      setError(null);
      setSuccess(null);

      if (data.new_password !== data.confirm_password) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }

      await userService.update(user.id, {
        password: data.new_password,
      });

      resetPassword();
      setSuccess('Mot de passe modifié avec succès');
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de mot de passe');
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap = {
      GRAND_SUPERUSER: 'Grand Superuser',
      SUPERUSER: 'Superuser',
      MANAGER: 'Manager',
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="warning">Vous devez être connecté pour voir cette page</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" mb={3}>
        Mon Profil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Informations générales */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations du compte
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Rôle
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {getRoleLabel(user.role)}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Clinique
                  </Typography>
                  <Typography variant="body1">
                    {user.clinic_name || 'Non assigné'}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Date de création
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulaire de modification du profil */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Modifier le profil
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="username"
                      control={profileControl}
                      rules={{ required: 'Le nom d\'utilisateur est requis' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nom d'utilisateur"
                          fullWidth
                          size="small"
                          error={!!profileErrors.username}
                          helperText={profileErrors.username?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="email"
                      control={profileControl}
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
                          size="small"
                          error={!!profileErrors.email}
                          helperText={profileErrors.email?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="first_name"
                      control={profileControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Prénom"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="last_name"
                      control={profileControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nom"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="phone_number"
                      control={profileControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Téléphone"
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Mettre à jour le profil
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulaire de changement de mot de passe */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Changer le mot de passe
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Controller
                      name="current_password"
                      control={passwordControl}
                      rules={{ required: 'Le mot de passe actuel est requis' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Mot de passe actuel"
                          type="password"
                          fullWidth
                          size="small"
                          error={!!passwordErrors.current_password}
                          helperText={passwordErrors.current_password?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="new_password"
                      control={passwordControl}
                      rules={{
                        required: 'Le nouveau mot de passe est requis',
                        minLength: {
                          value: 8,
                          message: 'Minimum 8 caractères',
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Nouveau mot de passe"
                          type="password"
                          fullWidth
                          size="small"
                          error={!!passwordErrors.new_password}
                          helperText={passwordErrors.new_password?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="confirm_password"
                      control={passwordControl}
                      rules={{ required: 'Confirmez le mot de passe' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Confirmer le mot de passe"
                          type="password"
                          fullWidth
                          size="small"
                          error={!!passwordErrors.confirm_password}
                          helperText={passwordErrors.confirm_password?.message}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="secondary"
                      fullWidth
                    >
                      Changer le mot de passe
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
