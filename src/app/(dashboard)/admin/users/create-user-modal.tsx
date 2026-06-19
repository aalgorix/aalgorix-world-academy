"use client";

import { Eye, EyeOff, Loader2, UserPlus, X } from "lucide-react";
import { useRef, useState } from "react";

import { USER_ROLES, type UserRole } from "@/lib/auth/roles";

import { createUserAction } from "./actions";

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  student: "Enrolled learner — can access assigned courses and submit homework.",
  teacher: "Educator — can grade submissions for assigned courses.",
  parent:  "Guardian — can monitor linked children's progress.",
  admin:   "Platform administrator — full access to all management panels.",
};

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  student: { bg: "#EDE9FE", color: "#7C3AED" },
  teacher: { bg: "#CCFBF1", color: "#0D9488" },
  parent:  { bg: "#FEF3C7", color: "#B45309" },
  admin:   { bg: "#FEE2E2", color: "#B91C1C" },
};

export function CreateUserModal({ onClose, onCreated }: {
  onClose:   () => void;
  onCreated: (name: string, role: string) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [role, setRole]           = useState<UserRole>("student");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [createdName, setCreatedName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const result = await createUserAction(fd);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const name = (fd.get("full_name") as string)?.trim() ?? "User";
    setCreatedName(name);
    setSuccess(true);
    onCreated(name, role);
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}>

      <div className="relative w-full max-w-[520px] bg-white rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,.22)] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center"
              style={{ background: "#EDE9FE" }}>
              <UserPlus className="w-4.5 h-4.5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900">Create account</h2>
              <p className="text-[12px] text-slate-500">Account is immediately active — no email verification required.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="px-7 py-10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#D1FAE5" }}>
              <UserPlus className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-[18px] font-extrabold text-slate-900 mb-1">{createdName}&apos;s account created!</h3>
            <p className="text-[13.5px] text-slate-500 mb-6">The account is active and the user can log in immediately.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setSuccess(false); formRef.current?.reset(); setRole("student"); }}
                className="px-5 py-2.5 rounded-[12px] border border-slate-200 text-[13.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Create another
              </button>
              <button onClick={onClose}
                className="px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: "#7C3AED" }}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="px-7 py-5 flex flex-col gap-4">

            {/* Role selector */}
            <div>
              <label className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">Role</label>
              <div className="grid grid-cols-2 gap-2">
                {USER_ROLES.map((r) => {
                  const s = ROLE_COLORS[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className="relative flex flex-col items-start gap-0.5 px-4 py-3 rounded-[14px] border-2 text-left transition-all"
                      style={role === r
                        ? { borderColor: s.color, background: s.bg }
                        : { borderColor: "#E2E8F0", background: "#fff" }}
                    >
                      <span className="text-[13.5px] font-extrabold capitalize" style={{ color: role === r ? s.color : "#334155" }}>{r}</span>
                      <span className="text-[11px] font-medium" style={{ color: role === r ? s.color : "#94A3B8", opacity: 0.85 }}>
                        {r === "student" ? "Learner" : r === "teacher" ? "Educator" : r === "parent" ? "Guardian" : "Full access"}
                      </span>
                      {/* hidden input carries the value */}
                    </button>
                  );
                })}
              </div>
              {/* Hidden actual input for FormData */}
              <input type="hidden" name="role" value={role} />
              <p className="mt-2 text-[12px] text-slate-500">{ROLE_DESCRIPTIONS[role]}</p>
            </div>

            {/* Full name */}
            <div>
              <label htmlFor="full_name" className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Full name</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                className="w-full border border-slate-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-400 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="priya@example.com"
                className="w-full border border-slate-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-400 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
                Temporary password
                <span className="ml-1.5 font-normal normal-case text-slate-400">(min 8 characters)</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="Share this with the user"
                  className="w-full border border-slate-200 rounded-[12px] px-4 py-2.5 pr-11 text-[13.5px] font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1 pb-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-[12px] border border-slate-200 text-[13.5px] font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "#7C3AED" }}>
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? "Creating…" : "Create account"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
