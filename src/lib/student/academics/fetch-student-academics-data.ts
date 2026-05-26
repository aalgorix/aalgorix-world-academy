import type { SupabaseClient } from "@supabase/supabase-js";

import {
  computeProgressPercent,
  fetchCompletedLessonsByEnrollment,
  fetchLessonTotalsByCourse,
} from "@/lib/dashboard/course-progress";
import { unwrapOne } from "@/lib/dashboard/relations";
import {
  isSubmissionStatus,
  type SubmissionStatus,
} from "@/lib/dashboard/submission-status";
import { getDashboardPathForRole } from "@/lib/auth/redirects";
import { isUserRole } from "@/lib/auth/roles";
import {
  hubSubmissionStatusLabel,
} from "@/lib/student/hub/submission-labels";
import { fetchFirstLessonIdForCourse } from "@/lib/student/workspace";

import {
  formatTurnInLabel,
  formatVideoDuration,
  lessonMilestoneLabel,
} from "./format";
import type {
  AcademicsClassVideo,
  AcademicsCourseTrack,
  AcademicsStudyMaterial,
  AcademicsSubmissionRecord,
  AcademicsSummaryMetrics,
  StudentAcademicsPayload,
} from "./types";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  grade_level: string | null;
  curriculum_tag: string | null;
};

type LessonRow = {
  id: string;
  title: string;
  sort_order: number;
  video_storage_path: string | null;
  video_duration_seconds: number | null;
  resource_paths: string[] | null;
};

type ModuleRow = {
  id: string;
  title: string;
  sort_order: number;
  lessons: LessonRow[] | null;
};

type RawSubmissionRow = {
  id: string;
  status: string;
  grade: number | null;
  submitted_at: string | null;
  assignments: {
    title: string;
    due_at: string | null;
    course_id: string;
    lesson_id: string | null;
    courses: { id: string; title: string } | { id: string; title: string }[] | null;
    lessons: { id: string; title: string } | { id: string; title: string }[] | null;
  } | {
    title: string;
    due_at: string | null;
    course_id: string;
    lesson_id: string | null;
    courses: { id: string; title: string } | { id: string; title: string }[] | null;
    lessons: { id: string; title: string } | { id: string; title: string }[] | null;
  }[] | null;
};

function fileNameFromPath(path: string): string {
  const segments = path.split("/");
  return segments[segments.length - 1] ?? path;
}

async function resolveSignedUrl(
  supabase: SupabaseClient,
  bucket: string,
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export type FetchStudentAcademicsResult =
  | { ok: true; data: StudentAcademicsPayload }
  | { ok: false; redirectTo: string };

export async function fetchStudentAcademicsData(
  supabase: SupabaseClient,
  userId: string,
): Promise<FetchStudentAcademicsResult> {
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single();

  if (profileRow?.role !== "student") {
    const destination =
      profileRow?.role && isUserRole(profileRow.role)
        ? getDashboardPathForRole(profileRow.role)
        : "/login?next=/student/academics";
    return { ok: false, redirectTo: destination };
  }

  const displayName = profileRow.full_name?.trim() ?? "";

  const [{ data: enrollmentRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        `
        id,
        courses (
          id,
          title,
          slug,
          grade_level,
          curriculum_tag
        )
      `,
      )
      .eq("student_id", userId)
      .eq("status", "active"),
    supabase
      .from("submissions")
      .select(
        `
        id,
        status,
        grade,
        submitted_at,
        assignments (
          title,
          due_at,
          course_id,
          lesson_id,
          courses ( id, title ),
          lessons ( id, title )
        )
      `,
      )
      .eq("student_id", userId)
      .order("updated_at", { ascending: false })
      .limit(60),
  ]);

  const enrollments =
    enrollmentRows?.flatMap((row) => {
      const course = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
      if (!course) return [];
      return [{ enrollmentId: row.id, course }];
    }) ?? [];

  const enrollmentIds = enrollments.map((row) => row.enrollmentId);
  const courseIds = enrollments.map((row) => row.course.id);

  const [lessonTotals, completedByEnrollment] = await Promise.all([
    fetchLessonTotalsByCourse(supabase, courseIds),
    fetchCompletedLessonsByEnrollment(supabase, enrollmentIds),
  ]);

  const completedLessonIdsByEnrollment = new Map<string, Set<string>>();
  if (enrollmentIds.length > 0) {
    const { data: progressRows } = await supabase
      .from("lesson_progress")
      .select("enrollment_id, lesson_id")
      .in("enrollment_id", enrollmentIds)
      .eq("completed", true);

    for (const row of progressRows ?? []) {
      const set =
        completedLessonIdsByEnrollment.get(row.enrollment_id) ?? new Set<string>();
      set.add(row.lesson_id);
      completedLessonIdsByEnrollment.set(row.enrollment_id, set);
    }
  }

  const courses: AcademicsCourseTrack[] = [];
  const materials: AcademicsStudyMaterial[] = [];
  const videos: AcademicsClassVideo[] = [];

  for (const { enrollmentId, course } of enrollments) {
    const totalLessons = lessonTotals.get(course.id) ?? 0;
    const completedLessons = completedByEnrollment.get(enrollmentId) ?? 0;
    const progressPercent = computeProgressPercent(completedLessons, totalLessons);
    const completedIds =
      completedLessonIdsByEnrollment.get(enrollmentId) ?? new Set<string>();

    const { data: moduleRows } = await supabase
      .from("course_modules")
      .select(
        `
        id,
        title,
        sort_order,
        lessons (
          id,
          title,
          sort_order,
          video_storage_path,
          video_duration_seconds,
          resource_paths
        )
      `,
      )
      .eq("course_id", course.id)
      .order("sort_order", { ascending: true });

    const modules = [...(moduleRows ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((module: ModuleRow) => ({
        id: module.id,
        title: module.title ?? "",
        lessons: [...(module.lessons ?? [])]
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((lesson) => {
            const completed = completedIds.has(lesson.id);
            const lessonHref = `/student/courses/${course.id}/lessons/${lesson.id}`;
            const resourcePaths = Array.isArray(lesson.resource_paths)
              ? lesson.resource_paths.filter((p): p is string => typeof p === "string")
              : [];

            return {
              lesson,
              completed,
              lessonHref,
              resourcePaths,
            };
          }),
      }));

    courses.push({
      enrollmentId,
      courseId: course.id,
      courseTitle: course.title ?? "",
      courseSlug: course.slug ?? "",
      gradeLevel: course.grade_level ?? "",
      curriculumTag: course.curriculum_tag ?? "",
      progressPercent,
      modules: modules.map((module) => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons.map(({ lesson, completed, lessonHref }) => ({
          id: lesson.id,
          title: lesson.title ?? "",
          completed,
          workspaceHref: lessonHref,
          milestoneLabel: lessonMilestoneLabel(completed),
        })),
      })),
    });

    for (const module of modules) {
      for (const { lesson, lessonHref, resourcePaths } of module.lessons) {
        const durationSeconds = lesson.video_duration_seconds ?? 0;

        if (lesson.video_storage_path) {
          videos.push({
            id: `video-${lesson.id}`,
            title: lesson.title ?? "",
            courseTitle: course.title ?? "",
            moduleTitle: module.title,
            durationLabel: formatVideoDuration(lesson.video_duration_seconds),
            durationSeconds,
            lessonHref,
          });
        }

        for (const path of resourcePaths) {
          const downloadUrl = await resolveSignedUrl(
            supabase,
            "assignment-files",
            path,
          );
          materials.push({
            id: `material-${lesson.id}-${path}`,
            title: lesson.title ?? "",
            courseTitle: course.title ?? "",
            moduleTitle: module.title,
            fileName: fileNameFromPath(path),
            storagePath: path,
            downloadUrl,
            lessonHref,
          });
        }
      }
    }
  }

  const progressValues = courses.map((course) => course.progressPercent);
  const meanProgressPercent =
    progressValues.length > 0
      ? Math.round(
          progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length,
        )
      : 0;

  let awaitingReviewCount = 0;
  let revisionRequestedCount = 0;

  const submissions: AcademicsSubmissionRecord[] = [];

  for (const row of (submissionRows ?? []) as RawSubmissionRow[]) {
    if (!isSubmissionStatus(row.status)) continue;
    const status = row.status as SubmissionStatus;
    if (status === "submitted") awaitingReviewCount += 1;
    if (status === "returned") revisionRequestedCount += 1;

    const assignment = unwrapOne(row.assignments);
    if (!assignment) continue;

    const course = unwrapOne(assignment.courses);
    const lesson = unwrapOne(assignment.lessons);
    const courseId = course?.id ?? assignment.course_id;
    const lessonId = lesson?.id ?? assignment.lesson_id;

    submissions.push({
      id: row.id,
      assessmentName: assignment.title ?? "",
      trackTitle: course?.title ?? "",
      turnedInLabel: formatTurnInLabel(row.submitted_at, assignment.due_at),
      status,
      statusLabel: hubSubmissionStatusLabel(status),
      grade: row.grade,
      workspaceHref: lessonId
        ? `/student/courses/${courseId}/lessons/${lessonId}`
        : null,
      notificationsHref: "/student/notifications",
    });
  }

  const submissionsWithHrefs = await Promise.all(
    submissions.map(async (record) => {
      if (record.workspaceHref) return record;
      const course = enrollments.find((e) => e.course.title === record.trackTitle);
      if (!course) return record;
      const lessonId = await fetchFirstLessonIdForCourse(course.course.id);
      return {
        ...record,
        workspaceHref: lessonId
          ? `/student/courses/${course.course.id}/lessons/${lessonId}`
          : null,
      };
    }),
  );

  const metrics: AcademicsSummaryMetrics = {
    activeEnrollments: courses.length,
    meanProgressPercent,
    awaitingReviewCount,
    revisionRequestedCount,
  };

  return {
    ok: true,
    data: {
      displayName,
      metrics,
      courses,
      materials,
      videos,
      submissions: submissionsWithHrefs,
    },
  };
}
