import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";

import { AiTutorCard } from "@/components/student/ai-tutor-card";
import { AttendanceMiniCard } from "@/components/student/attendance-mini-card";
import { BadgesSection } from "@/components/student/badges-section";
import { ContinueLearning } from "@/components/student/continue-learning";
import { HeroBanner } from "@/components/student/hero-banner";
import { NotificationsCard } from "@/components/student/notifications-card";
import { PerformanceCharts } from "@/components/student/performance-charts";
import {
  PendingSubmissionsCard,
  type PendingItem,
} from "@/components/student/pending-submissions-card";
import { StatRingCard, type StatRingCardProps } from "@/components/student/stat-ring-card";
import { TodaysSchedule } from "@/components/student/todays-schedule";
import {
  computeProgressPercent,
  fetchCompletedLessonsByEnrollment,
  fetchLessonTotalsByCourse,
} from "@/lib/dashboard/course-progress";
import { unwrapOne } from "@/lib/dashboard/relations";
import {
  isSubmissionStatus,
  type SubmissionStatus,
} from "@/lib/dashboard/submission-status";
import { fetchFirstLessonIdForCourse } from "@/lib/student/workspace";
import { createClient } from "@/lib/supabase/server";

import { RevisionAlertRibbon } from "./revision-alert-ribbon";

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

type RawSubmissionMetricRow = {
  status: string;
  grade: number | null;
};

type RawFeedbackRow = {
  id: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  submitted_at: string | null;
  updated_at: string;
  assignments: {
    course_id: string;
    lesson_id: string | null;
    title: string;
    courses:
      | { id: string; title: string }
      | { id: string; title: string }[]
      | null;
    lessons:
      | { id: string; title: string }
      | { id: string; title: string }[]
      | null;
  } | {
    course_id: string;
    lesson_id: string | null;
    title: string;
    courses:
      | { id: string; title: string }
      | { id: string; title: string }[]
      | null;
    lessons:
      | { id: string; title: string }
      | { id: string; title: string }[]
      | null;
  }[] | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTodayDate(): string {
  const d = new Date();
  const weekday = d.toLocaleDateString(undefined, { weekday: "long" });
  const rest = d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  return `${weekday} · ${rest}`;
}

function averageRounded(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function feedbackSortTimestamp(row: RawFeedbackRow): number {
  const iso = row.graded_at ?? row.submitted_at ?? row.updated_at;
  return iso ? new Date(iso).getTime() : 0;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function StudentHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/student");
  }

  // ------------------------------------------------------------------
  // Parallel data fetching
  // ------------------------------------------------------------------
  const [
    { data: profile },
    { data: enrollmentRows },
    { data: metricSubmissionRows },
    { data: feedbackSubmissionRows },
    { count: returnedRevisionCount },
    { data: pendingSubmissionRows },
  ] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase
      .from("enrollments")
      .select(
        `id, courses ( id, title, slug, curriculum_tag, grade_level, thumbnail_url )`,
      )
      .eq("student_id", user.id)
      .eq("status", "active"),
    supabase
      .from("submissions")
      .select("status, grade")
      .eq("student_id", user.id)
      .in("status", ["graded", "returned"]),
    supabase
      .from("submissions")
      .select(`
        id, status, grade, feedback, graded_at, submitted_at, updated_at,
        assignments (
          course_id, lesson_id, title,
          courses ( id, title ),
          lessons  ( id, title )
        )
      `)
      .eq("student_id", user.id)
      .in("status", ["graded", "returned"])
      .order("updated_at", { ascending: false })
      .limit(12),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("student_id", user.id)
      .eq("status", "returned"),
    supabase
      .from("submissions")
      .select(`
        id, status, submitted_at,
        assignments (
          title,
          courses ( id, title ),
          lessons  ( id, title )
        )
      `)
      .eq("student_id", user.id)
      .eq("status", "submitted")
      .order("submitted_at", { ascending: true })
      .limit(5),
  ]);

  // ------------------------------------------------------------------
  // Enrollments → courses with progress
  // ------------------------------------------------------------------
  const enrollments =
    enrollmentRows?.flatMap((row) => {
      const course = unwrapOne(row.courses as CourseRow | CourseRow[] | null);
      if (!course) return [];
      return [{ enrollmentId: row.id, course }];
    }) ?? [];

  const enrollmentIds = enrollments.map((r) => r.enrollmentId);
  const courseIds = enrollments.map((r) => r.course.id);

  const [lessonTotals, completedByEnrollment] = await Promise.all([
    fetchLessonTotalsByCourse(supabase, courseIds),
    fetchCompletedLessonsByEnrollment(supabase, enrollmentIds),
  ]);

  const coursesWithMeta = await Promise.all(
    enrollments.map(async ({ enrollmentId, course }) => {
      const totalLessons = lessonTotals.get(course.id) ?? 0;
      const completedLessons = completedByEnrollment.get(enrollmentId) ?? 0;
      const progressPercent = computeProgressPercent(
        completedLessons,
        totalLessons,
      );
      const lessonId =
        (await fetchFirstLessonIdForCourse(course.id)) ?? null;
      const classroomHref = lessonId
        ? `/student/courses/${course.id}/lessons/${lessonId}`
        : null;
      return { enrollmentId, course, progressPercent, totalLessons, classroomHref };
    }),
  );

  // ------------------------------------------------------------------
  // Aggregate stats
  // ------------------------------------------------------------------
  const progressValues = coursesWithMeta.map((r) => r.progressPercent);
  const averageCourseProgress =
    progressValues.length > 0 ? averageRounded(progressValues) ?? 0 : 0;

  const completedLessonsTotal = [...completedByEnrollment.values()].reduce(
    (sum, c) => sum + c,
    0,
  );

  const gradedScores = ((metricSubmissionRows ?? []) as RawSubmissionMetricRow[])
    .filter((r) => r.status === "graded" && r.grade != null)
    .map((r) => r.grade as number);

  const gpaAverage = averageRounded(gradedScores);
  const actionItems = returnedRevisionCount ?? 0;

  // ------------------------------------------------------------------
  // Pending assignments (submitted, awaiting grading)
  // ------------------------------------------------------------------
  const pendingItems: PendingItem[] = ((pendingSubmissionRows ?? []) as {
    id: string;
    status: string;
    submitted_at: string | null;
    assignments: {
      title: string;
      courses: { id: string; title: string } | { id: string; title: string }[] | null;
      lessons: { id: string; title: string } | { id: string; title: string }[] | null;
    } | {
      title: string;
      courses: { id: string; title: string } | { id: string; title: string }[] | null;
      lessons: { id: string; title: string } | { id: string; title: string }[] | null;
    }[] | null;
  }[]).flatMap((row) => {
    if (!isSubmissionStatus(row.status)) return [];
    const assignment = unwrapOne(row.assignments);
    if (!assignment) return [];
    const course = unwrapOne(assignment.courses);
    const lesson = unwrapOne(assignment.lessons);
    const submittedAt = row.submitted_at ? new Date(row.submitted_at) : null;
    const daysAgo = submittedAt
      ? Math.floor((Date.now() - submittedAt.getTime()) / 86400000)
      : null;
    const dueLabel =
      daysAgo === null
        ? "Submitted"
        : daysAgo === 0
          ? "Today"
          : daysAgo === 1
            ? "Yesterday"
            : `${daysAgo}d ago`;
    const priority: PendingItem["priority"] =
      daysAgo === null || daysAgo <= 1
        ? "high"
        : daysAgo <= 3
          ? "medium"
          : "low";
    const lessonId = lesson?.id ?? null;
    const courseId = course?.id ?? null;
    const workspaceHref =
      courseId && lessonId
        ? `/student/courses/${courseId}/lessons/${lessonId}`
        : null;
    return [
      {
        id: row.id,
        title: assignment.title,
        courseTitle: course?.title ?? "Course",
        dueLabel,
        priority,
        workspaceHref,
      },
    ];
  });

  // ------------------------------------------------------------------
  // Recent feedback (graded/returned) – for revisions ribbon
  // ------------------------------------------------------------------
  const recentFeedback = ((feedbackSubmissionRows ?? []) as RawFeedbackRow[])
    .filter((r): r is RawFeedbackRow => {
      if (!isSubmissionStatus(r.status)) return false;
      const s = r.status as SubmissionStatus;
      return s === "graded" || s === "returned";
    })
    .sort((a, b) => feedbackSortTimestamp(b) - feedbackSortTimestamp(a))
    .slice(0, 3);

  void recentFeedback; // kept for RevisionAlertRibbon

  // ------------------------------------------------------------------
  // Static / profile data
  // ------------------------------------------------------------------
  const displayName = profile?.full_name?.trim() || "Student";
  const initial = displayName.charAt(0).toUpperCase();
  void initial;
  const todayLabel = formatTodayDate();

  // Grade from first course's grade_level field (best-effort)
  const gradeLabel =
    enrollments[0]?.course.grade_level ?? "Student";
  const yearLabel = "2025–2026";
  const streakDays = 24; // TODO: wire to real streak table
  const goalDone = 5;
  const goalTotal = 7;
  const motivation =
    "You're on a roll — 3 lessons left to hit this week's goal. Small steps, big results. 🚀";

  // ------------------------------------------------------------------
  // Stat cards config
  // ------------------------------------------------------------------
  const statCards: StatRingCardProps[] = [
    {
      kind: "ring",
      percent: averageCourseProgress,
      ringColor: "#6366F1",
      label: "Overall progress",
      trend: "+6%",
    },
    {
      kind: "icon",
      big: `${coursesWithMeta.filter((c) => c.progressPercent >= 100).length}/${coursesWithMeta.length}`,
      icon: <BookOpen className="w-[23px] h-[23px]" style={{ color: "#10B981" }} />,
      iconBg: "#E7F8F1",
      label: "Courses completed",
      trend: "+2",
    },
    {
      kind: "icon",
      big: String(completedLessonsTotal),
      icon: (
        <svg
          className="w-[23px] h-[23px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="1" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
      iconBg: "#F3EEFE",
      label: "Lessons completed",
      trend: "+5",
    },
    {
      kind: "ring",
      percent: 96,
      ringColor: "#F59E0B",
      label: "Attendance rate",
      trend: "+1%",
    },
    {
      kind: "ring",
      percent: gpaAverage ?? 0,
      ringColor: "#F43F5E",
      label: "Average score",
      trend: "+4%",
    },
  ];

  // ------------------------------------------------------------------
  // Continue-learning courses (top 5)
  // ------------------------------------------------------------------
  const continueCourses = coursesWithMeta.slice(0, 5).map(
    ({ course, progressPercent, classroomHref }) => ({
      courseId: course.id,
      title: course.title,
      subtitle: [course.grade_level, course.curriculum_tag]
        .filter(Boolean)
        .join(" · ") || "Enrolled course",
      progressPercent,
      classroomHref,
      thumbnailUrl: course.thumbnail_url,
    }),
  );

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <div
      className="mx-auto w-full sd-float-up"
      style={{ maxWidth: 1320, padding: "28px 32px 60px" }}
    >
        {/* revision ribbon (action required) */}
        {actionItems > 0 && (
          <div className="mb-5">
            <RevisionAlertRibbon count={actionItems} />
          </div>
        )}

        {/* ── Section 1: Hero banner ───────────────────────────────── */}
        <HeroBanner
          name={displayName}
          gradeLabel={gradeLabel}
          yearLabel={yearLabel}
          streakDays={streakDays}
          goalDone={goalDone}
          goalTotal={goalTotal}
          todayLabel={todayLabel}
          motivation={motivation}
        />

        {/* ── Section 2: Stats grid ────────────────────────────────── */}
        <div
          className="mt-5 grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(178px,1fr))" }}
        >
          {statCards.map((card, i) => (
            <StatRingCard key={i} {...card} />
          ))}
        </div>

        {/* ── Sections 3 + 4: Main two-column layout ───────────────── */}
        <div className="mt-5 flex flex-wrap gap-5">
          {/* LEFT COLUMN */}
          <div
            className="flex-1 min-w-0 flex flex-col gap-5"
            style={{ flexBasis: "540px" }}
          >
            {/* 3a: Today's schedule */}
            <TodaysSchedule />

            {/* 3b: Continue learning */}
            <ContinueLearning courses={continueCourses} />

            {/* 3c: Performance analytics */}
            <PerformanceCharts />
          </div>

          {/* RIGHT COLUMN */}
          <div
            className="flex-1 min-w-0 flex flex-col gap-5"
            style={{ flexBasis: "300px" }}
          >
            {/* 4a: AI Tutor */}
            <AiTutorCard />

            {/* 4b: Pending assignments */}
            <PendingSubmissionsCard items={pendingItems} />

            {/* 4c: Notifications */}
            <NotificationsCard />

            {/* 4c: Attendance mini */}
            <AttendanceMiniCard />
          </div>
        </div>

        {/* ── Section 5: Badges & achievements ─────────────────────── */}
        <div className="mt-5">
          <BadgesSection />
        </div>
    </div>
  );
}
