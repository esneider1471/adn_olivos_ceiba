import { setTokenProvider } from '../http/http';

/**
 * Persistencia de la sesión en `localStorage`.
 *
 * Solo se guarda el `access_token`; los datos del usuario se recuperan con
 * `GET /auth/me` al cargar la app. `localStorage` basta para una app de
 * escritorio/local; no es una defensa contra XSS, pero sí es la forma más
 * simple de mantener la sesión entre recargas sin un backend de sesiones.
 */

const TOKEN_KEY = 'task-manager:access_token';

let inMemoryToken: string | null = null;

/** Proveedor que el http client usa para adjuntar el Bearer token. */
export function getAccessToken(): string | null {
  return inMemoryToken;
}

export function setAccessToken(token: string | null): void {
  inMemoryToken = token;
  if (typeof window === 'undefined') return;
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

/** Carga el token persistido (una sola vez, al hidratar el contexto). */
export function loadStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function clearSession(): void {
  setAccessToken(null);
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  // Si ya estamos en /login (p. ej. un login fallido devolvió 401), no
  // recargar: el formulario quiere mostrar su mensaje de error.
  if (window.location.pathname === '/login') return;
  window.location.assign('/login');
}

// Se registra el proveedor al cargar el módulo (idempotente).
setTokenProvider(getAccessToken);
