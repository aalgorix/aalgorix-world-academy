import type { AcademicsSummaryMetrics } from "@/lib/student/academics/types";

type AcademicsSummaryMetricsProps = {
  metrics: AcademicsSummaryMetrics;
};

export function AcademicsSummaryMetricsBar({ metrics }: AcademicsSummaryMetricsProps) {
  const items = [
    {
      label: "Active tracks",
      value: metrics.activeEnrollments,
      hint: "Published enrollments",
    },
    {
      label: "Mean progress",
      value: `${metrics.meanProgressPercent}%`,
      hint: "Across all courses",
    },
    {
      label: "Awaiting review",
      value: metrics.awaitingReviewCount,
      hint: "Submitted coursework",
    },
    {
      label: "Revision desk",
      value: metrics.revisionRequestedCount,
      hint: "Returned by teachers",
    },
  ];

  return (
    <section
      aria-label="Academics summary metrics"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {item.label}
          </p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">
            {item.value}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{item.hint}</p>
        </div>
      ))}
    </section>
  );
}
