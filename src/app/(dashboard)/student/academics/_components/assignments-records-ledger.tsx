import Link from "next/link";

import { hubSubmissionBadgeClass } from "@/lib/student/hub/submission-labels";
import type { AcademicsSubmissionRecord } from "@/lib/student/academics/types";

type AssignmentsRecordsLedgerProps = {
  rows: AcademicsSubmissionRecord[];
};

export function AssignmentsRecordsLedger({ rows }: AssignmentsRecordsLedgerProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
        Your assignments and formal tests will be listed here after you submit work from
        your classroom lessons.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3">Assessment name</th>
            <th className="px-4 py-3">Track title</th>
            <th className="px-4 py-3">Turned in date</th>
            <th className="px-4 py-3">Status badge</th>
            <th className="px-4 py-3 text-right">Mark received</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-[#fafafa]">
              <td className="px-4 py-3 font-semibold text-slate-900">
                {row.assessmentName || "Untitled assessment"}
              </td>
              <td className="px-4 py-3 text-slate-600">
                {row.trackTitle || "—"}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">{row.turnedInLabel}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${hubSubmissionBadgeClass(row.status)}`}
                >
                  {row.statusLabel}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-extrabold tabular-nums text-slate-900">
                {row.grade != null ? `${row.grade} / 100` : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                {row.status === "returned" ? (
                  <Link
                    href={row.notificationsHref}
                    className="inline-flex rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-rose-700 active:scale-[0.98]"
                  >
                    Open Desk to Revise
                  </Link>
                ) : row.workspaceHref ? (
                  <Link
                    href={row.workspaceHref}
                    className="inline-flex rounded-lg border border-slate-900 px-3 py-1.5 text-xs font-bold text-slate-900 transition-all hover:bg-slate-50 active:scale-[0.98]"
                  >
                    Open workspace
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
