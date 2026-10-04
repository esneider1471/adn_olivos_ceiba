import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider } from '@/features/auth/auth-context';
import { colors } from '@/shared';

// Mantiene el splash hasta que el bundle esté listo (oculto automáticamente).
SplashScreen.setOptions({ duration: 400, fade: true });

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </AuthProvider>
  );
}
