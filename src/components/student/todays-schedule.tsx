import {
  BookMarked,
  Brain,
  Calculator,
  Code,
  FlaskConical,
  Globe,
  Video,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { TodayScheduleItem } from "@/lib/student/queries";

const SUBJECT_COLORS: Record<string, { solid: string; bg: string; border: string; grad: string }> = {
  math:    { solid: "#4F6BFF", bg: "#EDF1FF", border: "#DCE3FF", grad: "linear-gradient(135deg,#6E8BFF,#3B5BFF)" },
  science: { solid: "#10B981", bg: "#E7F8F1", border: "#CFEEE1", grad: "linear-gradient(135deg,#34D399,#0E9F6E)" },
  english: { solid: "#F59E0B", bg: "#FEF3E2", border: "#FCE6C2", grad: "linear-gradient(135deg,#FBBF24,#F59E0B)" },
  coding:  { solid: "#8B5CF6", bg: "#F3EEFE", border: "#E6DBFB", grad: "linear-gradient(135deg,#A78BFA,#7C3AED)" },
  ai:      { solid: "#06B6D4", bg: "#E2F7FB", border: "#C7EFF5", grad: "linear-gradient(135deg,#22D3EE,#0891B2)" },
  history: { solid: "#F43F5E", bg: "#FEECEF", border: "#FBD5DC", grad: "linear-gradient(135deg,#FB7185,#E11D48)" },
  general: { solid: "#6366F1", bg: "#EEF0FF", border: "#DCE3FF", grad: "linear-gradient(135deg,#818CF8,#6366F1)" },
};

const SUBJECT_ICONS: Record<string, ReactNode> = {
  math: <Calculator className="w-5 h-5 text-white" />,
  science: <FlaskConical className="w-5 h-5 text-white" />,
  english: <BookMarked className="w-5 h-5 text-white" />,
  coding: <Code className="w-5 h-5 text-white" />,
  ai: <Brain className="w-5 h-5 text-white" />,
  history: <Globe className="w-5 h-5 text-white" />,
  general: <Video className="w-5 h-5 text-white" />,
};

export function TodaysSchedule({ sessions }: { sessions: TodayScheduleItem[] }) {
  const liveSessions = sessions.filter((s) => s.state === "live").length;
  const upcomingSessions = sessions.filter((s) => s.state === "soon").length;
  const sessionCount = liveSessions + upcomingSessions;

  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
      style={{
        boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
      }}
    >
      <div className="flex items-center justify-between mb-[18px]">
        <div>
          <div className="text-[17px] font-extrabold text-[#1A1B2E]">Today&apos;s schedule</div>
          <div className="text-[12.5px] font-medium text-[#9AA0B8] mt-0.5">
            {sessionCount > 0
              ? `${sessionCount} item${sessionCount !== 1 ? "s" : ""} today`
              : "Nothing scheduled for today"}
          </div>
        </div>
        <Link
          href="/student/live"
          className="flex items-center gap-1.5 border border-[#ECEDF3] bg-white text-[#5B5BF0] text-[12.5px] font-bold px-3 py-2 rounded-[10px] transition-colors hover:bg-[#EEF0FF]"
        >
          View all
          <Video className="w-3.5 h-3.5" />
        </Link>
      </div>

      {sessions.length === 0 ? (
        <p className="text-[13px] font-medium text-[#9AA0B8] py-4">
          Live classes and assignment deadlines for today will show up here.
        </p>
      ) : (
        <div className="flex flex-col">
          {sessions.map((session, idx) => {
            const color = SUBJECT_COLORS[session.subjectKey] ?? SUBJECT_COLORS.general!;
            const icon = SUBJECT_ICONS[session.subjectKey] ?? SUBJECT_ICONS.general;

            return (
              <div key={session.id} className="flex gap-4 items-stretch">
                <div className="w-[60px] shrink-0 text-right pt-0.5">
                  <div className="text-[14px] font-extrabold text-[#1A1B2E] leading-none">{session.time}</div>
                  <div className="text-[10px] font-semibold text-[#9AA0B8] font-mono mt-0.5">{session.ampm}</div>
                </div>

                <div className="shrink-0 flex flex-col items-center">
                  <span
                    className="w-[13px] h-[13px] rounded-full border-[3px] bg-white mt-1 shrink-0"
                    style={{ borderColor: color.solid }}
                  />
                  {idx < sessions.length - 1 && <span className="flex-1 w-0.5 bg-[#EDEEF4]" />}
                </div>

                <div
                  className="flex-1 min-w-0 mb-3.5 rounded-[14px] p-[13px_15px] flex items-center gap-3"
                  style={{ background: color.bg, border: `1px solid ${color.border}` }}
                >
                  <div
                    className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0"
                    style={{ background: color.grad }}
                  >
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-[#1A1B2E]">{session.subject}</div>
                    <div className="text-[12px] font-medium text-[#6B6F8A] truncate">{session.subtitle}</div>
                  </div>

                  {session.state === "live" && session.meetingUrl && (
                    <a
                      href={session.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1.5 text-[12px] font-bold text-white px-3.5 py-2 rounded-[10px]"
                      style={{ background: color.solid }}
                    >
                      <span className="sd-pulse-dot w-[7px] h-[7px] rounded-full bg-white" />
                      Join
                    </a>
                  )}
                  {session.state === "soon" && (
                    <span
                      className="shrink-0 text-[11.5px] font-bold px-3 py-1.5 rounded-[10px] bg-white border"
                      style={{ color: color.solid, border: `1px solid ${color.border}` }}
                    >
                      {session.status}
                    </span>
                  )}
                  {session.state === "done" && (
                    <span className="shrink-0 flex items-center gap-1.5 text-[11.5px] font-bold text-[#0E9F6E]">
                      ✓ Done
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
