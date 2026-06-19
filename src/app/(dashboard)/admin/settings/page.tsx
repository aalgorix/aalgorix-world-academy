import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type { PlatformSettings } from "./actions";
import { SettingsPanel } from "./settings-panel";

const DEFAULT_SETTINGS: PlatformSettings = {
  allow_registration: true,
  maintenance_mode: false,
  public_course_catalog: true,
  admin_notification_prefs: {
    new_user_registration: true,
    enrollment_created: true,
    pending_submissions: false,
    system_alerts: true,
  },
};

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/settings");

  const [{ data: settingsRow }, { data: profile }] = await Promise.all([
    supabase.from("platform_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("profiles").select("metadata").eq("id", user.id).single(),
  ]);

  const prefs = settingsRow?.admin_notification_prefs as
    | PlatformSettings["admin_notification_prefs"]
    | undefined;

  const platform: PlatformSettings = settingsRow
    ? {
        allow_registration: settingsRow.allow_registration,
        maintenance_mode: settingsRow.maintenance_mode,
        public_course_catalog: settingsRow.public_course_catalog,
        admin_notification_prefs: prefs ?? DEFAULT_SETTINGS.admin_notification_prefs,
      }
    : DEFAULT_SETTINGS;

  const metadata = (profile?.metadata ?? {}) as Record<string, unknown>;
  const theme = metadata.admin_theme === "dark" ? "dark" : "light";

  return <SettingsPanel platform={platform} theme={theme} />;
}
