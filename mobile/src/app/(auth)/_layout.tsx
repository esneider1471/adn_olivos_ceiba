import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';

/**
 * Grupo de rutas de auth (login, register): si ya hay sesión activa, lleva
 * directo al dashboard para no mostrar formularios a un usuario logueado.
 */
export default function AuthGroupLayout() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Redirect href="/dashboard" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
