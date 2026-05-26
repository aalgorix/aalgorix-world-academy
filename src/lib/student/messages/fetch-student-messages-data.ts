import type { SupabaseClient } from "@supabase/supabase-js";

import { unwrapOne } from "@/lib/dashboard/relations";
import { getDashboardPathForRole } from "@/lib/auth/redirects";
import { isUserRole } from "@/lib/auth/roles";
import { initialsFromName } from "@/lib/student/hub/format";
import { parseStudentMetadata } from "@/lib/student/metadata";

import {
  buildBatchThreadMessages,
  buildTeacherThreadMessages,
} from "./fixtures";
import type {
  LoungeChatMessage,
  MessageChannel,
  StudentMessagesPayload,
} from "./types";

type CourseRow = {
  id: string;
  title: string;
};

export type FetchStudentMessagesResult =
  | { ok: true; data: StudentMessagesPayload }
  | { ok: false; redirectTo: string };

export async function fetchStudentMessagesData(
  supabase: SupabaseClient,
  userId: string,
): Promise<FetchStudentMessagesResult> {
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("role, full_name, metadata")
    .eq("id", userId)
    .single();

  if (profileRow?.role !== "student") {
    const destination =
      profileRow?.role && isUserRole(profileRow.role)
        ? getDashboardPathForRole(profileRow.role)
        : "/login?next=/student/messages";
    return { ok: false, redirectTo: destination };
  }

  const metadata = parseStudentMetadata(profileRow.metadata);
  const displayName = profileRow.full_name?.trim() ?? "";
  const batchCode = metadata.batch_enrolled ?? "";
  const batchLabel = batchCode.trim() || "Academy-wide intake cohort";

  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      courses ( id, title )
    `,
    )
    .eq("student_id", userId)
    .eq("status", "active");

  const enrollments =
    enrollmentRows?.flatMap((row) => {
      const course = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
      if (!course) return [];
      return [{ course }];
    }) ?? [];

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
    (teacherProfiles ?? []).map((profile) => [
      profile.id,
      profile.full_name?.trim() || "Instructor",
    ]),
  );

  const channels: MessageChannel[] = [
    {
      id: `batch-${batchLabel.replace(/\s+/g, "-").toLowerCase() || "cohort"}`,
      kind: "batch",
      label: batchLabel,
      subtitle: "Batch enrolled channel",
      initials: batchLabel.slice(0, 2).toUpperCase() || "BC",
      teacherId: null,
    },
  ];

  const threads: Record<string, LoungeChatMessage[]> = {
    [channels[0]!.id]: buildBatchThreadMessages(batchLabel, displayName || "Student"),
  };

  const seenTeachers = new Set<string>();
  const enrolledCourseIds = new Set(courseIds);

  for (const row of teacherAssignmentRows ?? []) {
    const course = unwrapOne(
      row.courses as { id: string; title: string } | { id: string; title: string }[] | null,
    );
    if (!course || !enrolledCourseIds.has(course.id)) continue;

    const teacherId = row.teacher_id;
    if (!teacherId || seenTeachers.has(teacherId)) continue;
    seenTeachers.add(teacherId);

    const fullName = teacherNameById.get(teacherId) ?? "Instructor";
    const channelId = `teacher-${teacherId}`;

    channels.push({
      id: channelId,
      kind: "teacher",
      label: fullName,
      subtitle: course.title ?? "",
      initials: initialsFromName(fullName),
      teacherId,
    });

    threads[channelId] = buildTeacherThreadMessages(
      fullName,
      course.title ?? "",
      displayName || "Student",
    );
  }

  return {
    ok: true,
    data: {
      displayName,
      batchCode,
      channels,
      threads,
    },
  };
}
