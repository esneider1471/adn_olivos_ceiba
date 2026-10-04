import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, colors, fontSizes, radii, spacing } from '@/shared';
import { formatDate } from '@/shared/utils/format';
import { TaskForm } from './task-form';
import type { CreateTaskInput, Task, UpdateTaskInput } from './types';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isCompleted = task.status === 'COMPLETED';

  async function handleToggle() {
    await onUpdate(task.id, { status: isCompleted ? 'PENDING' : 'COMPLETED' });
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(task.id);
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  async function handleEditSubmit(input: CreateTaskInput) {
    setSaving(true);
    try {
      await onUpdate(task.id, input);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <Card style={styles.card}>
        <TaskForm
          initial={{ title: task.title, description: task.description ?? '', status: task.status }}
          submitLabel="Guardar cambios"
          submitting={saving}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditing(false)}
        />
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
          onPress={() => void handleToggle()}
          hitSlop={10}
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        <View style={styles.content}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.description ? (
            <Text style={styles.description}>{task.description}</Text>
          ) : null}
          <Text style={styles.date}>{formatDate(task.createdAt)}</Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Editar"
            variant="ghost"
            onPress={() => setEditing(true)}
            style={styles.actionButton}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirming(true)}
            hitSlop={8}
            style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.actionDanger}>Eliminar</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={confirming}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirming(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Eliminar tarea</Text>
            <Text style={styles.modalBody}>
              ¿Estás seguro de eliminar «{task.title}»? Esta acción no se puede deshacer.
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setConfirming(false)}
                disabled={deleting}
              />
              <Button
                title="Eliminar"
                variant="danger"
                loading={deleting}
                onPress={() => void handleDelete()}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.full,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
  },
  titleCompleted: {
    color: colors.inkSoft,
    textDecorationLine: 'line-through',
  },
  description: {
    marginTop: 2,
    fontSize: 14,
    color: colors.inkSoft,
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: colors.inkSoft,
    opacity: 0.8,
  },
  actions: {
    gap: spacing.xs,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    minHeight: 0,
  },
  actionDanger: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.ink,
  },
  modalBody: {
    fontSize: fontSizes.sm,
    color: colors.inkSoft,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
  },
});
