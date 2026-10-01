'use client';

import { useState } from 'react';
import { formatDate } from '@/shared';
import { Button, Card } from '@/shared';
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
  const isCompleted = task.status === 'COMPLETED';

  async function handleToggle() {
    await onUpdate(task.id, { status: isCompleted ? 'PENDING' : 'COMPLETED' });
  }

  async function handleDelete() {
    if (window.confirm(`¿Eliminar "${task.title}"?`)) {
      await onDelete(task.id);
    }
  }

  function handleEditSubmit(input: CreateTaskInput) {
    void (async () => {
      setSaving(true);
      try {
        await onUpdate(task.id, input);
        setEditing(false);
      } finally {
        setSaving(false);
      }
    })();
  }

  if (editing) {
    return (
      <Card className="p-4">
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
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={handleToggle}
          aria-label={isCompleted ? 'Marcar como pendiente' : 'Marcar como completada'}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isCompleted
              ? 'border-success bg-success text-white'
              : 'border-line hover:border-success'
          }`}
        >
          {isCompleted && (
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm font-medium ${
              isCompleted ? 'text-ink-soft line-through' : 'text-ink'
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-ink-soft">
              {task.description}
            </p>
          )}
          <p className="mt-1 text-xs text-ink-soft/70">{formatDate(task.createdAt)}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setEditing(true)}>
            Editar
          </Button>
          <Button variant="ghost" className="px-2 py-1 text-xs text-danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  );
}
