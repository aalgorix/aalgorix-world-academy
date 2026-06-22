"use client";

import { BookOpen, ChevronLeft, ChevronRight, Clock, Video } from "lucide-react";
import { useState } from "react";

import type { StudentCalendarEvent } from "@/lib/student/queries";

type EventKind = StudentCalendarEvent["kind"] | "holiday";

type CalEvent = StudentCalendarEvent & { kind: EventKind };

const KIND_STYLE: Record<EventKind, { bg: string; color: string; dot: string }> = {
  live:       { bg:"#EEF0FF", color:"#5B5BF0", dot:"#6366F1" },
  assignment: { bg:"#FEF3E2", color:"#B45309", dot:"#F59E0B" },
  assessment: { bg:"#FEECEF", color:"#E11D48", dot:"#FB7185" },
  holiday:    { bg:"#E7F8F1", color:"#0E9F6E", dot:"#10B981" },
};

const KIND_ICON: Record<EventKind, React.ReactNode> = {
  live:       <Video   className="w-3.5 h-3.5" />,
  assignment: <BookOpen className="w-3.5 h-3.5" />,
  assessment: <Clock   className="w-3.5 h-3.5" />,
  holiday:    <span className="text-[12px]">🎉</span>,
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getEventsForDate(events: CalEvent[], date: string) {
  return events.filter((e) => e.date === date);
}

function buildCalendar(year: number, month: number): (string | null)[][] {
  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMo   = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;

  const flat: (string | null)[] = Array(startOffset).fill(null);
  for (let d = 1; d <= daysInMo; d++) {
    flat.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  while (flat.length % 7 !== 0) flat.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < flat.length; i += 7) weeks.push(flat.slice(i, i + 7));
  return weeks;
}

export function StudentCalendarView({ events }: { events: StudentCalendarEvent[] }) {
  const now  = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const [year,  setYear]   = useState(now.getFullYear());
  const [month, setMonth]  = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const calEvents = events as CalEvent[];

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const weeks   = buildCalendar(year, month);
  const dayNames = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const selectedEvents = getEventsForDate(calEvents, selectedDate);

  const upcomingEvents = calEvents
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 60px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Calendar</h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">Live classes, assignment deadlines, and exams — all in one place.</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#ECEDF3] bg-white px-8 py-16 text-center">
          <p className="text-[16px] font-bold text-[#1A1B2E]">No scheduled events yet</p>
          <p className="mt-2 text-[14px] font-medium text-[#9AA0B8]">
            Assignment due dates and live classes from your enrolled courses will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          <div className="flex-1 min-w-[320px]">
            <div className="bg-white border border-[#ECEDF3] rounded-[22px] overflow-hidden"
              style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#F0F1F6]">
                <button onClick={prevMonth} className="w-9 h-9 rounded-[10px] border border-[#ECEDF3] flex items-center justify-center text-[#41435F] hover:bg-[#EEF0FF] transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[17px] font-extrabold text-[#1A1B2E]">
                  {MONTH_NAMES[month]} {year}
                </span>
                <button onClick={nextMonth} className="w-9 h-9 rounded-[10px] border border-[#ECEDF3] flex items-center justify-center text-[#41435F] hover:bg-[#EEF0FF] transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 pb-5 pt-4">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {dayNames.map((d) => (
                    <div key={d} className="text-center text-[11px] font-bold text-[#9AA0B8] py-1">{d}</div>
                  ))}
                </div>

                {weeks.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7 gap-1 mb-1">
                    {week.map((dateStr, di) => {
                      if (!dateStr) return <div key={di} />;
                      const dayEvents  = getEventsForDate(calEvents, dateStr);
                      const isToday    = dateStr === todayStr;
                      const isSelected = dateStr === selectedDate;
                      const isWeekend  = [5, 6].includes(di);

                      return (
                        <button
                          key={di}
                          onClick={() => setSelectedDate(dateStr)}
                          className="relative flex flex-col items-center pt-2 pb-1.5 rounded-[12px] transition-all hover:scale-105"
                          style={{
                            background: isSelected ? "#1A1B2E" : isToday ? "#EEF0FF" : "transparent",
                            minHeight: 54,
                          }}
                        >
                          <span
                            className="text-[13.5px] font-bold leading-none mb-1"
                            style={{
                              color: isSelected ? "#fff" : isToday ? "#5B5BF0" : isWeekend ? "#C4C7D9" : "#1A1B2E",
                            }}
                          >
                            {parseInt(dateStr.slice(8), 10)}
                          </span>
                          <div className="flex gap-0.5 flex-wrap justify-center">
                            {dayEvents.slice(0, 3).map((ev) => (
                              <span
                                key={ev.id}
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ background: isSelected ? "rgba(255,255,255,.7)" : KIND_STYLE[ev.kind].dot }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 px-6 pb-5 text-[11.5px] font-semibold text-[#6B6F8A]">
                {(["live","assignment","assessment"] as EventKind[]).map((k) => (
                  <span key={k} className="flex items-center gap-1.5 capitalize">
                    <span className="w-3 h-3 rounded-[4px] shrink-0" style={{ background: KIND_STYLE[k].dot }} />
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4" style={{ width: 300, minWidth: 260 }}>
            <div className="bg-white border border-[#ECEDF3] rounded-[22px] p-5"
              style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
              <div className="text-[14px] font-extrabold text-[#1A1B2E] mb-3">
                {selectedDate === todayStr ? "Today" : new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" })}
              </div>
              {selectedEvents.length === 0 ? (
                <p className="text-[13px] text-[#9AA0B8] font-medium">No events scheduled.</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {selectedEvents.map((ev) => {
                    const s = KIND_STYLE[ev.kind];
                    return (
                      <div key={ev.id} className="flex items-start gap-2.5 rounded-[14px] px-3.5 py-3" style={{ background: s.bg }}>
                        <div className="mt-0.5" style={{ color: s.color }}>{KIND_ICON[ev.kind]}</div>
                        <div>
                          <div className="text-[13px] font-bold leading-snug" style={{ color: s.color }}>{ev.title}</div>
                          {(ev.time || ev.subject) && (
                            <div className="text-[11.5px] font-medium mt-0.5" style={{ color: s.color, opacity: 0.75 }}>
                              {[ev.subject, ev.time].filter(Boolean).join(" · ")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white border border-[#ECEDF3] rounded-[22px] p-5"
              style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
              <div className="text-[14px] font-extrabold text-[#1A1B2E] mb-3">Upcoming</div>
              <div className="flex flex-col gap-2">
                {upcomingEvents.map((ev) => {
                  const s = KIND_STYLE[ev.kind];
                  const dateLabel = new Date(ev.date + "T00:00:00").toLocaleDateString("en-GB", { day:"numeric", month:"short" });
                  return (
                    <div key={ev.id} className="flex items-center gap-3 py-2 border-b border-[#F8F8FC] last:border-0">
                      <div
                        className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: s.bg, color: s.color }}
                      >
                        {KIND_ICON[ev.kind]}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-[#1A1B2E] truncate">{ev.title}</div>
                        <div className="text-[11.5px] font-medium text-[#9AA0B8]">{dateLabel}{ev.time ? ` · ${ev.time}` : ""}</div>
                      </div>
                    </div>
                  );
                })}
                {upcomingEvents.length === 0 && (
                  <p className="text-[13px] text-[#9AA0B8] font-medium">All clear ahead!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
