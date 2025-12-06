// Helper per ottenere ID token da Google usando Firebase SDK client-side
// Questo è necessario solo per il login Google, poi passiamo il token all'API
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();

export async function getGoogleIdToken(): Promise<string> {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return idToken;
}
