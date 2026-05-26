"use client";

import Link from "next/link";

import { formatShortDate } from "@/lib/student/hub/format";
import { hubSubmissionBadgeClass } from "@/lib/student/hub/submission-labels";
import type { HubAssignmentRow } from "@/lib/student/hub/types";

type AssignmentsLedgerProps = {
  rows: HubAssignmentRow[];
};

export function AssignmentsLedger({ rows }: AssignmentsLedgerProps) {
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
        No submissions yet. Complete lessons and upload work from your classroom workspace.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3">Assignment</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Turn-in</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-[#fafafa]">
              <td className="px-4 py-3 font-semibold text-slate-900">
                {row.workspaceHref ? (
                  <Link
                    href={row.workspaceHref}
                    className="hover:text-indigo-700 active:scale-[0.98]"
                  >
                    {row.title}
                  </Link>
                ) : (
                  row.title
                )}
              </td>
              <td className="px-4 py-3 text-slate-600">{row.courseTitle}</td>
              <td className="px-4 py-3 capitalize text-slate-600">{row.kind}</td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {row.submittedAtIso
                  ? formatShortDate(row.submittedAtIso)
                  : row.dueAtIso
                    ? `Due ${formatShortDate(row.dueAtIso)}`
                    : "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ring-inset ${hubSubmissionBadgeClass(row.status)}`}
                >
                  {row.statusLabel}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-900">
                {row.grade != null ? `${row.grade} / 100` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
