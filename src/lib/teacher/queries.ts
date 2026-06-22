import { redirect } from "next/navigation";

import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

export type TeacherScheduleEvent = {
  id: string;
  title: string;
  course: string;
  type: "live-class" | "deadline" | "meeting" | "review";
  date: string;
  time: string;
  duration?: string;
  students?: number;
  color: string;
};

function formatScheduleTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export async function requireTeacherId(nextPath: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user.id;
}

export async function fetchTeacherCourseIds(teacherId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("teacher_course_assignments")
    .select("course_id")
    .eq("teacher_id", teacherId);

  return [...new Set((rows ?? []).map((r) => r.course_id as string))];
}

export async function fetchTeacherScheduleEvents(
  teacherId: string,
): Promise<TeacherScheduleEvent[]> {
  const supabase = await createClient();
  const courseIds = await fetchTeacherCourseIds(teacherId);
  if (courseIds.length === 0) return [];

  const [{ data: assignmentRows }, { data: liveRows }, { data: enrollmentRows }] =
    await Promise.all([
      supabase
        .from("assignments")
        .select(
          `id, title, due_at,
           courses ( title )`,
        )
        .in("course_id", courseIds)
        .eq("is_published", true)
        .not("due_at", "is", null)
        .order("due_at", { ascending: true }),
      supabase
        .from("live_class_sessions")
        .select(
          `id, title, starts_at, duration_minutes, course_id,
           courses ( title )`,
        )
        .in("course_id", courseIds)
        .eq("is_published", true)
        .order("starts_at", { ascending: true }),
      supabase
        .from("enrollments")
        .select("course_id")
        .in("course_id", courseIds)
        .eq("status", "active"),
    ]);

  const studentsByCourse = new Map<string, number>();
  for (const row of enrollmentRows ?? []) {
    const cid = row.course_id as string;
    studentsByCourse.set(cid, (studentsByCourse.get(cid) ?? 0) + 1);
  }

  const deadlineEvents: TeacherScheduleEvent[] = (assignmentRows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as { title: string } | { title: string }[] | null,
    );
    const dueAt = row.due_at as string;
    return {
      id: `deadline-${row.id}`,
      title: `Deadline: ${row.title}`,
      course: course?.title ?? "Course",
      type: "deadline",
      date: dueAt.slice(0, 10),
      time: formatScheduleTime(dueAt),
      color: "#EF4444",
    };
  });

  const liveEvents: TeacherScheduleEvent[] = (liveRows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as { title: string } | { title: string }[] | null,
    );
    const startsAt = row.starts_at as string;
    const duration = row.duration_minutes as number;
    return {
      id: `live-${row.id}`,
      title: row.title as string,
      course: course?.title ?? "Course",
      type: "live-class",
      date: startsAt.slice(0, 10),
      time: formatScheduleTime(startsAt),
      duration: `${duration} min`,
      students: studentsByCourse.get(row.course_id as string) ?? 0,
      color: "#0D9488",
    };
  });

  return [...deadlineEvents, ...liveEvents].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return a.time.localeCompare(b.time);
  });
}
