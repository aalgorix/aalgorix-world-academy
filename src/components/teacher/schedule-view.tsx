"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { TeacherScheduleEvent } from "@/lib/teacher/queries";

const TYPE_ICON: Record<string, React.ReactNode> = {
  "live-class": <Video  className="w-4 h-4" />,
  "deadline":   <Clock  className="w-4 h-4" />,
  "meeting":    <Users  className="w-4 h-4" />,
  "review":     <CalendarDays className="w-4 h-4" />,
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function pad2(n: number) { return String(n).padStart(2, "0"); }
function dateKey(y: number, m: number, d: number) { return `${y}-${pad2(m+1)}-${pad2(d)}`; }

export function TeacherScheduleView({ events }: { events: TeacherScheduleEvent[] }) {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(dateKey(today.getFullYear(), today.getMonth(), today.getDate()));

  const eventsByDate = useMemo(() => {
    const map: Record<string, TeacherScheduleEvent[]> = {};
    for (const ev of events) {
      (map[ev.date] ??= []).push(ev);
    }
    return map;
  }, [events]);

  function prevMonth() { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }
  function nextMonth() { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedEvents = eventsByDate[selected] ?? [];

  const upcoming = Object.entries(eventsByDate)
    .filter(([d]) => d >= todayKey)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6)
    .map(([date, dayEvents]) => ({ date, events: dayEvents }));

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Schedule</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">Live classes and assignment deadlines from your courses.</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
          <p className="text-[16px] font-bold text-slate-800">No schedule items yet</p>
          <p className="mt-2 text-[14px] font-medium text-slate-500">
            Published assignment deadlines and live sessions will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-5">
          <div className="flex-1 min-w-[300px]">
            <div className="bg-white border border-slate-200 rounded-[22px] overflow-hidden"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[16px] font-extrabold text-slate-900">{MONTH_NAMES[month]} {year}</span>
                <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 px-4 pt-3">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-[11px] font-bold text-slate-400 pb-2">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 px-4 pb-4 gap-y-1">
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const key = dateKey(year, month, day);
                  const isToday = key === todayKey;
                  const isSelected = key === selected;
                  const hasEvents = !!eventsByDate[key];

                  return (
                    <button key={key} onClick={() => setSelected(key)}
                      className="relative flex flex-col items-center py-1.5 rounded-[10px] transition-all"
                      style={isSelected
                        ? { background: "#0D9488", color: "#fff" }
                        : isToday
                        ? { background: "#CCFBF1", color: "#0F766E" }
                        : { color: "#475569" }
                      }>
                      <span className="text-[13px] font-bold">{day}</span>
                      {hasEvents && (
                        <span className="w-1 h-1 rounded-full mt-0.5"
                          style={{ background: isSelected ? "#fff" : "#0D9488" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 bg-white border border-slate-200 rounded-[22px] overflow-hidden"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-[15px] font-extrabold text-slate-900">
                  {new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </h2>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <CalendarDays className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-[13.5px] font-bold text-slate-700">No events</p>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3">
                  {selectedEvents.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-3 rounded-[14px] p-3"
                      style={{ background: `${ev.color}12`, border: `1px solid ${ev.color}30` }}>
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: ev.color, color: "#fff" }}>
                        {TYPE_ICON[ev.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-bold text-slate-900">{ev.title}</div>
                        {ev.course && <div className="text-[12px] text-slate-500">{ev.course}</div>}
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[12px] font-semibold" style={{ color: ev.color }}>{ev.time}</span>
                          {ev.duration && <span className="text-[11.5px] text-slate-400">{ev.duration}</span>}
                          {ev.students != null && ev.students > 0 && (
                            <span className="text-[11.5px] text-slate-400">{ev.students} students</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-[280px] shrink-0">
            <div className="bg-white border border-slate-200 rounded-[22px] overflow-hidden"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-[15px] font-extrabold text-slate-900">Upcoming</h2>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {upcoming.map(({ date, events: dayEvents }) => (
                  <div key={date}>
                    <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                      {new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </div>
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="flex items-center gap-2.5 py-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ev.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="text-[12.5px] font-bold text-slate-800 truncate">{ev.title}</div>
                          <div className="text-[11px] text-slate-400">{ev.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                {upcoming.length === 0 && (
                  <p className="text-[13px] text-slate-500 font-medium text-center py-4">Nothing upcoming</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
