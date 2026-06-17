import { Award, BookOpen, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PerformanceCharts } from "@/components/student/performance-charts";
import {
  computeProgressPercent,
  fetchCompletedLessonsByEnrollment,
  fetchLessonTotalsByCourse,
} from "@/lib/dashboard/course-progress";
import { unwrapOne } from "@/lib/dashboard/relations";
import { isSubmissionStatus } from "@/lib/dashboard/submission-status";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CourseRow = {
  id: string;
  title: string;
  curriculum_tag: string | null;
  grade_level: string | null;
};

type RawSubmission = {
  id: string;
  status: string;
  grade: number | null;
  updated_at: string;
  assignments: {
    course_id: string;
    title: string;
    courses: { id: string; title: string } | { id: string; title: string }[] | null;
  } | {
    course_id: string;
    title: string;
    courses: { id: string; title: string } | { id: string; title: string }[] | null;
  }[] | null;
};

function averageRounded(vals: number[]) {
  if (!vals.length) return null;
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function ProgressReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/student/reports");

  // -- enrollments -----------------------------------------------------------
  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("id, courses ( id, title, curriculum_tag, grade_level )")
    .eq("student_id", user.id)
    .eq("status", "active");

  const enrollments = (enrollmentRows ?? []).flatMap((row) => {
    const course = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
    if (!course) return [];
    return [{ enrollmentId: row.id, course }];
  });

  const enrollmentIds = enrollments.map((e) => e.enrollmentId);
  const courseIds     = enrollments.map((e) => e.course.id);

  const [lessonTotals, completedByEnrollment] = await Promise.all([
    fetchLessonTotalsByCourse(supabase, courseIds),
    fetchCompletedLessonsByEnrollment(supabase, enrollmentIds),
  ]);

  // -- graded submissions ----------------------------------------------------
  const { data: submissionRows } = await supabase
    .from("submissions")
    .select(`id, status, grade, updated_at,
      assignments ( course_id, title, courses ( id, title ) )`)
    .eq("student_id", user.id)
    .in("status", ["graded", "returned"])
    .order("updated_at", { ascending: false });

  const gradedSubmissions = ((submissionRows ?? []) as RawSubmission[]).filter((r) => {
    if (!isSubmissionStatus(r.status)) return false;
    return r.status === "graded";
  });

  // -- aggregate stats -------------------------------------------------------
  const progressValues = enrollments.map(({ enrollmentId, course }) => {
    const total     = lessonTotals.get(course.id) ?? 0;
    const completed = completedByEnrollment.get(enrollmentId) ?? 0;
    return computeProgressPercent(completed, total);
  });

  const avgProgress    = averageRounded(progressValues) ?? 0;
  const completedCount = [...completedByEnrollment.values()].reduce((s, c) => s + c, 0);

  const gradedScores = gradedSubmissions
    .filter((r) => r.grade != null)
    .map((r) => r.grade as number);
  const gpaAverage   = averageRounded(gradedScores);

  // -- per-course grade map --------------------------------------------------
  const gradeByCourse = new Map<string, number[]>();
  for (const sub of gradedSubmissions) {
    const assignment = unwrapOne(sub.assignments);
    if (!assignment || sub.grade == null) continue;
    const existing = gradeByCourse.get(assignment.course_id) ?? [];
    existing.push(sub.grade);
    gradeByCourse.set(assignment.course_id, existing);
  }

  const courseReports = enrollments.map(({ enrollmentId, course }) => {
    const total     = lessonTotals.get(course.id) ?? 0;
    const completed = completedByEnrollment.get(enrollmentId) ?? 0;
    const progress  = computeProgressPercent(completed, total);
    const scores    = gradeByCourse.get(course.id) ?? [];
    const avg       = averageRounded(scores);
    return { course, progress, completed, total, avg, gradedCount: scores.length };
  });

  // -- subject stats for charts (use real data where available) -------------
  const PALETTE = [
    { grad: "linear-gradient(135deg,#6E8BFF,#3B5BFF)" },
    { grad: "linear-gradient(135deg,#34D399,#0E9F6E)" },
    { grad: "linear-gradient(135deg,#FBBF24,#F59E0B)" },
    { grad: "linear-gradient(135deg,#A78BFA,#7C3AED)" },
    { grad: "linear-gradient(135deg,#22D3EE,#0891B2)" },
    { grad: "linear-gradient(135deg,#FB7185,#E11D48)" },
  ];

  const subjectStats = courseReports
    .filter((r) => r.avg != null)
    .map((r, i) => ({
      name:  r.course.title.length > 14 ? r.course.title.slice(0, 13) + "…" : r.course.title,
      score: r.avg!,
      grad:  PALETTE[i % PALETTE.length]!.grad,
    }));

  // -------------------------------------------------------------------------
  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 60px" }}>
      {/* heading */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Progress Reports</h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">
          Your academic performance across all enrolled courses.
        </p>
      </div>

      {/* headline stats */}
      <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>
        {[
          { icon:<TrendingUp className="w-5 h-5" style={{ color:"#6366F1" }}/>, bg:"#EEF0FF", value:`${avgProgress}%`, label:"Average progress" },
          { icon:<BookOpen className="w-5 h-5" style={{ color:"#10B981" }}/>,   bg:"#E7F8F1", value:completedCount,  label:"Lessons completed" },
          { icon:<CheckCircle2 className="w-5 h-5" style={{ color:"#F59E0B" }}/>,bg:"#FEF3E2",value:gradedSubmissions.length, label:"Graded submissions" },
          { icon:<Award className="w-5 h-5" style={{ color:"#8B5CF6" }}/>,      bg:"#F3EEFE", value: gpaAverage != null ? `${gpaAverage}%` : "—", label:"GPA average" },
        ].map(({ icon, bg, value, label }) => (
          <div key={label} className="bg-white border border-[#ECEDF3] rounded-[20px] p-5 flex items-center gap-3"
            style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center shrink-0" style={{ background: bg }}>{icon}</div>
            <div>
              <div className="text-[21px] font-extrabold text-[#1A1B2E] leading-none">{value}</div>
              <div className="text-[12px] font-semibold text-[#6B6F8A] mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* per-course report cards */}
      <div className="mb-8">
        <h2 className="text-[17px] font-extrabold text-[#1A1B2E] mb-4">Course breakdown</h2>
        {courseReports.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[#D6D8E4] bg-white px-8 py-14 text-center">
            <BookOpen className="w-9 h-9 text-[#C4C7D9] mx-auto mb-3" />
            <p className="text-[15px] font-extrabold text-[#1A1B2E]">No enrolments yet</p>
            <Link href="/student/courses" className="mt-4 inline-flex px-4 py-2.5 rounded-[11px] text-[13px] font-bold text-[#5B5BF0] bg-[#EEF0FF]">View courses</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {courseReports.map(({ course, progress, completed, total, avg, gradedCount }, idx) => {
              const palette = PALETTE[idx % PALETTE.length]!;
              return (
                <div key={course.id} className="bg-white border border-[#ECEDF3] rounded-[20px] p-5"
                  style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-[16px] font-extrabold text-[#1A1B2E]">{course.title}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {course.grade_level && <span className="text-[11px] font-bold bg-[#1A1B2E] text-white px-2 py-0.5 rounded-full">{course.grade_level}</span>}
                        {course.curriculum_tag && <span className="text-[11px] font-semibold text-[#5B5BF0] bg-[#EEF0FF] px-2 py-0.5 rounded-full">{course.curriculum_tag}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      {avg != null ? (
                        <span className="text-[24px] font-extrabold text-[#0E9F6E]">{avg}%</span>
                      ) : (
                        <span className="text-[14px] font-semibold text-[#9AA0B8]">No grades yet</span>
                      )}
                      {gradedCount > 0 && <div className="text-[11px] text-[#9AA0B8] mt-0.5">{gradedCount} graded</div>}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[12px] font-semibold text-[#6B6F8A] mb-1.5">
                      <span>Lesson progress · {completed} of {total > 0 ? total : "—"} lessons</span>
                      <span className="font-extrabold text-[#1A1B2E]">{progress}%</span>
                    </div>
                    <div className="h-2.5 bg-[#EEF0F5] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width:`${progress}%`, background: palette.grad }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* performance charts (real subject data if available, otherwise default mock) */}
      {subjectStats.length > 0 && (
        <div>
          <h2 className="text-[17px] font-extrabold text-[#1A1B2E] mb-4">Performance analytics</h2>
          <PerformanceCharts subjectStats={subjectStats} />
        </div>
      )}
    </div>
  );
}
