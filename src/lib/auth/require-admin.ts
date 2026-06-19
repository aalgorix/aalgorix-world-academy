import { createClient } from "@/lib/supabase/server";

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
};

export type AdminGuardResult =
  | { ok: true; ctx: AdminContext }
  | { ok: false; error: string };

/** Returns an authenticated Supabase client only when the caller is an admin. */
export async function requireAdmin(): Promise<AdminGuardResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { ok: false, error: "Only administrators can perform this action." };
  }

  return { ok: true, ctx: { supabase, userId: user.id } };
}
