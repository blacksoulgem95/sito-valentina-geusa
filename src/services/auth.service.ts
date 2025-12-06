import { api } from './api';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface LoginResponse {
  user: User;
  idToken: string;
  refreshToken: string;
}

export interface GoogleLoginResponse {
  user: User;
  customToken: string;
}

class AuthService {
  async loginWithEmail(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    
    api.setAuthToken(response.idToken);
    return response;
  }

  async loginWithGoogle(idToken: string): Promise<GoogleLoginResponse> {
    const response = await api.post<GoogleLoginResponse>('/auth/google', {
      idToken,
    });
    
    // Exchange custom token for ID token if needed
    // For now, we'll use the custom token
    if (response.customToken) {
      // You might need to exchange this with Firebase Auth SDK
      // For simplicity, we'll store it
      api.setAuthToken(response.customToken);
    }
    
    return response;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get<{ user: User }>('/auth/user');
      return response.user;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      api.clearAuthToken();
    }
  }

  isAuthenticated(): boolean {
    return !!api.getAuthToken();
  }
}

export const authService = new AuthService();
