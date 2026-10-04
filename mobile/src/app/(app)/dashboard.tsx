import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TaskList } from '@/features/tasks/task-list';

import { useAuth } from '@/features/auth/auth-context';
import { RequireAuth } from '@/features/auth/require-auth';
import { Button, colors, fontSizes, spacing } from '@/shared';

/**
 * Dashboard: header con el usuario logueado + lista de tareas.
 * La navegación entre grupos (auth ↔ app) la hacen los `_layout` con
 * <Redirect>, así esta pantalla solo renderiza contenido.
 */
function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Task Manager</Text>
          <Text style={styles.greeting}>Hola, {user?.username}</Text>
        </View>
        <Button title="Cerrar sesión" variant="secondary" onPress={logout} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TaskList />
      </ScrollView>
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  headerText: {
    gap: 2,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.ink,
  },
  greeting: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
