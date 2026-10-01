'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-context';
import { Spinner } from '@/shared';

/**
 * Para /login y /register: si ya hay sesión activa, lleva directo al
 * dashboard para no mostrar formularios de auth a un usuario logueado.
 */
export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [loading, user, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-6 w-6 text-ink-soft" />
      </div>
    );
  }

  return <>{children}</>;
}
