import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/auth.service';
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

    // Check authentication periodically
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
        setLoading(false);
        
        if (!user && location.pathname !== '/login') {
          navigate('/login');
        }
      } catch (error) {
        setUser(null);
        setLoading(false);
        if (location.pathname !== '/login') {
          navigate('/login');
        }
      }
    };

    const interval = setInterval(checkAuth, 60000); // Check every minute
    checkAuth(); // Initial check

    return () => clearInterval(interval);
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
