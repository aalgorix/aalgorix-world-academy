import { redirect } from "next/navigation";

import { getDashboardPathForRole } from "@/lib/auth/redirects";
import { isUserRole } from "@/lib/auth/roles";
import {
  computeProgressPercent,
  fetchCompletedLessonsByEnrollment,
  fetchLessonTotalsByCourse,
} from "@/lib/dashboard/course-progress";
import { unwrapOne } from "@/lib/dashboard/relations";
import { isSubmissionStatus } from "@/lib/dashboard/submission-status";
import { createClient } from "@/lib/supabase/server";

import type {
  CourseEnrollmentProgress,
  GradingTimelineEntry,
  LinkedChild,
  ScholasticSummary,
  StoragePathEntry,
} from "@/app/(dashboard)/parent/types";

type ChildProfile = {
  id: string;
  full_name: string | null;
  email: string;
};

type RawSubmissionRow = {
  id: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  submitted_at: string | null;
  storage_paths: unknown;
  assignments: {
    title: string;
    courses: { title: string } | { title: string }[] | null;
    lessons: { title: string } | { title: string }[] | null;
  } | {
    title: string;
    courses: { title: string } | { title: string }[] | null;
    lessons: { title: string } | { title: string }[] | null;
  }[] | null;
};

export type ParentSession = {
  userId: string;
  displayName: string;
  children: LinkedChild[];
};

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

function normalizeTimelineEntry(row: RawSubmissionRow): GradingTimelineEntry | null {
  if (!isSubmissionStatus(row.status) || row.status === "draft") return null;

  const assignment = unwrapOne(row.assignments);
  if (!assignment) return null;

  const course = unwrapOne(assignment.courses);
  const lesson = unwrapOne(assignment.lessons);

  return {
    id: row.id,
    status: row.status,
    grade: row.grade,
    feedback: row.feedback,
    gradedAt: row.graded_at,
    submittedAt: row.submitted_at,
    courseTitle: course?.title ?? "Course",
    lessonTitle: lesson?.title ?? null,
    assignmentTitle: assignment.title,
    storagePaths: parseStoragePaths(row.storage_paths),
  };
}

function timelineSortTimestamp(entry: GradingTimelineEntry): number {
  const iso = entry.gradedAt ?? entry.submittedAt;
  return iso ? new Date(iso).getTime() : 0;
}

export function buildScholasticSummary(
  completionPercent: number,
  timeline: GradingTimelineEntry[],
): ScholasticSummary {
  const gradedWithScores = timeline.filter(
    (entry) => entry.status === "graded" && entry.grade != null,
  );

  const averageGrade =
    gradedWithScores.length > 0
      ? Math.round(
          gradedWithScores.reduce((sum, entry) => sum + (entry.grade ?? 0), 0) /
            gradedWithScores.length,
        )
      : null;

  return {
    completionPercent,
    assignmentsSubmitted: timeline.length,
    averageGrade,
    pendingRevisions: timeline.filter((entry) => entry.status === "returned").length,
  };
}

export async function requireParentSession(
  nextPath = "/parent",
): Promise<ParentSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "parent") {
    const destination =
      profile?.role && isUserRole(profile.role)
        ? getDashboardPathForRole(profile.role)
        : "/login";
    redirect(destination);
  }

  const { data: relationRows } = await supabase
    .from("student_parent_relations")
    .select(
      `
      student_id,
      relationship_label,
      student:profiles!student_id (
        id,
        full_name,
        email
      )
    `,
    )
    .eq("parent_id", user.id);

  const children: LinkedChild[] =
    relationRows?.flatMap((row) => {
      const child = unwrapOne(row.student as ChildProfile | ChildProfile[] | null);
      if (!child) return [];
      return [
        {
          ...child,
          relationshipLabel: row.relationship_label ?? "Child",
        },
      ];
    }) ?? [];

  return {
    userId: user.id,
    displayName: profile?.full_name?.trim() || "Parent",
    children,
  };
}

/** Validates ?child= param and redirects to a canonical child id when needed. */
export function resolveActiveChildId(
  children: LinkedChild[],
  childParam: string | undefined,
  redirectPath: string,
): string | null {
  if (children.length === 0) return null;

  const validatedChildId = children.some((child) => child.id === childParam)
    ? childParam!
    : children[0].id;

  if (childParam !== validatedChildId) {
    redirect(`${redirectPath}?child=${validatedChildId}`);
  }

  return validatedChildId;
}

export async function fetchChildDashboardData(childId: string): Promise<{
  enrollments: CourseEnrollmentProgress[];
  timeline: GradingTimelineEntry[];
  completionPercent: number;
}> {
  const supabase = await createClient();

  const [{ data: enrollmentRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        `
          id,
          courses (
            id,
            title,
            curriculum_tag
          )
        `,
      )
      .eq("student_id", childId)
      .eq("status", "active"),
    supabase
      .from("submissions")
      .select(
        `
          id,
          status,
          grade,
          feedback,
          graded_at,
          submitted_at,
          storage_paths,
          assignments (
            title,
            courses ( title ),
            lessons ( title )
          )
        `,
      )
      .eq("student_id", childId)
      .neq("status", "draft"),
  ]);

  type CourseSummary = { id: string; title: string; curriculum_tag: string | null };

  const childEnrollments =
    enrollmentRows?.flatMap((row) => {
      const course = unwrapOne(row.courses as CourseSummary | CourseSummary[] | null);
      if (!course) return [];
      return [{ enrollmentId: row.id, course }];
    }) ?? [];

  const enrollmentIds = childEnrollments.map((row) => row.enrollmentId);
  const courseIds = childEnrollments.map((row) => row.course.id);

  const [lessonTotals, completedByEnrollment] = await Promise.all([
    fetchLessonTotalsByCourse(supabase, courseIds),
    fetchCompletedLessonsByEnrollment(supabase, enrollmentIds),
  ]);

  const enrollments = childEnrollments.map(({ enrollmentId, course }) => {
    const total = lessonTotals.get(course.id) ?? 0;
    const completed = completedByEnrollment.get(enrollmentId) ?? 0;
    return {
      enrollmentId,
      course,
      progressPercent: computeProgressPercent(completed, total),
    };
  });

  let completionPercent = 0;
  if (enrollments.length > 0) {
    completionPercent = Math.round(
      enrollments.reduce((sum, row) => sum + row.progressPercent, 0) / enrollments.length,
    );
  }

  const timeline = ((submissionRows ?? []) as RawSubmissionRow[])
    .map(normalizeTimelineEntry)
    .filter((entry): entry is GradingTimelineEntry => entry !== null)
    .sort((a, b) => timelineSortTimestamp(b) - timelineSortTimestamp(a));

  return { enrollments, timeline, completionPercent };
}

export async function assertParentHasChild(
  parentId: string,
  childId: string,
): Promise<void> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("student_parent_relations")
    .select("id")
    .eq("parent_id", parentId)
    .eq("student_id", childId)
    .maybeSingle();

  if (!data) {
    redirect("/parent");
  }
}

export type ParentAssignmentRow = {
  id: string;
  title: string;
  courseTitle: string;
  lessonTitle: string | null;
  maxPoints: number;
  status: string;
  grade: number | null;
  submittedAt: string | null;
  gradedAt: string | null;
};

export async function fetchChildAssignments(childId: string): Promise<ParentAssignmentRow[]> {
  const supabase = await createClient();

  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("courses ( id )")
    .eq("student_id", childId)
    .eq("status", "active");

  const courseIds = (enrollmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(row.courses as { id: string } | { id: string }[] | null);
    return c ? [c.id] : [];
  });

  if (courseIds.length === 0) return [];

  const { data: assignmentRows } = await supabase
    .from("assignments")
    .select(
      `id, title, max_points,
       courses ( title ),
       lessons ( title )`,
    )
    .in("course_id", courseIds)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  const assignmentIds = (assignmentRows ?? []).map((r) => r.id);
  const { data: submissionRows } =
    assignmentIds.length > 0
      ? await supabase
          .from("submissions")
          .select("assignment_id, status, grade, submitted_at, graded_at")
          .eq("student_id", childId)
          .in("assignment_id", assignmentIds)
      : { data: [] };

  const submissionByAssignment = new Map(
    (submissionRows ?? []).map((s) => [s.assignment_id, s]),
  );

  return (assignmentRows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as { title: string } | { title: string }[] | null,
    );
    const lesson = unwrapOne(
      row.lessons as { title: string } | { title: string }[] | null,
    );
    const submission = submissionByAssignment.get(row.id);

    return {
      id: row.id,
      title: row.title,
      courseTitle: course?.title ?? "Course",
      lessonTitle: lesson?.title ?? null,
      maxPoints: row.max_points,
      status: submission?.status ?? "not_submitted",
      grade: submission?.grade ?? null,
      submittedAt: submission?.submitted_at ?? null,
      gradedAt: submission?.graded_at ?? null,
    };
  });
}

export type { LearningActivityDay } from "@/lib/dashboard/learning-activity";
export { fetchLearningActivity as fetchChildLearningActivity } from "@/lib/dashboard/learning-activity";

export type ChildTeacherContact = {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  courseTitle: string;
};

export async function fetchChildTeacherContacts(
  childId: string,
): Promise<ChildTeacherContact[]> {
  const supabase = await createClient();

  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("courses ( id, title )")
    .eq("student_id", childId)
    .eq("status", "active");

  const courses = (enrollmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(
      row.courses as { id: string; title: string } | { id: string; title: string }[] | null,
    );
    return c ? [c] : [];
  });

  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id);
  const courseTitleById = new Map(courses.map((c) => [c.id, c.title]));

  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select("teacher_id, course_id")
    .in("course_id", courseIds);

  const teacherIds = [...new Set((assignmentRows ?? []).map((r) => r.teacher_id))];
  if (teacherIds.length === 0) return [];

  const { data: teacherProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", teacherIds);

  const profileById = new Map((teacherProfiles ?? []).map((p) => [p.id, p]));

  const contacts: ChildTeacherContact[] = [];
  const seen = new Set<string>();

  for (const row of assignmentRows ?? []) {
    const key = `${row.teacher_id}:${row.course_id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const profile = profileById.get(row.teacher_id);
    if (!profile) continue;

    contacts.push({
      teacherId: profile.id,
      teacherName: profile.full_name?.trim() || "Teacher",
      teacherEmail: profile.email,
      courseTitle: courseTitleById.get(row.course_id) ?? "Course",
    });
  }

  return contacts.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle));
}
