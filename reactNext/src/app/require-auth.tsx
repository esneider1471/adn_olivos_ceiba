'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { Spinner } from '@/shared';

/**
 * Envuelve rutas protegidas: si no hay sesión (y ya terminó la hidratación),
 * redirige a /login. Mientras se valida el token, muestra un spinner.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6 text-ink-soft" />
      </div>
    );
  }

  return <>{children}</>;
}
