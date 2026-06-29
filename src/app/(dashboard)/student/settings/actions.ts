"use server";

import { revalidatePath } from "next/cache";

import {
  mergeStudentSettingsIntoMetadata,
  type StudentSettingsPrefs,
} from "@/lib/student/settings";
import { createClient } from "@/lib/supabase/server";

export type SaveStudentSettingsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function saveStudentSettings(
  settings: StudentSettingsPrefs,
): Promise<SaveStudentSettingsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in to save settings." };
  }

  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", user.id)
    .single();

  if (readError) {
    return { ok: false, error: readError.message };
  }

  const metadata = mergeStudentSettingsIntoMetadata(profile?.metadata, settings);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ metadata })
    .eq("id", user.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  revalidatePath("/student/settings");
  return { ok: true };
}
