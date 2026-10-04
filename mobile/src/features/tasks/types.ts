/** Espejo exacto del enum `TaskStatus` de la API. */
export const TASK_STATUSES = ['PENDING', 'COMPLETED'] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

/** Tarea tal y como la devuelve `GET /tasks`. */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdByUserId: string;
  createdAt: string;
}

/** Espejo de `CreateTaskDto` (la API rechaza campos extra). */
export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
}

/** Espejo de `UpdateTaskDto` (actualización parcial). */
export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
