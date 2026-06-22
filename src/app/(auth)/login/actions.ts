"use server";

import { redirect } from "next/navigation";

import { resolvePostLoginDestination } from "@/lib/auth/post-login";
import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error?: string;
};

export async function loginWithPassword(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || null;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const destination = await resolvePostLoginDestination(supabase, next);
  redirect(destination);
}
