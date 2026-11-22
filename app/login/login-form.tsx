"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AuthProvider, authMessage, useAuth } from "@/lib/auth";

function Form() {
  const auth = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(params.get("new") ? "signup" : "signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!auth.loading && auth.user) router.replace("/journal");
  }, [auth.loading, auth.user, router]);

  async function run(action: () => Promise<void>) {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void run(() =>
      mode === "signup" ? auth.signUpEmail(name.trim(), email.trim(), password) : auth.signInEmail(email.trim(), password),
    );
  }

  function reset() {
    if (!email.trim()) {
      setError("Enter your email address above, then choose reset again.");
      return;
    }
    void run(async () => {
      await auth.resetPassword(email.trim());
      setNotice("If there is an account for that email, a reset link is on its way.");
    });
  }

  const signup = mode === "signup";

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-10">
      <Link href="/" className="font-display text-lg text-ink">
        My Weight Loss Journal
      </Link>
      <h1 className="mt-8 font-display text-4xl text-ink">
        {signup ? "Start your journal" : "Welcome back"}
      </h1>
      <p className="mt-2 text-muted">
        {signup ? "Create a free account to keep your journal safe on every device." : "Sign in to open your journal."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {signup ? (
          <div>
            <label className="label" htmlFor="name">First name</label>
            <input id="name" className="field" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        ) : null}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required className="field" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="field"
            autoComplete={signup ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {signup ? <p className="mt-1.5 text-sm text-muted">At least 6 characters.</p> : null}
        </div>

        <div aria-live="polite">
          {error ? <p className="rounded-xl bg-clay-soft px-3.5 py-3 text-sm text-clay">{error}</p> : null}
          {notice ? <p className="rounded-xl bg-leaf-soft px-3.5 py-3 text-sm text-leaf-dark">{notice}</p> : null}
        </div>

        <button className="btn w-full" disabled={busy}>
          {signup ? "Create account" : "Sign in"}
        </button>
      </form>

      <button className="btn-quiet mt-3 w-full" disabled={busy} onClick={() => void run(auth.signInGoogle)}>
        Continue with Google
      </button>

      <p className="mt-4 text-sm text-muted">
        By creating an account or continuing with Google you agree to our{" "}
        <Link href="/terms" className="font-semibold text-leaf underline-offset-4 hover:underline">terms</Link> and{" "}
        <Link href="/privacy" className="font-semibold text-leaf underline-offset-4 hover:underline">privacy policy</Link>.
      </p>

      <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm">
        <button className="font-semibold text-leaf underline-offset-4 hover:underline" onClick={() => { setMode(signup ? "signin" : "signup"); setError(""); }}>
          {signup ? "I already have an account" : "Create an account"}
        </button>
        {!signup ? (
          <button className="text-muted underline-offset-4 hover:underline" onClick={reset}>
            Reset password
          </button>
        ) : null}
      </div>
    </main>
  );
}

export default function LoginForm() {
  return (
    <AuthProvider>
      <Form />
    </AuthProvider>
  );
}
