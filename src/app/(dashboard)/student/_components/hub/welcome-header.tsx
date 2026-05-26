import Link from "next/link";

import { RevisionAlertRibbon } from "../../revision-alert-ribbon";

type WelcomeHeaderProps = {
  displayName: string;
  batchCode: string;
  todayLabel: string;
  revisionCount: number;
};

export function WelcomeHeader({
  displayName,
  batchCode,
  todayLabel,
  revisionCount,
}: WelcomeHeaderProps) {
  const batchLabel = batchCode.trim() || "Intake pending assignment";

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <time
            dateTime={new Date().toISOString().slice(0, 10)}
            className="text-xs font-semibold uppercase tracking-widest text-slate-500"
          >
            {todayLabel}
          </time>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {displayName}
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Active intake batch:{" "}
            <span className="font-bold text-slate-800">{batchLabel}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Link
            href="/student/notifications"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-[#fafafa] px-3 py-2 text-xs font-bold text-slate-900 transition-all duration-200 hover:border-slate-300 hover:bg-white active:scale-[0.98]"
          >
            Alerts
            {revisionCount > 0 ? (
              <span className="ml-1.5 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                {revisionCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/student/profile"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
          >
            Profile
          </Link>
        </div>
      </div>
      <RevisionAlertRibbon count={revisionCount} />
    </header>
  );
}
