"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";

import { loginWithPassword, type LoginActionState } from "@/app/(auth)/login/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  authInputClassName,
  authPrimaryButtonClassName,
  authSecondaryButtonClassName,
} from "@/components/auth/auth-field-classes";
import { GoogleIcon } from "@/components/auth/google-icon";
import { createClient } from "@/lib/supabase/client";

const initialState: LoginActionState = {};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const urlError = searchParams.get("error");

  const [state, formAction, isPending] = useActionState(
    loginWithPassword,
    initialState,
  );
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const error =
    state.error ??
    googleError ??
    (urlError ? decodeURIComponent(urlError) : null);

  async function handleGoogleSignIn() {
    setGoogleError(null);
    setGoogleLoading(true);

    const supabase = createClient();
    const redirectTo = new URL("/auth/callback", window.location.origin);
    if (next) {
      redirectTo.searchParams.set("next", next);
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
      },
    });

    if (oauthError) {
      setGoogleError(oauthError.message);
      setGoogleLoading(false);
    }
  }

  const isBusy = isPending || googleLoading;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your learning journey"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-300 transition hover:text-indigo-200"
          >
            Create one
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          className={authSecondaryButtonClassName}
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-transparent px-2 text-slate-400">
              or continue with email
            </span>
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          {next ? <input type="hidden" name="next" value={next} /> : null}

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
              className={authInputClassName}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-200"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-indigo-300 transition hover:text-indigo-200"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={authInputClassName}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isBusy}
            className={authPrimaryButtonClassName}
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
