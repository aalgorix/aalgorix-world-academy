"use client";

import type { HubTelemetry } from "@/lib/student/hub/types";

import { RadialDial } from "./radial-dial";

type TelemetryMetricsRowProps = {
  telemetry: HubTelemetry;
};

export function TelemetryMetricsRow({ telemetry }: TelemetryMetricsRowProps) {
  return (
    <section
      aria-label="Academic telemetry"
      className="grid grid-cols-3 gap-3 sm:gap-4"
    >
      <RadialDial
        label="Attendance"
        value={telemetry.attendancePercent}
        accentClass="text-indigo-600"
      />
      <RadialDial
        label="Course completion"
        value={telemetry.courseCompletionPercent}
        accentClass="text-violet-600"
      />
      {telemetry.gpaAverage != null ? (
        <RadialDial
          label="Certified GPA"
          value={telemetry.gpaAverage}
          suffix="pts"
          accentClass="text-emerald-600"
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
          <p className="text-3xl font-extrabold text-slate-400">—</p>
          <p className="mt-3 text-center text-xs font-bold text-slate-700">Certified GPA</p>
          <p className="mt-1 text-center text-[10px] text-slate-500">No graded work yet</p>
        </div>
      )}
    </section>
  );
}
