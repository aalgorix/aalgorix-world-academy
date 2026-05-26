"use client";

import { useState } from "react";

import type {
  AcademicTabId,
  HubAiContext,
  HubAssignmentRow,
  HubEnrolledCourse,
  HubVaultItem,
} from "@/lib/student/hub/types";

import { AssignmentsLedger } from "./assignments-ledger";
import { CurriculumTreePanel } from "./curriculum-tree-panel";
import { StudyVaultGrid } from "./study-vault-grid";

const TABS: { id: AcademicTabId; label: string }[] = [
  { id: "curriculum", label: "Curriculum" },
  { id: "assignments", label: "Assignments & Tests" },
  { id: "vault", label: "Study Vault" },
];

type AcademicCanvasProps = {
  courses: HubEnrolledCourse[];
  assignments: HubAssignmentRow[];
  vaultItems: HubVaultItem[];
  onAiContextChange: (context: HubAiContext) => void;
  initialAiContext: HubAiContext;
};

export function AcademicCanvas({
  courses,
  assignments,
  vaultItems,
  onAiContextChange,
  initialAiContext,
}: AcademicCanvasProps) {
  const [activeTab, setActiveTab] = useState<AcademicTabId>("curriculum");

  function handleLessonFocus(
    courseId: string,
    lessonId: string,
    lessonTitle: string,
    moduleTitle: string,
  ) {
    const course = courses.find((c) => c.courseId === courseId);
    onAiContextChange({
      courseId,
      courseTitle: course?.courseTitle ?? initialAiContext.courseTitle,
      moduleTitle,
      lessonId,
      lessonTitle,
    });
  }

  return (
    <section
      aria-label="Academic quad expansion suite"
      id="hub-academics"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div
        role="tablist"
        aria-label="Academic views"
        className="flex gap-1 overflow-x-auto border-b border-slate-200 p-2"
      >
        {TABS.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 active:scale-[0.98] sm:text-sm ${
                selected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-[280px] p-4 sm:p-5" role="tabpanel">
        {activeTab === "curriculum" ? (
          <CurriculumTreePanel courses={courses} onLessonFocus={handleLessonFocus} />
        ) : null}
        {activeTab === "assignments" ? (
          <AssignmentsLedger rows={assignments} />
        ) : null}
        {activeTab === "vault" ? <StudyVaultGrid items={vaultItems} /> : null}
      </div>
    </section>
  );
}
