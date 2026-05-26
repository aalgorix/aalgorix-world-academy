import type { SupabaseClient } from "@supabase/supabase-js";

import { unwrapOne } from "@/lib/dashboard/relations";
import { getDashboardPathForRole } from "@/lib/auth/redirects";
import { isUserRole } from "@/lib/auth/roles";

import type {
  AiBuddyActiveSelection,
  AiBuddyCourseNode,
  AiBuddyWorkspacePayload,
} from "./types";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
};

type LessonRow = {
  id: string;
  title: string;
  sort_order: number;
};

type ModuleRow = {
  id: string;
  title: string;
  sort_order: number;
  lessons: LessonRow[] | null;
};

function buildDefaultSelection(courses: AiBuddyCourseNode[]): AiBuddyActiveSelection | null {
  for (const course of courses) {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed) {
          return {
            level: "lesson",
            enrollmentId: course.enrollmentId,
            courseId: course.courseId,
            courseTitle: course.courseTitle,
            moduleId: module.id,
            moduleTitle: module.title,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            workspaceHref: lesson.workspaceHref,
          };
        }
      }
    }
  }

  const course = courses[0];
  const module = course?.modules[0];
  const lesson = module?.lessons[0];
  if (!course || !module || !lesson) return null;

  return {
    level: "lesson",
    enrollmentId: course.enrollmentId,
    courseId: course.courseId,
    courseTitle: course.courseTitle,
    moduleId: module.id,
    moduleTitle: module.title,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    workspaceHref: lesson.workspaceHref,
  };
}

export type FetchAiBuddyWorkspaceResult =
  | { ok: true; data: AiBuddyWorkspacePayload }
  | { ok: false; redirectTo: string };

export async function fetchAiBuddyWorkspaceData(
  supabase: SupabaseClient,
  userId: string,
): Promise<FetchAiBuddyWorkspaceResult> {
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .single();

  if (profileRow?.role !== "student") {
    const destination =
      profileRow?.role && isUserRole(profileRow.role)
        ? getDashboardPathForRole(profileRow.role)
        : "/login?next=/student/ai-buddy";
    return { ok: false, redirectTo: destination };
  }

  const displayName = profileRow.full_name?.trim() ?? "";

  const { data: enrollmentRows } = await supabase
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
    .eq("status", "active");

  const enrollments =
    enrollmentRows?.flatMap((row) => {
      const course = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
      if (!course) return [];
      return [{ enrollmentId: row.id, course }];
    }) ?? [];

  const enrollmentIds = enrollments.map((row) => row.enrollmentId);
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

  const courses: AiBuddyCourseNode[] = [];

  for (const { enrollmentId, course } of enrollments) {
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
          sort_order
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
          .map((lesson) => ({
            id: lesson.id,
            title: lesson.title ?? "",
            completed: completedIds.has(lesson.id),
            workspaceHref: `/student/courses/${course.id}/lessons/${lesson.id}`,
          })),
      }));

    courses.push({
      enrollmentId,
      courseId: course.id,
      courseTitle: course.title ?? "",
      courseSlug: course.slug ?? "",
      modules,
    });
  }

  return {
    ok: true,
    data: {
      displayName,
      courses,
      defaultSelection: buildDefaultSelection(courses),
    },
  };
}
