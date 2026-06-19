"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";

export type SettingsActionResult =
  | { success: true }
  | { success: false; error: string };

export type PlatformSettings = {
  allow_registration: boolean;
  maintenance_mode: boolean;
  public_course_catalog: boolean;
  admin_notification_prefs: {
    new_user_registration: boolean;
    enrollment_created: boolean;
    pending_submissions: boolean;
    system_alerts: boolean;
  };
};

const SETTINGS_PATH = "/admin/settings";

function revalidateSettings() {
  revalidatePath(SETTINGS_PATH);
  revalidatePath("/admin");
}

export async function updatePlatformSettingsAction(
  settings: PlatformSettings,
): Promise<SettingsActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { supabase, userId } = guard.ctx;

  const { error } = await supabase
    .from("platform_settings")
    .upsert({
      id: 1,
      allow_registration: settings.allow_registration,
      maintenance_mode: settings.maintenance_mode,
      public_course_catalog: settings.public_course_catalog,
      admin_notification_prefs: settings.admin_notification_prefs,
      updated_by: userId,
    });

  if (error) return { success: false, error: error.message };

  revalidateSettings();
  return { success: true };
}

export async function updateAdminThemeAction(
  theme: "light" | "dark",
): Promise<SettingsActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { supabase, userId } = guard.ctx;

  const { data: profile } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", userId)
    .single();

  const metadata = (profile?.metadata ?? {}) as Record<string, unknown>;

  const { error } = await supabase
    .from("profiles")
    .update({
      metadata: { ...metadata, admin_theme: theme },
    })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidateSettings();
  return { success: true };
}
