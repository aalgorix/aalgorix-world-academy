"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarSignOutTerminal } from "./sidebar-sign-out-terminal";

const NAV_ITEMS = [
  { label: "Overview", href: "/student", match: "exact" as const },
  { label: "Academics", href: "/student/academics", match: "prefix" as const },
  { label: "Schedules", href: "/student/schedule", match: "prefix" as const },
  { label: "Messages", href: "/student/messages", match: "prefix" as const },
  { label: "AI Study Buddy", href: "/student/ai-buddy", match: "prefix" as const },
  {
    label: "Profile & Passport",
    href: "/student/profile",
    match: "prefix" as const,
  },
] as const;

function isNavActive(
  pathname: string,
  href: string,
  match: "exact" | "prefix",
): boolean {
  if (match === "exact") {
    return pathname === href;
  }
  if (href === "/student/academics" && pathname.startsWith("/student/courses")) {
    return true;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentSidebarNav() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Student workspace navigation"
      className="fixed top-16 left-0 bottom-0 z-30 hidden w-64 flex-col justify-between border-r border-slate-800 bg-slate-900 py-6 md:flex"
    >
      <nav className="px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href, item.match);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? "border-l-2 border-indigo-400 bg-indigo-500/15 pl-[10px] text-white"
                      : "border-l-2 border-transparent text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-3">
        <SidebarSignOutTerminal />
      </div>
    </aside>
  );
}
