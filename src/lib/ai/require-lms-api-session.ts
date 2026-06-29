import { getUserRole } from "@/lib/auth/post-login";
import type { UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

const LMS_ROLES: UserRole[] = ["student", "parent", "teacher", "admin"];

export type LmsApiSession = {
  userId: string;
  role: UserRole;
  displayName: string;
};

export async function getLmsApiSession(): Promise<
  { session: LmsApiSession } | { error: string; status: number }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }

  const role = await getUserRole(supabase, user);
  if (!role || !LMS_ROLES.includes(role)) {
    return { error: "Forbidden", status: 403 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return {
    session: {
      userId: user.id,
      role,
      displayName: profile?.full_name?.trim() || role,
    },
  };
}

export function isLmsApiSession(
  value: { session: LmsApiSession } | { error: string; status: number },
): value is { session: LmsApiSession } {
  return "session" in value;
}

export function assertLmsRole(
  session: LmsApiSession,
  allowed: UserRole[],
): boolean {
  return allowed.includes(session.role) || session.role === "admin";
}
