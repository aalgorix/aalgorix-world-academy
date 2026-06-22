import { Suspense } from "react";

import { NoChildrenPrompt } from "@/components/parent/no-children-prompt";
import { ParentChildNav } from "@/components/parent/parent-child-nav";
import {
  fetchChildLearningActivity,
  requireParentSession,
  resolveActiveChildId,
} from "@/lib/parent/queries";

type PageProps = {
  searchParams: Promise<{ child?: string }>;
};

export default async function ParentAttendancePage({ searchParams }: PageProps) {
  const { child: childParam } = await searchParams;
  const session = await requireParentSession("/parent/attendance");
  const activeChildId = resolveActiveChildId(session.children, childParam, "/parent/attendance");
  const activeChild = session.children.find((c) => c.id === activeChildId);

  const activity = activeChildId ? await fetchChildLearningActivity(activeChildId) : [];

  const totalLessons = activity.reduce((sum, day) => sum + day.lessonsCompleted, 0);
  const totalSubmissions = activity.reduce((sum, day) => sum + day.assignmentsSubmitted, 0);
  const activeDays = activity.filter(
    (day) => day.lessonsCompleted > 0 || day.assignmentsSubmitted > 0,
  ).length;

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-stone-900">Learning activity</h1>
        <p className="mt-1 text-[14px] font-medium text-stone-500">
          Lesson completions and assignment submissions (derived from LMS activity).
        </p>
      </div>

      {session.children.length === 0 ? (
        <NoChildrenPrompt />
      ) : activeChild && activeChildId ? (
        <>
          <Suspense fallback={null}>
            <ParentChildNav linkedChildren={session.children} activeChildId={activeChildId} />
          </Suspense>

          <div className="grid gap-4 mb-6 sm:grid-cols-3">
            {[
              { label: "Active days", value: activeDays },
              { label: "Lessons completed", value: totalLessons },
              { label: "Assignments submitted", value: totalSubmissions },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-white border border-stone-200 rounded-[20px] p-5"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}
              >
                <div className="text-[24px] font-extrabold text-stone-900">{value}</div>
                <div className="text-[12px] font-bold text-stone-600 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {activity.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-stone-300 bg-white px-8 py-16 text-center">
              <p className="text-[16px] font-bold text-stone-800">No activity recorded yet</p>
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-[22px] overflow-hidden">
              <div className="hidden sm:grid grid-cols-[auto_1fr_1fr] gap-4 px-5 py-3 border-b border-stone-100 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                <span>Date</span>
                <span className="text-right">Lessons</span>
                <span className="text-right">Assignments</span>
              </div>
              <div className="divide-y divide-stone-50">
                {activity.slice(0, 30).map((day) => (
                  <div
                    key={day.date}
                    className="flex sm:grid sm:grid-cols-[auto_1fr_1fr] items-center gap-4 px-5 py-3.5"
                  >
                    <div className="text-[14px] font-bold text-stone-900">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-right text-[13px] font-semibold text-emerald-700">
                      {day.lessonsCompleted}
                    </div>
                    <div className="text-right text-[13px] font-semibold text-blue-700">
                      {day.assignmentsSubmitted}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
