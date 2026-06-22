"use client";

import { CalendarDays, CheckCircle2, Clock, Play, Video } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { LiveClassSession } from "@/lib/student/queries";

type SessionState = "live" | "soon" | "done";

type Tab = "today" | "week" | "recordings";

function sessionState(session: LiveClassSession, now: Date): SessionState {
  const start = new Date(session.startsAt);
  const end = new Date(start.getTime() + session.durationMinutes * 60 * 1000);
  if (now >= start && now <= end && session.status !== "cancelled") return "live";
  if (now > end || session.status === "completed") return "done";
  return "soon";
}

function formatTime(iso: string): { time: string; ampm: string } {
  const d = new Date(iso);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true });
  const [t, ampm] = time.split(" ");
  return { time: t ?? time, ampm: ampm ?? "" };
}

export function StudentLiveView({ sessions }: { sessions: LiveClassSession[] }) {
  const [tab, setTab] = useState<Tab>("today");
  const now = useMemo(() => new Date(), []);

  const todayKey = now.toISOString().slice(0, 10);
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const withState = sessions.map((s) => ({
    ...s,
    state: sessionState(s, now),
    dateKey: s.startsAt.slice(0, 10),
  }));

  const todaySessions = withState.filter((s) => s.dateKey === todayKey);
  const weekSessions = withState.filter((s) => {
    const d = new Date(s.startsAt);
    return d >= now && d <= weekEnd;
  });
  const recordings = withState.filter((s) => s.state === "done" && s.recordingUrl);

  const liveNow = todaySessions.find((s) => s.state === "live");
  const activeList = tab === "today" ? todaySessions : tab === "week" ? weekSessions : recordings;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "today", label: "Today", count: todaySessions.length },
    { key: "week", label: "This Week", count: weekSessions.length },
    { key: "recordings", label: "Recordings", count: recordings.length },
  ];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 60px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Live Classes</h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">Scheduled sessions from your enrolled courses.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#ECEDF3] bg-white px-8 py-16 text-center">
          <Video className="w-10 h-10 text-[#C4C7D9] mx-auto mb-3" />
          <p className="text-[16px] font-bold text-[#1A1B2E]">No live classes scheduled</p>
          <p className="mt-2 text-[14px] font-medium text-[#9AA0B8]">
            Your teachers can publish live sessions — they will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {liveNow && (
            <div className="relative overflow-hidden rounded-[22px] p-6 sm:p-8 text-white mb-6"
              style={{ background: "linear-gradient(125deg,#5B5BF0,#8B5CF6)", boxShadow: "0 14px 34px rgba(99,102,241,.25)" }}>
              <div className="flex flex-wrap items-center gap-5 justify-between">
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wider mb-2 opacity-80">Live right now</div>
                  <h2 className="text-[24px] font-extrabold">{liveNow.title}</h2>
                  <p className="mt-1 text-[14px] opacity-85">{liveNow.courseTitle}</p>
                </div>
                {liveNow.meetingUrl ? (
                  <a href={liveNow.meetingUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 bg-white text-[#1A1B2E] font-bold text-[14px] px-6 py-3.5 rounded-[14px] hover:opacity-90">
                    <Video className="w-4.5 h-4.5" /> Join class
                  </a>
                ) : null}
              </div>
            </div>
          )}

          <div className="bg-white border border-[#ECEDF3] rounded-[16px] p-1.5 flex gap-1 mb-6 w-fit">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all"
                style={tab === t.key ? { background: "#1A1B2E", color: "#fff" } : { color: "#6B6F8A" }}>
                {t.label}
                {t.count > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={tab === t.key ? { background: "rgba(255,255,255,.2)" } : { background: "#EEF0F5" }}>{t.count}</span>}
              </button>
            ))}
          </div>

          {activeList.length === 0 ? (
            <div className="rounded-[22px] border border-[#ECEDF3] bg-white px-8 py-12 text-center">
              <CalendarDays className="w-8 h-8 text-[#C4C7D9] mx-auto mb-2" />
              <p className="text-[14px] font-medium text-[#9AA0B8]">Nothing in this view.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeList.map((session) => {
                const { time, ampm } = formatTime(session.startsAt);
                return (
                  <div key={session.id} className="bg-white border border-[#ECEDF3] rounded-[18px] p-4 flex flex-wrap items-center gap-4"
                    style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04)" }}>
                    <div className="text-right w-16 shrink-0">
                      <div className="text-[14px] font-extrabold text-[#1A1B2E]">{time}</div>
                      <div className="text-[10px] font-semibold text-[#9AA0B8]">{ampm}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-[#1A1B2E]">{session.title}</div>
                      <div className="text-[12px] font-medium text-[#6B6F8A] mt-0.5 flex items-center gap-1.5">
                        {session.courseTitle}
                        <span className="text-[#D6D8E4]">·</span>
                        <Clock className="w-3 h-3" /> {session.durationMinutes} min
                      </div>
                    </div>
                    <div className="shrink-0">
                      {session.state === "live" && session.meetingUrl && (
                        <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[12px] font-bold text-white px-4 py-2 rounded-[10px] bg-[#6366F1]">Join now</a>
                      )}
                      {session.state === "soon" && (
                        <span className="text-[11.5px] font-bold px-3 py-1.5 rounded-[10px] bg-[#EEF0FF] text-[#5B5BF0]">Upcoming</span>
                      )}
                      {session.state === "done" && session.recordingUrl && (
                        <Link href={session.recordingUrl} target="_blank"
                          className="flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-[10px] border border-[#ECEDF3] text-[#41435F]">
                          <Play className="w-3.5 h-3.5" /> Recording
                        </Link>
                      )}
                      {session.state === "done" && !session.recordingUrl && (
                        <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#0E9F6E]">
                          <CheckCircle2 className="w-4 h-4" /> Done
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
