import { redirect } from "next/navigation";

import { ParentShell } from "@/components/parent/parent-shell";
import { createClient } from "@/lib/supabase/server";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/parent");

  const [{ data: profile }, { count: linkedChildCount }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
    supabase
      .from("student_parent_relations")
      .select("*", { count: "exact", head: true })
      .eq("parent_id", user.id),
  ]);

  if (profile?.role !== "parent") {
    redirect("/login");
  }

  return (
    <ParentShell
      parentName={profile?.full_name?.trim() || "Parent"}
      linkedChildCount={linkedChildCount ?? 0}
    >
      {children}
    </ParentShell>
  );
}
