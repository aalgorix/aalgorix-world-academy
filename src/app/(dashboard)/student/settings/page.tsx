import { redirect } from "next/navigation";

import { SettingsForm } from "@/components/student/settings-form";
import { extractStudentSettingsFromMetadata } from "@/lib/student/settings";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/student/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", user.id)
    .single();

  const initialSettings = extractStudentSettingsFromMetadata(profile?.metadata);

  return <SettingsForm initialSettings={initialSettings} />;
}
