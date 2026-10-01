'use client';

import { useState } from 'react';
import { useTasks } from './use-tasks';
import { TaskForm } from './task-form';
import { TaskItem } from './task-item';
import { Alert, Button, Card, EmptyState, Spinner } from '@/shared';
import type { CreateTaskInput } from './types';

/**
 * Lista de tareas + formulario de creación. Es el bloque principal del
 * dashboard: gestiona el estado vía `useTasks`.
 */
export function TaskList() {
  const { tasks, error, createTask, updateTask, deleteTask } = useTasks();
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mis tareas</h2>
        {!creating && (
          <Button onClick={() => setCreating(true)}>+ Nueva tarea</Button>
        )}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {creating && (
        <Card className="p-4">
          <TaskForm
            submitLabel="Crear tarea"
            submitting={saving}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </Card>
      )}

      {tasks === null ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6 text-ink-soft" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="Aún no hay tareas"
          hint="Crea la primera con el botón «Nueva tarea»."
        />
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskItem task={task} onUpdate={updateTask} onDelete={deleteTask} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
