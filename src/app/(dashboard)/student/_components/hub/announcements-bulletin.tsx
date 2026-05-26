"use client";

import { useEffect, useState } from "react";

import type { HubAnnouncement } from "@/lib/student/hub/types";

type AnnouncementsBulletinProps = {
  announcements: HubAnnouncement[];
};

export function AnnouncementsBulletin({ announcements }: AnnouncementsBulletinProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % announcements.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [announcements.length]);

  const item = announcements[index];

  return (
    <section
      aria-label="Campus noticeboard announcements"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Campus noticeboard
      </h2>
      {item ? (
        <div className="mt-3 min-h-[96px]">
          <p className="text-sm font-bold text-slate-900">{item.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.body}</p>
          <p className="mt-2 text-[10px] font-semibold text-slate-400">
            {item.authorLabel}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          No priority notices yet. Check back for schedule shifts and admin broadcasts.
        </p>
      )}
    </section>
  );
}
