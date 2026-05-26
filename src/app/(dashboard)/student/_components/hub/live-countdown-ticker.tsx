"use client";

import { useEffect, useState, useTransition } from "react";

import { logLectureAttendanceAction } from "@/app/(dashboard)/student/actions";
import { formatShortDate, formatTimeUntil } from "@/lib/student/hub/format";
import type { HubLiveSession } from "@/lib/student/hub/types";

const FIVE_MINUTES_MS = 5 * 60 * 1000;

type LiveCountdownTickerProps = {
  session: HubLiveSession;
};

export function LiveCountdownTicker({ session }: LiveCountdownTickerProps) {
  const [now, setNow] = useState(() => Date.now());
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startsAtMs = new Date(session.startsAtIso).getTime();
  const msUntilStart = startsAtMs - now;
  const canJoin = msUntilStart <= FIVE_MINUTES_MS;
  const isLive = msUntilStart <= 0;

  function handleStartClass() {
    if (!canJoin || pending) return;
    setFeedback(null);
    startTransition(async () => {
      const result = await logLectureAttendanceAction({
        sessionTitle: session.title,
        courseId: session.courseId,
        sessionStartsAtIso: session.startsAtIso,
      });
      setFeedback(result.ok ? (result.message ?? "Joined.") : (result.error ?? "Could not log attendance."));
      if (result.ok && session.joinUrl) {
        window.location.href = session.joinUrl;
      }
    });
  }

  return (
    <section
      aria-label="Upcoming live class"
      id="hub-schedule"
      className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-white shadow-lg"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Next live session
          </p>
          <h2 className="mt-1 truncate text-lg font-extrabold">{session.title}</h2>
          <p className="mt-1 text-sm text-slate-300">
            {session.courseTitle} · {formatShortDate(session.startsAtIso)}
          </p>
          <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-emerald-400">
            {isLive ? "LIVE NOW" : formatTimeUntil(session.startsAtIso)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartClass}
          disabled={!canJoin || pending}
          className={`inline-flex shrink-0 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${
            canJoin
              ? "bg-emerald-500 text-slate-900 shadow-[0_0_0_4px_rgba(16,185,129,0.35)] ring-2 ring-emerald-300 animate-pulse hover:bg-emerald-400"
              : "bg-slate-600 text-slate-400"
          }`}
        >
          {pending ? "Logging…" : "START CLASS"}
        </button>
      </div>
      {feedback ? (
        <p className="mt-3 text-xs font-medium text-emerald-200" role="status">
          {feedback}
        </p>
      ) : null}
      {!canJoin ? (
        <p className="mt-2 text-xs text-slate-400">
          Join unlocks 5 minutes before the scheduled start.
        </p>
      ) : null}
    </section>
  );
}
