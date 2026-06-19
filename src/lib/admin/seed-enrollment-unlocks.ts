import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Seeds content_unlocks for drip / all_at_once strategies.
 * Sequential unlocks are computed in the student workspace without DB rows.
 */
export async function seedEnrollmentUnlocks(
  supabase: Supabase,
  enrollmentId: string,
  courseId: string,
  unlockedBy: string | null,
): Promise<void> {
  const { data: course } = await supabase
    .from("courses")
    .select("unlock_strategy, drip_interval_days")
    .eq("id", courseId)
    .single();

  if (!course) return;

  const strategy = course.unlock_strategy;
  if (strategy !== "drip" && strategy !== "all_at_once") {
    return;
  }

  const { data: modules } = await supabase
    .from("course_modules")
    .select("sort_order, lessons ( id, sort_order )")
    .eq("course_id", courseId)
    .order("sort_order");

  type RawLesson = { id: string; sort_order: number };
  type RawModule = { sort_order: number; lessons: RawLesson[] | null };

  const lessonIds = [...(modules ?? [])]
    .sort((a, b) => (a as RawModule).sort_order - (b as RawModule).sort_order)
    .flatMap((module) => {
      const m = module as RawModule;
      return [...(m.lessons ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((l) => l.id);
    });

  if (lessonIds.length === 0) return;

  const now = new Date();
  const dripDays = course.drip_interval_days ?? 7;

  const rows = lessonIds.map((lessonId, index) => {
    const availableAt = new Date(now);
    if (strategy === "drip" && index > 0) {
      availableAt.setDate(availableAt.getDate() + index * dripDays);
    }

    return {
      enrollment_id: enrollmentId,
      lesson_id: lessonId,
      available_at: availableAt.toISOString(),
      unlocked_by: unlockedBy,
      unlock_reason: strategy === "drip" ? "enrollment_drip" : "enrollment_all_at_once",
    };
  });

  await supabase.from("content_unlocks").delete().eq("enrollment_id", enrollmentId);

  const { error } = await supabase.from("content_unlocks").insert(rows);
  if (error) {
    console.error("[seedEnrollmentUnlocks]", error.message);
  }
}
