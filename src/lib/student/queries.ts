import { redirect } from "next/navigation";

import type { LearningActivityDay } from "@/lib/dashboard/learning-activity";
import { unwrapOne } from "@/lib/dashboard/relations";
import { isSubmissionStatus } from "@/lib/dashboard/submission-status";
import { createClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Session helpers
// ---------------------------------------------------------------------------

export async function requireStudentId(nextPath: string): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user.id;
}

export async function fetchEnrolledCourseIds(studentId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("courses ( id )")
    .eq("student_id", studentId)
    .eq("status", "active");

  return (enrollmentRows ?? []).flatMap((row) => {
    const course = unwrapOne(row.courses as { id: string } | { id: string }[] | null);
    return course ? [course.id] : [];
  });
}

// ---------------------------------------------------------------------------
// Calendar events
// ---------------------------------------------------------------------------

export type StudentCalendarEventKind = "live" | "assignment" | "assessment";

export type StudentCalendarEvent = {
  id: string;
  title: string;
  kind: StudentCalendarEventKind;
  date: string;
  time?: string;
  subject?: string;
};

function formatEventTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function inferAssessmentKind(title: string): StudentCalendarEventKind {
  const lower = title.toLowerCase();
  if (lower.includes("quiz") || lower.includes("test") || lower.includes("exam")) {
    return "assessment";
  }
  return "assignment";
}

export async function fetchStudentCalendarEvents(
  studentId: string,
): Promise<StudentCalendarEvent[]> {
  const supabase = await createClient();
  const courseIds = await fetchEnrolledCourseIds(studentId);
  if (courseIds.length === 0) return [];

  const [{ data: assignmentRows }, { data: liveRows }] = await Promise.all([
    supabase
      .from("assignments")
      .select(
        `id, title, due_at,
         courses ( title )`,
      )
      .in("course_id", courseIds)
      .eq("is_published", true)
      .not("due_at", "is", null)
      .order("due_at", { ascending: true }),
    supabase
      .from("live_class_sessions")
      .select(
        `id, title, starts_at,
         courses ( title )`,
      )
      .in("course_id", courseIds)
      .eq("is_published", true)
      .gte("starts_at", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order("starts_at", { ascending: true }),
  ]);

  const assignmentEvents: StudentCalendarEvent[] = (assignmentRows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as { title: string } | { title: string }[] | null,
    );
    const dueAt = row.due_at as string;
    return {
      id: `assignment-${row.id}`,
      title: row.title,
      kind: inferAssessmentKind(row.title),
      date: dueAt.slice(0, 10),
      time: formatEventTime(dueAt),
      subject: course?.title,
    };
  });

  const liveEvents: StudentCalendarEvent[] = (liveRows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as { title: string } | { title: string }[] | null,
    );
    const startsAt = row.starts_at as string;
    return {
      id: `live-${row.id}`,
      title: row.title,
      kind: "live",
      date: startsAt.slice(0, 10),
      time: formatEventTime(startsAt),
      subject: course?.title,
    };
  });

  return [...assignmentEvents, ...liveEvents].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
}

// ---------------------------------------------------------------------------
// Attendance (derived from LMS activity)
// ---------------------------------------------------------------------------

export type AttendanceDayStatus =
  | "present"
  | "absent"
  | "late"
  | "holiday"
  | "weekend"
  | "future";

export type MonthlyAttendance = {
  year: number;
  month: number;
  days: Record<number, AttendanceDayStatus>;
  stats: {
    present: number;
    absent: number;
    late: number;
    holidays: number;
    schoolDays: number;
    pct: number;
  };
};

function isWeekendDate(year: number, month: number, day: number): boolean {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}

export async function fetchStudentMonthlyAttendance(
  studentId: string,
  year: number,
  month: number,
): Promise<MonthlyAttendance> {
  const { fetchLearningActivity } = await import("@/lib/dashboard/learning-activity");
  const activity = await fetchLearningActivity(studentId);
  const activeDates = new Set(
    activity
      .filter((d) => d.lessonsCompleted > 0 || d.assignmentsSubmitted > 0)
      .map((d) => d.date),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Record<number, AttendanceDayStatus> = {};

  let present = 0;
  let absent = 0;
  let late = 0;
  let holidays = 0;
  let schoolDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    cellDate.setHours(0, 0, 0, 0);

    if (isWeekendDate(year, month, d)) {
      days[d] = "weekend";
      continue;
    }

    if (cellDate > today) {
      days[d] = "future";
      continue;
    }

    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    schoolDays++;

    if (activeDates.has(iso)) {
      days[d] = "present";
      present++;
    } else {
      days[d] = "absent";
      absent++;
    }
  }

  const pct = schoolDays > 0 ? Math.round((present / schoolDays) * 100) : 100;

  return {
    year,
    month,
    days,
    stats: { present, absent, late, holidays, schoolDays, pct },
  };
}

// ---------------------------------------------------------------------------
// Assessments (published assignments + submission state)
// ---------------------------------------------------------------------------

export type AssessmentType = "quiz" | "test" | "mock_exam";
export type AssessmentState = "upcoming" | "available" | "completed" | "locked";

export type StudentAssessment = {
  id: string;
  title: string;
  subject: string;
  subjectKey: string;
  type: AssessmentType;
  state: AssessmentState;
  dateLabel: string;
  score: number | null;
  maxScore: number;
  passMark: number;
  courseId: string;
  lessonId: string | null;
};

export type SubjectPerformance = {
  name: string;
  score: number;
  tests: number;
};

function slugSubjectKey(value: string | null | undefined): string {
  if (!value) return "general";
  const lower = value.toLowerCase();
  if (lower.includes("math")) return "math";
  if (lower.includes("science") || lower.includes("physics") || lower.includes("chem")) {
    return "science";
  }
  if (lower.includes("english")) return "english";
  if (lower.includes("code") || lower.includes("python") || lower.includes("program")) {
    return "coding";
  }
  if (lower.includes("ai")) return "ai";
  if (lower.includes("history")) return "history";
  return "general";
}

function inferAssessmentType(title: string): AssessmentType {
  const lower = title.toLowerCase();
  if (lower.includes("mock")) return "mock_exam";
  if (lower.includes("quiz")) return "quiz";
  return "test";
}

function formatDueLabel(dueAt: string | null): string {
  if (!dueAt) return "Open";
  const due = new Date(dueAt);
  const now = new Date();
  const dueDay = due.toISOString().slice(0, 10);
  const today = now.toISOString().slice(0, 10);
  if (dueDay === today) return "Due today";
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function mapAssessmentState(
  status: string | undefined,
  dueAt: string | null,
): AssessmentState {
  if (status === "graded" || status === "returned") return "completed";
  if (status === "submitted") return "upcoming";

  const now = Date.now();
  if (dueAt) {
    const due = new Date(dueAt).getTime();
    if (due <= now) return "available";
    const dayMs = 24 * 60 * 60 * 1000;
    if (due - now <= dayMs) return "available";
    return "upcoming";
  }

  return "available";
}

export async function fetchStudentAssessments(
  studentId: string,
): Promise<{ assessments: StudentAssessment[]; subjectPerformance: SubjectPerformance[] }> {
  const supabase = await createClient();
  const courseIds = await fetchEnrolledCourseIds(studentId);
  if (courseIds.length === 0) {
    return { assessments: [], subjectPerformance: [] };
  }

  const { data: assignmentRows } = await supabase
    .from("assignments")
    .select(
      `id, title, max_points, due_at, course_id, lesson_id,
       courses ( title, curriculum_tag )`,
    )
    .in("course_id", courseIds)
    .eq("is_published", true)
    .order("due_at", { ascending: true, nullsFirst: false });

  const assignmentIds = (assignmentRows ?? []).map((r) => r.id);
  const { data: submissionRows } =
    assignmentIds.length > 0
      ? await supabase
          .from("submissions")
          .select("assignment_id, status, grade")
          .eq("student_id", studentId)
          .in("assignment_id", assignmentIds)
      : { data: [] };

  const submissionByAssignment = new Map(
    (submissionRows ?? []).map((s) => [s.assignment_id, s]),
  );

  const assessments: StudentAssessment[] = (assignmentRows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as
        | { title: string; curriculum_tag: string | null }
        | { title: string; curriculum_tag: string | null }[]
        | null,
    );
    const submission = submissionByAssignment.get(row.id);
    const status =
      submission && isSubmissionStatus(submission.status) ? submission.status : undefined;
    const passMark = Math.round((row.max_points as number) * 0.5);

    return {
      id: row.id,
      title: row.title,
      subject: course?.title ?? "Course",
      subjectKey: slugSubjectKey(course?.curriculum_tag ?? course?.title),
      type: inferAssessmentType(row.title),
      state: mapAssessmentState(status, row.due_at as string | null),
      dateLabel: formatDueLabel(row.due_at as string | null),
      score: submission?.grade ?? null,
      maxScore: row.max_points as number,
      passMark,
      courseId: row.course_id as string,
      lessonId: row.lesson_id as string | null,
    };
  });

  const gradedBySubject = new Map<string, { total: number; count: number }>();
  for (const a of assessments) {
    if (a.state !== "completed" || a.score == null) continue;
    const bucket = gradedBySubject.get(a.subject) ?? { total: 0, count: 0 };
    bucket.total += a.score;
    bucket.count += 1;
    gradedBySubject.set(a.subject, bucket);
  }

  const subjectPerformance: SubjectPerformance[] = [...gradedBySubject.entries()]
    .map(([name, { total, count }]) => ({
      name,
      score: Math.round(total / count),
      tests: count,
    }))
    .sort((a, b) => b.score - a.score);

  return { assessments, subjectPerformance };
}

// ---------------------------------------------------------------------------
// Live class sessions
// ---------------------------------------------------------------------------

export type LiveClassSession = {
  id: string;
  title: string;
  courseTitle: string;
  startsAt: string;
  durationMinutes: number;
  meetingUrl: string | null;
  recordingUrl: string | null;
  status: string;
};

export async function fetchStudentLiveSessions(
  studentId: string,
): Promise<LiveClassSession[]> {
  const supabase = await createClient();
  const courseIds = await fetchEnrolledCourseIds(studentId);
  if (courseIds.length === 0) return [];

  const { data: rows } = await supabase
    .from("live_class_sessions")
    .select(
      `id, title, starts_at, duration_minutes, meeting_url, recording_url, status,
       courses ( title )`,
    )
    .in("course_id", courseIds)
    .eq("is_published", true)
    .order("starts_at", { ascending: true });

  return (rows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as { title: string } | { title: string }[] | null,
    );
    return {
      id: row.id as string,
      title: row.title as string,
      courseTitle: course?.title ?? "Course",
      startsAt: row.starts_at as string,
      durationMinutes: row.duration_minutes as number,
      meetingUrl: (row.meeting_url as string | null) ?? null,
      recordingUrl: (row.recording_url as string | null) ?? null,
      status: row.status as string,
    };
  });
}

// ---------------------------------------------------------------------------
// Dashboard home widgets
// ---------------------------------------------------------------------------

export type TodayScheduleItem = {
  id: string;
  time: string;
  ampm: string;
  subject: string;
  subtitle: string;
  state: "live" | "soon" | "done";
  status: string;
  meetingUrl: string | null;
  subjectKey: string;
};

export type NotificationPreview = {
  kind: "graded" | "returned" | "due";
  text: string;
  timeLabel: string;
};

export type AttendanceMiniDay = {
  status: "present" | "absent" | "holiday";
  label: string;
};

function dashboardSlugSubjectKey(value: string | null | undefined): string {
  if (!value) return "general";
  const lower = value.toLowerCase();
  if (lower.includes("math")) return "math";
  if (lower.includes("science")) return "science";
  if (lower.includes("english")) return "english";
  if (lower.includes("code") || lower.includes("python")) return "coding";
  if (lower.includes("ai")) return "ai";
  if (lower.includes("history")) return "history";
  return "general";
}

function isWeekdayDate(date: Date): boolean {
  const d = date.getDay();
  return d !== 0 && d !== 6;
}

export function computeActivityStreak(activity: LearningActivityDay[]): number {
  const activeDates = new Set(
    activity
      .filter((d) => d.lessonsCompleted > 0 || d.assignmentsSubmitted > 0)
      .map((d) => d.date),
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (activeDates.has(iso)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (streak === 0 && isWeekdayDate(cursor)) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }

  return streak;
}

export function computeWeeklyLessonGoal(activity: LearningActivityDay[]): {
  done: number;
  total: number;
} {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  const done = activity
    .filter((d) => {
      const date = new Date(d.date + "T00:00:00");
      return date >= weekStart && d.lessonsCompleted > 0;
    })
    .reduce((sum, d) => sum + d.lessonsCompleted, 0);

  return { done, total: 7 };
}

export function computeMonthAttendancePercent(activity: LearningActivityDay[]): number {
  const activeDates = new Set(
    activity
      .filter((d) => d.lessonsCompleted > 0 || d.assignmentsSubmitted > 0)
      .map((d) => d.date),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let schoolDays = 0;
  let present = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const cell = new Date(year, month, d);
    if (!isWeekdayDate(cell) || cell > today) continue;
    schoolDays++;
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (activeDates.has(iso)) present++;
  }

  return schoolDays > 0 ? Math.round((present / schoolDays) * 100) : 100;
}

export function buildLast30WeekdayAttendance(
  activity: LearningActivityDay[],
): AttendanceMiniDay[] {
  const activeDates = new Set(
    activity
      .filter((d) => d.lessonsCompleted > 0 || d.assignmentsSubmitted > 0)
      .map((d) => d.date),
  );

  const days: AttendanceMiniDay[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (days.length < 30) {
    if (isWeekdayDate(cursor)) {
      const iso = cursor.toISOString().slice(0, 10);
      const present = activeDates.has(iso);
      days.unshift({
        status: present ? "present" : "absent",
        label: `${cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" })} — ${present ? "Active" : "No activity"}`,
      });
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return days;
}

function splitTimeParts(iso: string): { time: string; ampm: string } {
  const formatted = new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const parts = formatted.split(" ");
  return { time: parts[0] ?? formatted, ampm: parts[1] ?? "" };
}

function liveSessionState(session: LiveClassSession, now: Date): TodayScheduleItem["state"] {
  const start = new Date(session.startsAt);
  const end = new Date(start.getTime() + session.durationMinutes * 60 * 1000);
  if (now >= start && now <= end) return "live";
  if (now > end) return "done";
  return "soon";
}

export async function fetchTodayScheduleItems(
  studentId: string,
): Promise<TodayScheduleItem[]> {
  const supabase = await createClient();
  const courseIds = await fetchEnrolledCourseIds(studentId);
  if (courseIds.length === 0) return [];

  const todayKey = new Date().toISOString().slice(0, 10);
  const dayStart = `${todayKey}T00:00:00.000Z`;
  const dayEnd = `${todayKey}T23:59:59.999Z`;
  const now = new Date();

  const [{ data: liveRows }, { data: assignmentRows }] = await Promise.all([
    supabase
      .from("live_class_sessions")
      .select(`id, title, starts_at, duration_minutes, meeting_url, courses ( title, curriculum_tag )`)
      .in("course_id", courseIds)
      .eq("is_published", true)
      .gte("starts_at", dayStart)
      .lte("starts_at", dayEnd)
      .order("starts_at", { ascending: true }),
    supabase
      .from("assignments")
      .select(`id, title, due_at, courses ( title, curriculum_tag )`)
      .in("course_id", courseIds)
      .eq("is_published", true)
      .gte("due_at", dayStart)
      .lte("due_at", dayEnd)
      .order("due_at", { ascending: true }),
  ]);

  const liveItems: TodayScheduleItem[] = (liveRows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as
        | { title: string; curriculum_tag: string | null }
        | { title: string; curriculum_tag: string | null }[]
        | null,
    );
    const session: LiveClassSession = {
      id: row.id as string,
      title: row.title as string,
      courseTitle: course?.title ?? "Course",
      startsAt: row.starts_at as string,
      durationMinutes: row.duration_minutes as number,
      meetingUrl: (row.meeting_url as string | null) ?? null,
      recordingUrl: null,
      status: "scheduled",
    };
    const state = liveSessionState(session, now);
    const { time, ampm } = splitTimeParts(session.startsAt);
    return {
      id: `live-${session.id}`,
      time,
      ampm,
      subject: session.title,
      subtitle: `Live · ${session.courseTitle}`,
      state,
      status: state === "live" ? "Live now" : state === "done" ? "Completed" : "Upcoming",
      meetingUrl: session.meetingUrl,
      subjectKey: dashboardSlugSubjectKey(course?.curriculum_tag ?? course?.title),
    };
  });

  const dueItems: TodayScheduleItem[] = (assignmentRows ?? []).map((row) => {
    const course = unwrapOne(
      row.courses as
        | { title: string; curriculum_tag: string | null }
        | { title: string; curriculum_tag: string | null }[]
        | null,
    );
    const dueAt = row.due_at as string;
    const { time, ampm } = splitTimeParts(dueAt);
    return {
      id: `due-${row.id}`,
      time,
      ampm,
      subject: row.title as string,
      subtitle: `Due · ${course?.title ?? "Course"}`,
      state: "soon" as const,
      status: "Due today",
      meetingUrl: null,
      subjectKey: dashboardSlugSubjectKey(course?.curriculum_tag ?? course?.title),
    };
  });

  return [...liveItems, ...dueItems].sort((a, b) =>
    `${a.time} ${a.ampm}`.localeCompare(`${b.time} ${b.ampm}`),
  );
}

export async function fetchNotificationPreviews(
  studentId: string,
  limit = 4,
): Promise<NotificationPreview[]> {
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("submissions")
    .select(
      `id, status, grade, updated_at,
       assignments ( title, courses ( title ) )`,
    )
    .eq("student_id", studentId)
    .in("status", ["graded", "returned"])
    .order("updated_at", { ascending: false })
    .limit(limit);

  return (rows ?? []).map((row) => {
    const assignment = unwrapOne(
      row.assignments as
        | { title: string; courses: { title: string } | { title: string }[] | null }
        | { title: string; courses: { title: string } | { title: string }[] | null }[]
        | null,
    );
    const isGraded = row.status === "graded";
    return {
      kind: isGraded ? ("graded" as const) : ("returned" as const),
      text: isGraded
        ? `${assignment?.title ?? "Assignment"} graded${row.grade != null ? ` — ${row.grade}%` : ""}`
        : `${assignment?.title ?? "Assignment"} returned for revision`,
      timeLabel: new Date(row.updated_at as string).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    };
  });
}

export function buildWeeklyHoursFromActivity(
  activity: LearningActivityDay[],
): { day: string; hours: number }[] {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);

  const counts = Array(7).fill(0) as number[];

  for (const entry of activity) {
    const date = new Date(entry.date + "T00:00:00");
    if (date < weekStart) continue;
    const dayIndex = (date.getDay() + 6) % 7;
    counts[dayIndex] += entry.lessonsCompleted;
  }

  return labels.map((day, i) => ({
    day,
    hours: +(counts[i]! * 0.5).toFixed(1),
  }));
}

export function buildQuizScoreTrend(grades: number[]): number[] {
  if (grades.length === 0) return [];
  return grades.slice(-7);
}

export function buildSubjectStatsForCharts(
  rows: { courseTitle: string; grade: number }[],
): { name: string; score: number; grad: string }[] {
  const palette = [
    "linear-gradient(135deg,#6E8BFF,#3B5BFF)",
    "linear-gradient(135deg,#34D399,#0E9F6E)",
    "linear-gradient(135deg,#FBBF24,#F59E0B)",
    "linear-gradient(135deg,#A78BFA,#7C3AED)",
    "linear-gradient(135deg,#22D3EE,#0891B2)",
  ];

  const byCourse = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const bucket = byCourse.get(row.courseTitle) ?? { total: 0, count: 0 };
    bucket.total += row.grade;
    bucket.count += 1;
    byCourse.set(row.courseTitle, bucket);
  }

  return [...byCourse.entries()]
    .map(([name, { total, count }], index) => ({
      name,
      score: Math.round(total / count),
      grad: palette[index % palette.length]!,
    }))
    .slice(0, 5);
}
