import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LoginForm } from '@/features/auth/login-form';
import { colors, fontSizes, spacing } from '@/shared';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <LoginForm />
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/register')}
        style={styles.footer}
      >
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <Text style={styles.footerLink}>Regístrate</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  footerLink: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
});
