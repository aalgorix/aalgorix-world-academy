"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import type { HubNavSection } from "@/lib/student/hub/types";

type NavItem = {
  id: HubNavSection | "ai";
  label: string;
  href?: string;
  icon: ReactNode;
  onSelect?: () => void;
};

type NavRailProps = {
  activeSection: HubNavSection;
  onSectionChange: (section: HubNavSection) => void;
  onOpenAiBuddy: () => void;
};

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-slate-900 group-hover:text-white">
      {children}
    </span>
  );
}

export function NavRail({
  activeSection,
  onSectionChange,
  onOpenAiBuddy,
}: NavRailProps) {
  const items: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: (
        <NavIcon>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M10.707 2.293a1 1 0 0 0-1.414 0l-7 7A1 1 0 0 0 3 11h1v6a1 1 0 0 0 1 1h3v-4h4v4h3a1 1 0 0 0 1-1v-6h1a1 1 0 0 0 .707-1.707l-7-7Z" />
          </svg>
        </NavIcon>
      ),
      onSelect: () => onSectionChange("overview"),
    },
    {
      id: "academics",
      label: "Academics",
      icon: (
        <NavIcon>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
        </NavIcon>
      ),
      onSelect: () => onSectionChange("academics"),
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: (
        <NavIcon>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.75A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5.5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z"
              clipRule="evenodd"
            />
          </svg>
        </NavIcon>
      ),
      onSelect: () => onSectionChange("schedule"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: (
        <NavIcon>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.672 2.43 2.902 1.168.212 2.352.37 3.57.524.48.06.96.116 1.435.166V12.78l-1.46-1.46a.75.75 0 1 1 1.06-1.061l2.591 2.59c.293.293.768.293 1.06 0l2.59-2.59a.75.75 0 1 1 1.061 1.06l-1.459 1.46v2.016c.48-.05.955-.106 1.435-.166 1.218-.154 2.402-.312 3.57-.524 1.437-.23 2.43-1.49 2.43-2.902V5.426c0-1.412-.993-2.673-2.43-2.902A41.253 41.253 0 0 0 10 2Z"
              clipRule="evenodd"
            />
          </svg>
        </NavIcon>
      ),
      onSelect: () => onSectionChange("messages"),
    },
    {
      id: "profile",
      label: "Profile",
      href: "/student/profile",
      icon: (
        <NavIcon>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 16.5v-.75A4.5 4.5 0 0 1 10.5 11h0a4.5 4.5 0 0 1 4.5 4.5v.75a.75.75 0 0 1-1.5 0v-.75a3 3 0 0 0-3-3h0a3 3 0 0 0-3 3v.75a.75.75 0 0 1-1.5 0Z" />
          </svg>
        </NavIcon>
      ),
    },
    {
      id: "ai",
      label: "AI Buddy",
      icon: (
        <NavIcon>
          <span className="text-[10px] font-extrabold">AI</span>
        </NavIcon>
      ),
      onSelect: onOpenAiBuddy,
    },
  ];

  return (
    <nav
      aria-label="Student hub navigation"
      className="flex w-20 shrink-0 flex-col items-center gap-2 border-r border-slate-200 bg-white py-4"
    >
      {items.map((item) => {
        const isActive =
          item.id !== "ai" && item.id !== "profile" && activeSection === item.id;

        const className = `group flex w-full flex-col items-center gap-1 px-1 py-2 text-[10px] font-bold text-slate-600 transition-all active:scale-[0.98] ${
          isActive ? "text-slate-900" : "hover:text-slate-900"
        }`;

        if (item.href) {
          return (
            <Link key={item.id} href={item.href} className={className} title={item.label}>
              {item.icon}
              <span className="sr-only sm:not-sr-only sm:max-w-full sm:truncate sm:text-center">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onSelect}
            className={className}
            title={item.label}
          >
            {item.icon}
            <span className="hidden max-w-full truncate text-center sm:block">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
