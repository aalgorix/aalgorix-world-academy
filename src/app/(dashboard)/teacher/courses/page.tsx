import { BookOpen, CheckCircle2, Clock, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

type AssignedCourse = {
  id: string;
  title: string;
  description: string | null;
  grade_level: string | null;
  curriculum_tag: string | null;
  is_published: boolean;
};

const PALETTE = [
  { grad: "linear-gradient(135deg,#0D9488,#065F46)" },
  { grad: "linear-gradient(135deg,#6366F1,#4338CA)" },
  { grad: "linear-gradient(135deg,#F59E0B,#B45309)" },
  { grad: "linear-gradient(135deg,#EC4899,#BE185D)" },
  { grad: "linear-gradient(135deg,#22D3EE,#0891B2)" },
  { grad: "linear-gradient(135deg,#34D399,#059669)" },
];

export default async function TeacherCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/teacher/courses");

  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select("courses ( id, title, description, grade_level, curriculum_tag, is_published )")
    .eq("teacher_id", user.id);

  const courses = (assignmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(row.courses as AssignedCourse | AssignedCourse[] | null);
    return c ? [c] : [];
  });

  const courseIds = courses.map((c) => c.id);

  // Per-course: enrollment count + pending submissions
  const enrollmentByCourse = new Map<string, number>();
  const pendingByCourse    = new Map<string, number>();

  if (courseIds.length > 0) {
    const [{ data: enrollRows }, { data: assignRows }] = await Promise.all([
      supabase.from("enrollments").select("course_id")
        .eq("status", "active").in("course_id", courseIds),
      supabase.from("assignments").select("id, course_id").in("course_id", courseIds),
    ]);

    for (const row of enrollRows ?? []) {
      enrollmentByCourse.set(row.course_id, (enrollmentByCourse.get(row.course_id) ?? 0) + 1);
    }

    const assignmentIds = (assignRows ?? []).map((r) => r.id);
    const assignByCourse = new Map((assignRows ?? []).map((r) => [r.id, r.course_id]));

    if (assignmentIds.length > 0) {
      const { data: pendingRows } = await supabase
        .from("submissions").select("assignment_id")
        .eq("status", "submitted").in("assignment_id", assignmentIds);
      for (const row of pendingRows ?? []) {
        const courseId = assignByCourse.get(row.assignment_id);
        if (courseId) pendingByCourse.set(courseId, (pendingByCourse.get(courseId) ?? 0) + 1);
      }
    }
  }

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">My Courses</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">
          {courses.length} course{courses.length !== 1 ? "s" : ""} assigned to you by the admin.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-[22px] border border-dashed border-slate-300 px-8 py-20 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-[17px] font-extrabold text-slate-900">No courses assigned yet</p>
          <p className="mt-2 text-[13.5px] text-slate-500">An administrator needs to link your profile to courses.</p>
        </div>
      ) : (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))" }}>
          {courses.map((course, idx) => {
            const pal = PALETTE[idx % PALETTE.length]!;
            const students = enrollmentByCourse.get(course.id) ?? 0;
            const pending  = pendingByCourse.get(course.id) ?? 0;

            return (
              <div key={course.id} className="bg-white border border-slate-200 rounded-[22px] overflow-hidden transition-all hover:shadow-md"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
                {/* header */}
                <div className="h-[110px] relative flex flex-col justify-end px-6 pb-4"
                  style={{ background: pal.grad }}>
                  <div aria-hidden className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
                    style={{ background: "rgba(255,255,255,.12)" }} />
                  <div className="flex flex-wrap gap-1.5">
                    {course.curriculum_tag && (
                      <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{course.curriculum_tag}</span>
                    )}
                    {course.grade_level && (
                      <span className="text-[11px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">{course.grade_level}</span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={course.is_published
                        ? { background: "rgba(255,255,255,.2)", color: "#fff" }
                        : { background: "rgba(0,0,0,.25)", color: "#fde68a" }}>
                      {course.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-[16px] font-extrabold text-slate-900">{course.title}</h3>
                  {course.description && (
                    <p className="mt-1.5 text-[13px] text-slate-500 line-clamp-2">{course.description}</p>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    {[
                      { icon: <Users        className="w-4 h-4" />, color: "#7C3AED", label: "Students", value: students },
                      { icon: <Clock        className="w-4 h-4" />, color: "#B45309", label: "Pending",  value: pending  },
                      { icon: <CheckCircle2 className="w-4 h-4" />, color: "#065F46", label: "Active",   value: course.is_published ? "Yes" : "No" },
                    ].map(({ icon, color, label, value }) => (
                      <div key={label} className="rounded-[12px] py-2.5" style={{ background: "#F8FAFC" }}>
                        <div style={{ color }} className="flex justify-center mb-1">{icon}</div>
                        <div className="text-[16px] font-extrabold text-slate-900">{value}</div>
                        <div className="text-[10.5px] font-semibold text-slate-500">{label}</div>
                      </div>
                    ))}
                  </div>

                  <Link href="/teacher/grading"
                    className="mt-4 block text-center w-full py-2.5 rounded-[12px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#0D9488,#065F46)" }}>
                    Grade submissions →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
