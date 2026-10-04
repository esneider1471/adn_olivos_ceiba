import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Alert, Button, Card, Field, colors, spacing } from '@/shared';
import { authApi } from './api';
import { useAuth } from './auth-context';

export function LoginForm() {
  const { loginWithAuthResponse } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const auth = await authApi.login({ email, password });
      loginWithAuthResponse(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>Accede a tu Task Manager</Text>
        </View>

        {error && <Alert tone="error">{error}</Alert>}

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="tu@ejemplo.com"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <Field
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          onSubmitEditing={handleSubmit}
        />

        <Button
          title="Entrar"
          loading={submitting}
          disabled={!email.trim() || !password}
          onPress={handleSubmit}
          style={styles.submit}
        />
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.surface,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkSoft,
  },
  submit: {
    marginTop: spacing.xs,
  },
});
