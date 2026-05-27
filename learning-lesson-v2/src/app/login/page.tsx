import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase text-violet">Supabase Auth</p>
        <h1 className="mt-3 text-4xl font-black">Login or create an account</h1>
        <p className="mt-4 text-ink/70">
          This MVP uses Supabase email/password auth and stores lesson progress per user.
        </p>
      </div>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
