import { redirect } from "next/navigation";

import { buildLmsAiSessionContext } from "@/lib/ai/lms-context";
import type { LmsAiSessionContext } from "@/lib/ai/lms-context";
import { getUserRole } from "@/lib/auth/post-login";
import { getDashboardPathForRole } from "@/lib/auth/redirects";
import { isUserRole, type UserRole } from "@/lib/auth/roles";
import type { AalgoAudience } from "@/components/aalgo-ai/aalgo-ai-workspace";
import { createClient } from "@/lib/supabase/server";

const AUDIENCE_ROLES: Record<AalgoAudience, UserRole[]> = {
  student: ["student"],
  parent: ["parent"],
  teacher: ["teacher", "admin"],
};

export async function loadTutorPageSession(
  audience: AalgoAudience,
  nextPath: string,
): Promise<LmsAiSessionContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const role = await getUserRole(supabase, user);
  const allowed = AUDIENCE_ROLES[audience];

  if (!role || !allowed.includes(role)) {
    const destination =
      role && isUserRole(role) ? getDashboardPathForRole(role) : "/login";
    redirect(destination);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return buildLmsAiSessionContext({
    userId: user.id,
    role,
    displayName: profile?.full_name?.trim() || role,
  });
}
