import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearSession,
  loadStoredToken,
  setAccessToken,
  setOnSessionCleared,
} from '@/core/auth/token-storage';
import { authApi } from './api';
import type { AuthResponse, User } from './types';

interface AuthContextValue {
  user: User | null;
  /** `true` mientras se hidrata la sesión al cargar la app. */
  loading: boolean;
  loginWithAuthResponse: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Si el http client limpia la sesión por un 401, solo sincronizamos el
  // estado: con `user = null` el <Redirect href="/login"> declarativo de
  // RequireAuth (y /index) ya se encarga de la navegación. Un 401 en
  // /login (credenciales malas) no navega: sin sesión, clearSession no
  // dispara el listener.
  useEffect(() => {
    setOnSessionCleared(() => setUser(null));
    return () => setOnSessionCleared(null);
  }, []);

  // Hidrata la sesión: si hay token guardado, valida contra /auth/me.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await loadStoredToken();
      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }
      await setAccessToken(stored);
      try {
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        // Token inválido o vencido: el http client ya limpió la sesión.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithAuthResponse = useCallback((auth: AuthResponse) => {
    void setAccessToken(auth.access_token);
    setUser(auth.user);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, loginWithAuthResponse, logout }),
    [user, loading, loginWithAuthResponse, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
