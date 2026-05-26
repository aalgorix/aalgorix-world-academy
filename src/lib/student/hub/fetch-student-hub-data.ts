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
import { parseStudentMetadata } from "@/lib/student/metadata";
import {
  CURATED_NEWS_CARDS,
  DEFAULT_COHORT_MESSAGES,
  EXPECTED_LECTURES_PER_TERM,
  PLATFORM_ANNOUNCEMENTS,
  buildDefaultLiveSession,
} from "@/lib/student/hub/fixtures";
import { formatHubTodayDate, initialsFromName } from "@/lib/student/hub/format";
import {
  hubSubmissionStatusLabel,
  inferAssignmentKind,
} from "@/lib/student/hub/submission-labels";
import type {
  HubAiContext,
  HubAssignmentRow,
  HubEnrolledCourse,
  HubTeacherContact,
  HubVaultItem,
  StudentHubPayload,
} from "@/lib/student/hub/types";
import { fetchFirstLessonIdForCourse } from "@/lib/student/workspace";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
};

type ModuleRow = {
  id: string;
  title: string;
  sort_order: number;
  lessons: { id: string; title: string; sort_order: number; video_storage_path: string | null; resource_paths: string[] | null }[] | null;
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

function averageRounded(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function fileNameFromPath(path: string): string {
  const segments = path.split("/");
  return segments[segments.length - 1] ?? path;
}

async function buildCurriculumCourses(
  supabase: SupabaseClient,
  enrollments: { enrollmentId: string; course: CourseRow }[],
  completedByEnrollment: Map<string, number>,
  lessonTotals: Map<string, number>,
): Promise<HubEnrolledCourse[]> {
  const completedLessonIdsByEnrollment = new Map<string, Set<string>>();

  if (enrollments.length > 0) {
    const enrollmentIds = enrollments.map((e) => e.enrollmentId);
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

  return Promise.all(
    enrollments.map(async ({ enrollmentId, course }) => {
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
          title: module.title,
          lessons: [...(module.lessons ?? [])]
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              completed: completedIds.has(lesson.id),
              href: `/student/courses/${course.id}/lessons/${lesson.id}`,
              resourcePaths: lesson.resource_paths ?? [],
              hasVideo: Boolean(lesson.video_storage_path),
            })),
        }));

      return {
        enrollmentId,
        courseId: course.id,
        courseTitle: course.title,
        progressPercent,
        modules,
      };
    }),
  );
}

function resolveActiveIncompleteContext(
  courses: HubEnrolledCourse[],
): HubAiContext {
  for (const course of courses) {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed) {
          return {
            courseId: course.courseId,
            courseTitle: course.courseTitle ?? "",
            moduleTitle: module.title ?? "",
            lessonId: lesson.id,
            lessonTitle: lesson.title ?? "",
          };
        }
      }
    }
  }

  const primary = courses[0];
  const firstModule = primary?.modules[0];
  const firstLesson = firstModule?.lessons[0];

  return {
    courseId: primary?.courseId ?? null,
    courseTitle: primary?.courseTitle ?? "Your enrolled courses",
    moduleTitle: firstModule?.title ?? null,
    lessonId: firstLesson?.id ?? null,
    lessonTitle: firstLesson?.title ?? null,
  };
}

function buildVaultItems(courses: HubEnrolledCourse[]): HubVaultItem[] {
  const items: HubVaultItem[] = [];

  for (const course of courses) {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.hasVideo) {
          items.push({
            id: `video-${lesson.id}`,
            title: `${lesson.title} — Recording`,
            courseTitle: course.courseTitle,
            kind: "video",
            href: lesson.href,
            fileName: null,
          });
        }
        for (const path of lesson.resourcePaths) {
          items.push({
            id: `material-${lesson.id}-${path}`,
            title: lesson.title,
            courseTitle: course.courseTitle,
            kind: "material",
            href: lesson.href,
            fileName: fileNameFromPath(path),
          });
        }
      }
    }
  }

  return items;
}

function normalizeSubmissionRow(row: RawSubmissionRow): HubAssignmentRow | null {
  if (!isSubmissionStatus(row.status)) return null;
  const assignment = unwrapOne(row.assignments);
  if (!assignment) return null;

  const course = unwrapOne(assignment.courses);
  const lesson = unwrapOne(assignment.lessons);
  const courseId = course?.id ?? assignment.course_id;
  const lessonId = lesson?.id ?? assignment.lesson_id;
  const status = row.status as SubmissionStatus;

  return {
    id: row.id,
    title: assignment.title,
    courseTitle: course?.title ?? "Course",
    kind: inferAssignmentKind(assignment.title),
    status,
    statusLabel: hubSubmissionStatusLabel(status),
    grade: row.grade,
    dueAtIso: assignment.due_at,
    submittedAtIso: row.submitted_at,
    workspaceHref: lessonId
      ? `/student/courses/${courseId}/lessons/${lessonId}`
      : null,
  };
}

export type FetchStudentHubResult =
  | { ok: true; data: StudentHubPayload }
  | { ok: false; redirectTo: string };

export async function fetchStudentHubData(
  supabase: SupabaseClient,
  userId: string,
): Promise<FetchStudentHubResult> {
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role, full_name, metadata")
    .eq("id", userId)
    .single();

  if (profileRow?.role !== "student") {
    const destination =
      profileRow?.role && isUserRole(profileRow.role)
        ? getDashboardPathForRole(profileRow.role)
        : "/login?next=/student";
    return { ok: false, redirectTo: destination };
  }

  const metadata = parseStudentMetadata(profileRow.metadata);
  const batchCode = metadata.batch_enrolled ?? "";
  const displayName = profileRow.full_name?.trim() ?? "";

  const [
    { data: enrollmentRows },
    { data: submissionRows },
    { count: returnedRevisionCount },
    { count: attendedLectureCount },
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        `
        id,
        courses (
          id,
          title,
          slug
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
      .limit(40),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("student_id", userId)
      .eq("status", "returned"),
    supabase
      .from("lecture_attendance")
      .select("*", { count: "exact", head: true })
      .eq("student_id", userId),
  ]);

  const enrollments =
    enrollmentRows?.flatMap((row) => {
      const course = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
      if (!course) return [];
      return [{ enrollmentId: row.id, course }];
    }) ?? [];

  const enrollmentIds = enrollments.map((row) => row.enrollmentId);
  const courseIds = enrollments.map((row) => row.course.id);

  const { data: teacherAssignmentRows } =
    courseIds.length > 0
      ? await supabase
          .from("teacher_course_assignments")
          .select(
            `
            teacher_id,
            course_id,
            courses ( id, title )
          `,
          )
          .in("course_id", courseIds)
      : { data: [] as { teacher_id: string; course_id: string; courses: unknown }[] };

  const teacherIds = [
    ...new Set((teacherAssignmentRows ?? []).map((row) => row.teacher_id)),
  ];

  const { data: teacherProfiles } =
    teacherIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", teacherIds)
      : { data: [] as { id: string; full_name: string | null }[] };

  const teacherNameById = new Map(
    (teacherProfiles ?? []).map((p) => [p.id, p.full_name?.trim() || "Instructor"]),
  );

  const [lessonTotals, completedByEnrollment] = await Promise.all([
    fetchLessonTotalsByCourse(supabase, courseIds),
    fetchCompletedLessonsByEnrollment(supabase, enrollmentIds),
  ]);

  const courses = await buildCurriculumCourses(
    supabase,
    enrollments,
    completedByEnrollment,
    lessonTotals,
  );

  const progressValues = courses.map((c) => c.progressPercent);
  const courseCompletionPercent =
    progressValues.length > 0 ? averageRounded(progressValues) ?? 0 : 0;

  const totalLessons = [...lessonTotals.values()].reduce((sum, n) => sum + n, 0);
  const completedLessonsTotal = [...completedByEnrollment.values()].reduce(
    (sum, count) => sum + count,
    0,
  );
  const globalCompletion =
    totalLessons > 0
      ? computeProgressPercent(completedLessonsTotal, totalLessons)
      : courseCompletionPercent;

  const gradedScores = ((submissionRows ?? []) as RawSubmissionRow[])
    .filter((row) => row.status === "graded")
    .map((row) => row.grade)
    .filter((grade): grade is number => grade != null);

  const gpaAverage = averageRounded(gradedScores);

  const attended = attendedLectureCount ?? 0;
  const expected = EXPECTED_LECTURES_PER_TERM;
  const attendancePercent =
    expected > 0 ? Math.min(100, Math.round((attended / expected) * 100)) : 0;

  const primaryCourse = courses[0] ?? null;
  const liveSession = buildDefaultLiveSession(
    primaryCourse?.courseTitle ?? "Academic Cohort",
    primaryCourse?.courseId ?? null,
  );

  const assignments = ((submissionRows ?? []) as RawSubmissionRow[])
    .map(normalizeSubmissionRow)
    .filter((row): row is HubAssignmentRow => row !== null);

  const assignmentsWithHrefs = await Promise.all(
    assignments.map(async (row) => {
      if (row.workspaceHref) return row;
      const courseId = enrollments.find((e) =>
        courses.some((c) => c.courseTitle === row.courseTitle && c.courseId === e.course.id),
      )?.course.id;
      if (!courseId) return row;
      const lessonId = await fetchFirstLessonIdForCourse(courseId);
      return {
        ...row,
        workspaceHref: lessonId
          ? `/student/courses/${courseId}/lessons/${lessonId}`
          : null,
      };
    }),
  );

  const vaultItems = buildVaultItems(courses);

  const enrolledCourseIds = new Set(courseIds);
  const teacherContacts: HubTeacherContact[] = [];
  const seenTeachers = new Set<string>();

  for (const row of teacherAssignmentRows ?? []) {
    const course = unwrapOne(
      row.courses as { id: string; title: string } | { id: string; title: string }[] | null,
    );
    if (!course || !enrolledCourseIds.has(course.id)) continue;

    const teacherId = row.teacher_id;
    if (!teacherId || seenTeachers.has(teacherId)) continue;
    seenTeachers.add(teacherId);

    const fullName = teacherNameById.get(teacherId) ?? "Instructor";
    teacherContacts.push({
      id: teacherId,
      fullName,
      courseTitle: course.title,
      initials: initialsFromName(fullName),
    });
  }

  const teacherThreads: Record<string, typeof DEFAULT_COHORT_MESSAGES> = {};
  for (const teacher of teacherContacts) {
    teacherThreads[teacher.id] = [
      {
        id: `${teacher.id}-welcome`,
        authorName: teacher.fullName,
        body: `Hi ${displayName.split(" ")[0] ?? "there"} — message me here about ${teacher.courseTitle}.`,
        sentAtIso: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        isSelf: false,
      },
    ];
  }

  const aiContext = resolveActiveIncompleteContext(courses);

  return {
    ok: true,
    data: {
      studentId: userId,
      displayName,
      batchCode,
      todayLabel: formatHubTodayDate(),
      revisionCount: returnedRevisionCount ?? 0,
      telemetry: {
        attendancePercent,
        courseCompletionPercent: globalCompletion,
        gpaAverage,
      },
      liveSession,
      expectedLectureCount: expected,
      attendedLectureCount: attended,
      courses,
      assignments: assignmentsWithHrefs,
      vaultItems,
      announcements: PLATFORM_ANNOUNCEMENTS,
      newsCards: CURATED_NEWS_CARDS,
      cohortMessages: DEFAULT_COHORT_MESSAGES,
      teacherContacts,
      teacherThreads,
      aiContext,
    },
  };
}
