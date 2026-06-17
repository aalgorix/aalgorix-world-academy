"use client";

import {
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types (passed from server page)
// ---------------------------------------------------------------------------
export type AssignmentEntry = {
  id: string;
  title: string;
  description: string | null;
  maxPoints: number;
  courseId: string;
  courseTitle: string;
  curriculumTag: string | null;
  gradeLevel: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  submissionId: string | null;
  submissionStatus: "not_submitted" | "draft" | "submitted" | "graded" | "returned";
  grade: number | null;
  feedback: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  updatedAt: string | null;
};

type Tab = "all" | "todo" | "submitted" | "graded" | "returned";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const PALETTE = [
  { grad: "linear-gradient(135deg,#6E8BFF,#3B5BFF)", bg: "#EDF1FF", solid: "#4F6BFF", border: "#DCE3FF" },
  { grad: "linear-gradient(135deg,#34D399,#0E9F6E)",  bg: "#E7F8F1", solid: "#10B981", border: "#CFEEE1" },
  { grad: "linear-gradient(135deg,#FBBF24,#F59E0B)",  bg: "#FEF3E2", solid: "#F59E0B", border: "#FCE6C2" },
  { grad: "linear-gradient(135deg,#A78BFA,#7C3AED)",  bg: "#F3EEFE", solid: "#8B5CF6", border: "#E6DBFB" },
  { grad: "linear-gradient(135deg,#22D3EE,#0891B2)",  bg: "#E2F7FB", solid: "#06B6D4", border: "#C7EFF5" },
  { grad: "linear-gradient(135deg,#FB7185,#E11D48)",  bg: "#FEECEF", solid: "#F43F5E", border: "#FBD5DC" },
];

// Stable colour per courseId
function paletteFor(courseId: string) {
  let hash = 0;
  for (let i = 0; i < courseId.length; i++) hash = (hash * 31 + courseId.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length]!;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

const STATUS_META: Record<
  AssignmentEntry["submissionStatus"],
  { label: string; chipBg: string; chipText: string; icon: React.ReactNode }
> = {
  not_submitted: {
    label: "To do",
    chipBg: "#EEF0F5",
    chipText: "#6B6F8A",
    icon: <ClipboardList className="w-3.5 h-3.5" />,
  },
  draft: {
    label: "Draft",
    chipBg: "#FEF3E2",
    chipText: "#B45309",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  submitted: {
    label: "Submitted",
    chipBg: "#EEF0FF",
    chipText: "#5B5BF0",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  graded: {
    label: "Graded",
    chipBg: "#E7F8F1",
    chipText: "#0E9F6E",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  returned: {
    label: "Needs revision",
    chipBg: "#FEECEF",
    chipText: "#E11D48",
    icon: <RotateCcw className="w-3.5 h-3.5" />,
  },
};

// ---------------------------------------------------------------------------
// Assignment card
// ---------------------------------------------------------------------------
function AssignmentCard({ entry }: { entry: AssignmentEntry }) {
  const palette = paletteFor(entry.courseId);
  const statusMeta = STATUS_META[entry.submissionStatus];
  const workspaceHref =
    entry.lessonId
      ? `/student/courses/${entry.courseId}/lessons/${entry.lessonId}`
      : null;

  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[20px] overflow-hidden flex flex-col transition-shadow hover:shadow-md"
      style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
    >
      {/* colour stripe */}
      <div className="h-1.5 w-full" style={{ background: palette.grad }} />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* course + lesson breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: palette.bg, color: palette.solid }}
              >
                {entry.courseTitle}
              </span>
              {entry.lessonTitle && (
                <>
                  <span className="text-[#D6D8E4] text-[10px]">›</span>
                  <span className="text-[11px] font-medium text-[#9AA0B8] truncate max-w-[180px]">
                    {entry.lessonTitle}
                  </span>
                </>
              )}
            </div>
            <h3 className="text-[15px] font-extrabold text-[#1A1B2E] leading-snug">
              {entry.title}
            </h3>
            {entry.description && (
              <p className="text-[12.5px] text-[#6B6F8A] mt-1 line-clamp-2 leading-relaxed">
                {entry.description}
              </p>
            )}
          </div>

          {/* status chip */}
          <span
            className="shrink-0 flex items-center gap-1.5 text-[11.5px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
            style={{ background: statusMeta.chipBg, color: statusMeta.chipText }}
          >
            {statusMeta.icon}
            {statusMeta.label}
          </span>
        </div>

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-[#9AA0B8] font-medium">
          <span className="flex items-center gap-1">
            <ClipboardList className="w-3.5 h-3.5" />
            {entry.maxPoints} pts
          </span>
          {entry.submittedAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Submitted {formatDate(entry.submittedAt)}
            </span>
          )}
          {entry.gradedAt && (
            <span className="flex items-center gap-1 text-[#0E9F6E]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Graded {formatDate(entry.gradedAt)}
            </span>
          )}
        </div>

        {/* grade + feedback */}
        {entry.submissionStatus === "graded" && entry.grade != null && (
          <div
            className="flex items-center justify-between rounded-[12px] px-4 py-3"
            style={{ background: "#E7F8F1" }}
          >
            <span className="text-[13px] font-semibold text-[#0E9F6E]">Your score</span>
            <span className="text-[20px] font-extrabold text-[#0E9F6E]">
              {entry.grade}
              <span className="text-[13px] font-semibold text-[#6DC4A2]">
                /{entry.maxPoints}
              </span>
            </span>
          </div>
        )}

        {entry.submissionStatus === "returned" && (
          <div
            className="rounded-[12px] px-4 py-3 border"
            style={{ background: "#FEECEF", borderColor: "#FBD5DC" }}
          >
            <p className="text-[11.5px] font-bold text-[#E11D48] mb-1 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              Revision requested
            </p>
            {entry.feedback && (
              <p className="text-[12.5px] text-[#6B6F8A] line-clamp-2 leading-relaxed">
                {entry.feedback}
              </p>
            )}
          </div>
        )}

        {entry.submissionStatus === "graded" && entry.feedback && (
          <div
            className="rounded-[12px] px-4 py-3 border border-[#EEF0F5]"
            style={{ background: "#FAFAFA" }}
          >
            <p className="text-[11.5px] font-bold text-[#6B6F8A] mb-1">Instructor feedback</p>
            <p className="text-[12.5px] text-[#41435F] line-clamp-2 leading-relaxed">
              {entry.feedback}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          {workspaceHref ? (
            <Link
              href={workspaceHref}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[11px] text-[13px] font-bold transition-colors"
              style={
                entry.submissionStatus === "returned"
                  ? { background: "#FEECEF", color: "#E11D48" }
                  : entry.submissionStatus === "graded"
                    ? { background: "#E7F8F1", color: "#0E9F6E" }
                    : { background: palette.bg, color: palette.solid }
              }
            >
              {entry.submissionStatus === "not_submitted" && "Open & submit"}
              {entry.submissionStatus === "draft"         && "Continue draft"}
              {entry.submissionStatus === "submitted"     && "View submission"}
              {entry.submissionStatus === "graded"        && "View feedback"}
              {entry.submissionStatus === "returned"      && "Open revision desk"}
            </Link>
          ) : (
            <p className="text-center text-[12px] font-medium text-[#9AA0B8]">
              Lesson workspace not yet available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main list component
// ---------------------------------------------------------------------------
interface AssignmentsListProps {
  entries: AssignmentEntry[];
}

export function AssignmentsList({ entries }: AssignmentsListProps) {
  const [tab, setTab] = useState<Tab>("all");

  const counts = {
    all:       entries.length,
    todo:      entries.filter((e) => e.submissionStatus === "not_submitted" || e.submissionStatus === "draft").length,
    submitted: entries.filter((e) => e.submissionStatus === "submitted").length,
    graded:    entries.filter((e) => e.submissionStatus === "graded").length,
    returned:  entries.filter((e) => e.submissionStatus === "returned").length,
  };

  const visible = entries.filter((e) => {
    if (tab === "all")       return true;
    if (tab === "todo")      return e.submissionStatus === "not_submitted" || e.submissionStatus === "draft";
    if (tab === "submitted") return e.submissionStatus === "submitted";
    if (tab === "graded")    return e.submissionStatus === "graded";
    if (tab === "returned")  return e.submissionStatus === "returned";
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "all",       label: "All" },
    { key: "todo",      label: "To do" },
    { key: "submitted", label: "Submitted" },
    { key: "graded",    label: "Graded" },
    { key: "returned",  label: "Needs revision" },
  ];

  return (
    <div>
      {/* tab bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => {
          const count = counts[t.key];
          const active = tab === t.key;
          const hasBadge = count > 0 && t.key !== "all";
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-[13px] font-bold transition-all border"
              style={
                active
                  ? { background: "#1A1B2E", color: "#fff", borderColor: "#1A1B2E" }
                  : { background: "#fff", color: "#6B6F8A", borderColor: "#ECEDF3" }
              }
            >
              {t.label}
              {(t.key === "all" || hasBadge) && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={
                    active
                      ? { background: "rgba(255,255,255,.2)", color: "#fff" }
                      : t.key === "returned" && count > 0
                        ? { background: "#FEECEF", color: "#E11D48" }
                        : t.key === "todo" && count > 0
                          ? { background: "#EEF0FF", color: "#5B5BF0" }
                          : { background: "#EEF0F5", color: "#6B6F8A" }
                  }
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* grid */}
      {visible.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#D6D8E4] bg-white px-8 py-16 text-center">
          <ClipboardList className="w-9 h-9 text-[#C4C7D9] mx-auto mb-3" />
          <p className="text-[15px] font-extrabold text-[#1A1B2E]">
            {tab === "todo" ? "You're all caught up!" : `No ${tabs.find((t) => t.key === tab)?.label.toLowerCase()} assignments`}
          </p>
          <p className="mt-1.5 text-[13px] text-[#9AA0B8]">
            {tab === "todo"
              ? "All assignments have been submitted."
              : "Switch tabs to see other assignments."}
          </p>
        </div>
      ) : (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}
        >
          {visible.map((entry) => (
            <AssignmentCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
