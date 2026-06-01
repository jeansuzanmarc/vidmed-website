import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;

  // Role helpers
  isGrandSuperuser: () => boolean;
  isSuperuser: () => boolean;
  isManager: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      updateUser: (user) => {
        set({ user });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      isGrandSuperuser: () => {
        const { user } = get();
        return user?.role === 'grand_superuser';
      },

      isSuperuser: () => {
        const { user } = get();
        return user?.role === 'superuser' || user?.role === 'grand_superuser';
      },

      isManager: () => {
        const { user } = get();
        return user?.role === 'manager';
      },
    }),
    {
      name: 'vidmed-auth',
    }
  )
);
