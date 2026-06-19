import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import type { EnrollmentRow, CourseOption, StudentOption } from "./enrollment-panel";
import { EnrollmentPanel } from "./enrollment-panel";

type RawEnrollRow = {
  id: string;
  status: string;
  enrolled_at: string | null;
  student_id: string;
  course_id: string;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  courses:  { title: string } | { title: string }[] | null;
};

function unwrap<T>(v: T | T[] | null): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function AdminEnrollmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/enrollments");

  // Fetch all three in parallel
  const [
    { data: enrollRows },
    { data: studentRows },
    { data: courseRows },
  ] = await Promise.all([
    supabase
      .from("enrollments")
      .select(`
        id, status, enrolled_at, student_id, course_id,
        profiles!enrollments_student_id_fkey ( full_name ),
        courses ( title )
      `)
      .order("enrolled_at", { ascending: false, nullsFirst: false }),

    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "student")
      .order("full_name"),

    supabase
      .from("courses")
      .select("id, title")
      .eq("is_published", true)
      .order("title"),
  ]);

  const enrollments: EnrollmentRow[] = (enrollRows ?? []).map((r) => {
    const row     = r as RawEnrollRow;
    const profile = unwrap(row.profiles);
    const course  = unwrap(row.courses);
    return {
      id:          row.id,
      studentId:   row.student_id,
      studentName: profile?.full_name?.trim() || "Student",
      courseTitle: course?.title ?? "Course",
      status:      row.status,
      enrolledAt:  row.enrolled_at,
    };
  });

  const students: StudentOption[] = (studentRows ?? []).map((s) => ({
    id:   s.id,
    name: s.full_name?.trim() || "Student",
  }));

  const courses: CourseOption[] = (courseRows ?? []).map((c) => ({
    id:    c.id,
    title: c.title,
  }));

  const statusCounts = enrollments.reduce<Record<string, number>>((acc, e) => {
    acc[e.status] = (acc[e.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <EnrollmentPanel
        students={students}
        courses={courses}
        enrollments={enrollments}
        statusCounts={statusCounts}
      />
    </div>
  );
}
