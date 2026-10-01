'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Button, Card, Input } from '@/shared';
import { authApi } from './api';
import { useAuth } from './auth-context';

export function RegisterForm() {
  const router = useRouter();
  const { loginWithAuthResponse } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const auth = await authApi.register({ username, email, password });
      loginWithAuthResponse(auth);
      router.replace('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm p-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <h1 className="text-xl font-semibold">Crear cuenta</h1>
          <p className="mt-1 text-sm text-ink-soft">
            username: letras, números y guiones bajos (3-30)
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Input
          label="Username"
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="juan_perez"
          autoComplete="username"
          required
        />
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
          placeholder="mínimo 6 caracteres"
          autoComplete="new-password"
          required
        />

        <Button type="submit" loading={submitting} className="w-full">
          Registrarme
        </Button>

        <p className="text-center text-sm text-ink-soft">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </Card>
  );
}
