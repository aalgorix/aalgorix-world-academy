import type { ReactNode } from "react";

import { StudentShell } from "@/components/student/student-shell";
import { createClient } from "@/lib/supabase/server";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
    : { data: null };

  const { data: enrollment } = user
    ? await supabase
        .from("enrollments")
        .select("courses ( grade_level )")
        .eq("student_id", user.id)
        .eq("status", "active")
        .limit(1)
        .single()
    : { data: null };

  const displayName = profile?.full_name?.trim() || "Student";

  // Best-effort grade label from first active enrollment
  const coursesField = enrollment?.courses as
    | { grade_level: string | null }
    | { grade_level: string | null }[]
    | null;
  const firstCourse = Array.isArray(coursesField)
    ? coursesField[0]
    : coursesField;
  const gradeLabel = firstCourse?.grade_level ?? "Student";

  return (
    <StudentShell displayName={displayName} gradeLabel={gradeLabel}>
      {children}
    </StudentShell>
  );
}
