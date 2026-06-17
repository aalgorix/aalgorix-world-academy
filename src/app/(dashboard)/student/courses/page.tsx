import { BookOpen, CheckCircle2, Play, TrendingUp } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  computeProgressPercent,
  fetchCompletedLessonsByEnrollment,
  fetchLessonTotalsByCourse,
} from "@/lib/dashboard/course-progress";
import { unwrapOne } from "@/lib/dashboard/relations";
import { fetchFirstLessonIdForCourse } from "@/lib/student/workspace";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type CourseRow = {
  id: string;
  title: string;
  slug: string;
  curriculum_tag: string | null;
  grade_level: string | null;
  thumbnail_url: string | null;
};

type CourseMeta = {
  enrollmentId: string;
  course: CourseRow;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  classroomHref: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function averageRounded(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(
    values.reduce((sum, v) => sum + v, 0) / values.length,
  );
}

// Palette cycles for courses without a thumbnail
const PALETTE = [
  { grad: "linear-gradient(135deg,#6E8BFF,#3B5BFF)", solid: "#4F6BFF", bg: "#EDF1FF" },
  { grad: "linear-gradient(135deg,#34D399,#0E9F6E)", solid: "#10B981", bg: "#E7F8F1" },
  { grad: "linear-gradient(135deg,#FBBF24,#F59E0B)", solid: "#F59E0B", bg: "#FEF3E2" },
  { grad: "linear-gradient(135deg,#A78BFA,#7C3AED)", solid: "#8B5CF6", bg: "#F3EEFE" },
  { grad: "linear-gradient(135deg,#22D3EE,#0891B2)", solid: "#06B6D4", bg: "#E2F7FB" },
  { grad: "linear-gradient(135deg,#FB7185,#E11D48)", solid: "#F43F5E", bg: "#FEECEF" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function MyCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/student/courses");

  // ------------------------------------------------------------------
  // Fetch enrollments
  // ------------------------------------------------------------------
  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select(
      `id, courses ( id, title, slug, curriculum_tag, grade_level, thumbnail_url )`,
    )
    .eq("student_id", user.id)
    .eq("status", "active");

  const enrollments =
    enrollmentRows?.flatMap((row) => {
      const course = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
      if (!course) return [];
      return [{ enrollmentId: row.id, course }];
    }) ?? [];

  const enrollmentIds = enrollments.map((r) => r.enrollmentId);
  const courseIds = enrollments.map((r) => r.course.id);

  // ------------------------------------------------------------------
  // Fetch lesson counts + progress in parallel
  // ------------------------------------------------------------------
  const [lessonTotals, completedByEnrollment] = await Promise.all([
    fetchLessonTotalsByCourse(supabase, courseIds),
    fetchCompletedLessonsByEnrollment(supabase, enrollmentIds),
  ]);

  const coursesWithMeta: CourseMeta[] = await Promise.all(
    enrollments.map(async ({ enrollmentId, course }) => {
      const totalLessons = lessonTotals.get(course.id) ?? 0;
      const completedLessons = completedByEnrollment.get(enrollmentId) ?? 0;
      const progressPercent = computeProgressPercent(completedLessons, totalLessons);
      const lessonId = (await fetchFirstLessonIdForCourse(course.id)) ?? null;
      const classroomHref = lessonId
        ? `/student/courses/${course.id}/lessons/${lessonId}`
        : null;
      return {
        enrollmentId,
        course,
        progressPercent,
        completedLessons,
        totalLessons,
        classroomHref,
      };
    }),
  );

  // ------------------------------------------------------------------
  // Aggregate stats
  // ------------------------------------------------------------------
  const totalCourses = coursesWithMeta.length;
  const completedCourses = coursesWithMeta.filter((c) => c.progressPercent >= 100).length;
  const avgProgress = averageRounded(coursesWithMeta.map((c) => c.progressPercent));
  const totalLessonsCompleted = coursesWithMeta.reduce(
    (sum, c) => sum + c.completedLessons,
    0,
  );

  // Split into sections
  const inProgress = coursesWithMeta.filter((c) => c.progressPercent < 100);
  const completed = coursesWithMeta.filter((c) => c.progressPercent >= 100);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div
      className="mx-auto w-full sd-float-up"
      style={{ maxWidth: 1320, padding: "28px 32px 60px" }}
    >
      {/* ── Page heading ─────────────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">
          My Courses
        </h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">
          All your active enrolments and progress in one place.
        </p>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────── */}
      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}
      >
        {[
          {
            icon: <BookOpen className="w-5 h-5" style={{ color: "#6366F1" }} />,
            bg: "#EEF0FF",
            value: totalCourses,
            label: "Enrolled courses",
          },
          {
            icon: <TrendingUp className="w-5 h-5" style={{ color: "#10B981" }} />,
            bg: "#E7F8F1",
            value: `${avgProgress}%`,
            label: "Average progress",
          },
          {
            icon: <CheckCircle2 className="w-5 h-5" style={{ color: "#F59E0B" }} />,
            bg: "#FEF3E2",
            value: totalLessonsCompleted,
            label: "Lessons completed",
          },
          {
            icon: <Play className="w-5 h-5 fill-[#8B5CF6]" style={{ color: "#8B5CF6" }} />,
            bg: "#F3EEFE",
            value: completedCourses,
            label: "Courses finished",
          },
        ].map(({ icon, bg, value, label }) => (
          <div
            key={label}
            className="bg-white border border-[#ECEDF3] rounded-[20px] p-5 flex items-center gap-4"
            style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
          >
            <div
              className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center shrink-0"
              style={{ background: bg }}
            >
              {icon}
            </div>
            <div>
              <div className="text-[22px] font-extrabold text-[#1A1B2E] leading-none">
                {value}
              </div>
              <div className="text-[12.5px] font-semibold text-[#6B6F8A] mt-1">
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Empty state ──────────────────────────────────────────── */}
      {totalCourses === 0 && (
        <div className="rounded-[22px] border border-dashed border-[#D6D8E4] bg-white px-8 py-16 text-center">
          <BookOpen className="w-10 h-10 text-[#C4C7D9] mx-auto mb-4" />
          <p className="text-[17px] font-extrabold text-[#1A1B2E]">
            No active enrolments yet
          </p>
          <p className="mt-2 text-[13.5px] text-[#9AA0B8] max-w-xs mx-auto">
            Once your administrator enrols you, your courses will appear here.
          </p>
          <Link
            href="/courses"
            className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-[12px] text-[13px] font-bold text-[#5B5BF0] bg-[#EEF0FF] transition-colors hover:bg-[#E0E3FF]"
          >
            Browse open curricula
          </Link>
        </div>
      )}

      {/* ── In-progress courses ───────────────────────────────────── */}
      {inProgress.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[17px] font-extrabold text-[#1A1B2E] mb-4">
            In progress
            <span className="ml-2 text-[13px] font-semibold text-[#9AA0B8]">
              {inProgress.length} course{inProgress.length !== 1 ? "s" : ""}
            </span>
          </h2>

          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}
          >
            {inProgress.map(({ course, progressPercent, completedLessons, totalLessons, classroomHref }, idx) => {
              const palette = PALETTE[idx % PALETTE.length];
              const tags = [course.grade_level, course.curriculum_tag].filter(Boolean) as string[];

              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  progressPercent={progressPercent}
                  completedLessons={completedLessons}
                  totalLessons={totalLessons}
                  classroomHref={classroomHref}
                  palette={palette}
                  tags={tags}
                  isComplete={false}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ── Completed courses ─────────────────────────────────────── */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-[17px] font-extrabold text-[#1A1B2E] mb-4">
            Completed
            <span className="ml-2 text-[13px] font-semibold text-[#9AA0B8]">
              {completed.length} course{completed.length !== 1 ? "s" : ""}
            </span>
          </h2>

          <div
            className="grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}
          >
            {completed.map(({ course, progressPercent, completedLessons, totalLessons, classroomHref }, idx) => {
              const palette = PALETTE[idx % PALETTE.length];
              const tags = [course.grade_level, course.curriculum_tag].filter(Boolean) as string[];

              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  progressPercent={progressPercent}
                  completedLessons={completedLessons}
                  totalLessons={totalLessons}
                  classroomHref={classroomHref}
                  palette={palette}
                  tags={tags}
                  isComplete
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Course card
// ---------------------------------------------------------------------------
type Palette = { grad: string; solid: string; bg: string };

function CourseCard({
  course,
  progressPercent,
  completedLessons,
  totalLessons,
  classroomHref,
  palette,
  tags,
  isComplete,
}: {
  course: CourseRow;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  classroomHref: string | null;
  palette: Palette;
  tags: string[];
  isComplete: boolean;
}) {
  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] overflow-hidden flex flex-col transition-shadow hover:shadow-lg"
      style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
    >
      {/* Thumbnail / gradient header */}
      <div
        className="h-[120px] relative flex items-center px-5"
        style={{ background: palette.grad }}
      >
        {/* decorative orb */}
        <div
          aria-hidden
          className="absolute -top-6 -right-5 w-[110px] h-[110px] rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,.14)" }}
        />

        {course.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : null}

        {/* course initial badge */}
        <div
          className="relative w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-white text-[22px] font-extrabold shrink-0"
          style={{ background: "rgba(255,255,255,.22)", backdropFilter: "blur(4px)" }}
        >
          {course.title.charAt(0).toUpperCase()}
        </div>

        {/* completion / progress badge */}
        {isComplete ? (
          <div className="absolute top-3 right-4 flex items-center gap-1.5 bg-[#10B981] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </div>
        ) : (
          <span
            className="absolute top-3 right-4 text-[11px] font-bold text-white px-2.5 py-1 rounded-full"
            style={{ background: "rgba(0,0,0,.22)" }}
          >
            {progressPercent}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {course.grade_level && (
              <span className="text-[11px] font-bold bg-[#1A1B2E] text-white px-2.5 py-0.5 rounded-full">
                {course.grade_level}
              </span>
            )}
            {course.curriculum_tag && (
              <span
                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: palette.bg,
                  color: palette.solid,
                  border: `1px solid ${palette.solid}22`,
                }}
              >
                {course.curriculum_tag}
              </span>
            )}
          </div>
        )}

        {/* title */}
        <h3 className="text-[16px] font-extrabold text-[#1A1B2E] leading-snug">
          {course.title}
        </h3>

        {/* progress bar + lesson count */}
        <div>
          <div className="flex items-center justify-between text-[12px] font-semibold text-[#6B6F8A] mb-1.5">
            <span>
              {completedLessons} of {totalLessons > 0 ? totalLessons : "—"} lessons
            </span>
            <span className="font-extrabold text-[#1A1B2E]">{progressPercent}%</span>
          </div>
          <div className="h-[8px] bg-[#EEF0F5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, background: palette.grad }}
            />
          </div>
          {totalLessons === 0 && (
            <p className="mt-1 text-[11px] text-[#9AA0B8]">
              Syllabus publishing in progress
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          {classroomHref ? (
            <Link
              href={classroomHref}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[12px] text-[13px] font-bold transition-colors"
              style={
                isComplete
                  ? { background: "#E7F8F1", color: "#0E9F6E" }
                  : { background: palette.bg, color: palette.solid }
              }
            >
              {isComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Review course
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Open classroom
                </>
              )}
            </Link>
          ) : (
            <p className="text-center text-[12px] font-medium text-[#9AA0B8]">
              Classroom publishing soon
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
