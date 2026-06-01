import { useEffect } from 'react';
import { useSnackbar, VariantType } from 'notistack';
import {
  initializeFirebase,
  requestNotificationPermission,
  onMessageListener,
} from '@/services/firebaseService';

export const useNotifications = () => {
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    // Initialiser Firebase
    const initialized = initializeFirebase();

    if (initialized && 'Notification' in window) {
      // Demander permission
      requestNotificationPermission().catch((error) => {
        console.error('Error requesting notification permission:', error);
      });

      // Écouter les messages
      const unsubscribe = onMessageListener((payload) => {
        // Afficher dans l'UI
        enqueueSnackbar(payload.notification?.body || 'Nouvelle notification', {
          variant: 'info',
          autoHideDuration: 5000,
        });
      });

      return unsubscribe;
    }
  }, [enqueueSnackbar]);

  const showNotification = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, { variant });
  };

  return { showNotification };
};
