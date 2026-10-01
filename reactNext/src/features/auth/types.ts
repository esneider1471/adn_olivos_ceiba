/** Usuario tal y como lo devuelve la API (sin hash de password). */
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

/** El API devuelve `access_token` en snake_case — espejo exacto. */
export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
