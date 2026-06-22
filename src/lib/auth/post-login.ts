import type { SupabaseClient, User } from "@supabase/supabase-js";

import {
  getDashboardPathForRole,
  safeRedirectPath,
} from "@/lib/auth/redirects";
import { isUserRole, type UserRole } from "@/lib/auth/roles";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const MISSING_ROLE_ERROR =
  "Your account is not fully set up yet. Please contact support or try signing up again.";

export function missingRoleLoginUrl(): string {
  return `/login?error=${encodeURIComponent(MISSING_ROLE_ERROR)}`;
}

function roleFromUserMetadata(user: User): UserRole | null {
  const metaRole = user.user_metadata?.role;
  if (typeof metaRole === "string" && isUserRole(metaRole)) {
    return metaRole;
  }
  return null;
}

/**
 * Reads profile role, backfilling a missing row from auth metadata when possible.
 */
export async function getUserRole(
  supabase: SupabaseClient,
  user: User,
): Promise<UserRole | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role && isUserRole(profile.role)) {
    return profile.role;
  }

  const metadataRole = roleFromUserMetadata(user) ?? "student";

  try {
    const admin = createServiceRoleClient();
    const { data: inserted, error } = await admin
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email ?? "",
          full_name:
            typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : null,
          role: metadataRole,
        },
        { onConflict: "id" },
      )
      .select("role")
      .single();

    if (!error && inserted?.role && isUserRole(inserted.role)) {
      return inserted.role;
    }
  } catch {
    // Service role key may be unset in some local setups.
  }

  return null;
}

/**
 * Resolves where to send the user after a successful sign-in.
 * Prefers a validated `next` param, then role-based dashboard, then an error on /login.
 */
export async function resolvePostLoginDestination(
  supabase: SupabaseClient,
  next: string | null | undefined,
): Promise<string> {
  const safeNext = safeRedirectPath(next ?? null);
  if (safeNext) {
    return safeNext;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "/login";
  }

  const role = await getUserRole(supabase, user);
  if (role) {
    return getDashboardPathForRole(role);
  }

  return missingRoleLoginUrl();
}
