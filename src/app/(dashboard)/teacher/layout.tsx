import { redirect } from "next/navigation";

import { TeacherShell } from "@/components/teacher/teacher-shell";
import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

type AssignedCourse = { id: string; title: string; curriculum_tag: string | null };

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/teacher");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "teacher" && profile?.role !== "admin") {
    redirect("/login");
  }

  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select("courses ( id, title, curriculum_tag )")
    .eq("teacher_id", user.id)
    .limit(1);

  const firstCourse = assignmentRows?.flatMap((row) => {
    const c = unwrapOne(row.courses as AssignedCourse | AssignedCourse[] | null);
    return c ? [c] : [];
  })[0];

  const teacherName = profile?.full_name?.trim() || "Educator";
  const subject = firstCourse?.curriculum_tag ?? firstCourse?.title ?? undefined;

  return (
    <TeacherShell teacherName={teacherName} subject={subject}>
      {children}
    </TeacherShell>
  );
}
