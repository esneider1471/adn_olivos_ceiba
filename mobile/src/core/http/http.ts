import { config } from '../config';

/**
 * Cliente HTTP mínimo sobre `fetch`.
 *
 * - Prefija la base URL de la API.
 * - Adjunta el `Authorization: Bearer <token>` si hay sesión activa.
 * - Normaliza el cuerpo de error de NestJS
 *   (`{ statusCode, message: string | string[] }`) a una `HttpError` legible.
 * - Ante un `401` limpia la sesión; el `auth-context` reacciona al aviso
 *   y la navegación a /login la hace el `<Redirect>` declarativo.
 */

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

type TokenProvider = () => string | null;

let getToken: TokenProvider = () => null;

/** Inyecta el proveedor de token para romper el ciclo de import con auth. */
export function setTokenProvider(provider: TokenProvider): void {
  getToken = provider;
}

async function onUnauthorized(): Promise<void> {
  const { clearSession } = await import('../auth/token-storage');
  clearSession();
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  ignoreAuthError?: boolean;
}

export async function request<T>(
  path: string,
  { method = 'GET', body, ignoreAuthError }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${config.apiUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await safeParseJson(response);

  if (!response.ok) {
    if (response.status === 401 && !ignoreAuthError) {
      await onUnauthorized();
    }
    throw new HttpError(response.status, extractMessage(data, response.status));
  }

  return data as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

async function safeParseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * NestJS devuelve `message` como `string` o `string[]` (p. ej. ValidationPipe).
 * Lo normalizamos a una sola frase legible.
 */
function extractMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const message = (data as { message?: unknown }).message;
    if (typeof message === 'string') {
      return message;
    }
    if (Array.isArray(message) && message.every((m) => typeof m === 'string')) {
      return (message as string[]).join(' · ');
    }
  }
  return `Error ${status}`;
}
