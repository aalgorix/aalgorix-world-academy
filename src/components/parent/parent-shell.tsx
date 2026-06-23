"use client";

import {
  Bell,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { ProfileDropdown } from "@/components/ui/profile-dropdown";

type NavItem = {
  key: string;
  label: string;
  href: string;
  icon: ReactNode;
};

const NAV_ITEMS: Omit<NavItem, "icon">[] = [
  { key: "dashboard",   label: "Dashboard",    href: "/parent" },
  { key: "assignments", label: "Assignments",  href: "/parent/assignments" },
  { key: "attendance",  label: "Activity",     href: "/parent/attendance" },
  { key: "messages",    label: "Teachers",     href: "/parent/messages" },
  { key: "tutor",       label: "Aalgo AI",     href: "/parent/tutor" },
  { key: "fees",        label: "Fees",         href: "/parent/fees" },
  { key: "settings",    label: "Settings",     href: "/parent/settings" },
];

const ICON_MAP: Record<string, ReactNode> = {
  dashboard:   <LayoutDashboard size={20} />,
  assignments: <ClipboardList   size={20} />,
  attendance:  <CalendarCheck   size={20} />,
  messages:    <MessageCircle   size={20} />,
  tutor:       <Sparkles        size={20} />,
  fees:        <CreditCard      size={20} />,
  settings:    <Settings        size={20} />,
};

const BOTTOM_KEYS = ["dashboard", "assignments", "attendance", "messages", "settings"];

const ACCENT      = "#D97706";
const ACCENT_DARK = "#B45309";
const BG_NAV      = "#1C1917";

function isActive(href: string, pathname: string) {
  if (href === "/parent") return pathname === "/parent";
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
      style={active ? { background: ACCENT, color: "#fff" } : { color: "#A8A29E" }}
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
      {!iconOnly && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function ParentShell({
  children,
  parentName,
  linkedChildCount,
}: {
  children: ReactNode;
  parentName: string;
  linkedChildCount: number;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = NAV_ITEMS.map((item) => ({
    ...item,
    icon: ICON_MAP[item.key],
  }));

  const initials = parentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const bottomItems = BOTTOM_KEYS.map((k) => navItems.find((n) => n.key === k)!).filter(Boolean);

  return (
    <div className="flex min-h-screen" style={{ background: "#FAFAF9" }}>
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-30 w-[240px]"
        style={{ background: BG_NAV, borderRight: "1px solid rgba(255,255,255,.06)" }}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0 text-[13px] font-extrabold text-white"
            style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}
          >
            P
          </div>
          <div>
            <div className="text-[14px] font-extrabold text-white leading-none">Aalgorix</div>
            <div className="text-[11px] font-semibold mt-0.5" style={{ color: "#FCD34D" }}>
              Parent Portal
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1" style={{ scrollbarWidth: "none" }}>
          {navItems.map((item) => (
            <SideNavLink key={item.key} item={item} />
          ))}
        </nav>

        <div className="px-3 pb-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-[12px]">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
              style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white truncate">{parentName}</div>
              <div className="text-[11px] font-medium truncate" style={{ color: "#78716C" }}>
                {linkedChildCount} linked learner{linkedChildCount !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <aside
        className="hidden sm:flex md:hidden flex-col fixed top-0 left-0 h-screen z-30 w-[64px]"
        style={{ background: BG_NAV, borderRight: "1px solid rgba(255,255,255,.06)" }}
      >
        <div className="flex items-center justify-center py-5 border-b border-white/5">
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center text-[13px] font-extrabold text-white"
            style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}
          >
            P
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1" style={{ scrollbarWidth: "none" }}>
          {navItems.map((item) => (
            <SideNavLink key={item.key} item={item} iconOnly />
          ))}
        </nav>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute top-0 left-0 h-full w-[260px] flex flex-col" style={{ background: BG_NAV }}>
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
              <span className="text-[14px] font-extrabold text-white">Parent Portal</span>
              <button onClick={() => setDrawerOpen(false)} className="text-stone-400 hover:text-white">
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

      <div className="flex flex-col min-h-screen w-full ml-0 sm:ml-[64px] md:ml-[240px]">
        <header
          className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 h-[64px] border-b"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(12px)",
            borderColor: "#E7E5E4",
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="sm:hidden w-9 h-9 rounded-[10px] border border-stone-200 flex items-center justify-center text-stone-600"
          >
            <Menu size={18} />
          </button>

          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-extrabold"
            style={{ background: "#FEF3C7", color: ACCENT_DARK }}
          >
            <Users size={11} />
            Guardian
          </div>

          <div className="flex-1" />

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/parent/report-card"
              className="hidden sm:flex items-center gap-2 text-white text-[13px] font-bold px-4 py-2.5 rounded-[12px] transition-opacity hover:opacity-90"
              style={{
                background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})`,
                boxShadow: "0 6px 16px rgba(217,119,6,.28)",
              }}
            >
              <FileText className="w-[17px] h-[17px]" />
              <span className="hidden lg:inline">Report card</span>
            </Link>

            <button className="relative w-9 h-9 rounded-[10px] border border-stone-200 bg-white flex items-center justify-center text-stone-600">
              <Bell size={16} />
            </button>

            <ProfileDropdown
              displayName={parentName}
              subtitle="Parent / Guardian"
              trigger={
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-amber-400 transition-all"
                  style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_DARK})` }}
                >
                  {initials}
                </div>
              }
              items={[
                { label: "Family settings", href: "/parent/settings", icon: <Settings size={15} /> },
                { label: "Help & support", href: "/contact", icon: <HelpCircle size={15} /> },
              ]}
            />
          </div>
        </header>

        <main className="flex-1 pb-16 sm:pb-0">{children}</main>

        <nav
          className="sm:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t border-stone-200 bg-white"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {bottomItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.key}
                href={item.href}
                className="flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors"
                style={{ color: active ? ACCENT_DARK : "#A8A29E" }}
              >
                <span style={{ color: active ? ACCENT : "#A8A29E" }}>{item.icon}</span>
                <span className="truncate max-w-full px-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
