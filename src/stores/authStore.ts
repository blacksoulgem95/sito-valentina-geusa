import { create } from 'zustand';
import { authService, type User } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    loading: true,
    initialized: false,
    setUser: (user) => set({ user, loading: false, initialized: true }),
    setLoading: (loading) => set({ loading }),
    initialize: async () => {
      if (typeof window !== 'undefined') {
        try {
          const user = await authService.getCurrentUser();
          set({ user, loading: false, initialized: true });
        } catch (error) {
          set({ user: null, loading: false, initialized: true });
        }
      }
    },
  };
});
