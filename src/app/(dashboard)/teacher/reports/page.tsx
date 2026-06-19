import { BarChart2, CheckCircle2, Clock, TrendingUp, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { unwrapOne } from "@/lib/dashboard/relations";
import { createClient } from "@/lib/supabase/server";

type CourseRow = { id: string; title: string };
type GradeRow = { grade: number | null; status: string; course_id?: string };

function letterGrade(score: number, max: number): string {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

export default async function TeacherReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/teacher/reports");

  const { data: assignmentRows } = await supabase
    .from("teacher_course_assignments")
    .select("courses ( id, title )")
    .eq("teacher_id", user.id);

  const courses = (assignmentRows ?? []).flatMap((row) => {
    const c = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
    return c ? [c] : [];
  });
  const courseIds = courses.map((c) => c.id);

  let totalGraded = 0;
  let totalPending = 0;
  let gradeDist: Record<string, number> = { "A+": 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  let scoreSum = 0;
  let scoreCount = 0;

  type CourseStats = { graded: number; pending: number; avgPct: number | null };
  const courseStats: Record<string, CourseStats> = {};

  if (courseIds.length > 0) {
    const { data: assignRows } = await supabase
      .from("assignments")
      .select("id, course_id, max_points")
      .in("course_id", courseIds);

    const assignmentIds = (assignRows ?? []).map((r) => r.id);
    const maxByAssignment = new Map((assignRows ?? []).map((r) => [r.id, r.max_points ?? 100]));
    const courseByAssignment = new Map((assignRows ?? []).map((r) => [r.id, r.course_id]));

    for (const c of courses) courseStats[c.id] = { graded: 0, pending: 0, avgPct: null };

    if (assignmentIds.length > 0) {
      const { data: subRows } = await supabase
        .from("submissions")
        .select("grade, status, assignment_id")
        .in("assignment_id", assignmentIds)
        .in("status", ["submitted", "graded", "returned"]);

      const courseScores: Record<string, number[]> = {};

      for (const row of subRows ?? []) {
        const r = row as GradeRow & { assignment_id: string };
        const courseId = courseByAssignment.get(r.assignment_id);
        const maxPoints = maxByAssignment.get(r.assignment_id) ?? 100;

        if (r.status === "submitted") {
          totalPending++;
          if (courseId) courseStats[courseId]!.pending++;
        } else {
          totalGraded++;
          if (courseId) courseStats[courseId]!.graded++;
          if (r.grade != null) {
            const letter = letterGrade(r.grade, maxPoints);
            gradeDist[letter] = (gradeDist[letter] ?? 0) + 1;
            const pct = maxPoints > 0 ? (r.grade / maxPoints) * 100 : 0;
            scoreSum += pct;
            scoreCount++;
            if (courseId) {
              if (!courseScores[courseId]) courseScores[courseId] = [];
              courseScores[courseId]!.push(pct);
            }
          }
        }
      }

      for (const [cid, scores] of Object.entries(courseScores)) {
        if (scores.length > 0) {
          courseStats[cid]!.avgPct = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
        }
      }
    }
  }

  const avgScore = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : null;
  const maxDist = Math.max(...Object.values(gradeDist), 1);

  const GRADE_COLORS: Record<string, string> = {
    "A+": "#0D9488", A: "#10B981", B: "#6366F1", C: "#F59E0B", D: "#FB923C", F: "#EF4444",
  };

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">Performance overview across your assigned courses.</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        {[
          { icon: <CheckCircle2 className="w-5 h-5" />, bg: "#D1FAE5", color: "#065F46", value: totalGraded,  label: "Total graded" },
          { icon: <Clock        className="w-5 h-5" />, bg: "#FEF3C7", color: "#B45309", value: totalPending, label: "Pending review" },
          { icon: <TrendingUp   className="w-5 h-5" />, bg: "#CCFBF1", color: "#0D9488", value: avgScore != null ? `${avgScore}%` : "—", label: "Avg score" },
          { icon: <Users        className="w-5 h-5" />, bg: "#EDE9FE", color: "#7C3AED", value: courses.length, label: "Courses" },
        ].map(({ icon, bg, color, value, label }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-[20px] p-5 flex items-center gap-3"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.03)" }}>
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: bg, color }}>{icon}</div>
            <div>
              <div className="text-[22px] font-extrabold text-slate-900 leading-none">{value}</div>
              <div className="text-[12px] font-bold text-slate-600 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-5">
        {/* Grade distribution */}
        <div className="flex-1 min-w-[280px] bg-white border border-slate-200 rounded-[22px] overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <BarChart2 className="w-4 h-4 text-teal-600" />
            <h2 className="text-[15px] font-extrabold text-slate-900">Grade distribution</h2>
          </div>
          {scoreCount === 0 ? (
            <div className="px-6 py-12 text-center">
              <BarChart2 className="w-8 h-8 text-slate-200 mx-auto mb-3" />
              <p className="text-[14px] font-bold text-slate-700">No graded submissions yet</p>
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-4">
              {Object.entries(gradeDist).map(([grade, count]) => (
                <div key={grade} className="flex items-center gap-3">
                  <span className="w-8 text-[13px] font-extrabold" style={{ color: GRADE_COLORS[grade] }}>{grade}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxDist) * 100}%`, background: GRADE_COLORS[grade] }} />
                  </div>
                  <span className="w-5 text-right text-[13px] font-bold text-slate-600">{count}</span>
                </div>
              ))}
              <div className="mt-2 pt-4 border-t border-slate-100 text-center">
                <span className="text-[12.5px] text-slate-500">{scoreCount} graded submissions total</span>
              </div>
            </div>
          )}
        </div>

        {/* Per-course breakdown */}
        <div className="flex-1 min-w-[280px] bg-white border border-slate-200 rounded-[22px] overflow-hidden"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-[15px] font-extrabold text-slate-900">Per-course performance</h2>
          </div>
          {courses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-[14px] font-bold text-slate-700">No courses assigned</p>
            </div>
          ) : (
            <div className="p-5 flex flex-col gap-4">
              {courses.map((c, idx) => {
                const stat = courseStats[c.id];
                const avg = stat?.avgPct;
                const COLORS = ["#0D9488","#6366F1","#F59E0B","#EC4899","#22D3EE"];
                const color = COLORS[idx % COLORS.length]!;
                return (
                  <div key={c.id} className="rounded-[16px] p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[14px] font-bold text-slate-900 truncate">{c.title}</span>
                      <span className="text-[20px] font-extrabold" style={{ color }}>
                        {avg != null ? `${avg}%` : "—"}
                      </span>
                    </div>
                    {avg != null && (
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                        <div className="h-full rounded-full" style={{ width: `${avg}%`, background: color }} />
                      </div>
                    )}
                    <div className="flex gap-4 text-[12px] text-slate-500">
                      <span><b className="text-slate-800">{stat?.graded ?? 0}</b> graded</span>
                      <span><b className="text-slate-800">{stat?.pending ?? 0}</b> pending</span>
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
