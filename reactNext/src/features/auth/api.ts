import { http } from '@/core/http/http';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from './types';

export const authApi = {
  login: (payload: LoginPayload) => http.post<AuthResponse>('/auth/login', payload),
  register: (payload: RegisterPayload) => http.post<AuthResponse>('/auth/register', payload),
  me: () => http.get<User>('/auth/me'),
};
