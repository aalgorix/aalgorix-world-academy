import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const [
    { count: totalProfiles },
    { count: studentCount },
    { count: teacherCount },
    { count: parentCount },
    { count: totalCourses },
    { count: publishedCourses },
    { count: totalEnrollments },
    { count: activeEnrollments },
    { count: pendingSubmissions },
    { count: gradedSubmissions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "parent"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "graded"),
  ]);

  // Recent enrollments (last 5)
  const { data: recentEnrollRows } = await supabase
    .from("enrollments")
    .select(`
      id, status, enrolled_at,
      profiles!enrollments_student_id_fkey ( full_name ),
      courses ( title )
    `)
    .order("enrolled_at", { ascending: false, nullsFirst: false })
    .limit(5);

  type EnrollRow = {
    id: string; status: string; enrolled_at: string | null;
    profiles: { full_name: string | null } | { full_name: string | null }[] | null;
    courses: { title: string } | { title: string }[] | null;
  };

  function unwrap<T>(v: T | T[] | null): T | null {
    if (!v) return null;
    return Array.isArray(v) ? (v[0] ?? null) : v;
  }

  const recentEnrollments = (recentEnrollRows ?? []).map((r) => {
    const row = r as EnrollRow;
    const profile = unwrap(row.profiles);
    const course  = unwrap(row.courses);
    return {
      id:          row.id,
      studentName: profile?.full_name?.trim() || "Student",
      courseTitle: course?.title ?? "Course",
      enrolledAt:  row.enrolled_at,
      status:      row.status,
    };
  });

  // Recent profiles (last 5)
  const { data: recentProfileRows } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const displayName = profile?.full_name?.trim() || "Administrator";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
    student:  { bg: "#EDE9FE", color: "#7C3AED" },
    teacher:  { bg: "#CCFBF1", color: "#0D9488" },
    parent:   { bg: "#FEF3C7", color: "#B45309" },
    admin:    { bg: "#FEE2E2", color: "#B91C1C" },
  };

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="relative rounded-[24px] overflow-hidden mb-6 flex flex-wrap items-center gap-6 p-7"
        style={{ background: "linear-gradient(135deg,#0F0B1E 0%,#2E1065 100%)" }}>
        <div aria-hidden className="absolute -top-12 -right-12 w-[220px] h-[220px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(124,58,237,.45),transparent 70%)" }} />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-[160px] h-[160px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(76,29,149,.5),transparent 70%)" }} />

        <div className="relative flex-1 min-w-[260px]">
          <div className="text-[13px] font-semibold mb-1" style={{ color: "#A78BFA" }}>{greeting} ·</div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold text-white leading-tight tracking-tight">
            {displayName}
          </h1>
          <p className="mt-2 text-[14px] font-medium" style={{ color: "#94A3B8" }}>
            <span className="text-white font-bold">{totalProfiles ?? 0} users</span> registered ·{" "}
            <span className="text-white font-bold">{activeEnrollments ?? 0} active enrollments</span> ·{" "}
            <span className="text-white font-bold">{pendingSubmissions ?? 0} submissions</span> pending grading.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/admin/users"
              className="px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#7C3AED" }}>
              Manage users →
            </Link>
            <Link href="/admin/courses"
              className="px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-colors"
              style={{ background: "rgba(255,255,255,.1)", color: "#E2E8F0" }}>
              Course catalog
            </Link>
          </div>
        </div>

        <div className="relative flex flex-wrap gap-3">
          {[
            { label: "Students",  value: studentCount  ?? 0, color: "#A78BFA" },
            { label: "Teachers",  value: teacherCount  ?? 0, color: "#6EE7B7" },
            { label: "Courses",   value: totalCourses  ?? 0, color: "#FCD34D" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[16px] px-5 py-3 text-center min-w-[90px]"
              style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)" }}>
              <div className="text-[24px] font-extrabold" style={{ color }}>{value}</div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: "#94A3B8" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Platform stat grid ────────────────────────────── */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        {[
          { icon: <Users        className="w-5 h-5" />, bg: "#EDE9FE", color: "#7C3AED", value: totalProfiles  ?? 0, label: "Total users",        sub: "All roles" },
          { icon: <GraduationCap className="w-5 h-5"/>, bg: "#DBEAFE", color: "#1D4ED8", value: studentCount   ?? 0, label: "Students",           sub: "Registered" },
          { icon: <BookOpen     className="w-5 h-5" />, bg: "#CCFBF1", color: "#0D9488", value: publishedCourses?? 0, label: "Published courses",  sub: `of ${totalCourses ?? 0} total` },
          { icon: <UserPlus     className="w-5 h-5" />, bg: "#D1FAE5", color: "#065F46", value: activeEnrollments ?? 0, label: "Active enrollments", sub: `${totalEnrollments ?? 0} total` },
          { icon: <Clock        className="w-5 h-5" />, bg: "#FEF3C7", color: "#B45309", value: pendingSubmissions ?? 0, label: "Pending grading",  sub: "Awaiting teacher" },
          { icon: <CheckCircle2 className="w-5 h-5" />, bg: "#F0FDF4", color: "#15803D", value: gradedSubmissions ?? 0, label: "Graded submissions", sub: "All time" },
        ].map(({ icon, bg, color, value, label, sub }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-[20px] p-5 flex items-center gap-3"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}>
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: bg, color }}>
              {icon}
            </div>
            <div>
              <div className="text-[21px] font-extrabold text-slate-900 leading-none">{value}</div>
              <div className="text-[12px] font-bold text-slate-700 mt-0.5">{label}</div>
              <div className="text-[11px] text-slate-400">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions ────────────────────────────────── */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        {[
          { href: "/admin/courses",     label: "Course catalog",   desc: "Create, edit & publish courses",            color: "#0D9488", bg: "#CCFBF1", icon: <BookOpen    className="w-5 h-5" /> },
          { href: "/admin/staffing",    label: "Staffing",         desc: "Assign teachers to courses",                color: "#7C3AED", bg: "#EDE9FE", icon: <GraduationCap className="w-5 h-5"/> },
          { href: "/admin/users",       label: "All users",        desc: "Manage students, teachers & parents",       color: "#1D4ED8", bg: "#DBEAFE", icon: <Users      className="w-5 h-5" /> },
          { href: "/admin/enrollments", label: "Enrollments",      desc: "Enroll students, manage access",            color: "#065F46", bg: "#D1FAE5", icon: <UserPlus   className="w-5 h-5" /> },
          { href: "/admin/reports",     label: "Reports",          desc: "Platform analytics & grade overview",       color: "#B45309", bg: "#FEF3C7", icon: <TrendingUp  className="w-5 h-5" /> },
        ].map(({ href, label, desc, color, bg, icon }) => (
          <Link key={href} href={href}
            className="bg-white border border-slate-200 rounded-[20px] p-5 flex items-start gap-4 transition-all hover:shadow-md hover:-translate-y-0.5"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}>
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
              style={{ background: bg, color }}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-extrabold text-slate-900">{label}</div>
              <div className="text-[12.5px] text-slate-500 mt-0.5">{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Two-column feed ──────────────────────────────── */}
      <div className="flex flex-wrap gap-5">

        {/* Recent enrollments */}
        <div className="flex-1 min-w-[280px] bg-white border border-slate-200 rounded-[22px] overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[16px] font-extrabold text-slate-900">Recent enrollments</h2>
            <Link href="/admin/enrollments" className="text-[12.5px] font-bold text-violet-700 hover:text-violet-900">View all →</Link>
          </div>
          {recentEnrollments.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <UserPlus className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-slate-700">No enrollments yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentEnrollments.map((e) => {
                const timeAgo = e.enrolledAt
                  ? (() => {
                      const d = Math.floor((Date.now() - new Date(e.enrolledAt).getTime()) / 86400000);
                      return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
                    })()
                  : "—";
                return (
                  <div key={e.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
                      style={{ background: "#7C3AED" }}>
                      {e.studentName.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold text-slate-900 truncate">{e.studentName}</div>
                      <div className="text-[12px] text-slate-500 truncate">{e.courseTitle}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: e.status === "active" ? "#D1FAE5" : "#FEF3C7", color: e.status === "active" ? "#065F46" : "#B45309" }}>
                        {e.status}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">{timeAgo}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent user registrations */}
        <div className="flex-1 min-w-[280px] bg-white border border-slate-200 rounded-[22px] overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-[16px] font-extrabold text-slate-900">New registrations</h2>
            <Link href="/admin/users" className="text-[12.5px] font-bold text-violet-700 hover:text-violet-900">View all →</Link>
          </div>
          {(recentProfileRows ?? []).length === 0 ? (
            <div className="px-6 py-10 text-center">
              <Users className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-slate-700">No users yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {(recentProfileRows ?? []).map((r) => {
                const s = ROLE_STYLE[r.role] ?? { bg: "#F1F5F9", color: "#64748B" };
                const timeAgo = r.created_at
                  ? (() => {
                      const d = Math.floor((Date.now() - new Date(r.created_at).getTime()) / 86400000);
                      return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
                    })()
                  : "—";
                const initials = (r.full_name ?? "?").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
                return (
                  <div key={r.id} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold shrink-0"
                      style={{ background: s.bg, color: s.color }}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-bold text-slate-900 truncate">{r.full_name ?? "—"}</div>
                      <div className="text-[12px] text-slate-500">{timeAgo}</div>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full capitalize"
                      style={{ background: s.bg, color: s.color }}>
                      {r.role}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
