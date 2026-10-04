import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Alert, Button, Card, colors, EmptyState, spacing, Spinner } from '@/shared';
import { TaskForm } from './task-form';
import { TaskItem } from './task-item';
import { useTasks } from './use-tasks';
import type { CreateTaskInput } from './types';

/**
 * Lista de tareas + formulario de creación. Es el bloque principal del
 * dashboard: gestiona el estado vía `useTasks`.
 */
export function TaskList() {
  const { tasks, error, isLoading, isRefreshing, createTask, updateTask, deleteTask } = useTasks();
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleCreate(input: CreateTaskInput) {
    setSaving(true);
    try {
      await createTask(input);
      setCreating(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Mis tareas</Text>
        {!creating && <Button title="+ Nueva tarea" onPress={() => setCreating(true)} />}
      </View>

      {error && <Alert tone="error">{error}</Alert>}

      {creating && (
        <Card style={styles.formCard}>
          <TaskForm
            submitLabel="Crear tarea"
            submitting={saving}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}

      {/* `isLoading` solo en la primera carga; `isRefreshing` solo tras
          mutaciones, cuando la lista ya está montada: nunca dos spinners.
          Si la carga inicial falla, `tasks` queda `null` y solo se muestra
          el Alert de error (arriba), sin contenido. */}
      {isLoading ? (
        <View style={styles.center}>
          <Spinner />
        </View>
      ) : tasks === null ? null : tasks.length === 0 ? (
        <EmptyState
          title="Aún no hay tareas"
          hint="Crea la primera con el botón «Nueva tarea»."
        />
      ) : (
        <View style={styles.list}>
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onUpdate={updateTask}
              onDelete={deleteTask}
            />
          ))}
          {isRefreshing && <Spinner size="small" />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
  },
  formCard: {
    padding: spacing.lg,
  },
  center: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  list: {
    gap: spacing.md,
  },
});
