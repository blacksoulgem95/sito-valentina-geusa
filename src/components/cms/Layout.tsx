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
        
        // Only redirect to login if user is not authenticated and not already on login page
        const isLoginPage = location.pathname === '/login' || location.pathname.endsWith('/login');
        if (!user && !isLoginPage) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setLoading(false);
        // Only redirect if not on login page
        const isLoginPage = location.pathname === '/login' || location.pathname.endsWith('/login');
        if (!isLoginPage) {
          navigate('/login');
        }
      }
    };

    // Only check auth if initialized
    if (initialized) {
      checkAuth(); // Initial check
      
      // Only set interval if we're not on login page
      const isLoginPage = location.pathname === '/login' || location.pathname.endsWith('/login');
      if (!isLoginPage) {
        const interval = setInterval(checkAuth, 60000); // Check every minute
        return () => clearInterval(interval);
      }
    }
  }, [initialized, location.pathname, navigate, setUser, setLoading, initialize]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Only block rendering if user is not authenticated and not on login page
  const isLoginPage = location.pathname === '/login' || location.pathname.endsWith('/login');
  if (!user && !isLoginPage) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      {children}
    </div>
  );
}
