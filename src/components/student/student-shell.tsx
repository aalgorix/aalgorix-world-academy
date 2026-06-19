"use client";

import {
  Award,
  Bell,
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  User,
  Video,
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

function NavIcon({ icon }: { icon: ReactNode }) {
  return <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>;
}

const NAV_ITEMS: Omit<NavItem, "icon">[] = [
  { key: "dashboard",    label: "Dashboard",        href: "/student" },
  { key: "courses",      label: "My Courses",        href: "/student/courses" },
  { key: "live",         label: "Live Classes",      href: "/student/live" },
  { key: "assignments",  label: "Assignments",       href: "/student/assignments", badge: "3" },
  { key: "assessments",  label: "Assessments",       href: "/student/assessments" },
  { key: "attendance",   label: "Attendance",        href: "/student/attendance" },
  { key: "tutor",        label: "Aalgo AI",          href: "/student/tutor" },
  { key: "certificates", label: "Certificates",      href: "/student/certificates" },
  { key: "reports",      label: "Progress Reports",  href: "/student/reports" },
  { key: "messages",     label: "Messages",          href: "/student/messages", badge: "2" },
  { key: "calendar",     label: "Calendar",          href: "/student/calendar" },
  { key: "settings",     label: "Settings",          href: "/student/settings" },
];

const ICON_MAP: Record<string, ReactNode> = {
  dashboard:    <LayoutDashboard size={20} />,
  courses:      <BookOpen        size={20} />,
  live:         <Video           size={20} />,
  assignments:  <ClipboardList   size={20} />,
  assessments:  <ClipboardCheck  size={20} />,
  attendance:   <CalendarCheck   size={20} />,
  tutor:        <Sparkles        size={20} />,
  certificates: <Award           size={20} />,
  reports:      <TrendingUp      size={20} />,
  messages:     <MessageCircle   size={20} />,
  calendar:     <CalendarDays    size={20} />,
  settings:     <Settings        size={20} />,
};

const BOTTOM_KEYS = ["dashboard", "courses", "tutor", "assignments", "calendar"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isActive(href: string, pathname: string) {
  if (href === "/student") return pathname === "/student";
  return pathname.startsWith(href);
}

// ---------------------------------------------------------------------------
// Sidebar nav link
// ---------------------------------------------------------------------------
function SideNavItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[12px] text-[14px] font-semibold transition-colors"
      style={{
        background: active ? "#EEF0FF" : "transparent",
        color: active ? "#5B5BF0" : "#5A5E78",
        justifyContent: collapsed ? "center" : undefined,
      }}
    >
      <span
        className="shrink-0"
        style={{ color: active ? "#5B5BF0" : "#7A7E97" }}
      >
        <NavIcon icon={ICON_MAP[item.key]} />
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 whitespace-nowrap">{item.label}</span>
          {item.badge && (
            <span className="bg-[#FB7185] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface StudentShellProps {
  children: ReactNode;
  displayName: string;
  gradeLabel: string;
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------
export function StudentShell({
  children,
  displayName,
  gradeLabel,
}: StudentShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const initial = displayName.charAt(0).toUpperCase();

  const navItems: NavItem[] = NAV_ITEMS.map((n) => ({
    ...n,
    icon: ICON_MAP[n.key],
  }));

  const bottomItems = BOTTOM_KEYS.map((k) =>
    navItems.find((n) => n.key === k)!,
  );

  return (
    <div
      className="flex min-h-screen w-full relative font-sans"
      style={{ background: "#F6F7FB" }}
    >
      {/* ── Desktop / Tablet Sidebar ─────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col sticky top-0 h-screen z-20 bg-white border-r border-[#ECEDF3] gap-2"
        style={{ padding: "22px 16px" }}
      >
        {/* logo */}
        <div
          className="flex items-center gap-[11px] px-1.5 pb-3.5"
          /* on lg show label, on md icon only */
          style={{ justifyContent: "flex-start" }}
        >
          <div
            className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              boxShadow: "0 6px 16px rgba(99,102,241,.35)",
            }}
          >
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block leading-tight">
            <div className="text-[15px] font-extrabold tracking-tight">
              Aalgorix
            </div>
            <div className="text-[10.5px] font-semibold text-[#9AA0B8] tracking-[0.5px] uppercase font-mono">
              World Academy
            </div>
          </div>
        </div>

        {/* nav links */}
        <nav
          className="flex-1 overflow-y-auto flex flex-col gap-0.5 -mx-1 px-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {navItems.map((item) => (
            <SideNavItem
              key={item.key}
              item={item}
              active={isActive(item.href, pathname)}
              /* on md (tablet): icon-only; on lg: full label */
              collapsed={false}
            />
          ))}
        </nav>

      </aside>

      {/* ── Content column ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* ── Top header ─────────────────────────────────────────── */}
        <header
          className="sticky top-0 z-15 flex items-center gap-3.5"
          style={{
            background: "rgba(246,247,251,.82)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #ECEDF3",
            padding: "14px 28px",
          }}
        >
          {/* mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden w-10 h-10 rounded-[11px] border border-[#ECEDF3] bg-white flex items-center justify-center shrink-0 text-[#41435F]"
          >
            <Menu size={20} />
          </button>

          {/* search – hidden on mobile */}
          <div className="hidden sm:flex flex-1 max-w-[440px] items-center gap-2.5 bg-white border border-[#ECEDF3] rounded-[13px] px-3.5 py-2.5">
            <Search className="w-[18px] h-[18px] text-[#9AA0B8] shrink-0" />
            <input
              placeholder="Search courses, lessons, assignments…"
              className="border-none outline-none bg-transparent flex-1 text-[13.5px] font-medium text-[#1A1B2E] placeholder:text-[#A2A7BE]"
            />
            <kbd className="text-[10.5px] font-semibold text-[#9AA0B8] bg-[#F1F2F7] rounded-[6px] px-1.5 py-0.5 font-mono hidden lg:block">
              ⌘K
            </kbd>
          </div>

          {/* mobile: page title */}
          <div className="flex-1 text-[16px] font-extrabold text-[#1A1B2E] sm:hidden">
            {NAV_ITEMS.find((n) => isActive(n.href, pathname))?.label ??
              "Dashboard"}
          </div>

          {/* right actions */}
          <div className="flex items-center gap-2.5 ml-auto shrink-0">
            {/* ask Aalgo */}
            <Link
              href="/student/tutor"
              className="hidden sm:flex items-center gap-2 text-white text-[13px] font-bold px-4 py-2.5 rounded-[12px] transition-opacity hover:opacity-90"
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                boxShadow: "0 6px 16px rgba(99,102,241,.32)",
              }}
            >
              <Sparkles className="w-[17px] h-[17px]" />
              <span className="hidden lg:inline">Ask Aalgo</span>
            </Link>

            {/* notification bell */}
            <Link
              href="/student/notifications"
              className="relative w-[42px] h-[42px] rounded-[12px] border border-[#ECEDF3] bg-white flex items-center justify-center text-[#41435F]"
            >
              <Bell className="w-[19px] h-[19px]" />
              <span className="absolute top-[9px] right-[10px] w-2 h-2 bg-[#FB7185] border-2 border-white rounded-full" />
            </Link>

            {/* avatar + name — dropdown */}
            <ProfileDropdown
              displayName={displayName}
              subtitle={gradeLabel}
              trigger={
                <div className="flex items-center gap-2 border border-[#ECEDF3] bg-white px-1.5 py-1.5 rounded-[13px] transition-colors hover:border-[#DDE0FF] cursor-pointer">
                  <div
                    className="w-8 h-8 rounded-[9px] flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                    style={{ background: "linear-gradient(135deg,#FBBF24,#F59E0B)" }}
                  >
                    {initial}
                  </div>
                  <div className="hidden lg:block text-left pr-1.5">
                    <div className="text-[13px] font-bold text-[#1A1B2E] leading-tight">{displayName}</div>
                    <div className="text-[10.5px] font-semibold text-[#9AA0B8] font-mono">{gradeLabel}</div>
                  </div>
                </div>
              }
              items={[
                { label: "View profile",   href: "/student/settings", icon: <User        size={15} /> },
                { label: "Settings",       href: "/student/settings", icon: <Settings    size={15} /> },
                { label: "Messages",       href: "/student/messages", icon: <MessageCircle size={15} /> },
                { label: "Help & support", href: "/contact",          icon: <HelpCircle  size={15} /> },
              ]}
            />
          </div>
        </header>

        {/* ── Main scroll area ─────────────────────────────────────── */}
        <main
          className="flex-1 overflow-y-auto pb-24 md:pb-10"
          style={{ scrollbarWidth: "thin" }}
        >
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ──────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around items-center border-t border-[#ECEDF3]"
        style={{
          background: "rgba(255,255,255,.92)",
          backdropFilter: "blur(14px)",
          padding: "8px 6px 10px",
        }}
      >
        {bottomItems.map((item) => {
          const active = isActive(item.href, pathname);
          const isCenter = item.key === "tutor";
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5"
            >
              {isCenter ? (
                <div
                  className="w-[46px] h-[46px] rounded-[15px] flex items-center justify-center -mt-5 text-white"
                  style={{
                    background:
                      "linear-gradient(135deg,#6366F1,#8B5CF6)",
                    boxShadow: "0 8px 18px rgba(99,102,241,.4)",
                  }}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
              ) : (
                <>
                  <span
                    style={{ color: active ? "#5B5BF0" : "#9AA0B8" }}
                  >
                    <NavIcon icon={ICON_MAP[item.key]} />
                  </span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: active ? "#5B5BF0" : "#9AA0B8" }}
                  >
                    {item.label.replace("My ", "")}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Mobile slide-out drawer ────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[rgba(15,16,35,.5)] backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-white flex flex-col gap-1 overflow-y-auto"
            style={{ padding: "22px 16px", scrollbarWidth: "thin" }}
          >
            <div className="flex items-center justify-between px-1.5 pb-4">
              <div className="flex items-center gap-[11px]">
                <div
                  className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                  }}
                >
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="leading-tight">
                  <div className="text-[15px] font-extrabold">Aalgorix</div>
                  <div className="text-[10px] font-semibold text-[#9AA0B8] uppercase font-mono">
                    World Academy
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-9 h-9 rounded-[10px] border border-[#ECEDF3] bg-white flex items-center justify-center text-[#41435F]"
              >
                <X size={18} />
              </button>
            </div>

            {navItems.map((item) => (
              <SideNavItem
                key={item.key}
                item={item}
                active={isActive(item.href, pathname)}
                collapsed={false}
                onClick={() => setDrawerOpen(false)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
