"use server";

import { revalidatePath } from "next/cache";

import { seedEnrollmentUnlocks } from "@/lib/admin/seed-enrollment-unlocks";
import { requireAdmin } from "@/lib/auth/require-admin";

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

const ENROLLMENT_STATUSES = [
  "pending",
  "active",
  "paused",
  "cancelled",
  "completed",
] as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

function isEnrollmentStatus(value: string): value is EnrollmentStatus {
  return (ENROLLMENT_STATUSES as readonly string[]).includes(value);
}

function revalidateEnrollmentPaths() {
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
  revalidatePath("/student");
  revalidatePath("/student/courses");
}

export async function enrollStudentAction(
  studentId: string,
  courseId: string,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { supabase, userId } = guard.ctx;

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id, status")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (existing?.status === "active") {
    return { success: false, error: "Student is already actively enrolled in this course." };
  }

  let enrollmentId: string;

  if (existing) {
    const { data: updated, error } = await supabase
      .from("enrollments")
      .update({
        status: "active",
        enrolled_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    enrollmentId = updated.id;
  } else {
    const { data: created, error } = await supabase
      .from("enrollments")
      .insert({
        student_id: studentId,
        course_id: courseId,
        status: "active",
        enrolled_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };
    enrollmentId = created.id;
  }

  await seedEnrollmentUnlocks(supabase, enrollmentId, courseId, userId);

  revalidateEnrollmentPaths();
  return { success: true };
}

export async function updateEnrollmentStatusAction(
  enrollmentId: string,
  status: string,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  if (!isEnrollmentStatus(status)) {
    return { success: false, error: "Invalid enrollment status." };
  }

  const { supabase } = guard.ctx;

  const { error } = await supabase
    .from("enrollments")
    .update({ status })
    .eq("id", enrollmentId);

  if (error) return { success: false, error: error.message };

  revalidateEnrollmentPaths();
  return { success: true };
}

export async function removeEnrollmentAction(
  enrollmentId: string,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { supabase } = guard.ctx;

  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("id", enrollmentId);

  if (error) return { success: false, error: error.message };

  revalidateEnrollmentPaths();
  return { success: true };
}
