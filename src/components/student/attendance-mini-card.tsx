"use client";

import { motion } from "framer-motion";

type AttendanceStatus = "present" | "absent" | "holiday" | "late";

type AttendanceDay = {
  status: AttendanceStatus;
  label: string;
};

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "#10B981",
  absent: "#FB7185",
  holiday: "#EEF0F5",
  late: "#FBBF24",
};

// Mock 30-day attendance pattern (1=present, 0=absent, 2=holiday, 3=late)
const PATTERN: AttendanceStatus[] = [
  "late",
  "present",
  "present",
  "present",
  "present",
  "holiday",
  "holiday",
  "present",
  "present",
  "present",
  "present",
  "present",
  "holiday",
  "holiday",
  "present",
  "present",
  "absent",
  "present",
  "present",
  "holiday",
  "holiday",
  "present",
  "present",
  "present",
  "present",
  "present",
  "holiday",
  "holiday",
  "present",
  "present",
];

function buildDays(): AttendanceDay[] {
  return PATTERN.map((status, i) => ({
    status,
    label: `Day ${i + 1} – ${status.charAt(0).toUpperCase() + status.slice(1)}`,
  }));
}

interface AttendanceMiniCardProps {
  attendancePercent?: number;
  days?: AttendanceDay[];
}

export function AttendanceMiniCard({
  attendancePercent = 96,
  days = buildDays(),
}: AttendanceMiniCardProps) {
  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] p-[20px]"
      style={{
        boxShadow:
          "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-[16px] font-extrabold text-[#1A1B2E]">
          Attendance
        </div>
        <span className="text-[18px] font-extrabold text-[#0E9F6E]">
          {attendancePercent}%
        </span>
      </div>

      {/* dot grid */}
      <div className="flex flex-wrap gap-1.5">
        {days.map((d, i) => (
          <motion.span
            key={i}
            title={d.label}
            className="rounded-[6px]"
            style={{
              background: STATUS_COLORS[d.status],
              aspectRatio: "1",
              width: "calc((100% - 54px) / 10)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.025, duration: 0.25 }}
          />
        ))}
      </div>

      {/* legend */}
      <div className="flex flex-wrap gap-4 mt-3.5 text-[11px] font-semibold text-[#9AA0B8]">
        {(
          [
            ["present", "#10B981", "Present"],
            ["absent", "#FB7185", "Absent"],
            ["holiday", "#EEF0F5", "Holiday"],
          ] as const
        ).map(([, color, label]) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-[3px] shrink-0"
              style={{ background: color }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export type { AttendanceDay };
