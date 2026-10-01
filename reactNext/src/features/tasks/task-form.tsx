'use client';

import { useState } from 'react';
import { Button, Input, Textarea } from '@/shared';
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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    // `description` siempre como string: en edición, enviar `''` limpia la
    // descripción (con `undefined` la API no tocaría el campo).
    onSubmit({
      title: trimmedTitle,
      description: description.trim(),
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" noValidate>
      <Input
        label="Título"
        type="text"
        id="task-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Qué hay que hacer"
        maxLength={200}
        required
      />
      <Textarea
        label="Descripción (opcional)"
        id="task-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Detalles de la tarea"
        rows={3}
        maxLength={2000}
      />
      <div className="flex items-center gap-3">
        <label htmlFor="task-status" className="text-sm font-medium text-ink">
          Estado
        </label>
        <select
          id="task-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-2 focus:outline-offset-1 focus:outline-primary"
        >
          <option value="PENDING">Pendiente</option>
          <option value="COMPLETED">Completada</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting} disabled={!title.trim()}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
