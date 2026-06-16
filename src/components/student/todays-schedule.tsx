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

type SessionState = "live" | "soon" | "done";

type ScheduleSession = {
  time: string;
  ampm: string;
  subject: string;
  teacher: string;
  state: SessionState;
  status: string;
  color: {
    solid: string;
    bg: string;
    border: string;
    grad: string;
  };
  icon: ReactNode;
};

const SUBJECT_COLORS: Record<string, ScheduleSession["color"]> = {
  math: {
    solid: "#4F6BFF",
    bg: "#EDF1FF",
    border: "#DCE3FF",
    grad: "linear-gradient(135deg,#6E8BFF,#3B5BFF)",
  },
  science: {
    solid: "#10B981",
    bg: "#E7F8F1",
    border: "#CFEEE1",
    grad: "linear-gradient(135deg,#34D399,#0E9F6E)",
  },
  english: {
    solid: "#F59E0B",
    bg: "#FEF3E2",
    border: "#FCE6C2",
    grad: "linear-gradient(135deg,#FBBF24,#F59E0B)",
  },
  coding: {
    solid: "#8B5CF6",
    bg: "#F3EEFE",
    border: "#E6DBFB",
    grad: "linear-gradient(135deg,#A78BFA,#7C3AED)",
  },
  ai: {
    solid: "#06B6D4",
    bg: "#E2F7FB",
    border: "#C7EFF5",
    grad: "linear-gradient(135deg,#22D3EE,#0891B2)",
  },
  history: {
    solid: "#F43F5E",
    bg: "#FEECEF",
    border: "#FBD5DC",
    grad: "linear-gradient(135deg,#FB7185,#E11D48)",
  },
};

const SUBJECT_ICONS: Record<string, ReactNode> = {
  math: <Calculator className="w-5 h-5 text-white" />,
  science: <FlaskConical className="w-5 h-5 text-white" />,
  english: <BookMarked className="w-5 h-5 text-white" />,
  coding: <Code className="w-5 h-5 text-white" />,
  ai: <Brain className="w-5 h-5 text-white" />,
  history: <Globe className="w-5 h-5 text-white" />,
};

// Static schedule – will be replaced with real timetable data
const MOCK_SCHEDULE: ScheduleSession[] = [
  {
    time: "09:00",
    ampm: "AM",
    subject: "Mathematics",
    teacher: "Live with Mr. David Chen",
    state: "live",
    status: "Live now",
    color: SUBJECT_COLORS.math,
    icon: SUBJECT_ICONS.math,
  },
  {
    time: "11:30",
    ampm: "AM",
    subject: "AI Foundations",
    teacher: "Live with Dr. Mei Lin",
    state: "soon",
    status: "In 2 hrs",
    color: SUBJECT_COLORS.ai,
    icon: SUBJECT_ICONS.ai,
  },
  {
    time: "02:00",
    ampm: "PM",
    subject: "English Literature",
    teacher: "Live with Ms. Laura Bennett",
    state: "soon",
    status: "Upcoming",
    color: SUBJECT_COLORS.english,
    icon: SUBJECT_ICONS.english,
  },
  {
    time: "08:00",
    ampm: "AM",
    subject: "Science Lab",
    teacher: "Recorded · Dr. Aisha Khan",
    state: "done",
    status: "Completed",
    color: SUBJECT_COLORS.science,
    icon: SUBJECT_ICONS.science,
  },
];

export function TodaysSchedule() {
  const liveSessions = MOCK_SCHEDULE.filter((s) => s.state === "live").length;
  const upcomingSessions = MOCK_SCHEDULE.filter(
    (s) => s.state === "soon",
  ).length;
  const sessionCount = liveSessions + upcomingSessions;

  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
      style={{
        boxShadow:
          "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
      }}
    >
      <div className="flex items-center justify-between mb-[18px]">
        <div>
          <div className="text-[17px] font-extrabold text-[#1A1B2E]">
            Today's schedule
          </div>
          <div className="text-[12.5px] font-medium text-[#9AA0B8] mt-0.5">
            {sessionCount} live sessions today
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

      <div className="flex flex-col">
        {MOCK_SCHEDULE.map((session, idx) => (
          <div key={idx} className="flex gap-4 items-stretch">
            {/* time */}
            <div className="w-[60px] shrink-0 text-right pt-0.5">
              <div className="text-[14px] font-extrabold text-[#1A1B2E]">
                {session.time}
              </div>
              <div className="text-[10px] font-semibold text-[#9AA0B8] font-mono">
                {session.ampm}
              </div>
            </div>

            {/* timeline dot + line */}
            <div className="shrink-0 flex flex-col items-center">
              <span
                className="w-[13px] h-[13px] rounded-full border-[3px] bg-white mt-1 shrink-0"
                style={{ borderColor: session.color.solid }}
              />
              {idx < MOCK_SCHEDULE.length - 1 && (
                <span className="flex-1 w-0.5 bg-[#EDEEF4]" />
              )}
            </div>

            {/* card */}
            <div
              className="flex-1 min-w-0 mb-3.5 rounded-[14px] p-[13px_15px] flex items-center gap-3"
              style={{
                background: session.color.bg,
                border: `1px solid ${session.color.border}`,
              }}
            >
              {/* subject icon */}
              <div
                className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center shrink-0"
                style={{ background: session.color.grad }}
              >
                {session.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-bold text-[#1A1B2E]">
                  {session.subject}
                </div>
                <div className="text-[12px] font-medium text-[#6B6F8A] truncate">
                  {session.teacher}
                </div>
              </div>

              {/* status / join button */}
              {session.state === "live" && (
                <Link
                  href="/student/live"
                  className="shrink-0 flex items-center gap-1.5 text-[12px] font-bold text-white px-3.5 py-2 rounded-[10px]"
                  style={{ background: session.color.solid }}
                >
                  <span className="sd-pulse-dot w-[7px] h-[7px] rounded-full bg-white" />
                  Join
                </Link>
              )}
              {session.state === "soon" && (
                <span
                  className="shrink-0 text-[11.5px] font-bold px-3 py-1.5 rounded-[10px] bg-white border"
                  style={{
                    color: session.color.solid,
                    border: `1px solid ${session.color.border}`,
                  }}
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
        ))}
      </div>
    </div>
  );
}
