import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RegisterForm } from '@/features/auth/register-form';
import { colors, fontSizes, spacing } from '@/shared';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <RegisterForm />
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push('/login')}
        style={styles.footer}
      >
        <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
        <Text style={styles.footerLink}>Inicia sesión</Text>
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
