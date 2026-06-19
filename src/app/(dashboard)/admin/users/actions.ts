"use server";

import { revalidatePath } from "next/cache";

import { isUserRole, type UserRole } from "@/lib/auth/roles";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export type CreateUserResult =
  | { success: true; userId: string }
  | { success: false; error: string };

export type UpdateUserResult =
  | { success: true }
  | { success: false; error: string };

export async function createUserAction(
  formData: FormData,
): Promise<CreateUserResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const fullName = (formData.get("full_name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const role = (formData.get("role") as string | null) ?? "";

  if (!fullName) return { success: false, error: "Full name is required." };
  if (!email) return { success: false, error: "Email is required." };
  if (password.length < 8) return { success: false, error: "Password must be at least 8 characters." };
  if (!isUserRole(role)) return { success: false, error: "Invalid role selected." };

  const adminClient = createServiceRoleClient();
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: true, userId: data.user.id };
}

export async function updateUserAction(
  userId: string,
  formData: FormData,
): Promise<UpdateUserResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { success: false, error: guard.error };

  const { supabase, userId: callerId } = guard.ctx;

  const fullName = (formData.get("full_name") as string | null)?.trim() ?? "";
  const role = (formData.get("role") as string | null) ?? "";
  const phone = (formData.get("phone") as string | null)?.trim() ?? "";

  if (!fullName) return { success: false, error: "Full name is required." };
  if (!isUserRole(role)) return { success: false, error: "Invalid role selected." };

  if (userId === callerId && role !== "admin") {
    return { success: false, error: "You cannot remove your own admin access." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role: role as UserRole,
      phone: phone || null,
    })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/admin");

  return { success: true };
}
