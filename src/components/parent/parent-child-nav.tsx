"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { LinkedChild } from "@/app/(dashboard)/parent/types";

const CHILD_SCOPED_ROUTES = [
  "/parent",
  "/parent/assignments",
  "/parent/attendance",
  "/parent/messages",
  "/parent/fees",
];

function childHref(childId: string, pathname: string): string {
  if (pathname.startsWith("/parent/report-card")) {
    return `/parent/report-card/${childId}`;
  }

  const base =
    CHILD_SCOPED_ROUTES.find((route) => pathname === route || pathname.startsWith(`${route}/`)) ??
    "/parent";

  return `${base}?child=${childId}`;
}

export function ParentChildNav({
  linkedChildren,
  activeChildId,
}: {
  linkedChildren: LinkedChild[];
  activeChildId: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const childFromQuery = searchParams.get("child");

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-stone-200 pb-1 mb-6"
      aria-label="Linked students"
    >
      {linkedChildren.map((child) => {
        const isActive = child.id === activeChildId || child.id === childFromQuery;
        const label = child.full_name?.trim() || child.email;
        return (
          <Link
            key={child.id}
            href={childHref(child.id, pathname)}
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-t-lg px-4 py-3 text-sm font-bold tracking-tight transition-colors duration-200 ${
              isActive
                ? "border border-b-0 border-stone-200 bg-white text-amber-700 shadow-sm"
                : "text-stone-600 hover:bg-white/60 hover:text-stone-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
