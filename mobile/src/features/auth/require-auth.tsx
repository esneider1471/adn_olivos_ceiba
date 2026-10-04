import { Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { colors, Spinner } from '@/shared';
import { useAuth } from '@/features/auth/auth-context';

/**
 * Envuelve las rutas protegidas: si no hay sesión (y ya terminó la
 * hidratación), redirige a /login. Mientras valida el token, muestra un
 * spinner.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
