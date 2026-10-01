'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Card, Input } from '@/shared';
import { authApi } from './api';
import { useAuth } from './auth-context';

export function LoginForm() {
  const router = useRouter();
  const { loginWithAuthResponse } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const auth = await authApi.login({ email, password });
      loginWithAuthResponse(auth);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <h1 className="text-xl font-semibold">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-ink-soft">Accede a tu Task Manager</p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Input
          label="Email"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@ejemplo.com"
          autoComplete="email"
          required
        />
        <Input
          label="Contraseña"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <Button type="submit" loading={submitting} className="w-full">
          Entrar
        </Button>

        <p className="text-center text-sm text-ink-soft">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Regístrate
          </Link>
        </p>
      </form>
    </Card>
  );
}
