import { RegisterForm } from '@/features/auth/register-form';
import { RedirectIfAuthed } from '../redirect-if-authed';

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <RedirectIfAuthed>
        <RegisterForm />
      </RedirectIfAuthed>
    </main>
  );
}
