"use client";

import Link from "next/link";

import type { HubVaultItem } from "@/lib/student/hub/types";

type StudyVaultGridProps = {
  items: HubVaultItem[];
};

export function StudyVaultGrid({ items }: StudyVaultGridProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
        Study materials and recordings appear here as your teachers publish lesson resources.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-indigo-200 hover:shadow-md active:scale-[0.98]"
        >
          <span
            className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              item.kind === "video"
                ? "bg-violet-100 text-violet-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {item.kind === "video" ? "Class video" : "Study material"}
          </span>
          <p className="mt-2 font-bold text-slate-900">{item.title}</p>
          <p className="text-xs text-slate-500">{item.courseTitle}</p>
          {item.fileName ? (
            <p className="mt-1 truncate text-xs text-slate-400">{item.fileName}</p>
          ) : null}
          {item.href ? (
            <Link
              href={item.href}
              className="mt-3 inline-flex items-center justify-center rounded-lg border border-slate-900 px-3 py-2 text-xs font-bold text-slate-900 transition-all hover:bg-slate-50 active:scale-[0.98]"
            >
              {item.kind === "video" ? "Watch in classroom" : "Open lesson"}
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
