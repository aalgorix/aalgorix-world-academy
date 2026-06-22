import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { NoChildrenPrompt } from "@/components/parent/no-children-prompt";
import { ParentChildNav } from "@/components/parent/parent-child-nav";
import {
  fetchChildAssignments,
  requireParentSession,
  resolveActiveChildId,
} from "@/lib/parent/queries";

type PageProps = {
  searchParams: Promise<{ child?: string }>;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  not_submitted: { bg: "#F5F5F4", color: "#57534E", label: "Not submitted" },
  draft:         { bg: "#FEF3C7", color: "#B45309", label: "Draft" },
  submitted:     { bg: "#DBEAFE", color: "#1D4ED8", label: "Submitted" },
  graded:        { bg: "#D1FAE5", color: "#065F46", label: "Graded" },
  returned:      { bg: "#FEE2E2", color: "#B91C1C", label: "Returned" },
};

export default async function ParentAssignmentsPage({ searchParams }: PageProps) {
  const { child: childParam } = await searchParams;
  const session = await requireParentSession("/parent/assignments");
  const activeChildId = resolveActiveChildId(session.children, childParam, "/parent/assignments");
  const activeChild = session.children.find((c) => c.id === activeChildId);

  const assignments = activeChildId ? await fetchChildAssignments(activeChildId) : [];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-stone-900">Assignments</h1>
        <p className="mt-1 text-[14px] font-medium text-stone-500">
          Homework status across enrolled courses (read-only).
        </p>
      </div>

      {session.children.length === 0 ? (
        <NoChildrenPrompt />
      ) : activeChild && activeChildId ? (
        <>
          <Suspense fallback={null}>
            <ParentChildNav linkedChildren={session.children} activeChildId={activeChildId} />
          </Suspense>

          {assignments.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-stone-300 bg-white px-8 py-16 text-center">
              <p className="text-[16px] font-bold text-stone-800">No assignments yet</p>
              <p className="mt-2 text-[13px] text-stone-500">
                Published assignments will appear here when courses are active.
              </p>
            </div>
          ) : (
            <div
              className="bg-white border border-stone-200 rounded-[22px] overflow-hidden"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}
            >
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-stone-100 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                <span>Assignment</span>
                <span className="text-right">Status</span>
                <span className="text-right">Grade</span>
                <span className="text-right">Updated</span>
              </div>
              <div className="divide-y divide-stone-50">
                {assignments.map((row) => {
                  const s = STATUS_STYLE[row.status] ?? STATUS_STYLE.not_submitted;
                  const updated = row.gradedAt ?? row.submittedAt;
                  return (
                    <div
                      key={row.id}
                      className="flex sm:grid sm:grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <div className="text-[14px] font-bold text-stone-900 truncate">{row.title}</div>
                        <div className="text-[12px] text-stone-500 truncate">
                          {row.courseTitle}
                          {row.lessonTitle ? ` · ${row.lessonTitle}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ background: s.bg, color: s.color }}
                        >
                          {s.label}
                        </span>
                      </div>
                      <div className="text-right text-[13px] font-bold text-stone-800">
                        {row.grade != null ? `${row.grade}/${row.maxPoints}` : "—"}
                      </div>
                      <div className="hidden sm:block text-right text-[12px] text-stone-500">
                        {updated
                          ? new Date(updated).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
