import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { setTokenProvider } from '../http/http';

/**
 * Persistencia de la sesión.
 *
 * En dispositivos nativos el token vive en el secure store de la plataforma
 * (Keychain en iOS, Keystore en Android); en web se cae a `localStorage`
 * porque SecureStore no está disponible.
 *
 * Solo se guarda el `access_token`; los datos del usuario se recuperan con
 * `GET /auth/me` al cargar la app. Se mantiene una copia en memoria para que
 * el http client pueda adjuntarla de forma síncrona en cada petición.
 */

const TOKEN_KEY = 'task-manager:access_token';

let inMemoryToken: string | null = null;

/**
 * Suscriptores que se avisan cuando la sesión se limpia (p. ej. un 401 del
 * http client). El `auth-context` lo usa para sincronizar su estado
 * (`user = null`); con eso el `<Redirect>` declarativo de RequireAuth
 * navega a /login, sin que la navegación viva dentro del http client.
 */
let onSessionCleared: (() => void) | null = null;

export function setOnSessionCleared(handler: (() => void) | null): void {
  onSessionCleared = handler;
}

/** Proveedor que el http client usa para adjuntar el Bearer token. */
export function getAccessToken(): string | null {
  return inMemoryToken;
}

export async function setAccessToken(token: string | null): Promise<void> {
  inMemoryToken = token;
  try {
    if (Platform.OS === 'web') {
      if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // Si persistir falla, el token en memoria mantiene la sesión
    // durante el ciclo de vida de la app.
  }
}

/** Carga el token persistido (una sola vez, al hidratar la sesión). */
export async function loadStoredToken(): Promise<string | null> {
  if (inMemoryToken) return inMemoryToken;
  try {
    if (Platform.OS === 'web') return window.localStorage.getItem(TOKEN_KEY);
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (inMemoryToken === null) return; // ya limpia, no duplicar el aviso
  inMemoryToken = null;
  void setAccessToken(null);
  onSessionCleared?.();
}

// Se registra el proveedor al cargar el módulo (idempotente).
setTokenProvider(getAccessToken);
