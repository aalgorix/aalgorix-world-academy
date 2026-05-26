"use client";

import { useEffect, useState } from "react";

import type { HubAnnouncement, HubNewsCard } from "@/lib/student/hub/types";

type NoticeboardPanelProps = {
  announcements: HubAnnouncement[];
  newsCards: HubNewsCard[];
};

export function NoticeboardPanel({ announcements, newsCards }: NoticeboardPanelProps) {
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [newsIndex, setNewsIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setAnnouncementIndex((i) => (i + 1) % announcements.length);
    }, 6000);
    return () => window.clearInterval(id);
  }, [announcements.length]);

  useEffect(() => {
    if (newsCards.length <= 1) return undefined;
    const id = window.setInterval(() => {
      setNewsIndex((i) => (i + 1) % newsCards.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [newsCards.length]);

  const announcement = announcements[announcementIndex];
  const news = newsCards[newsIndex];

  return (
    <section aria-label="Campus noticeboard" className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Announcements
        </h2>
        {announcement ? (
          <div className="mt-3 min-h-[88px]">
            <p className="text-sm font-bold text-slate-900">{announcement.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              {announcement.body}
            </p>
            <p className="mt-2 text-[10px] font-semibold text-slate-400">
              {announcement.authorLabel}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No announcements yet.</p>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Latest news &amp; affairs
        </h2>
        {news ? (
          <a
            href={news.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block overflow-hidden rounded-xl border border-slate-200 transition-all duration-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]"
          >
            <div
              className={`bg-gradient-to-br ${news.imageGradient} px-4 py-6 text-white`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                {news.category}
              </span>
              <p className="mt-2 text-sm font-extrabold leading-snug">{news.title}</p>
            </div>
            <p className="px-4 py-3 text-xs text-slate-600">{news.summary}</p>
          </a>
        ) : null}
      </div>
    </section>
  );
}
