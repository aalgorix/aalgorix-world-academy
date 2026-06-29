"use client";

import { useActionState } from "react";

import { formatExpiryLabel } from "@/lib/parent-link/codes";

import {
  generateParentLinkCodeAction,
  type ParentLinkActionState,
} from "@/app/(dashboard)/student/profile/actions";

const initialState: ParentLinkActionState | null = null;

const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60";

export function ParentLinkPanel({
  linkedParents,
}: {
  linkedParents: { id: string; full_name: string | null; email: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    generateParentLinkCodeAction,
    initialState,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Parent link code</h2>
      <p className="mt-2 text-sm text-slate-600">
        Generate a one-time code your parent enters in their settings. Codes expire
        after 24 hours.
      </p>

      {linkedParents.length > 0 ? (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Linked parents
          </p>
          <ul className="mt-2 space-y-1 text-sm text-slate-700">
            {linkedParents.map((parent) => (
              <li key={parent.id}>
                {parent.full_name?.trim() || parent.email}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form action={formAction} className="mt-6">
        <button type="submit" disabled={pending} className={primaryButtonClassName}>
          {pending ? "Generating…" : "Generate parent link code"}
        </button>
      </form>

      {state && !state.ok && state.error ? (
        <p className="mt-4 text-sm text-rose-600" role="alert">
          {state.error}
        </p>
      ) : null}

      {state?.ok && state.code ? (
        <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Active code — copy now
          </p>
          <p
            className="mt-3 font-mono text-4xl font-extrabold tracking-[0.35em] text-indigo-900"
            aria-label={`Link code ${state.code}`}
          >
            {state.code}
          </p>
          {state.expiresAt ? (
            <p className="mt-2 text-sm text-indigo-800">
              Expires {formatExpiryLabel(state.expiresAt)}
            </p>
          ) : null}
          {state.message ? (
            <p className="mt-2 text-sm text-indigo-700">{state.message}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
