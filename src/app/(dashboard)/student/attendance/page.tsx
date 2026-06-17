"use client";

import { CalendarCheck, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type DayStatus = "present" | "absent" | "late" | "holiday" | "weekend" | "future";

type CalendarDay = {
  date: number;
  status: DayStatus;
};

// ---------------------------------------------------------------------------
// Mock attendance data per month (Jun 2026)
// ---------------------------------------------------------------------------
const ATTENDANCE_DATA: Record<string, Record<number, DayStatus>> = {
  "2026-06": {
    1:"present",2:"present",3:"present",4:"present",5:"present",
    8:"present",9:"present",10:"present",11:"absent",12:"present",
    15:"present",16:"present",17:"present",18:"present",19:"present",
    22:"present",23:"late",24:"present",25:"present",26:"present",
    29:"present",30:"present",
  },
  "2026-05": {
    1:"present",2:"present",5:"present",6:"present",7:"present",8:"present",9:"absent",
    12:"present",13:"present",14:"present",15:"present",16:"present",
    19:"holiday",20:"holiday",21:"present",22:"present",23:"present",
    26:"present",27:"present",28:"present",29:"late",30:"present",
  },
  "2026-04": {
    1:"present",2:"present",3:"present",4:"holiday",7:"present",8:"present",
    9:"present",10:"present",11:"present",14:"present",15:"present",
    16:"absent",17:"present",18:"present",21:"present",22:"present",
    23:"present",24:"present",25:"present",28:"present",29:"present",30:"present",
  },
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_COLOR: Record<DayStatus, string> = {
  present:  "#10B981",
  absent:   "#FB7185",
  late:     "#FBBF24",
  holiday:  "#A5B4FC",
  weekend:  "#F3F4F6",
  future:   "#F3F4F6",
};

const STATUS_TEXT: Record<DayStatus, string> = {
  present: "text-white",
  absent:  "text-white",
  late:    "text-[#92400E]",
  holiday: "text-[#4338CA]",
  weekend: "text-[#9AA0B8]",
  future:  "text-[#C4C7D9]",
};

function buildCalendar(year: number, month: number, data: Record<number, DayStatus>): CalendarDay[][] {
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7; // Mon-first offset

  const flat: (CalendarDay | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isFuture = new Date(year, month, d) > today;
    const explicitStatus = data[d];
    const status: DayStatus = explicitStatus ?? (isFuture ? "future" : isWeekend ? "weekend" : "present");
    flat.push({ date: d, status });
  }
  // pad to full weeks
  while (flat.length % 7 !== 0) flat.push(null);

  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < flat.length; i += 7) {
    weeks.push(flat.slice(i, i + 7).map((d) => d ?? ({ date: 0, status: "weekend" as DayStatus })));
  }
  return weeks;
}

function computeStats(data: Record<number, DayStatus>, year: number, month: number) {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let present = 0, absent = 0, late = 0, holidays = 0, schoolDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const isWeekend = [0, 6].includes(new Date(year, month, d).getDay());
    const isFuture = new Date(year, month, d) > today;
    if (isWeekend || isFuture) continue;
    const s = data[d];
    if (s === "holiday") { holidays++; continue; }
    schoolDays++;
    if (!s || s === "present") present++;
    else if (s === "absent") absent++;
    else if (s === "late") { present++; late++; }
  }
  const pct = schoolDays > 0 ? Math.round((present / schoolDays) * 100) : 100;
  return { present, absent, late, holidays, schoolDays, pct };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AttendancePage() {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  const data = ATTENDANCE_DATA[key] ?? {};
  const weeks = buildCalendar(year, month, data);
  const stats = computeStats(data, year, month);

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    const n = new Date(); n.setDate(1); n.setMonth(n.getMonth());
    const cur = new Date(year, month, 1);
    if (cur >= n) return;
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const weekDays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 60px" }}>
      {/* heading */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Attendance</h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">Your daily attendance record and monthly summary.</p>
      </div>

      <div className="flex flex-wrap gap-5">
        {/* Calendar */}
        <div className="flex-1 min-w-[320px]">
          <div className="bg-white border border-[#ECEDF3] rounded-[22px] p-6"
            style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
            {/* month nav */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prev} className="w-9 h-9 rounded-[10px] border border-[#ECEDF3] bg-white flex items-center justify-center text-[#41435F] hover:bg-[#EEF0FF] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[17px] font-extrabold text-[#1A1B2E]">
                {MONTH_NAMES[month]} {year}
              </span>
              <button onClick={next} className="w-9 h-9 rounded-[10px] border border-[#ECEDF3] bg-white flex items-center justify-center text-[#41435F] hover:bg-[#EEF0FF] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* day-of-week headers */}
            <div className="grid grid-cols-7 gap-1.5 mb-1.5">
              {weekDays.map((d) => (
                <div key={d} className="text-center text-[11px] font-bold text-[#9AA0B8] py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* calendar grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-1.5 mb-1.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={day.date ? `${MONTH_NAMES[month]} ${day.date}: ${day.status}` : ""}
                    className="aspect-square rounded-[10px] flex items-center justify-center text-[13px] font-bold transition-transform hover:scale-105"
                    style={{
                      background: day.date ? STATUS_COLOR[day.status] : "transparent",
                      color: day.date ? (STATUS_TEXT[day.status].replace("text-", "")) : "transparent",
                      opacity: day.status === "future" || day.status === "weekend" ? 0.45 : 1,
                    }}
                  >
                    {day.date > 0 ? day.date : ""}
                  </div>
                ))}
              </div>
            ))}

            {/* legend */}
            <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-[#F0F1F6] text-[11.5px] font-semibold text-[#6B6F8A]">
              {(["present","absent","late","holiday"] as DayStatus[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5 capitalize">
                  <span className="w-3 h-3 rounded-[4px] shrink-0" style={{ background: STATUS_COLOR[s] }} />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats column */}
        <div className="flex flex-col gap-4 min-w-[200px] flex-1" style={{ maxWidth: 320 }}>
          {/* Attendance rate ring */}
          <div className="bg-white border border-[#ECEDF3] rounded-[22px] p-6 text-center"
            style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
            <div className="text-[13px] font-semibold text-[#6B6F8A] mb-4">Attendance rate</div>
            <div className="relative w-[120px] h-[120px] mx-auto">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#EEF0F5" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none"
                  stroke={stats.pct >= 90 ? "#10B981" : stats.pct >= 75 ? "#F59E0B" : "#FB7185"}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(2 * Math.PI * 50).toFixed(1)}`}
                  strokeDashoffset={`${(2 * Math.PI * 50 * (1 - stats.pct / 100)).toFixed(1)}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-extrabold text-[#1A1B2E]">{stats.pct}%</span>
                <span className="text-[11px] font-semibold text-[#9AA0B8]">this month</span>
              </div>
            </div>
            {stats.pct >= 90 && (
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#0E9F6E]">
                <TrendingUp className="w-4 h-4" /> Excellent attendance!
              </div>
            )}
          </div>

          {/* breakdown cards */}
          {[
            { label: "Present days",  value: stats.present,  bg: "#E7F8F1", color: "#0E9F6E" },
            { label: "Absent days",   value: stats.absent,   bg: "#FEECEF", color: "#E11D48" },
            { label: "Late arrivals", value: stats.late,     bg: "#FEF3E2", color: "#B45309" },
            { label: "Holidays",      value: stats.holidays, bg: "#EEF0FF", color: "#5B5BF0" },
            { label: "School days",   value: stats.schoolDays, bg: "#EEF0F5", color: "#41435F" },
          ].map(({ label, value, bg, color }) => (
            <div key={label} className="bg-white border border-[#ECEDF3] rounded-[18px] px-5 py-4 flex items-center justify-between"
              style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04)" }}>
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4.5 h-4.5" style={{ color }} />
                <span className="text-[13px] font-semibold text-[#41435F]">{label}</span>
              </div>
              <span className="text-[18px] font-extrabold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
