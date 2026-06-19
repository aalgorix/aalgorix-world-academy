"use client";

import { Pencil, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CreateUserButton } from "./create-user-button";
import { EditUserModal, type EditableUser } from "./edit-user-modal";

type UserRole = "student" | "teacher" | "parent" | "admin";

export type UserRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
};

const ROLE_STYLE: Record<UserRole, { bg: string; color: string; avatarBg: string }> = {
  student: { bg: "#EDE9FE", color: "#7C3AED", avatarBg: "#7C3AED" },
  teacher: { bg: "#CCFBF1", color: "#0D9488", avatarBg: "#0D9488" },
  parent:  { bg: "#FEF3C7", color: "#B45309", avatarBg: "#D97706" },
  admin:   { bg: "#FEE2E2", color: "#B91C1C", avatarBg: "#DC2626" },
};

function isRole(r: string): r is UserRole {
  return ["student", "teacher", "parent", "admin"].includes(r);
}

export function UsersPanel({
  profiles,
  initialQuery = "",
}: {
  profiles: UserRow[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (roleFilter !== "all" && p.role !== roleFilter) return false;
      if (!q) return true;
      return (
        (p.full_name ?? "").toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
      );
    });
  }, [profiles, query, roleFilter]);

  const byCounts = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1;
    return acc;
  }, {});

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.replace(`/admin/users${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">All Users</h1>
          <p className="mt-1 text-[14px] font-medium text-slate-500">
            {profiles.length} registered account{profiles.length !== 1 ? "s" : ""} across the platform.
          </p>
        </div>
        <CreateUserButton />
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <button
          onClick={() => setRoleFilter("all")}
          className="flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-extrabold transition-colors"
          style={
            roleFilter === "all"
              ? { borderColor: "#7C3AED", background: "#EDE9FE", color: "#7C3AED" }
              : { borderColor: "#E2E8F0", background: "#fff", color: "#64748B" }
          }
        >
          All <span>{profiles.length}</span>
        </button>
        {(["student", "teacher", "parent", "admin"] as UserRole[]).map((role) => {
          const s = ROLE_STYLE[role];
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-extrabold capitalize transition-colors"
              style={
                roleFilter === role
                  ? { borderColor: s.color, background: s.bg, color: s.color }
                  : { borderColor: "#E2E8F0", background: "#fff", color: "#64748B" }
              }
            >
              {role}s <span>{byCounts[role] ?? 0}</span>
            </button>
          );
        })}
      </div>

      {profiles.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-dashed border-slate-300 px-8 py-20 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-[17px] font-extrabold text-slate-900">No users registered yet</p>
        </div>
      ) : (
        <div
          className="bg-white border border-slate-200 rounded-[22px] overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}
        >
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 px-5 py-4 border-b border-slate-100"
          >
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or role…"
              className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-700 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="text-[12px] font-bold text-violet-700 hover:text-violet-900 px-2"
            >
              Search
            </button>
          </form>

          <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            <span>User</span>
            <span>Email</span>
            <span className="text-right">Role</span>
            <span className="text-right">Joined</span>
            <span />
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-[14px] text-slate-500">
              No users match your search.
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const role = isRole(p.role) ? p.role : "student";
                const s = ROLE_STYLE[role];
                const initials = (p.full_name ?? "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const joined = p.created_at
                  ? new Date(p.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <div
                    key={p.id}
                    className="flex sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4 px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
                        style={{ background: s.avatarBg }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-slate-900 truncate">
                          {p.full_name ?? "—"}
                        </div>
                        <div className="sm:hidden text-[12px] text-slate-500 truncate">{p.email}</div>
                      </div>
                    </div>

                    <div className="hidden sm:block min-w-0">
                      <span className="text-[13px] text-slate-600 truncate block">{p.email}</span>
                    </div>

                    <div className="text-right">
                      <span
                        className="text-[11.5px] font-bold px-2.5 py-1 rounded-full capitalize"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {role}
                      </span>
                    </div>

                    <div className="hidden sm:block text-right">
                      <span className="text-[12px] font-medium text-slate-500">{joined}</span>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => setEditingUser(p)}
                        className="w-8 h-8 rounded-[8px] flex items-center justify-center text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-colors"
                        title="Edit user"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => router.refresh()}
        />
      )}
    </>
  );
}
