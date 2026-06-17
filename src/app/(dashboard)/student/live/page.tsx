"use client";

import {
  BookMarked,
  Brain,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Clock,
  Code,
  FlaskConical,
  Globe,
  Play,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------
type SessionState = "live" | "soon" | "done";

type Session = {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  ampm: "AM" | "PM";
  day: string;           // e.g. "Monday", "Tuesday"
  dayShort: string;      // e.g. "Mon"
  date: string;          // e.g. "Jun 16"
  duration: string;      // e.g. "60 min"
  state: SessionState;
  statusLabel: string;
  recordingHref: string | null;
  subject_key: string;
};

const SUBJECT_STYLE: Record<string, {
  solid: string; bg: string; border: string; grad: string;
}> = {
  math:    { solid:"#4F6BFF", bg:"#EDF1FF", border:"#DCE3FF", grad:"linear-gradient(135deg,#6E8BFF,#3B5BFF)" },
  science: { solid:"#10B981", bg:"#E7F8F1", border:"#CFEEE1", grad:"linear-gradient(135deg,#34D399,#0E9F6E)" },
  english: { solid:"#F59E0B", bg:"#FEF3E2", border:"#FCE6C2", grad:"linear-gradient(135deg,#FBBF24,#F59E0B)" },
  coding:  { solid:"#8B5CF6", bg:"#F3EEFE", border:"#E6DBFB", grad:"linear-gradient(135deg,#A78BFA,#7C3AED)" },
  ai:      { solid:"#06B6D4", bg:"#E2F7FB", border:"#C7EFF5", grad:"linear-gradient(135deg,#22D3EE,#0891B2)" },
  history: { solid:"#F43F5E", bg:"#FEECEF", border:"#FBD5DC", grad:"linear-gradient(135deg,#FB7185,#E11D48)" },
};

const SUBJECT_ICON: Record<string, React.ReactNode> = {
  math:    <Calculator  className="w-5 h-5 text-white" />,
  science: <FlaskConical className="w-5 h-5 text-white" />,
  english: <BookMarked  className="w-5 h-5 text-white" />,
  coding:  <Code        className="w-5 h-5 text-white" />,
  ai:      <Brain       className="w-5 h-5 text-white" />,
  history: <Globe       className="w-5 h-5 text-white" />,
};

// Mock schedule — replace with real timetable query when available
const ALL_SESSIONS: Session[] = [
  // Today (Mon)
  { id:"s1", subject:"Mathematics",      teacher:"Mr. David Chen",     time:"09:00", ampm:"AM", day:"Monday",    dayShort:"Mon", date:"Jun 16", duration:"60 min", state:"live",  statusLabel:"Live now",   recordingHref:null,      subject_key:"math"    },
  { id:"s2", subject:"AI Foundations",   teacher:"Dr. Mei Lin",        time:"11:30", ampm:"AM", day:"Monday",    dayShort:"Mon", date:"Jun 16", duration:"60 min", state:"soon",  statusLabel:"In 2 hrs",   recordingHref:null,      subject_key:"ai"      },
  { id:"s3", subject:"English Literature",teacher:"Ms. Laura Bennett", time:"02:00", ampm:"PM", day:"Monday",    dayShort:"Mon", date:"Jun 16", duration:"45 min", state:"soon",  statusLabel:"Upcoming",   recordingHref:null,      subject_key:"english" },
  { id:"s4", subject:"Science Lab",      teacher:"Dr. Aisha Khan",     time:"08:00", ampm:"AM", day:"Monday",    dayShort:"Mon", date:"Jun 16", duration:"60 min", state:"done",  statusLabel:"Completed",  recordingHref:"#",       subject_key:"science" },
  // Tuesday
  { id:"s5", subject:"Coding",           teacher:"Mr. Omar Reyes",     time:"10:00", ampm:"AM", day:"Tuesday",   dayShort:"Tue", date:"Jun 17", duration:"60 min", state:"soon",  statusLabel:"Tomorrow",   recordingHref:null,      subject_key:"coding"  },
  { id:"s6", subject:"Mathematics",      teacher:"Mr. David Chen",     time:"01:00", ampm:"PM", day:"Tuesday",   dayShort:"Tue", date:"Jun 17", duration:"60 min", state:"soon",  statusLabel:"Tomorrow",   recordingHref:null,      subject_key:"math"    },
  { id:"s7", subject:"World History",    teacher:"Mr. Tom Walsh",      time:"03:30", ampm:"PM", day:"Tuesday",   dayShort:"Tue", date:"Jun 17", duration:"45 min", state:"soon",  statusLabel:"Tomorrow",   recordingHref:null,      subject_key:"history" },
  // Wednesday
  { id:"s8", subject:"Science Lab",      teacher:"Dr. Aisha Khan",     time:"09:00", ampm:"AM", day:"Wednesday", dayShort:"Wed", date:"Jun 18", duration:"60 min", state:"soon",  statusLabel:"Wed",        recordingHref:null,      subject_key:"science" },
  { id:"s9", subject:"AI Foundations",   teacher:"Dr. Mei Lin",        time:"11:00", ampm:"AM", day:"Wednesday", dayShort:"Wed", date:"Jun 18", duration:"60 min", state:"soon",  statusLabel:"Wed",        recordingHref:null,      subject_key:"ai"      },
  // Recordings (past)
  { id:"r1", subject:"Mathematics",      teacher:"Mr. David Chen",     time:"09:00", ampm:"AM", day:"Friday",    dayShort:"Fri", date:"Jun 13", duration:"60 min", state:"done",  statusLabel:"Completed",  recordingHref:"#",       subject_key:"math"    },
  { id:"r2", subject:"English Literature",teacher:"Ms. Laura Bennett", time:"02:00", ampm:"PM", day:"Thursday",  dayShort:"Thu", date:"Jun 12", duration:"45 min", state:"done",  statusLabel:"Completed",  recordingHref:"#",       subject_key:"english" },
  { id:"r3", subject:"Coding",           teacher:"Mr. Omar Reyes",     time:"10:00", ampm:"AM", day:"Wednesday", dayShort:"Wed", date:"Jun 11", duration:"60 min", state:"done",  statusLabel:"Completed",  recordingHref:"#",       subject_key:"coding"  },
  { id:"r4", subject:"World History",    teacher:"Mr. Tom Walsh",      time:"03:30", ampm:"PM", day:"Tuesday",   dayShort:"Tue", date:"Jun 10", duration:"45 min", state:"done",  statusLabel:"Completed",  recordingHref:"#",       subject_key:"history" },
  { id:"r5", subject:"Science Lab",      teacher:"Dr. Aisha Khan",     time:"09:00", ampm:"AM", day:"Monday",    dayShort:"Mon", date:"Jun 9",  duration:"60 min", state:"done",  statusLabel:"Completed",  recordingHref:"#",       subject_key:"science" },
];

const TODAY_SESSIONS  = ALL_SESSIONS.filter((s) => s.date === "Jun 16");
const WEEK_SESSIONS   = ALL_SESSIONS.filter((s) => ["Jun 16","Jun 17","Jun 18","Jun 19","Jun 20"].includes(s.date));
const PAST_SESSIONS   = ALL_SESSIONS.filter((s) => s.state === "done" && !TODAY_SESSIONS.find((t) => t.id === s.id));

const WEEK_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

type Tab = "today" | "week" | "recordings";

// ---------------------------------------------------------------------------
// Session card
// ---------------------------------------------------------------------------
function SessionCard({ session, showDate = false }: { session: Session; showDate?: boolean }) {
  const style = SUBJECT_STYLE[session.subject_key];
  const icon  = SUBJECT_ICON[session.subject_key];

  return (
    <div
      className="flex gap-4 items-stretch"
    >
      {/* time column */}
      <div className="w-[64px] shrink-0 text-right pt-1">
        <div className="text-[14px] font-extrabold text-[#1A1B2E] leading-none">
          {session.time}
        </div>
        <div className="text-[10px] font-semibold text-[#9AA0B8] font-mono mt-0.5">
          {session.ampm}
        </div>
        {showDate && (
          <div className="text-[10px] font-semibold text-[#9AA0B8] mt-1">
            {session.date}
          </div>
        )}
      </div>

      {/* dot + line */}
      <div className="shrink-0 flex flex-col items-center">
        <span
          className="w-[13px] h-[13px] rounded-full border-[3px] bg-white mt-1 shrink-0"
          style={{ borderColor: style.solid }}
        />
        <span className="flex-1 w-0.5 bg-[#EDEEF4]" />
      </div>

      {/* card */}
      <div
        className="flex-1 min-w-0 mb-3.5 rounded-[16px] p-[14px_16px] flex items-center gap-3 flex-wrap sm:flex-nowrap"
        style={{ background: style.bg, border: `1px solid ${style.border}` }}
      >
        {/* subject icon */}
        <div
          className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0"
          style={{ background: style.grad }}
        >
          {icon}
        </div>

        {/* info */}
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-[#1A1B2E]">
            {session.subject}
          </div>
          <div className="text-[12px] font-medium text-[#6B6F8A] flex items-center gap-1.5 mt-0.5 flex-wrap">
            {session.teacher}
            <span className="text-[#D6D8E4]">·</span>
            <Clock className="w-3 h-3 text-[#9AA0B8]" />
            {session.duration}
          </div>
        </div>

        {/* action */}
        <div className="shrink-0">
          {session.state === "live" && (
            <button
              className="flex items-center gap-1.5 text-[12px] font-bold text-white px-4 py-2 rounded-[10px]"
              style={{ background: style.solid }}
            >
              <span
                className="sd-pulse-dot w-[7px] h-[7px] rounded-full bg-white shrink-0"
              />
              Join now
            </button>
          )}
          {session.state === "soon" && (
            <span
              className="text-[11.5px] font-bold px-3 py-1.5 rounded-[10px] bg-white border"
              style={{ color: style.solid, border: `1px solid ${style.border}` }}
            >
              {session.statusLabel}
            </span>
          )}
          {session.state === "done" && session.recordingHref && (
            <Link
              href={session.recordingHref}
              className="flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-1.5 rounded-[10px] bg-white border border-[#ECEDF3] text-[#41435F] transition-colors hover:border-[#DDE0FF] hover:text-[#5B5BF0]"
            >
              <Play className="w-3.5 h-3.5" />
              Recording
            </Link>
          )}
          {session.state === "done" && !session.recordingHref && (
            <span className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#0E9F6E]">
              <CheckCircle2 className="w-4 h-4" />
              Done
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live session hero (shown when a class is live right now)
// ---------------------------------------------------------------------------
function LiveNowHero({ session }: { session: Session }) {
  const style = SUBJECT_STYLE[session.subject_key];
  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-6 sm:p-8 text-white mb-6 sd-float-up"
      style={{ background: style.grad, boxShadow: "0 14px 34px rgba(99,102,241,.25)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 w-[180px] h-[180px] rounded-full"
        style={{ background: "radial-gradient(circle,rgba(255,255,255,.18),transparent 65%)" }}
      />
      <div className="relative flex flex-wrap items-center gap-5 justify-between">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider mb-2"
            style={{ color: "rgba(255,255,255,.78)" }}>
            <span className="sd-pulse-dot w-2 h-2 rounded-full bg-white" />
            Live right now
          </div>
          <h2 className="text-[24px] sm:text-[30px] font-extrabold tracking-tight">
            {session.subject}
          </h2>
          <p className="mt-1 text-[14px] font-medium" style={{ color: "rgba(255,255,255,.85)" }}>
            {session.teacher} · {session.time} {session.ampm} · {session.duration}
          </p>
        </div>
        <button
          className="flex items-center gap-2.5 bg-white text-[#1A1B2E] font-bold text-[14px] px-6 py-3.5 rounded-[14px] transition-opacity hover:opacity-90 shrink-0"
          style={{ boxShadow: "0 8px 20px rgba(0,0,0,.14)" }}
        >
          <Video className="w-4.5 h-4.5" />
          Join class
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function LiveClassesPage() {
  const [tab, setTab] = useState<Tab>("today");

  const liveNow = TODAY_SESSIONS.find((s) => s.state === "live");
  const liveTodayCount  = TODAY_SESSIONS.filter((s) => s.state === "live").length;
  const soonTodayCount  = TODAY_SESSIONS.filter((s) => s.state === "soon").length;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "today",      label: "Today",      count: liveTodayCount + soonTodayCount },
    { key: "week",       label: "This Week",  count: WEEK_SESSIONS.length },
    { key: "recordings", label: "Recordings", count: PAST_SESSIONS.length },
  ];

  return (
    <div
      className="mx-auto w-full sd-float-up"
      style={{ maxWidth: 1320, padding: "28px 32px 60px" }}
    >
      {/* heading */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">
          Live Classes
        </h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">
          Join live sessions, check your weekly timetable, and catch up on recordings.
        </p>
      </div>

      {/* live-now hero */}
      {liveNow && <LiveNowHero session={liveNow} />}

      {/* week-at-a-glance mini strip */}
      <div className="hidden sm:grid grid-cols-5 gap-3 mb-7"
        style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {WEEK_DAYS.map((day) => {
          const daySessions = WEEK_SESSIONS.filter((s) => s.day === day);
          const hasLive = daySessions.some((s) => s.state === "live");
          return (
            <div
              key={day}
              className="bg-white border border-[#ECEDF3] rounded-[16px] p-3 text-center"
              style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 4px 12px rgba(20,22,46,.03)" }}
            >
              <div className="text-[11px] font-semibold text-[#9AA0B8] uppercase tracking-wide">
                {day.slice(0, 3)}
              </div>
              <div className="text-[18px] font-extrabold text-[#1A1B2E] mt-0.5">
                {daySessions.length}
              </div>
              <div className="text-[11px] font-medium text-[#9AA0B8]">
                {daySessions.length === 1 ? "class" : "classes"}
              </div>
              {hasLive && (
                <div className="mt-1.5 flex justify-center">
                  <span className="sd-pulse-dot w-2 h-2 rounded-full bg-[#F43F5E]" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* tab bar */}
      <div
        className="bg-white border border-[#ECEDF3] rounded-[16px] p-1.5 flex gap-1 mb-6 w-fit"
        style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 4px 12px rgba(20,22,46,.03)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all"
            style={
              tab === t.key
                ? { background: "#1A1B2E", color: "#fff" }
                : { background: "transparent", color: "#6B6F8A" }
            }
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={
                  tab === t.key
                    ? { background: "rgba(255,255,255,.2)", color: "#fff" }
                    : { background: "#EEF0F5", color: "#6B6F8A" }
                }
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Today ────────────────────────────────────────────────── */}
      {tab === "today" && (
        <div
          className="bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[17px] font-extrabold text-[#1A1B2E]">
                Today's schedule
              </div>
              <div className="text-[12.5px] font-medium text-[#9AA0B8] mt-0.5 flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5" />
                Monday, Jun 16 · {liveTodayCount + soonTodayCount} upcoming
              </div>
            </div>
          </div>

          {TODAY_SESSIONS.length === 0 ? (
            <div className="py-12 text-center">
              <Video className="w-8 h-8 text-[#C4C7D9] mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-[#41435F]">No classes today</p>
              <p className="text-[12.5px] text-[#9AA0B8] mt-1">Check This Week for upcoming sessions.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {TODAY_SESSIONS.map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── This Week ────────────────────────────────────────────── */}
      {tab === "week" && (
        <div className="flex flex-col gap-5">
          {WEEK_DAYS.map((day) => {
            const daySessions = WEEK_SESSIONS.filter((s) => s.day === day);
            if (daySessions.length === 0) return null;
            const dateLabel = daySessions[0]?.date ?? "";
            return (
              <div
                key={day}
                className="bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
                style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="text-[17px] font-extrabold text-[#1A1B2E]">{day}</div>
                  <div className="text-[12.5px] font-medium text-[#9AA0B8]">
                    {dateLabel} · {daySessions.length} session{daySessions.length !== 1 ? "s" : ""}
                  </div>
                  {day === "Monday" && (
                    <span className="ml-auto text-[11px] font-bold text-[#5B5BF0] bg-[#EEF0FF] px-2.5 py-1 rounded-full">
                      Today
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  {daySessions.map((s) => (
                    <SessionCard key={s.id} session={s} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Recordings ───────────────────────────────────────────── */}
      {tab === "recordings" && (
        <div
          className="bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
          style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[17px] font-extrabold text-[#1A1B2E]">
                Past recordings
              </div>
              <div className="text-[12.5px] font-medium text-[#9AA0B8] mt-0.5">
                {PAST_SESSIONS.length} sessions available to replay
              </div>
            </div>
          </div>

          {PAST_SESSIONS.length === 0 ? (
            <div className="py-12 text-center">
              <Video className="w-8 h-8 text-[#C4C7D9] mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-[#41435F]">No recordings yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {PAST_SESSIONS.map((s) => (
                <SessionCard key={s.id} session={s} showDate />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
