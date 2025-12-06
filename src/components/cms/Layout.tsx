import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { onAuthChange } from '@/lib/firebase/auth';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading, initialized, setUser, setLoading, initialize } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }

    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
      
      if (!user && location.pathname !== '/login') {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [initialized, location.pathname, navigate, setUser, setLoading, initialize]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user && location.pathname !== '/login') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {children}
    </div>
  );
}
