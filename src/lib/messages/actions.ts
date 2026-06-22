"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type SendMessageResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string };

export async function sendMessageAction(
  conversationId: string,
  body: string,
  revalidatePaths: string[],
): Promise<SendMessageResult> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Message cannot be empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not signed in." };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: trimmed,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Failed to send message." };
  }

  for (const path of revalidatePaths) {
    revalidatePath(path);
  }

  return { ok: true, messageId: data.id };
}

export async function ensureConversationAction(input: {
  courseId: string;
  studentId: string;
  teacherId: string;
}): Promise<{ ok: true; conversationId: string } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Not signed in." };
  }

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("course_id", input.courseId)
    .eq("student_id", input.studentId)
    .eq("teacher_id", input.teacherId)
    .maybeSingle();

  if (existing) {
    return { ok: true, conversationId: existing.id };
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      course_id: input.courseId,
      student_id: input.studentId,
      teacher_id: input.teacherId,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { ok: false, error: error?.message ?? "Could not start conversation." };
  }

  return { ok: true, conversationId: created.id };
}
