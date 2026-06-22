import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { NoChildrenPrompt } from "@/components/parent/no-children-prompt";
import { ParentChildNav } from "@/components/parent/parent-child-nav";
import {
  buildScholasticSummary,
  fetchChildDashboardData,
  requireParentSession,
  resolveActiveChildId,
} from "@/lib/parent/queries";

import { CourseProgressPanel } from "./course-progress-panel";
import { GradingTimeline } from "./grading-timeline";
import { ScholasticSummaryPanel } from "./scholastic-summary";

type PageProps = {
  searchParams: Promise<{ child?: string }>;
};

export default async function ParentHomePage({ searchParams }: PageProps) {
  const { child: childParam } = await searchParams;
  const session = await requireParentSession("/parent");
  const { children, displayName } = session;

  const activeChildId = resolveActiveChildId(children, childParam, "/parent");
  const activeChild = children.find((child) => child.id === activeChildId) ?? null;

  let enrollments: Awaited<ReturnType<typeof fetchChildDashboardData>>["enrollments"] = [];
  let timeline: Awaited<ReturnType<typeof fetchChildDashboardData>>["timeline"] = [];
  let completionPercent = 0;

  if (activeChildId) {
    const data = await fetchChildDashboardData(activeChildId);
    enrollments = data.enrollments;
    timeline = data.timeline;
    completionPercent = data.completionPercent;
  }

  const summary = buildScholasticSummary(completionPercent, timeline);
  const learnerName = activeChild?.full_name?.trim() || activeChild?.email || "Learner";

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <p className="text-[12px] font-bold uppercase tracking-widest text-amber-600">
          Parent performance monitoring
        </p>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-stone-900">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-[14px] font-medium text-stone-500">
          Progress, grades, and teacher feedback for your linked learners.
        </p>
      </div>

      {children.length === 0 ? (
        <NoChildrenPrompt />
      ) : activeChild && activeChildId ? (
        <>
          <Suspense fallback={null}>
            <ParentChildNav linkedChildren={children} activeChildId={activeChildId} />
          </Suspense>

          <div className="rounded-[22px] rounded-tl-none border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <header className="border-b border-stone-100 pb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600">
                {activeChild.relationshipLabel}
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-stone-900">{learnerName}</h2>
              <p className="mt-1 text-sm text-stone-500">{activeChild.email}</p>
            </header>

            <Link
              href={`/parent/report-card/${activeChildId}`}
              className="mt-6 flex w-full items-center gap-4 rounded-xl border-2 border-stone-800 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-stone-900 hover:bg-stone-50 hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-800">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M9 12h6M9 16h6M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
                  <path d="M14 3v5h5" />
                </svg>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-stone-900 sm:text-base">
                  View official academic transcript
                </span>
                <span className="mt-0.5 block text-xs text-stone-600 sm:text-sm">
                  Print-ready report card and graded assessment record
                </span>
              </span>
              <span className="hidden shrink-0 text-stone-400 sm:inline">→</span>
            </Link>

            <div className="mt-8">
              <ScholasticSummaryPanel summary={summary} learnerName={learnerName} />
            </div>
            <div className="mt-10">
              <CourseProgressPanel enrollments={enrollments} />
            </div>
            <div className="mt-10">
              <GradingTimeline entries={timeline} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
