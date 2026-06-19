"use client";

import {
  BarChart2,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { ProfileDropdown } from "@/components/ui/profile-dropdown";

// ---------------------------------------------------------------------------
// Nav definition
// ---------------------------------------------------------------------------
type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string;
};

const NAV_ITEMS: Omit<NavItem, "icon">[] = [
  { key: "dashboard", label: "Dashboard",     href: "/teacher" },
  { key: "grading",   label: "Grading Queue", href: "/teacher/grading", badge: "!" },
  { key: "courses",   label: "My Courses",    href: "/teacher/courses" },
  { key: "students",  label: "Students",      href: "/teacher/students" },
  { key: "schedule",  label: "Schedule",      href: "/teacher/schedule" },
  { key: "messages",  label: "Messages",      href: "/teacher/messages" },
  { key: "reports",   label: "Reports",       href: "/teacher/reports" },
  { key: "tutor",     label: "Aalgo AI",      href: "/teacher/tutor" },
  { key: "profile",   label: "Profile",       href: "/teacher/profile" },
  { key: "settings",  label: "Settings",      href: "/teacher/settings" },
];

const ICON_MAP: Record<string, ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  grading:   <ClipboardCheck  size={20} />,
  courses:   <BookOpen        size={20} />,
  students:  <Users           size={20} />,
  schedule:  <CalendarDays    size={20} />,
  messages:  <MessageCircle   size={20} />,
  reports:   <BarChart2       size={20} />,
  tutor:     <Sparkles        size={20} />,
  profile:   <User            size={20} />,
  settings:  <Settings        size={20} />,
};

const BOTTOM_KEYS = ["dashboard", "grading", "courses", "students", "schedule"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isActive(href: string, pathname: string) {
  if (href === "/teacher") return pathname === "/teacher";
  return pathname.startsWith(href);
}

// Teal-green teacher palette
const ACCENT      = "#0D9488"; // teal-600
const ACCENT_SOFT = "#CCFBF1"; // teal-100
const ACCENT_TEXT = "#0F766E"; // teal-700
const BG_DARK     = "#0B1120"; // very dark navy
const BG_NAV      = "#111827"; // dark slate

// ---------------------------------------------------------------------------
// Sidebar Nav Link
// ---------------------------------------------------------------------------
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
      style={
        active
          ? { background: ACCENT, color: "#fff" }
          : { color: "#94A3B8" }
      }
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center">
        {item.icon}
      </span>
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
export function TeacherShell({
  children,
  teacherName,
  subject,
}: {
  children: ReactNode;
  teacherName: string;
  subject?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = NAV_ITEMS.map((item) => ({
    ...item,
    icon: ICON_MAP[item.key],
  }));

  const initials = teacherName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: "#F1F5F9" }}>
      {/* ── Desktop sidebar ───────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 transition-all duration-200"
        style={{ width: 240, background: BG_NAV, borderRight: "1px solid rgba(255,255,255,.06)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 text-[13px] font-extrabold text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #065F46)` }}>
            T
          </div>
          <div>
            <div className="text-[14px] font-extrabold text-white leading-none">Aalgorix</div>
            <div className="text-[11px] font-semibold mt-0.5" style={{ color: ACCENT }}>Teacher Portal</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1" style={{ scrollbarWidth: "none" }}>
          {navItems.map((item) => (
            <SideNavLink key={item.key} item={item} />
          ))}
        </nav>

        {/* Profile chip */}
        <div className="px-3 pb-4 pt-2 border-t border-white/5">
          <Link href="/teacher/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-colors hover:bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #065F46)` }}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white truncate">{teacherName}</div>
              {subject && <div className="text-[11px] font-medium truncate" style={{ color: "#64748B" }}>{subject}</div>}
            </div>
          </Link>
        </div>
      </aside>

      {/* ── Tablet sidebar (icon-only) ─────────────────────── */}
      <aside
        className="hidden sm:flex md:hidden flex-col fixed top-0 left-0 h-screen z-30"
        style={{ width: 64, background: BG_NAV, borderRight: "1px solid rgba(255,255,255,.06)" }}
      >
        <div className="flex items-center justify-center py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-[11px] flex items-center justify-center text-[13px] font-extrabold text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #065F46)` }}>
            T
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1" style={{ scrollbarWidth: "none" }}>
          {navItems.map((item) => (
            <SideNavLink key={item.key} item={item} iconOnly />
          ))}
        </nav>
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
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #065F46)` }}>T</div>
                <span className="text-[14px] font-extrabold text-white">Teacher Portal</span>
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

      {/* ── Main content area ─────────────────────────────── */}
      {/*
        The two sidebars are position:fixed, so they don't occupy flow space.
        We push this entire column right by matching the sidebar width at each breakpoint.
      */}
      <div className="flex flex-col min-h-screen w-full ml-0 sm:ml-[64px] md:ml-[240px]">

        {/* Topbar */}
        <header
          className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-[64px] border-b"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderColor: "#E2E8F0",
          }}
        >
          {/* mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="sm:hidden w-9 h-9 rounded-[10px] border border-slate-200 flex items-center justify-center text-slate-600"
          >
            <Menu size={18} />
          </button>

          {/* search */}
          <div className="flex-1 max-w-[360px] flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-[12px] px-3 py-2">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              placeholder="Search students, courses…"
              className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* ask Aalgo */}
            <Link
              href="/teacher/tutor"
              className="hidden sm:flex items-center gap-2 text-white text-[13px] font-bold px-4 py-2.5 rounded-[12px] transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                boxShadow: "0 6px 16px rgba(99,102,241,.32)",
              }}
            >
              <Sparkles className="w-[17px] h-[17px]" />
              <span className="hidden lg:inline">Ask Aalgo</span>
            </Link>

            {/* notifications */}
            <button className="relative w-9 h-9 rounded-[10px] border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:border-teal-300 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>

            {/* avatar dropdown */}
            <ProfileDropdown
              displayName={teacherName}
              subtitle={subject ?? "Teacher"}
              trigger={
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-teal-400 transition-all"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #065F46)` }}
                >
                  {initials}
                </div>
              }
              items={[
                { label: "View profile", href: "/teacher/profile",  icon: <User     size={15} /> },
                { label: "Settings",     href: "/teacher/settings", icon: <Settings size={15} /> },
                { label: "Messages",     href: "/teacher/messages", icon: <MessageCircle size={15} /> },
                { label: "Help & support", href: "/contact",        icon: <HelpCircle   size={15} /> },
              ]}
            />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="sm:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-slate-200 bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {BOTTOM_KEYS.map((key) => {
            const item = navItems.find((n) => n.key === key)!;
            if (!item) return null;
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={key}
                href={item.href}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors"
                style={{ color: active ? ACCENT_TEXT : "#94A3B8" }}
              >
                <span style={{ color: active ? ACCENT : "#94A3B8" }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
