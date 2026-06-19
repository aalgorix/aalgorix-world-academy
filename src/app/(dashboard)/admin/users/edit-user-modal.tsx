"use client";

import { Loader2, Pencil, X } from "lucide-react";
import { useState } from "react";

import { USER_ROLES, type UserRole } from "@/lib/auth/roles";

import { updateUserAction } from "./actions";

export type EditableUser = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  phone: string | null;
};

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  student: { bg: "#EDE9FE", color: "#7C3AED" },
  teacher: { bg: "#CCFBF1", color: "#0D9488" },
  parent:  { bg: "#FEF3C7", color: "#B45309" },
  admin:   { bg: "#FEE2E2", color: "#B91C1C" },
};

export function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: EditableUser;
  onClose: () => void;
  onSaved: () => void;
}) {
  const initialRole = USER_ROLES.includes(user.role as UserRole)
    ? (user.role as UserRole)
    : "student";

  const [role, setRole] = useState<UserRole>(initialRole);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    fd.set("role", role);

    const result = await updateUserAction(user.id, fd);
    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-[480px] bg-white rounded-[24px] shadow-[0_24px_64px_rgba(0,0,0,.22)] overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center bg-violet-100">
              <Pencil className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-slate-900">Edit user</h2>
              <p className="text-[12px] text-slate-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
              Full name
            </label>
            <input
              name="full_name"
              defaultValue={user.full_name ?? ""}
              required
              className="w-full border border-slate-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium text-slate-900 outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5">
              Phone
            </label>
            <input
              name="phone"
              defaultValue={user.phone ?? ""}
              placeholder="Optional"
              className="w-full border border-slate-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium text-slate-900 outline-none focus:border-violet-400"
            />
          </div>

          <div>
            <label className="block text-[12.5px] font-extrabold text-slate-600 uppercase tracking-wider mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {USER_ROLES.map((r) => {
                const s = ROLE_COLORS[r];
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="px-4 py-2.5 rounded-[14px] border-2 text-[13px] font-extrabold capitalize text-left transition-all"
                    style={
                      role === r
                        ? { borderColor: s.color, background: s.bg, color: s.color }
                        : { borderColor: "#E2E8F0", background: "#fff", color: "#64748B" }
                    }
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3 pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-[12px] border border-slate-200 text-[13.5px] font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#7C3AED" }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
