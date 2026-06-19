"use server";

import { revalidatePath } from "next/cache";

import {
  hashCodeDigest,
  isValidParentLinkCodeFormat,
  normalizeParentLinkCode,
  verifyCodeBinding,
} from "@/lib/parent-link/codes";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PARENT_SETTINGS_PATH = "/parent/settings";
const PARENT_HOME_PATH = "/parent";

export type ConnectChildActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  studentName?: string;
};

export type UnlinkStudentResult = {
  ok: boolean;
  error?: string;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

async function requireParent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in.", supabase: null, userId: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "parent") {
    return { error: "Only parent accounts can link students.", supabase: null, userId: null };
  }

  return { error: null, supabase, userId: user.id };
}

export async function connectChildWithLinkCode(
  _prev: ConnectChildActionState | null,
  formData: FormData,
): Promise<ConnectChildActionState> {
  const ctx = await requireParent();
  if (ctx.error || !ctx.supabase || !ctx.userId) {
    return { ok: false, error: ctx.error ?? "Unauthorized." };
  }

  const rawCode = formData.get("link_code");
  const normalized = normalizeParentLinkCode(
    typeof rawCode === "string" ? rawCode : "",
  );

  if (!isValidParentLinkCodeFormat(normalized)) {
    return { ok: false, error: "Enter a valid 6-character link code." };
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Server configuration prevents link code verification.",
    };
  }

  const digest = hashCodeDigest(normalized);
  const now = new Date().toISOString();

  const { data: linkRow, error: lookupError } = await admin
    .from("parent_link_codes")
    .select("id, student_id, code_hash, expires_at, used_at")
    .eq("code_digest", digest)
    .maybeSingle();

  if (lookupError) {
    return { ok: false, error: lookupError.message };
  }

  if (!linkRow || linkRow.used_at) {
    return { ok: false, error: "Invalid or already used link code." };
  }

  if (linkRow.expires_at <= now) {
    return { ok: false, error: "This link code has expired. Ask your student for a new one." };
  }

  if (!verifyCodeBinding(linkRow.student_id, normalized, linkRow.code_hash)) {
    return { ok: false, error: "Link code verification failed." };
  }

  if (linkRow.student_id === ctx.userId) {
    return { ok: false, error: "You cannot link your own account as a child." };
  }

  const { data: existing } = await ctx.supabase
    .from("student_parent_relations")
    .select("id")
    .eq("parent_id", ctx.userId)
    .eq("student_id", linkRow.student_id)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "This student is already linked to your account." };
  }

  const { error: relationError } = await ctx.supabase
    .from("student_parent_relations")
    .insert({
      parent_id: ctx.userId,
      student_id: linkRow.student_id,
      relationship_label: "parent",
      is_primary_contact: false,
    });

  if (relationError) {
    return { ok: false, error: relationError.message };
  }

  const { error: markUsedError } = await admin
    .from("parent_link_codes")
    .update({
      used_at: now,
      used_by_parent_id: ctx.userId,
    })
    .eq("id", linkRow.id);

  if (markUsedError) {
    return { ok: false, error: markUsedError.message };
  }

  const { data: studentProfile } = await ctx.supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", linkRow.student_id)
    .maybeSingle();

  revalidatePath(PARENT_SETTINGS_PATH);
  revalidatePath(PARENT_HOME_PATH);

  const studentName =
    studentProfile?.full_name?.trim() || studentProfile?.email || "your student";

  return {
    ok: true,
    message: `Successfully linked to ${studentName}.`,
    studentName,
  };
}

export async function unlinkStudent(studentId: string): Promise<UnlinkStudentResult> {
  const ctx = await requireParent();
  if (ctx.error || !ctx.supabase || !ctx.userId) {
    return { ok: false, error: ctx.error ?? "Unauthorized." };
  }

  if (!isUuid(studentId)) {
    return { ok: false, error: "Invalid student identifier." };
  }

  if (studentId === ctx.userId) {
    return { ok: false, error: "Invalid unlink target." };
  }

  const { data: relation, error: lookupError } = await ctx.supabase
    .from("student_parent_relations")
    .select("id")
    .eq("parent_id", ctx.userId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (lookupError) {
    return { ok: false, error: lookupError.message };
  }

  if (!relation) {
    return { ok: false, error: "This learner is not linked to your account." };
  }

  const { error: deleteError } = await ctx.supabase
    .from("student_parent_relations")
    .delete()
    .eq("parent_id", ctx.userId)
    .eq("student_id", studentId);

  if (deleteError) {
    return { ok: false, error: deleteError.message };
  }

  revalidatePath(PARENT_SETTINGS_PATH);
  revalidatePath(PARENT_HOME_PATH);

  return { ok: true };
}
