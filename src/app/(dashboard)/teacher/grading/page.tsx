import { redirect } from "next/navigation";

import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

import { GradingStation } from "./grading-station";
import type {
  GradingQueueItem,
  GradingQueueMetrics,
  StoragePathEntry,
  SubmissionStatus,
} from "./types";

type AssignedCourseRow = {
  id: string;
  title: string;
};

type RawSubmissionRow = {
  id: string;
  status: SubmissionStatus;
  submitted_at: string | null;
  graded_at: string | null;
  grade: number | null;
  feedback: string | null;
  storage_paths: StoragePathEntry[] | null;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  assignments: {
    id: string;
    title: string;
    description: string | null;
    max_points: number;
    course_id: string;
    lesson_id: string | null;
    courses: { title: string } | { title: string }[] | null;
    lessons: { title: string } | { title: string }[] | null;
  } | {
    id: string;
    title: string;
    description: string | null;
    max_points: number;
    course_id: string;
    lesson_id: string | null;
    courses: { title: string } | { title: string }[] | null;
    lessons: { title: string } | { title: string }[] | null;
  }[] | null;
};

function isSubmissionStatus(value: string): value is SubmissionStatus {
  return (
    value === "submitted" ||
    value === "graded" ||
    value === "returned" ||
    value === "draft"
  );
}

function parseStoragePaths(raw: unknown): StoragePathEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (entry): entry is StoragePathEntry =>
      typeof entry === "object" &&
      entry !== null &&
      "path" in entry &&
      "name" in entry &&
      typeof (entry as StoragePathEntry).path === "string" &&
      typeof (entry as StoragePathEntry).name === "string",
  );
}

function buildMetrics(items: GradingQueueItem[]): GradingQueueMetrics {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return {
    pendingHomework: items.filter((item) => item.status === "submitted").length,
    gradedThisWeek: items.filter((item) => {
      if (item.status !== "graded" || !item.gradedAt) return false;
      return new Date(item.gradedAt).getTime() >= weekAgo;
    }).length,
    revisionQueue: items.filter((item) => item.status === "returned").length,
  };
}

function normalizeSubmission(row: RawSubmissionRow): GradingQueueItem | null {
  if (!isSubmissionStatus(row.status)) return null;

  const assignment = unwrapOne(row.assignments);
  if (!assignment) return null;

  const course = unwrapOne(assignment.courses);
  const lesson = unwrapOne(assignment.lessons);
  const student = unwrapOne(row.profiles);

  return {
    id: row.id,
    status: row.status,
    submittedAt: row.submitted_at,
    gradedAt: row.graded_at,
    grade: row.grade,
    feedback: row.feedback,
    storagePaths: parseStoragePaths(row.storage_paths),
    studentName: student?.full_name?.trim() || "Student",
    courseTitle: course?.title ?? "Course",
    lessonTitle: lesson?.title ?? null,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    assignmentDescription: assignment.description,
    maxPoints: assignment.max_points,
    courseId: assignment.course_id,
    lessonId: assignment.lesson_id,
  };
}

export default async function TeacherGradingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/teacher/grading");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher") {
    redirect("/teacher");
  }

  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select(
      `
      course_id,
      courses (
        id,
        title
      )
    `,
    )
    .eq("teacher_id", user.id);

  const courseOptions =
    assignmentRows?.flatMap((row) => {
      const course = unwrapOne(
        row.courses as AssignedCourseRow | AssignedCourseRow[] | null,
      );
      if (!course) return [];
      return [{ id: course.id, title: course.title }];
    }) ?? [];

  const courseIds = courseOptions.map((course) => course.id);

  let items: GradingQueueItem[] = [];

  if (courseIds.length > 0) {
    const { data: courseAssignments } = await supabase
      .from("assignments")
      .select("id")
      .in("course_id", courseIds);

    const assignmentIds = (courseAssignments ?? []).map((row) => row.id);

    if (assignmentIds.length > 0) {
      const { data: submissionRows, error } = await supabase
        .from("submissions")
        .select(
          `
          id,
          status,
          submitted_at,
          graded_at,
          grade,
          feedback,
          storage_paths,
          profiles!submissions_student_id_fkey (
            full_name
          ),
          assignments!inner (
            id,
            title,
            description,
            max_points,
            course_id,
            lesson_id,
            courses (
              title
            ),
            lessons (
              title
            )
          )
        `,
        )
        .in("assignment_id", assignmentIds)
        .in("status", ["submitted", "graded", "returned"])
        .order("submitted_at", { ascending: false, nullsFirst: false });

      if (error) {
        console.error("[teacher/grading] submissions fetch failed:", error.message);
      } else {
        items = ((submissionRows ?? []) as RawSubmissionRow[])
          .map(normalizeSubmission)
          .filter((row): row is GradingQueueItem => row !== null);
      }
    }
  }

  const metrics = buildMetrics(items);

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <p className="text-[12px] font-extrabold uppercase tracking-widest text-teal-600 mb-1">Grading queue</p>
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Teacher evaluation terminal</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">
          Review submissions across your assigned courses, download learner artifacts securely, and log scores with actionable feedback.
        </p>
      </div>
      <GradingStation items={items} metrics={metrics} courseOptions={courseOptions} />
    </div>
  );
}
