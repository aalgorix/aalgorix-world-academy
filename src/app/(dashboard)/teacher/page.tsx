import {
  BookOpen,
  CheckCircle2,
  Clock,
  RotateCcw,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

type AssignedCourse = {
  id: string;
  title: string;
  curriculum_tag: string | null;
  grade_level: string | null;
};

const PALETTE = [
  { grad: "linear-gradient(135deg,#0D9488,#065F46)", shadow: "rgba(13,148,136,.35)" },
  { grad: "linear-gradient(135deg,#6366F1,#4338CA)", shadow: "rgba(99,102,241,.35)" },
  { grad: "linear-gradient(135deg,#F59E0B,#B45309)", shadow: "rgba(245,158,11,.35)" },
  { grad: "linear-gradient(135deg,#EC4899,#BE185D)", shadow: "rgba(236,72,153,.35)" },
  { grad: "linear-gradient(135deg,#22D3EE,#0891B2)", shadow: "rgba(6,182,212,.35)" },
  { grad: "linear-gradient(135deg,#34D399,#059669)", shadow: "rgba(52,211,153,.35)" },
];

export default async function TeacherHomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  // Assigned courses
  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select("courses ( id, title, curriculum_tag, grade_level )")
    .eq("teacher_id", user.id);

  const assignedCourses = (assignmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(row.courses as AssignedCourse | AssignedCourse[] | null);
    return c ? [c] : [];
  });

  const courseIds = assignedCourses.map((c) => c.id);

  // Parallel: submission counts + enrollment counts + recent submissions
  let pendingCount = 0;
  let gradedWeekCount = 0;
  let returnedCount = 0;
  let totalStudents = 0;
  let recentSubmissions: {
    id: string;
    studentName: string;
    assignmentTitle: string;
    courseTitle: string;
    submittedAt: string | null;
    status: string;
  }[] = [];

  if (courseIds.length > 0) {
    const { data: assignmentRows2 } = await supabase
      .from("assignments")
      .select("id")
      .in("course_id", courseIds);

    const assignmentIds = (assignmentRows2 ?? []).map((r) => r.id);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: pending },
      { count: gradedWeek },
      { count: returned },
      { count: enrolled },
      { data: recentRows },
    ] = await Promise.all([
      assignmentIds.length > 0
        ? supabase.from("submissions").select("*", { count: "exact", head: true })
            .eq("status", "submitted").in("assignment_id", assignmentIds)
        : Promise.resolve({ count: 0 }),
      assignmentIds.length > 0
        ? supabase.from("submissions").select("*", { count: "exact", head: true })
            .eq("status", "graded").gte("graded_at", weekAgo).in("assignment_id", assignmentIds)
        : Promise.resolve({ count: 0 }),
      assignmentIds.length > 0
        ? supabase.from("submissions").select("*", { count: "exact", head: true })
            .eq("status", "returned").in("assignment_id", assignmentIds)
        : Promise.resolve({ count: 0 }),
      supabase.from("enrollments").select("*", { count: "exact", head: true })
        .eq("status", "active").in("course_id", courseIds),
      assignmentIds.length > 0
        ? supabase.from("submissions")
            .select(`id, status, submitted_at,
              profiles!submissions_student_id_fkey ( full_name ),
              assignments!inner ( title, courses ( title ) )`)
            .in("assignment_id", assignmentIds)
            .in("status", ["submitted", "graded", "returned"])
            .order("submitted_at", { ascending: false, nullsFirst: false })
            .limit(5)
        : Promise.resolve({ data: [] }),
    ]);

    pendingCount    = pending    ?? 0;
    gradedWeekCount = gradedWeek ?? 0;
    returnedCount   = returned   ?? 0;
    totalStudents   = enrolled   ?? 0;

    recentSubmissions = ((recentRows ?? []) as unknown[]).map((row: unknown) => {
      const r = row as {
        id: string;
        status: string;
        submitted_at: string | null;
        profiles: { full_name: string | null } | { full_name: string | null }[] | null;
        assignments: { title: string; courses: { title: string } | { title: string }[] | null } | null;
      };
      const student = unwrapOne(r.profiles);
      const assignment = unwrapOne(r.assignments);
      const course = assignment ? unwrapOne(assignment.courses) : null;
      return {
        id: r.id,
        studentName: student?.full_name?.trim() || "Student",
        assignmentTitle: assignment?.title ?? "Assignment",
        courseTitle: course?.title ?? "Course",
        submittedAt: r.submitted_at,
        status: r.status,
      };
    });
  }

  const displayName = profile?.full_name?.trim() || "Educator";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Enrollment counts per course (quick lookup)
  let enrollmentByCourse = new Map<string, number>();
  if (courseIds.length > 0) {
    const { data: enrollRows } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("status", "active")
      .in("course_id", courseIds);
    for (const row of enrollRows ?? []) {
      enrollmentByCourse.set(row.course_id, (enrollmentByCourse.get(row.course_id) ?? 0) + 1);
    }
  }

  const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    submitted: { bg: "#FEF3C7", color: "#B45309", label: "Awaiting grade" },
    graded:    { bg: "#D1FAE5", color: "#065F46", label: "Graded" },
    returned:  { bg: "#FEE2E2", color: "#B91C1C", label: "Returned" },
  };

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div
        className="relative rounded-[24px] overflow-hidden mb-6 flex flex-wrap items-center gap-6 p-7"
        style={{ background: "linear-gradient(135deg,#0B1120 0%,#134E4A 100%)" }}
      >
        {/* decorative orbs */}
        <div aria-hidden className="absolute -top-12 -right-12 w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(13,148,136,.45),transparent 70%)" }} />
        <div aria-hidden className="absolute bottom-0 left-1/3 w-[160px] h-[160px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle,rgba(6,95,70,.5),transparent 70%)" }} />

        <div className="relative flex-1 min-w-[260px]">
          <div className="text-[13px] font-semibold mb-1" style={{ color: "#5EEAD4" }}>{greeting} ·</div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold text-white leading-tight tracking-tight">
            {displayName}
          </h1>
          <p className="mt-2 text-[14px] font-medium" style={{ color: "#94A3B8" }}>
            You have <span className="text-white font-bold">{pendingCount} submission{pendingCount !== 1 ? "s" : ""}</span> awaiting grading
            {assignedCourses.length > 0 && <> across <span className="text-white font-bold">{assignedCourses.length} course{assignedCourses.length !== 1 ? "s" : ""}</span></>}.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/teacher/grading"
              className="px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#0D9488" }}>
              Open grading queue →
            </Link>
            <Link href="/teacher/students"
              className="px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-colors"
              style={{ background: "rgba(255,255,255,.1)", color: "#E2E8F0" }}>
              View students
            </Link>
          </div>
        </div>

        {/* stat pills */}
        <div className="relative flex flex-wrap gap-3">
          {[
            { label: "Courses",       value: assignedCourses.length, color: "#5EEAD4" },
            { label: "Students",      value: totalStudents,          color: "#A78BFA" },
            { label: "Graded / week", value: gradedWeekCount,        color: "#6EE7B7" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[16px] px-5 py-3 text-center min-w-[90px]"
              style={{ background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)" }}>
              <div className="text-[24px] font-extrabold" style={{ color }}>{value}</div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: "#94A3B8" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats row ─────────────────────────────────────── */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
        {[
          { icon: <BookOpen     className="w-5 h-5" />, iconBg: "#CCFBF1", iconColor: "#0D9488", value: assignedCourses.length, label: "Assigned courses", sub: "Active teaching load" },
          { icon: <Users        className="w-5 h-5" />, iconBg: "#EDE9FE", iconColor: "#7C3AED", value: totalStudents,          label: "Total students",    sub: "Active enrollments" },
          { icon: <Clock        className="w-5 h-5" />, iconBg: "#FEF3C7", iconColor: "#B45309", value: pendingCount,           label: "Pending review",    sub: "Awaiting grading" },
          { icon: <CheckCircle2 className="w-5 h-5" />, iconBg: "#D1FAE5", iconColor: "#065F46", value: gradedWeekCount,        label: "Graded this week",  sub: "Last 7 days" },
          { icon: <RotateCcw    className="w-5 h-5" />, iconBg: "#FEE2E2", iconColor: "#B91C1C", value: returnedCount,          label: "Revision queue",    sub: "Returned to students" },
          { icon: <TrendingUp   className="w-5 h-5" />, iconBg: "#DBEAFE", iconColor: "#1D4ED8", value: `${assignedCourses.length > 0 ? Math.min(100, Math.round((gradedWeekCount / Math.max(1, pendingCount + gradedWeekCount)) * 100)) : 0}%`, label: "Grading rate",      sub: "Submissions resolved" },
        ].map(({ icon, iconBg, iconColor, value, label, sub }) => (
          <div key={label} className="bg-white border border-[#E2E8F0] rounded-[20px] p-5 flex items-center gap-3"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}>
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: iconBg, color: iconColor }}>
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

      <div className="flex flex-wrap gap-5">
        {/* ── Left column ──────────────────────────── */}
        <div className="flex-1 min-w-[300px] flex flex-col gap-5">

          {/* Recent submissions */}
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] overflow-hidden"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
              <h2 className="text-[16px] font-extrabold text-slate-900">Recent submissions</h2>
              <Link href="/teacher/grading"
                className="text-[12.5px] font-bold text-teal-700 hover:text-teal-900 transition-colors">
                View all →
              </Link>
            </div>
            {recentSubmissions.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <CheckCircle2 className="w-9 h-9 text-slate-200 mx-auto mb-3" />
                <p className="text-[14px] font-bold text-slate-700">Queue is clear</p>
                <p className="text-[12.5px] text-slate-400 mt-1">No submissions to review right now.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentSubmissions.map((sub) => {
                  const s = STATUS_STYLE[sub.status] ?? STATUS_STYLE.submitted;
                  const timeAgo = sub.submittedAt
                    ? (() => {
                        const diff = Date.now() - new Date(sub.submittedAt).getTime();
                        const h = Math.floor(diff / 3600000);
                        const d = Math.floor(diff / 86400000);
                        return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : "Just now";
                      })()
                    : "—";
                  return (
                    <div key={sub.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-slate-900 truncate">{sub.studentName}</div>
                        <div className="text-[12.5px] text-slate-500 truncate">{sub.assignmentTitle} · {sub.courseTitle}</div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        <span className="text-[11px] text-slate-400">{timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pending grading CTA */}
          {pendingCount > 0 && (
            <Link href="/teacher/grading"
              className="block rounded-[20px] p-5 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#0D9488,#065F46)", boxShadow: "0 8px 24px rgba(13,148,136,.3)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[22px] font-extrabold text-white">{pendingCount} submission{pendingCount !== 1 ? "s" : ""}</div>
                  <div className="text-[13px] font-medium mt-0.5" style={{ color: "#99F6E4" }}>waiting for your evaluation</div>
                </div>
                <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-white"
                  style={{ background: "rgba(255,255,255,.15)" }}>
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 text-[13px] font-bold text-white">
                Open grading queue →
              </div>
            </Link>
          )}
        </div>

        {/* ── Right column — assigned courses ──────── */}
        <div className="flex-1 min-w-[260px]">
          <div className="bg-white border border-[#E2E8F0] rounded-[22px] overflow-hidden"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]">
              <h2 className="text-[16px] font-extrabold text-slate-900">Your courses</h2>
              <Link href="/teacher/courses"
                className="text-[12.5px] font-bold text-teal-700 hover:text-teal-900 transition-colors">
                View all →
              </Link>
            </div>

            {assignedCourses.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <BookOpen className="w-9 h-9 text-slate-200 mx-auto mb-3" />
                <p className="text-[14px] font-bold text-slate-700">No courses assigned yet</p>
                <p className="text-[12.5px] text-slate-400 mt-1">Ask an admin to assign you to a course.</p>
              </div>
            ) : (
              <div className="p-4 flex flex-col gap-3">
                {assignedCourses.map((course, idx) => {
                  const pal = PALETTE[idx % PALETTE.length]!;
                  const students = enrollmentByCourse.get(course.id) ?? 0;
                  return (
                    <Link key={course.id} href="/teacher/courses"
                      className="flex items-center gap-4 rounded-[16px] p-4 border border-slate-100 transition-all hover:border-teal-200 hover:shadow-sm">
                      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 text-[13px] font-extrabold text-white"
                        style={{ background: pal.grad, boxShadow: `0 4px 12px ${pal.shadow}` }}>
                        {course.title.slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-bold text-slate-900 truncate">{course.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {course.curriculum_tag && (
                            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-full">{course.curriculum_tag}</span>
                          )}
                          {course.grade_level && (
                            <span className="text-[11px] font-semibold text-slate-500">{course.grade_level}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[16px] font-extrabold text-slate-900">{students}</div>
                        <div className="text-[11px] text-slate-400">students</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
