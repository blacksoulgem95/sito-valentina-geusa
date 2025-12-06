import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';
import {
  ShieldCheckIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

const MIN_PASSWORD_LENGTH = 8;

export default function AccountSettings() {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Compila tutti i campi');
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      toast.error(`La nuova password deve avere almeno ${MIN_PASSWORD_LENGTH} caratteri`);
      return;
    }

    if (newPassword === currentPassword) {
      toast.error('La nuova password deve essere diversa da quella attuale');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Le nuove password non coincidono');
      return;
    }

    setLoading(true);
    toast.loading('Aggiornamento password...', { id: 'change-password' });

    try {
      const response = await authService.changePassword(currentPassword, newPassword);

      if (response.user) {
        setUser(response.user);
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success(response.message || 'Password aggiornata con successo', { id: 'change-password' });

      if (response.requiresReauth) {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Errore durante il logout dopo cambio password:', error);
        } finally {
          setUser(null);
          setTimeout(() => {
            navigate('/login');
          }, 800);
        }
      }
    } catch (error: any) {
      console.error('Errore cambio password:', error);
      const message =
        error?.message ||
        (error?.error as string) ||
        'Si è verificato un problema durante il cambio password';
      toast.error(message, { id: 'change-password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-pink-100 rounded-lg">
          <ShieldCheckIcon className="h-6 w-6 text-pink-600" />
        </div>
        <div className="ml-4">
          <h1 className="text-3xl font-bold text-gray-900">Impostazioni account</h1>
          <p className="text-gray-600">
            Gestisci la tua password e le impostazioni di sicurezza del CMS.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <p className="text-sm text-gray-500">Account collegato</p>
            <p className="text-lg font-semibold text-gray-900">{user?.email ?? '—'}</p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <KeyIcon className="h-5 w-5 text-pink-500 mr-2" />
            Password aggiorna sicurezza del CMS
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordInput
            id="current-password"
            label="Password attuale"
            placeholder="Inserisci la password attuale"
            value={currentPassword}
            onChange={setCurrentPassword}
            showPassword={showCurrentPassword}
            togglePassword={() => setShowCurrentPassword((prev) => !prev)}
          />

          <PasswordInput
            id="new-password"
            label="Nuova password"
            placeholder="Scegli una nuova password"
            value={newPassword}
            onChange={setNewPassword}
            showPassword={showNewPassword}
            togglePassword={() => setShowNewPassword((prev) => !prev)}
            helper={`Almeno ${MIN_PASSWORD_LENGTH} caratteri, meglio se includi numeri e simboli.`}
          />

          <PasswordInput
            id="confirm-password"
            label="Conferma nuova password"
            placeholder="Ripeti la nuova password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            showPassword={showConfirmPassword}
            togglePassword={() => setShowConfirmPassword((prev) => !prev)}
          />

          <div className="bg-pink-50 border border-pink-100 rounded-lg p-4 text-sm text-pink-900">
            <p className="font-medium mb-1">Consigli di sicurezza</p>
            <ul className="list-disc list-inside space-y-1 text-pink-800">
              <li>Usa password uniche e difficili da indovinare.</li>
              <li>Evita di riutilizzare password già usate altrove.</li>
              <li>Aggiorna periodicamente le credenziali del CMS.</li>
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvataggio in corso...' : 'Aggiorna password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PasswordInputProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showPassword: boolean;
  togglePassword: () => void;
  helper?: string;
}

function PasswordInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  showPassword,
  togglePassword,
  helper,
}: PasswordInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="block w-full rounded-md border border-gray-300 px-4 py-2 pr-12 shadow-sm focus:border-pink-500 focus:ring-pink-500"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" />
          ) : (
            <EyeIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      {helper && <p className="mt-1 text-sm text-gray-500">{helper}</p>}
    </div>
  );
}
