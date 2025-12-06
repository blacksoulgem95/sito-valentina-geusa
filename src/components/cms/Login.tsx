import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazione base
    if (!email || !password) {
      toast.error('Inserisci email e password');
      return;
    }

    setLoading(true);
    toast.loading('Connessione al server...', { id: 'login' });
    
    try {
      toast.loading('Verifica credenziali...', { id: 'login' });
      const response = await authService.loginWithEmail(email, password);
      
      // Aggiorna lo store con l'utente
      setUser(response.user);
      toast.success('Login effettuato con successo!', { id: 'login' });
      
      // Piccolo delay per mostrare il messaggio di successo
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Messaggi di errore più specifici
      let errorMessage = 'Errore durante il login';
      
      if (error.message) {
        if (error.message.includes('400')) {
          errorMessage = 'Richiesta nel formato errato';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Credenziali non corrette';
        } else if (error.message.includes('404')) {
          errorMessage = 'Pagina non trovata';
        } else if (error.message.includes('500')) {
          errorMessage = 'Errore del server. Riprova più tardi';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Errore di connessione. Verifica la tua connessione internet';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage, { id: 'login' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            CMS Valentina Geusa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accedi al pannello di amministrazione
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
