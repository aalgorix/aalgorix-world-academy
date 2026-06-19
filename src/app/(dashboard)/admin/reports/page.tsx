import { BarChart3, BookOpen, CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

function letterGrade(score: number, max: number): string {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/reports");

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: activeEnrollments },
    { count: totalCourses },
    { count: publishedCourses },
    { count: pendingSubmissions },
    { count: gradedSubmissions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "graded"),
  ]);

  // Graded submissions with scores for distribution
  const { data: gradedRows } = await supabase
    .from("submissions")
    .select("grade, assignment_id, assignments!inner ( max_points )")
    .eq("status", "graded")
    .not("grade", "is", null);

  type GradedRow = {
    grade: number;
    assignments: { max_points: number } | { max_points: number }[] | null;
  };

  function unwrap<T>(v: T | T[] | null): T | null {
    if (!v) return null;
    return Array.isArray(v) ? (v[0] ?? null) : v;
  }

  const gradeDist: Record<string, number> = { "A+": 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  let scoreSum = 0;
  let scoreCount = 0;

  for (const row of gradedRows ?? []) {
    const r = row as GradedRow;
    const assignment = unwrap(r.assignments);
    const maxPoints = assignment?.max_points ?? 100;
    const letter = letterGrade(r.grade, maxPoints);
    gradeDist[letter] = (gradeDist[letter] ?? 0) + 1;
    scoreSum += maxPoints > 0 ? (r.grade / maxPoints) * 100 : 0;
    scoreCount++;
  }
  const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null;
  const maxDist  = Math.max(...Object.values(gradeDist), 1);

  // Top courses by enrollment
  const { data: courseEnrollRows } = await supabase
    .from("enrollments")
    .select("course_id, courses ( title )")
    .eq("status", "active");

  const courseEnrollCount = new Map<string, { title: string; count: number }>();
  for (const row of courseEnrollRows ?? []) {
    const r = row as { course_id: string; courses: { title: string } | { title: string }[] | null };
    const course = unwrap(r.courses);
    if (!course) continue;
    const existing = courseEnrollCount.get(r.course_id);
    if (existing) existing.count++;
    else courseEnrollCount.set(r.course_id, { title: course.title, count: 1 });
  }
  const topCourses = [...courseEnrollCount.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxEnroll = Math.max(...topCourses.map((c) => c.count), 1);

  const GRADE_COLORS: Record<string, string> = {
    "A+": "#0D9488", A: "#10B981", B: "#6366F1", C: "#F59E0B", D: "#FB923C", F: "#EF4444",
  };

  const publishRatio = (totalCourses ?? 0) > 0
    ? Math.round(((publishedCourses ?? 0) / (totalCourses ?? 1)) * 100)
    : 0;
  const gradingRatio = ((pendingSubmissions ?? 0) + (gradedSubmissions ?? 0)) > 0
    ? Math.round(((gradedSubmissions ?? 0) / ((pendingSubmissions ?? 0) + (gradedSubmissions ?? 0))) * 100)
    : 0;

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Platform Reports</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">Academy-wide analytics across users, courses, and submissions.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))" }}>
        {[
          { icon: <Users        className="w-5 h-5" />, bg: "#EDE9FE", color: "#7C3AED", value: totalStudents  ?? 0, label: "Students" },
          { icon: <TrendingUp   className="w-5 h-5" />, bg: "#DBEAFE", color: "#1D4ED8", value: totalTeachers  ?? 0, label: "Teachers" },
          { icon: <BookOpen     className="w-5 h-5" />, bg: "#CCFBF1", color: "#0D9488", value: activeEnrollments ?? 0, label: "Active enrollments" },
          { icon: <CheckCircle2 className="w-5 h-5" />, bg: "#D1FAE5", color: "#065F46", value: gradedSubmissions ?? 0, label: "Graded submissions" },
          { icon: <Clock        className="w-5 h-5" />, bg: "#FEF3C7", color: "#B45309", value: pendingSubmissions ?? 0, label: "Pending grading" },
          { icon: <BarChart3    className="w-5 h-5" />, bg: "#F0F9FF", color: "#0284C7", value: avgScore != null ? `${avgScore}%` : "—", label: "Platform avg score" },
        ].map(({ icon, bg, color, value, label }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-[20px] p-5 flex items-center gap-3"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}>
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: bg, color }}>
              {icon}
            </div>
            <div>
              <div className="text-[22px] font-extrabold text-slate-900 leading-none">{value}</div>
              <div className="text-[12px] font-bold text-slate-600 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bars */}
      <div className="grid gap-4 mb-6 sm:grid-cols-2">
        {[
          { label: "Course publish rate", value: publishRatio,  color: "#0D9488", detail: `${publishedCourses ?? 0} of ${totalCourses ?? 0} courses published` },
          { label: "Grading completion",  value: gradingRatio,  color: "#7C3AED", detail: `${gradedSubmissions ?? 0} graded, ${pendingSubmissions ?? 0} pending` },
        ].map(({ label, value, color, detail }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-[20px] p-5"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-extrabold text-slate-900">{label}</span>
              <span className="text-[22px] font-extrabold" style={{ color }}>{value}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${value}%`, background: color }} />
            </div>
            <div className="text-[12.5px] text-slate-500">{detail}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-5">
        {/* Grade distribution */}
        <div className="flex-1 min-w-[260px] bg-white border border-slate-200 rounded-[22px] overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <BarChart3 className="w-4 h-4 text-violet-600" />
            <h2 className="text-[15px] font-extrabold text-slate-900">Platform grade distribution</h2>
          </div>
          {scoreCount === 0 ? (
            <div className="px-6 py-12 text-center">
              <BarChart3 className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-slate-700">No graded submissions yet</p>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-4">
              {Object.entries(gradeDist).map(([grade, count]) => (
                <div key={grade} className="flex items-center gap-3">
                  <span className="w-8 text-[13px] font-extrabold" style={{ color: GRADE_COLORS[grade] }}>{grade}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${(count / maxDist) * 100}%`, background: GRADE_COLORS[grade] }} />
                  </div>
                  <span className="w-6 text-right text-[13px] font-bold text-slate-600">{count}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-100 text-center text-[12.5px] text-slate-500">
                {scoreCount} graded submissions · Platform avg: <strong>{avgScore ?? "—"}%</strong>
              </div>
            </div>
          )}
        </div>

        {/* Top courses by enrollment */}
        <div className="flex-1 min-w-[260px] bg-white border border-slate-200 rounded-[22px] overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-[15px] font-extrabold text-slate-900">Top courses by enrollment</h2>
          </div>
          {topCourses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-slate-700">No enrollment data yet</p>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4">
              {topCourses.map((c, idx) => {
                const COLORS = ["#7C3AED","#0D9488","#1D4ED8","#B45309","#B91C1C","#059669"];
                const color  = COLORS[idx % COLORS.length]!;
                return (
                  <div key={c.title}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13.5px] font-bold text-slate-900 truncate flex-1">{c.title}</span>
                      <span className="text-[20px] font-extrabold ml-3 shrink-0" style={{ color }}>{c.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.count / maxEnroll) * 100}%`, background: color }} />
                    </div>
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
