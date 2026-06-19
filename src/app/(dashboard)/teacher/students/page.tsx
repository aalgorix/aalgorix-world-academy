import { Search, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

type CourseRow = { id: string; title: string };
type ProfileRow = { full_name: string | null; avatar_url: string | null };
type EnrollmentRow = {
  id: string;
  status: string;
  enrolled_at: string | null;
  student_id: string;
  courses: CourseRow | CourseRow[] | null;
  profiles: ProfileRow | ProfileRow[] | null;
};

export default async function TeacherStudentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/teacher/students");

  // Assigned courses
  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select("courses ( id, title )")
    .eq("teacher_id", user.id);

  const courses = (assignmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
    return c ? [c] : [];
  });
  const courseIds = courses.map((c) => c.id);

  // Enrollments with student profiles
  let enrollments: {
    enrollmentId: string;
    studentId: string;
    studentName: string;
    avatarUrl: string | null;
    courseTitle: string;
    courseId: string;
    enrolledAt: string | null;
    status: string;
  }[] = [];

  if (courseIds.length > 0) {
    const { data: enrollRows } = await supabase
      .from("enrollments")
      .select(`
        id, status, enrolled_at, student_id,
        courses ( id, title ),
        profiles!enrollments_student_id_fkey ( full_name, avatar_url )
      `)
      .in("course_id", courseIds)
      .eq("status", "active")
      .order("enrolled_at", { ascending: false });

    enrollments = ((enrollRows ?? []) as EnrollmentRow[]).map((row) => {
      const course  = unwrapOne(row.courses);
      const profile = unwrapOne(row.profiles);
      return {
        enrollmentId: row.id,
        studentId:    row.student_id,
        studentName:  profile?.full_name?.trim() || "Student",
        avatarUrl:    profile?.avatar_url ?? null,
        courseTitle:  course?.title ?? "Course",
        courseId:     course?.id ?? "",
        enrolledAt:   row.enrolled_at,
        status:       row.status,
      };
    });
  }

  // Unique students
  const uniqueStudents = new Map<string, { name: string; avatar: string | null; courses: string[] }>();
  for (const e of enrollments) {
    if (!uniqueStudents.has(e.studentId)) {
      uniqueStudents.set(e.studentId, { name: e.studentName, avatar: e.avatarUrl, courses: [] });
    }
    uniqueStudents.get(e.studentId)!.courses.push(e.courseTitle);
  }

  const COLOR_LIST = ["#0D9488","#6366F1","#F59E0B","#EC4899","#22D3EE","#34D399","#A78BFA","#FB7185"];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Students</h1>
          <p className="mt-1 text-[14px] font-medium text-slate-500">
            {uniqueStudents.size} student{uniqueStudents.size !== 1 ? "s" : ""} enrolled across your {courses.length} course{courses.length !== 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      {uniqueStudents.size === 0 ? (
        <div className="bg-white rounded-[22px] border border-dashed border-slate-300 px-8 py-20 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-[17px] font-extrabold text-slate-900">No students enrolled yet</p>
          <p className="mt-2 text-[13.5px] text-slate-500">Students will appear here once the admin enrolls them in your courses.</p>
        </div>
      ) : (
        <>
          {/* Course filter chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {courses.map((c, i) => (
              <span key={c.id} className="text-[12px] font-bold px-3 py-1.5 rounded-full border"
                style={{ borderColor: COLOR_LIST[i % COLOR_LIST.length], color: COLOR_LIST[i % COLOR_LIST.length], background: `${COLOR_LIST[i % COLOR_LIST.length]}15` }}>
                {c.title} · {enrollments.filter(e => e.courseId === c.id).length}
              </span>
            ))}
          </div>

          {/* Students table */}
          <div className="bg-white border border-slate-200 rounded-[22px] overflow-hidden"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400" />
              <span className="text-[13px] font-semibold text-slate-500">{uniqueStudents.size} students</span>
            </div>
            <div className="divide-y divide-slate-50">
              {[...uniqueStudents.entries()].map(([id, s], idx) => {
                const initials = s.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
                const color = COLOR_LIST[idx % COLOR_LIST.length]!;
                return (
                  <div key={id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold text-white shrink-0"
                      style={{ background: color }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold text-slate-900 truncate">{s.name}</div>
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {s.courses.map((ct) => (
                          <span key={ct} className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full">{ct}</span>
                        ))}
                      </div>
                    </div>
                    <div className="shrink-0 text-[12px] font-bold text-slate-500">
                      {s.courses.length} course{s.courses.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
