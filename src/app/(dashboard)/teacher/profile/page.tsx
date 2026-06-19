import { BookOpen, Mail, Shield, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

type CourseRow = { id: string; title: string; curriculum_tag: string | null; grade_level: string | null };

export default async function TeacherProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/teacher/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select("courses ( id, title, curriculum_tag, grade_level )")
    .eq("teacher_id", user.id);

  const courses = (assignmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
    return c ? [c] : [];
  });

  const { count: totalStudents } = await (courses.length > 0
    ? supabase.from("enrollments").select("*", { count: "exact", head: true })
        .eq("status", "active").in("course_id", courses.map(c => c.id))
    : Promise.resolve({ count: 0 }));

  const name = profile?.full_name?.trim() || "Educator";
  const initials = name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Unknown";

  const PALETTE = [
    "linear-gradient(135deg,#0D9488,#065F46)",
    "linear-gradient(135deg,#6366F1,#4338CA)",
    "linear-gradient(135deg,#F59E0B,#B45309)",
    "linear-gradient(135deg,#EC4899,#BE185D)",
    "linear-gradient(135deg,#22D3EE,#0891B2)",
    "linear-gradient(135deg,#34D399,#059669)",
  ];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 900, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">Your teacher profile and assigned teaching responsibilities.</p>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden mb-5"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
        {/* Banner */}
        <div className="h-[120px]" style={{ background: "linear-gradient(135deg,#0B1120 0%,#134E4A 100%)" }} />
        <div className="px-7 pb-7 -mt-12">
          <div className="w-[80px] h-[80px] rounded-full border-4 border-white flex items-center justify-center text-[22px] font-extrabold text-white mb-4"
            style={{ background: "linear-gradient(135deg,#0D9488,#065F46)" }}>
            {initials}
          </div>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-[22px] font-extrabold text-slate-900">{name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[13px] font-bold text-teal-700 capitalize">Teacher</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[13px] text-slate-500">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </div>
            </div>
            <div className="flex gap-4">
              {[
                { icon: <BookOpen className="w-4 h-4" />, value: courses.length,       label: "Courses" },
                { icon: <Users    className="w-4 h-4" />, value: totalStudents ?? 0,   label: "Students" },
              ].map(({ icon, value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-[24px] font-extrabold text-slate-900">{value}</div>
                  <div className="text-[12px] text-slate-500 flex items-center justify-center gap-1">{icon} {label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700">Member since {memberSince}</span>
            <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              {courses.length > 0 ? `${courses.length} active course${courses.length !== 1 ? "s" : ""}` : "No courses yet"}
            </span>
          </div>
        </div>
      </div>

      {/* Assigned courses */}
      <div className="bg-white border border-slate-200 rounded-[22px] overflow-hidden"
        style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-extrabold text-slate-900">Teaching assignments</h2>
        </div>
        {courses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BookOpen className="w-9 h-9 text-slate-200 mx-auto mb-3" />
            <p className="text-[14px] font-bold text-slate-700">No courses assigned yet</p>
          </div>
        ) : (
          <div className="p-5 grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
            {courses.map((c, idx) => (
              <div key={c.id} className="flex items-center gap-3 rounded-[16px] p-4 border border-slate-100">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-[13px] font-extrabold text-white shrink-0"
                  style={{ background: PALETTE[idx % PALETTE.length] }}>
                  {c.title.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-slate-900 truncate">{c.title}</div>
                  <div className="flex gap-1.5 flex-wrap mt-0.5">
                    {c.curriculum_tag && <span className="text-[11px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full font-semibold">{c.curriculum_tag}</span>}
                    {c.grade_level   && <span className="text-[11px] text-slate-500">{c.grade_level}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
