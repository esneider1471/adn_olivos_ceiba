import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, colors, radii, spacing } from '@/shared';
import type { CreateTaskInput, TaskStatus } from './types';

interface TaskFormProps {
  /** Valores iniciales (modo edición). */
  initial?: { title: string; description: string; status: TaskStatus };
  /** Título del botón de envío. */
  submitLabel: string;
  submitting: boolean;
  onSubmit: (input: CreateTaskInput) => void;
  onCancel: () => void;
}

/**
 * Formulario de creación/edición. En modo creación empieza vacío; en modo
 * edición se rellena con `initial` y solo envía los campos tocados.
 */
export function TaskForm({ initial, submitLabel, submitting, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'PENDING');

  function handleSubmit() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    onSubmit({ title: trimmedTitle, description: description.trim(), status });
  }

  return (
    <View style={styles.form}>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={[styles.input, !title.trim() && styles.inputPlaceholder]}
          value={title}
          onChangeText={setTitle}
          placeholder="Qué hay que hacer"
          placeholderTextColor={colors.inkSoft}
          maxLength={200}
          returnKeyType="next"
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Descripción (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={description}
          onChangeText={setDescription}
          placeholder="Detalles de la tarea"
          placeholderTextColor={colors.inkSoft}
          multiline
          numberOfLines={3}
          maxLength={2000}
        />
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Estado</Text>
        <View style={styles.statusRow}>
          <StatusChip
            label="Pendiente"
            selected={status === 'PENDING'}
            onPress={() => setStatus('PENDING')}
          />
          <StatusChip
            label="Completada"
            selected={status === 'COMPLETED'}
            onPress={() => setStatus('COMPLETED')}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Cancelar" variant="secondary" onPress={onCancel} />
        <Button
          title={submitLabel}
          loading={submitting}
          disabled={!title.trim()}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
}

function StatusChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { backgroundColor: colors.surface, borderColor: colors.line },
      ]}
    >
      <Text
        style={[
          styles.chipLabel,
          { color: selected ? '#ffffff' : colors.inkSoft },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 14,
    color: colors.ink,
  },
  inputPlaceholder: {
    color: colors.inkSoft,
  },
  inputMultiline: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    borderRadius: radii.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    paddingTop: 4,
  },
});
