import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { authService } from './authService';
import { useAuthStore } from '@/stores/authStore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

let messaging: Messaging | null = null;

export const initializeFirebase = () => {
  try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log('Firebase initialized');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted');

      if (!messaging) {
        console.error('Firebase messaging not initialized');
        return null;
      }

      const token = await getToken(messaging, { vapidKey });
      console.log('FCM Token:', token);

      // Envoyer le token au backend
      const user = useAuthStore.getState().user;
      if (user) {
        await authService.updateFcmToken(user.id, token);
        console.log('FCM token saved to backend');
      }

      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.error('Firebase messaging not initialized');
    return () => {};
  }

  return onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    callback(payload);

    // Afficher notification
    if (payload.notification) {
      new Notification(payload.notification.title || 'VIDMED', {
        body: payload.notification.body,
        icon: '/logo.png',
      });
    }
  });
};
