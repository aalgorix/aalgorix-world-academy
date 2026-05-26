"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const STUDENT_HUB_PATH = "/student";

export type LogAttendanceState = {
  ok: boolean;
  error?: string;
  message?: string;
};

async function requireStudent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in.", supabase: null, userId: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "student") {
    return { error: "Only student accounts can log lecture attendance.", supabase: null, userId: null };
  }

  return { error: null, supabase, userId: user.id };
}

export async function logLectureAttendanceAction(input: {
  sessionTitle: string;
  courseId: string | null;
  sessionStartsAtIso: string;
}): Promise<LogAttendanceState> {
  const ctx = await requireStudent();
  if (ctx.error || !ctx.supabase || !ctx.userId) {
    return { ok: false, error: ctx.error ?? "Unauthorized." };
  }

  const title = input.sessionTitle?.trim();
  if (!title) {
    return { ok: false, error: "Session title is required." };
  }

  const { error } = await ctx.supabase.from("lecture_attendance").insert({
    student_id: ctx.userId,
    course_id: input.courseId,
    session_title: title,
    session_starts_at: input.sessionStartsAtIso,
    metadata: { source: "student_hub_live_countdown" },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(STUDENT_HUB_PATH);
  return {
    ok: true,
    message: "Attendance logged. See you in class!",
  };
}
