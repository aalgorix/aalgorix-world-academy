import Link from "next/link";

import type { HubTelemetry } from "@/lib/student/hub/types";

import { RevisionAlertRibbon } from "../../revision-alert-ribbon";
import { TelemetryMetricsRow } from "./telemetry-metrics-row";

type GreetingTelemetryCardProps = {
  displayName: string;
  batchCode: string;
  todayLabel: string;
  revisionCount: number;
  telemetry: HubTelemetry;
};

export function GreetingTelemetryCard({
  displayName,
  batchCode,
  todayLabel,
  revisionCount,
  telemetry,
}: GreetingTelemetryCardProps) {
  const safeName = displayName.trim() || "Student";
  const batchLabel = batchCode.trim() || "Intake cohort pending assignment";

  return (
    <section
      aria-label="Welcome and academic telemetry"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <time
            dateTime={new Date().toISOString().slice(0, 10)}
            className="text-xs font-semibold uppercase tracking-widest text-slate-500"
          >
            {todayLabel}
          </time>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {safeName}
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Intake batch:{" "}
            <span className="font-semibold text-slate-700">{batchLabel}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/student/notifications"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-[#fafafa] px-3 py-2 text-xs font-bold text-slate-900 transition-all duration-200 hover:border-slate-300 hover:bg-white active:scale-[0.98]"
          >
            Alerts
            {revisionCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {revisionCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <RevisionAlertRibbon count={revisionCount} />

      <div className="mt-6">
        <TelemetryMetricsRow telemetry={telemetry} />
      </div>
    </section>
  );
}
