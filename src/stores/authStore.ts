import { create } from 'zustand';
import { User } from 'firebase/auth';
import { getCurrentUser } from '@/lib/firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  return {
    user: null,
    loading: true,
    initialized: false,
    setUser: (user) => set({ user, loading: false, initialized: true }),
    setLoading: (loading) => set({ loading }),
    initialize: () => {
      if (typeof window !== 'undefined') {
        const user = getCurrentUser();
        set({ user, loading: false, initialized: true });
      }
    },
  };
});
