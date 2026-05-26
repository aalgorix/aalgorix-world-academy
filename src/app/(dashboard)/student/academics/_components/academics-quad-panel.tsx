"use client";

import { useState } from "react";

import type { AcademicsTabId, StudentAcademicsPayload } from "@/lib/student/academics/types";

import { AssignmentsRecordsLedger } from "./assignments-records-ledger";
import { CurriculumTracksTree } from "./curriculum-tracks-tree";
import { StudyVaultPanel } from "./study-vault-panel";

const TABS: { id: AcademicsTabId; label: string }[] = [
  { id: "curriculum", label: "Curriculum Tracks" },
  { id: "vault", label: "Study Material & Videos Vault" },
  { id: "assignments", label: "Assignments & Testing Records" },
];

const PANEL_MIN_HEIGHT = "min-h-[360px]";

type AcademicsQuadPanelProps = Pick<
  StudentAcademicsPayload,
  "courses" | "materials" | "videos" | "submissions"
>;

export function AcademicsQuadPanel({
  courses,
  materials,
  videos,
  submissions,
}: AcademicsQuadPanelProps) {
  const [activeTab, setActiveTab] = useState<AcademicsTabId>("curriculum");

  return (
    <section
      aria-label="Student academics quad"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div
        role="tablist"
        aria-label="Academics views"
        className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-[#fafafa] p-2"
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
              className={`shrink-0 rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-200 active:scale-[0.98] sm:px-4 sm:text-sm ${
                selected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={`${PANEL_MIN_HEIGHT} p-4 sm:p-6`} role="tabpanel">
        <div className={activeTab === "curriculum" ? "block" : "hidden"}>
          <CurriculumTracksTree courses={courses} />
        </div>
        <div className={activeTab === "vault" ? "block" : "hidden"}>
          <StudyVaultPanel materials={materials} videos={videos} />
        </div>
        <div className={activeTab === "assignments" ? "block" : "hidden"}>
          <AssignmentsRecordsLedger rows={submissions} />
        </div>
      </div>
    </section>
  );
}
