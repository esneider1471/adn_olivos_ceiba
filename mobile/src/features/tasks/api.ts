import { http } from '@/core/http/http';
import type { CreateTaskInput, Task, UpdateTaskInput } from './types';

export const tasksApi = {
  list: () => http.get<Task[]>('/tasks'),
  create: (input: CreateTaskInput) => http.post<Task>('/tasks', input),
  update: (id: string, input: UpdateTaskInput) => http.patch<Task>(`/tasks/${id}`, input),
  remove: (id: string) => http.delete<void>(`/tasks/${id}`),
};
