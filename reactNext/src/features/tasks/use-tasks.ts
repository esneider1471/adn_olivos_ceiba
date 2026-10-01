'use client';

import { useCallback, useEffect, useState } from 'react';
import { tasksApi } from './api';
import type { CreateTaskInput, Task, UpdateTaskInput } from './types';

interface UseTasksResult {
  /** `null` hasta que termina la primera carga. */
  tasks: Task[] | null;
  error: string | null;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

/**
 * Estado de tareas de la app: carga inicial, refresco tras cada mutación
 * y un `error` legible para mostrarlo en la UI.
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      setTasks(await tasksApi.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las tareas');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createTask = useCallback(
    async (input: CreateTaskInput) => {
      await tasksApi.create(input);
      await refresh();
    },
    [refresh],
  );

  const updateTask = useCallback(
    async (id: string, input: UpdateTaskInput) => {
      await tasksApi.update(id, input);
      await refresh();
    },
    [refresh],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await tasksApi.remove(id);
      await refresh();
    },
    [refresh],
  );

  return { tasks, error, isRefreshing, refresh, createTask, updateTask, deleteTask };
}
