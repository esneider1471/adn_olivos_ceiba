import { LoginForm } from '@/features/auth/login-form';
import { RedirectIfAuthed } from '../redirect-if-authed';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <RedirectIfAuthed>
        <LoginForm />
      </RedirectIfAuthed>
    </main>
  );
}
