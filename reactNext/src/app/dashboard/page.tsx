'use client';

import { Button } from '@/shared';
import { RequireAuth } from '../require-auth';
import { useAuth } from '@/features/auth/auth-context';
import { TaskList } from '@/features/tasks/task-list';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Task Manager</h1>
            <p className="text-sm text-ink-soft">Hola, {user?.username}</p>
          </div>
          <Button variant="secondary" onClick={logout}>
            Cerrar sesión
          </Button>
        </header>
        <TaskList />
      </div>
    </RequireAuth>
  );
}
