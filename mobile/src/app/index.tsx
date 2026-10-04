import { Redirect } from 'expo-router';

import { useAuth } from '@/features/auth/auth-context';

/**
 * Punto de entrada: envía al dashboard si hay sesión activa, al login si no.
 * Mientras termina la hidratación, `RequireAuth` (dentro de /dashboard)
 * muestra un spinner.
 */
export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return <Redirect href={user ? '/dashboard' : '/login'} />;
}
