"use client";

import Link from "next/link";
import { useState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  roleLabel,
  SIGNUP_ROLES,
  type SignupRole,
} from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SignupRole>("student");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          role,
          full_name: fullName.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Aalgorix World Academy and start learning today"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-300 transition hover:text-indigo-200"
          >
            Sign in
          </Link>
        </>
      }
    >
      {success ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-100"
        >
          <p className="font-medium">Check your email</p>
          <p className="mt-1 text-emerald-200/90">
            We sent a confirmation link to <strong>{email}</strong>. Click it to
            activate your account, then sign in.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-200"
            >
              I am registering as
            </label>
            <select
              id="role"
              name="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value as SignupRole)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/30"
            >
              {SIGNUP_ROLES.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-white">
                  {roleLabel(r)}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400">
              Parents enroll children and monitor progress. Students access courses.
              Teachers grade work and support learners.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-200"
            >
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Jane Smith"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/30"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/30"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
