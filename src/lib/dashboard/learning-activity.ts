import { createClient } from "@/lib/supabase/server";

export type LearningActivityDay = {
  date: string;
  lessonsCompleted: number;
  assignmentsSubmitted: number;
};

/** Aggregates lesson completions and assignment submissions by calendar day. */
export async function fetchLearningActivity(
  studentId: string,
): Promise<LearningActivityDay[]> {
  const supabase = await createClient();

  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", studentId)
    .eq("status", "active");

  const enrollmentIds = (enrollmentRows ?? []).map((r) => r.id);
  if (enrollmentIds.length === 0) return [];

  const [{ data: progressRows }, { data: submissionRows }] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("completed_at, updated_at, completed")
      .in("enrollment_id", enrollmentIds)
      .eq("completed", true),
    supabase
      .from("submissions")
      .select("submitted_at")
      .eq("student_id", studentId)
      .not("submitted_at", "is", null),
  ]);

  const dayMap = new Map<string, LearningActivityDay>();

  function bump(dateIso: string, field: "lessonsCompleted" | "assignmentsSubmitted") {
    const date = dateIso.slice(0, 10);
    const existing = dayMap.get(date) ?? {
      date,
      lessonsCompleted: 0,
      assignmentsSubmitted: 0,
    };
    existing[field] += 1;
    dayMap.set(date, existing);
  }

  for (const row of progressRows ?? []) {
    const ts = row.completed_at ?? row.updated_at;
    if (ts) bump(ts, "lessonsCompleted");
  }

  for (const row of submissionRows ?? []) {
    if (row.submitted_at) bump(row.submitted_at, "assignmentsSubmitted");
  }

  return [...dayMap.values()].sort((a, b) => b.date.localeCompare(a.date));
}
