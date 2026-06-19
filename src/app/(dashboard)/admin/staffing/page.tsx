import Link from "next/link";
import { redirect } from "next/navigation";

import { isUserRole, type UserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

import { StaffingPanel } from "./staffing-panel";
import type {
  PublishedCourseOption,
  StaffingPageData,
  StaffProfile,
  TeacherCourseAssignment,
} from "./types";

type RawAssignment = {
  teacher_id: string;
  course_id: string;
  assigned_at: string;
  courses: PublishedCourseOption | PublishedCourseOption[] | null;
};

export default async function AdminStaffingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/staffing");
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") {
    redirect("/admin");
  }

  const [
    { data: profileRows, error: profilesError },
    { data: courseRows, error: coursesError },
    { data: assignmentRows, error: assignmentsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("courses")
      .select("id, slug, title, grade_level, curriculum_tag")
      .eq("is_published", true)
      .order("title", { ascending: true }),
    supabase
      .from("teacher_course_assignments")
      .select(
        `
        teacher_id,
        course_id,
        assigned_at,
        courses (
          id,
          slug,
          title,
          grade_level,
          curriculum_tag
        )
      `,
      )
      .order("assigned_at", { ascending: false }),
  ]);

  if (profilesError || coursesError || assignmentsError) {
    const message =
      profilesError?.message ?? coursesError?.message ?? assignmentsError?.message;

    return (
      <div className="mx-auto w-full" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
        <div className="mb-6">
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Staffing registry</h1>
        </div>
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Could not load staffing data: {message}
        </p>
        <Link href="/admin" className="mt-4 inline-block text-sm font-medium text-violet-600">
          ← Admin home
        </Link>
      </div>
    );
  }

  const profiles: StaffProfile[] = (profileRows ?? [])
    .filter((row): row is typeof row & { role: UserRole } => isUserRole(row.role))
    .map((row) => ({
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      role: row.role,
      created_at: row.created_at,
    }));

  const publishedCourses: PublishedCourseOption[] = courseRows ?? [];

  const assignments: TeacherCourseAssignment[] = (assignmentRows ?? [])
    .flatMap((row: RawAssignment) => {
      const nested = row.courses;
      const course = Array.isArray(nested) ? nested[0] : nested;
      if (!course) return [];
      return [
        {
          teacher_id: row.teacher_id,
          course_id: row.course_id,
          assigned_at: row.assigned_at,
          course,
        },
      ];
    });

  const data: StaffingPageData = {
    profiles,
    publishedCourses,
    assignments,
  };

  const teacherCount = profiles.filter((p) => p.role === "teacher").length;
  const linkedTeachers = new Set(assignments.map((a) => a.teacher_id)).size;

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Staffing & Course Allocation</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">
          Registry monitor for every account in the tenant. Link published courses to teachers via teacher_course_assignments.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Registered accounts",      value: profiles.length, bg: "#EDE9FE", color: "#7C3AED" },
          { label: "Teacher profiles",          value: teacherCount,    bg: "#CCFBF1", color: "#0D9488" },
          { label: "Teachers with allocations", value: linkedTeachers,  bg: "#D1FAE5", color: "#065F46" },
        ].map(({ label, value, bg, color }) => (
          <div key={label} className="rounded-[20px] border border-slate-200 bg-white p-5"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}>
            <p className="text-[11.5px] font-extrabold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 text-[32px] font-extrabold tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <StaffingPanel data={data} />
    </div>
  );
}
