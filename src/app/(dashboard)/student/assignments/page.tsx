import { CheckCircle2, Clock, ClipboardList, RotateCcw } from "lucide-react";
import { redirect } from "next/navigation";

import {
  AssignmentsList,
  type AssignmentEntry,
} from "@/components/student/assignments-list";
import { unwrapOne } from "@/lib/dashboard/relations";
import { isSubmissionStatus } from "@/lib/dashboard/submission-status";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type RawAssignmentRow = {
  id: string;
  title: string;
  description: string | null;
  max_points: number;
  course_id: string;
  lesson_id: string | null;
  courses:
    | { id: string; title: string; curriculum_tag: string | null; grade_level: string | null }
    | { id: string; title: string; curriculum_tag: string | null; grade_level: string | null }[]
    | null;
  lessons:
    | { id: string; title: string }
    | { id: string; title: string }[]
    | null;
};

type RawSubmissionRow = {
  id: string;
  assignment_id: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string | null;
  graded_at: string | null;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function AssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/student/assignments");

  // -- enrolled course IDs --------------------------------------------------
  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("courses ( id )")
    .eq("student_id", user.id)
    .eq("status", "active");

  const courseIds = (enrollmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(row.courses as { id: string } | { id: string }[] | null);
    return c ? [c.id] : [];
  });

  if (courseIds.length === 0) {
    return (
      <div
        className="mx-auto w-full sd-float-up"
        style={{ maxWidth: 1320, padding: "28px 32px 60px" }}
      >
        <PageHeading />
        <EmptyEnrollment />
      </div>
    );
  }

  // -- all published assignments for enrolled courses -----------------------
  const { data: assignmentRows } = await supabase
    .from("assignments")
    .select(
      `id, title, description, max_points, course_id, lesson_id,
       courses ( id, title, curriculum_tag, grade_level ),
       lessons ( id, title )`,
    )
    .in("course_id", courseIds)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // -- student's submissions ------------------------------------------------
  const assignmentIds = (assignmentRows ?? []).map((r) => r.id);
  const { data: submissionRows } =
    assignmentIds.length > 0
      ? await supabase
          .from("submissions")
          .select(
            "id, assignment_id, status, grade, feedback, submitted_at, graded_at, updated_at",
          )
          .eq("student_id", user.id)
          .in("assignment_id", assignmentIds)
      : { data: [] };

  // -- merge ----------------------------------------------------------------
  const submissionByAssignmentId = new Map(
    ((submissionRows ?? []) as RawSubmissionRow[]).map((s) => [s.assignment_id, s]),
  );

  const entries: AssignmentEntry[] = ((assignmentRows ?? []) as RawAssignmentRow[]).map(
    (row) => {
      const course = unwrapOne(row.courses);
      const lesson = unwrapOne(row.lessons);
      const sub = submissionByAssignmentId.get(row.id);
      const rawStatus = sub?.status ?? "not_submitted";
      const submissionStatus = isSubmissionStatus(rawStatus)
        ? rawStatus
        : ("not_submitted" as const);

      return {
        id:               row.id,
        title:            row.title,
        description:      row.description,
        maxPoints:        row.max_points ?? 100,
        courseId:         course?.id ?? row.course_id,
        courseTitle:      course?.title ?? "Course",
        curriculumTag:    course?.curriculum_tag ?? null,
        gradeLevel:       course?.grade_level ?? null,
        lessonId:         lesson?.id ?? row.lesson_id,
        lessonTitle:      lesson?.title ?? null,
        submissionId:     sub?.id ?? null,
        submissionStatus,
        grade:            sub?.grade ?? null,
        feedback:         sub?.feedback ?? null,
        submittedAt:      sub?.submitted_at ?? null,
        gradedAt:         sub?.graded_at ?? null,
        updatedAt:        sub?.updated_at ?? null,
      };
    },
  );

  // -- stats ----------------------------------------------------------------
  const total      = entries.length;
  const todo       = entries.filter((e) => e.submissionStatus === "not_submitted" || e.submissionStatus === "draft").length;
  const submitted  = entries.filter((e) => e.submissionStatus === "submitted").length;
  const graded     = entries.filter((e) => e.submissionStatus === "graded").length;
  const returned   = entries.filter((e) => e.submissionStatus === "returned").length;

  const gradedScores = entries
    .filter((e) => e.submissionStatus === "graded" && e.grade != null)
    .map((e) => e.grade as number);
  const avgScore =
    gradedScores.length > 0
      ? Math.round(gradedScores.reduce((s, v) => s + v, 0) / gradedScores.length)
      : null;

  // -------------------------------------------------------------------------
  return (
    <div
      className="mx-auto w-full sd-float-up"
      style={{ maxWidth: 1320, padding: "28px 32px 60px" }}
    >
      <PageHeading />

      {/* stats strip */}
      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}
      >
        {[
          {
            icon: <ClipboardList className="w-5 h-5" style={{ color: "#6366F1" }} />,
            bg: "#EEF0FF", value: total,     label: "Total assignments",
          },
          {
            icon: <ClipboardList className="w-5 h-5" style={{ color: "#5B5BF0" }} />,
            bg: "#EEF0FF", value: todo,      label: "To do",
          },
          {
            icon: <Clock className="w-5 h-5" style={{ color: "#F59E0B" }} />,
            bg: "#FEF3E2", value: submitted, label: "Awaiting grade",
          },
          {
            icon: <CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} />,
            bg: "#E7F8F1", value: graded,    label: "Graded",
          },
          {
            icon: <RotateCcw className="w-5 h-5" style={{ color: "#F43F5E" }} />,
            bg: "#FEECEF", value: returned,  label: "Needs revision",
          },
          {
            icon: <CheckCircle2 className="w-5 h-5" style={{ color: "#0E9F6E" }} />,
            bg: "#E7F8F1", value: avgScore != null ? `${avgScore}%` : "—", label: "Average score",
          },
        ].map(({ icon, bg, value, label }) => (
          <div
            key={label}
            className="bg-white border border-[#ECEDF3] rounded-[20px] p-5 flex items-center gap-3"
            style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
          >
            <div
              className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: bg }}
            >
              {icon}
            </div>
            <div>
              <div className="text-[21px] font-extrabold text-[#1A1B2E] leading-none">
                {value}
              </div>
              <div className="text-[12px] font-semibold text-[#6B6F8A] mt-0.5">
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* assignments list with tab filtering */}
      {total === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[#D6D8E4] bg-white px-8 py-16 text-center">
          <ClipboardList className="w-10 h-10 text-[#C4C7D9] mx-auto mb-4" />
          <p className="text-[17px] font-extrabold text-[#1A1B2E]">No assignments yet</p>
          <p className="mt-2 text-[13.5px] text-[#9AA0B8] max-w-xs mx-auto">
            Assignments will appear here once your teachers publish them to your courses.
          </p>
        </div>
      ) : (
        <AssignmentsList entries={entries} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function PageHeading() {
  return (
    <div className="mb-6">
      <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">
        Assignments
      </h1>
      <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">
        All homework and projects across your enrolled courses.
      </p>
    </div>
  );
}

function EmptyEnrollment() {
  return (
    <div className="rounded-[22px] border border-dashed border-[#D6D8E4] bg-white px-8 py-16 text-center">
      <ClipboardList className="w-10 h-10 text-[#C4C7D9] mx-auto mb-4" />
      <p className="text-[17px] font-extrabold text-[#1A1B2E]">No active enrolments</p>
      <p className="mt-2 text-[13.5px] text-[#9AA0B8] max-w-xs mx-auto">
        Enrol in courses to see your assignments here.
      </p>
    </div>
  );
}
