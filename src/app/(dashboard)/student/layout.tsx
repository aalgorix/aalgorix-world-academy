import { redirect } from "next/navigation";

import { getDashboardPathForRole } from "@/lib/auth/redirects";
import { isUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

import { StudentSidebarNav } from "./_components/workspace/student-sidebar-nav";
import { StudentTopNavbar } from "./_components/workspace/student-top-navbar";

export default async function StudentDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/student");
  }

  const [{ data: profile }, { count: notificationCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, full_name, email, avatar_url")
      .eq("id", user.id)
      .single(),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .eq("status", "returned"),
  ]);

  if (profile?.role !== "student") {
    const destination =
      profile?.role && isUserRole(profile.role)
        ? getDashboardPathForRole(profile.role)
        : "/login";
    redirect(destination);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <StudentTopNavbar
        displayName={profile.full_name}
        email={profile.email ?? user.email ?? ""}
        avatarUrl={profile.avatar_url}
        notificationCount={notificationCount ?? 0}
      />

      <StudentSidebarNav />

      <main className="min-h-screen flex-1 overflow-y-auto bg-[#fafafa] pt-16 pl-0 md:pl-64">
        {children}
      </main>
    </div>
  );
}
