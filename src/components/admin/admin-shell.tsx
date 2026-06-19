"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Shield,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { ProfileDropdown } from "@/components/ui/profile-dropdown";

// ---------------------------------------------------------------------------
// Nav definition
// ---------------------------------------------------------------------------
type NavItem = { key: string; label: string; href: string; icon: ReactNode; badge?: string };

const NAV_ITEMS: Omit<NavItem, "icon">[] = [
  { key: "dashboard",   label: "Dashboard",    href: "/admin" },
  { key: "courses",     label: "Courses",      href: "/admin/courses" },
  { key: "staffing",    label: "Staffing",     href: "/admin/staffing" },
  { key: "users",       label: "Users",        href: "/admin/users" },
  { key: "enrollments", label: "Enrollments",  href: "/admin/enrollments" },
  { key: "reports",     label: "Reports",      href: "/admin/reports" },
  { key: "settings",    label: "Settings",     href: "/admin/settings" },
];

const ICON_MAP: Record<string, ReactNode> = {
  dashboard:   <LayoutDashboard size={20} />,
  courses:     <BookOpen        size={20} />,
  staffing:    <GraduationCap   size={20} />,
  users:       <Users           size={20} />,
  enrollments: <UserPlus        size={20} />,
  reports:     <BarChart3       size={20} />,
  settings:    <Settings        size={20} />,
};

const BOTTOM_KEYS = ["dashboard", "courses", "staffing", "users", "enrollments"];

// Violet admin palette
const ACCENT      = "#7C3AED";
const ACCENT_DARK = "#4C1D95";
const BG_NAV      = "#0F0B1E";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isActive(href: string, pathname: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

function SideNavLink({
  item,
  iconOnly,
  onClick,
}: {
  item: NavItem;
  iconOnly?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = isActive(item.href, pathname);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={iconOnly ? item.label : undefined}
      className="relative flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13.5px] font-semibold transition-all"
      style={active
        ? { background: ACCENT, color: "#fff" }
        : { color: "#94A3B8" }}
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
      {!iconOnly && <span className="truncate">{item.label}</span>}
      {!iconOnly && item.badge && !active && (
        <span className="ml-auto shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-extrabold flex items-center justify-center"
          style={{ background: "#EF4444", color: "#fff" }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------
export function AdminShell({
  children,
  adminName,
}: {
  children: ReactNode;
  adminName: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = NAV_ITEMS.map((item) => ({
    ...item,
    icon: ICON_MAP[item.key],
  }));

  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sidebarContent = (iconOnly?: boolean) => (
    <>
      {/* Logo */}
      <div className={`flex ${iconOnly ? "justify-center" : "items-center gap-3"} px-${iconOnly ? "0" : "5"} py-5 border-b border-white/5`}
        style={{ padding: iconOnly ? "20px 0" : "20px 20px" }}>
        {iconOnly ? (
          <div className="w-9 h-9 rounded-[11px] flex items-center justify-center text-[13px] font-extrabold text-white"
            style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}>A</div>
        ) : (
          <>
            <div className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 text-[13px] font-extrabold text-white"
              style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}>A</div>
            <div>
              <div className="text-[14px] font-extrabold text-white leading-none">Aalgorix</div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: "#A78BFA" }}>Admin Console</div>
            </div>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1"
        style={{ padding: iconOnly ? "16px 8px" : "16px 12px", scrollbarWidth: "none" }}>
        {navItems.map((item) => (
          <SideNavLink key={item.key} item={item} iconOnly={iconOnly} />
        ))}
      </nav>

      {/* Profile chip (full sidebar only) */}
      {!iconOnly && (
        <div className="px-3 pb-4 pt-2 border-t border-white/5">
          <Link href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-colors hover:bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
              style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white truncate">{adminName}</div>
              <div className="text-[11px] font-medium" style={{ color: "#64748B" }}>Administrator</div>
            </div>
          </Link>
        </div>
      )}
    </>
  );

  const bottomItems = BOTTOM_KEYS.map((k) => navItems.find((n) => n.key === k)!).filter(Boolean);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/admin/users?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#F1F5F9" }}>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 w-[240px]"
        style={{ background: BG_NAV, borderRight: "1px solid rgba(255,255,255,.06)" }}>
        {sidebarContent(false)}
      </aside>

      {/* ── Tablet sidebar (icon-only) ─────────────────────── */}
      <aside className="hidden sm:flex md:hidden flex-col fixed top-0 left-0 h-screen z-30 w-[64px] items-center"
        style={{ background: BG_NAV, borderRight: "1px solid rgba(255,255,255,.06)" }}>
        {sidebarContent(true)}
      </aside>

      {/* ── Mobile drawer ─────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-[260px] flex flex-col"
            style={{ background: BG_NAV }}>
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[12px] font-extrabold text-white"
                  style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}>A</div>
                <span className="text-[14px] font-extrabold text-white">Admin Console</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <SideNavLink key={item.key} item={item} onClick={() => setDrawerOpen(false)} />
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ── Main content column ───────────────────────────── */}
      <div className="flex flex-col min-h-screen w-full ml-0 sm:ml-[64px] md:ml-[240px]">

        {/* Topbar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-[64px] border-b"
          style={{ background: "rgba(255,255,255,0.96)", backdropFilter: "blur(12px)", borderColor: "#E2E8F0" }}
        >
          <button onClick={() => setDrawerOpen(true)}
            className="sm:hidden w-9 h-9 rounded-[10px] border border-slate-200 flex items-center justify-center text-slate-600">
            <Menu size={18} />
          </button>

          {/* badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-extrabold"
            style={{ background: "#EDE9FE", color: ACCENT }}>
            <Shield size={11} />
            Admin
          </div>

          {/* search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-[340px] flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-[12px] px-3 py-2"
          >
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, courses…"
              className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-700 placeholder:text-slate-400"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-[10px] border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-violet-300 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <ProfileDropdown
              displayName={adminName}
              subtitle="Administrator"
              trigger={
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-violet-400 transition-all"
                  style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}
                >
                  {initials}
                </div>
              }
              items={[
                { label: "Admin settings", href: "/admin/settings", icon: <Settings size={15} /> },
                { label: "All users",      href: "/admin/users",    icon: <Users    size={15} /> },
                { label: "Help & support", href: "/contact",        icon: <HelpCircle size={15} /> },
              ]}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-16 sm:pb-0">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="sm:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-slate-200 bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {bottomItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors"
                style={{ color: active ? ACCENT : "#94A3B8" }}
              >
                <span style={{ color: active ? ACCENT : "#94A3B8" }}>{item.icon}</span>
                <span className="truncate max-w-full px-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
