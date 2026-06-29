import {
  buildScholasticSummary,
  fetchChildDashboardData,
} from "@/lib/parent/queries";
import { unwrapOne } from "@/lib/dashboard/relations";
import { fetchLearningActivity } from "@/lib/dashboard/learning-activity";
import type { UserRole } from "@/lib/auth/roles";
import {
  computeActivityStreak,
  computeMonthAttendancePercent,
  computeWeeklyLessonGoal,
  fetchEnrolledCourseIds,
  fetchStudentAssessments,
  fetchStudentDueAssignments,
  fetchStudentLiveSessions,
  fetchStudentNavCounts,
  fetchTodayScheduleItems,
  formatAcademicYearLabel,
} from "@/lib/student/queries";
import { fetchTeacherCourseIds, fetchTeacherScheduleEvents } from "@/lib/teacher/queries";
import { createClient } from "@/lib/supabase/server";

export type LmsAiSessionContext = {
  userId: string;
  role: UserRole;
  displayName: string;
  dynamicVariables: Record<string, string | number | boolean>;
};

async function fetchParentChildren(parentId: string) {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("student_parent_relations")
    .select(
      `student_id,
       student:profiles!student_id ( id, full_name, email )`,
    )
    .eq("parent_id", parentId);

  return (rows ?? []).flatMap((row) => {
    const child = unwrapOne(
      row.student as
        | { id: string; full_name: string | null; email: string }
        | { id: string; full_name: string | null; email: string }[]
        | null,
    );
    return child ? [{ id: child.id, name: child.full_name?.trim() || child.email }] : [];
  });
}

async function fetchTeacherPendingCount(teacherId: string): Promise<number> {
  const supabase = await createClient();
  const courseIds = await fetchTeacherCourseIds(teacherId);
  if (courseIds.length === 0) return 0;

  const { data: assignments } = await supabase
    .from("assignments")
    .select("id")
    .in("course_id", courseIds)
    .eq("is_published", true);

  const assignmentIds = (assignments ?? []).map((row) => row.id as string);
  if (assignmentIds.length === 0) return 0;

  const { count } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("status", "submitted")
    .in("assignment_id", assignmentIds);

  return count ?? 0;
}

export async function fetchLmsSummary(session: {
  userId: string;
  role: UserRole;
  displayName: string;
}) {
  const { userId, role, displayName } = session;

  if (role === "student") {
    const [nav, due, activity, assessments, enrolledCourseIds] = await Promise.all([
      fetchStudentNavCounts(userId),
      fetchStudentDueAssignments(userId, 10),
      fetchLearningActivity(userId),
      fetchStudentAssessments(userId),
      fetchEnrolledCourseIds(userId),
    ]);

    const streak = computeActivityStreak(activity);
    const weeklyGoal = computeWeeklyLessonGoal(activity);
    const attendancePercent = computeMonthAttendancePercent(activity);
    const graded = assessments.assessments.filter(
      (item) => item.state === "completed" && item.score != null,
    );
    const avgGrade =
      graded.length > 0
        ? Math.round(
            graded.reduce((sum, item) => sum + (item.score ?? 0), 0) /
              graded.length,
          )
        : null;

    return {
      role,
      displayName,
      streakDays: streak,
      weeklyLessonsCompleted: weeklyGoal.done,
      weeklyLessonGoal: weeklyGoal.total,
      attendancePercent,
      openAssignments: nav.assignmentsDue,
      unreadMessages: nav.unreadMessages,
      pendingRevisions: nav.notifications - nav.unreadMessages,
      averageGradePercent: avgGrade,
      enrolledCourses: enrolledCourseIds.length,
      dueAssignmentsPreview: due.slice(0, 5).map((item) => ({
        title: item.title,
        course: item.courseTitle,
        dueLabel: item.dueLabel,
      })),
    };
  }

  if (role === "parent") {
    const children = await fetchParentChildren(userId);
    const childSummaries = await Promise.all(
      children.slice(0, 3).map(async (child) => {
        const data = await fetchChildDashboardData(child.id);
        const summary = buildScholasticSummary(
          data.completionPercent,
          data.timeline,
        );
        return {
          name: child.name,
          completionPercent: summary.completionPercent,
          averageGrade: summary.averageGrade,
          pendingRevisions: summary.pendingRevisions,
          assignmentsSubmitted: summary.assignmentsSubmitted,
        };
      }),
    );

    return {
      role,
      displayName,
      linkedChildrenCount: children.length,
      children: childSummaries,
    };
  }

  if (role === "teacher" || role === "admin") {
    const [courseIds, pendingGrading, schedule] = await Promise.all([
      fetchTeacherCourseIds(userId),
      fetchTeacherPendingCount(userId),
      fetchTeacherScheduleEvents(userId),
    ]);

    return {
      role,
      displayName,
      assignedCourses: courseIds.length,
      pendingGrading,
      upcomingEvents: schedule.slice(0, 5).map((event) => ({
        title: event.title,
        course: event.course,
        date: event.date,
        time: event.time,
        type: event.type,
      })),
    };
  }

  return { role, displayName };
}

export async function fetchLmsAssignments(session: {
  userId: string;
  role: UserRole;
}) {
  if (session.role === "student") {
    const items = await fetchStudentDueAssignments(session.userId, 15);
    return {
      role: session.role,
      count: items.length,
      assignments: items.map((item) => ({
        title: item.title,
        course: item.courseTitle,
        status: item.dueLabel,
        priority: item.priority,
        link: item.workspaceHref,
      })),
    };
  }

  if (session.role === "parent") {
    const children = await fetchParentChildren(session.userId);
    const byChild = await Promise.all(
      children.map(async (child) => {
        const due = await fetchStudentDueAssignments(child.id, 8);
        return {
          childName: child.name,
          assignments: due.map((item) => ({
            title: item.title,
            course: item.courseTitle,
            status: item.dueLabel,
          })),
        };
      }),
    );
    return { role: session.role, children: byChild };
  }

  if (session.role === "teacher" || session.role === "admin") {
    const pending = await fetchTeacherPendingCount(session.userId);
    const schedule = await fetchTeacherScheduleEvents(session.userId);
    const deadlines = schedule
      .filter((event) => event.type === "deadline")
      .slice(0, 10)
      .map((event) => ({
        title: event.title,
        course: event.course,
        date: event.date,
        time: event.time,
      }));
    return {
      role: session.role,
      pendingSubmissionsToGrade: pending,
      upcomingDeadlines: deadlines,
    };
  }

  return { role: session.role, assignments: [] };
}

export async function fetchLmsAttendance(session: {
  userId: string;
  role: UserRole;
}) {
  if (session.role === "student") {
    const activity = await fetchLearningActivity(session.userId);
    return {
      role: session.role,
      note: "Based on weekday lesson and assignment activity in the LMS.",
      attendancePercent: computeMonthAttendancePercent(activity),
      streakDays: computeActivityStreak(activity),
      activeDaysThisMonth: activity.filter(
        (day) => day.lessonsCompleted > 0 || day.assignmentsSubmitted > 0,
      ).length,
    };
  }

  if (session.role === "parent") {
    const children = await fetchParentChildren(session.userId);
    const rows = await Promise.all(
      children.map(async (child) => {
        const activity = await fetchLearningActivity(child.id);
        return {
          childName: child.name,
          attendancePercent: computeMonthAttendancePercent(activity),
          streakDays: computeActivityStreak(activity),
        };
      }),
    );
    return {
      role: session.role,
      note: "Based on weekday learning activity per linked child.",
      children: rows,
    };
  }

  return {
    role: session.role,
    note: "Attendance tools apply to students and parents with linked children.",
  };
}

export async function fetchLmsSchedule(session: {
  userId: string;
  role: UserRole;
}) {
  if (session.role === "student") {
    const [today, live] = await Promise.all([
      fetchTodayScheduleItems(session.userId),
      fetchStudentLiveSessions(session.userId),
    ]);
    const upcomingLive = live
      .filter((session) => new Date(session.startsAt) >= new Date())
      .slice(0, 8)
      .map((item) => ({
        title: item.title,
        course: item.courseTitle,
        startsAt: item.startsAt,
        meetingUrl: item.meetingUrl,
      }));

    return {
      role: session.role,
      today: today.map((item) => ({
        time: `${item.time} ${item.ampm}`.trim(),
        subject: item.subject,
        subtitle: item.subtitle,
        status: item.status,
      })),
      upcomingLiveClasses: upcomingLive,
    };
  }

  if (session.role === "parent") {
    const children = await fetchParentChildren(session.userId);
    const rows = await Promise.all(
      children.map(async (child) => {
        const today = await fetchTodayScheduleItems(child.id);
        return {
          childName: child.name,
          today: today.map((item) => ({
            time: `${item.time} ${item.ampm}`.trim(),
            subject: item.subject,
            subtitle: item.subtitle,
          })),
        };
      }),
    );
    return { role: session.role, children: rows };
  }

  if (session.role === "teacher" || session.role === "admin") {
    const events = await fetchTeacherScheduleEvents(session.userId);
    return {
      role: session.role,
      events: events.slice(0, 12).map((event) => ({
        title: event.title,
        course: event.course,
        type: event.type,
        date: event.date,
        time: event.time,
        students: event.students,
      })),
    };
  }

  return { role: session.role, schedule: [] };
}

export async function fetchLmsGrades(session: {
  userId: string;
  role: UserRole;
}) {
  const supabase = await createClient();

  if (session.role === "student") {
    const { assessments, subjectPerformance } = await fetchStudentAssessments(
      session.userId,
    );
    const graded = assessments
      .filter((item) => item.state === "completed" && item.score != null)
      .slice(0, 12)
      .map((item) => ({
        title: item.title,
        subject: item.subject,
        score: item.score,
        maxScore: item.maxScore,
        dateLabel: item.dateLabel,
      }));

    return {
      role: session.role,
      recentGrades: graded,
      subjectPerformance,
    };
  }

  if (session.role === "parent") {
    const children = await fetchParentChildren(session.userId);
    const rows = await Promise.all(
      children.map(async (child) => {
        const data = await fetchChildDashboardData(child.id);
        const summary = buildScholasticSummary(
          data.completionPercent,
          data.timeline,
        );
        const recent = data.timeline
          .filter((entry) => entry.status === "graded" && entry.grade != null)
          .slice(0, 8)
          .map((entry) => ({
            assignment: entry.assignmentTitle,
            course: entry.courseTitle,
            grade: entry.grade,
            status: entry.status,
          }));
        return {
          childName: child.name,
          averageGrade: summary.averageGrade,
          completionPercent: summary.completionPercent,
          recentGrades: recent,
        };
      }),
    );
    return { role: session.role, children: rows };
  }

  if (session.role === "teacher" || session.role === "admin") {
    const courseIds = await fetchTeacherCourseIds(session.userId);
    if (courseIds.length === 0) {
      return { role: session.role, courses: [] };
    }

    const { data: assignmentRows } = await supabase
      .from("assignments")
      .select("id")
      .in("course_id", courseIds)
      .eq("is_published", true);

    const assignmentIds = (assignmentRows ?? []).map((row) => row.id as string);
    if (assignmentIds.length === 0) {
      return { role: session.role, recentGradesGiven: [] };
    }

    const { data: rows } = await supabase
      .from("submissions")
      .select(
        `grade, status, graded_at,
         assignments ( title, courses ( title ) ),
         profiles!student_id ( full_name )`,
      )
      .eq("status", "graded")
      .not("grade", "is", null)
      .in("assignment_id", assignmentIds)
      .order("graded_at", { ascending: false })
      .limit(15);

    const graded = (rows ?? []).flatMap((row) => {
      const assignment = unwrapOne(
        row.assignments as
          | { title: string; courses: { title: string } | { title: string }[] | null }
          | { title: string; courses: { title: string } | { title: string }[] | null }[]
          | null,
      );
      const course = unwrapOne(assignment?.courses ?? null);
      const student = unwrapOne(
        row.profiles as
          | { full_name: string | null }
          | { full_name: string | null }[]
          | null,
      );
      if (!assignment) return [];
      return [
        {
          student: student?.full_name ?? "Student",
          assignment: assignment.title,
          course: course?.title ?? "Course",
          grade: row.grade as number,
          gradedAt: row.graded_at as string | null,
        },
      ];
    });

    return { role: session.role, recentGradesGiven: graded };
  }

  return { role: session.role, grades: [] };
}

export async function buildLmsAiSessionContext(session: {
  userId: string;
  role: UserRole;
  displayName: string;
}): Promise<LmsAiSessionContext> {
  const summary = await fetchLmsSummary(session);
  const dynamicVariables: Record<string, string | number | boolean> = {
    user_name: session.displayName,
    user_role: session.role,
  };

  if (session.role === "student" && "openAssignments" in summary) {
    dynamicVariables.open_assignments = summary.openAssignments ?? 0;
    dynamicVariables.attendance_percent = summary.attendancePercent ?? 0;
    dynamicVariables.streak_days = summary.streakDays ?? 0;
    dynamicVariables.unread_messages = summary.unreadMessages ?? 0;
    if (summary.averageGradePercent != null) {
      dynamicVariables.average_grade_percent = summary.averageGradePercent;
    }
  }

  if (session.role === "parent" && "linkedChildrenCount" in summary) {
    dynamicVariables.linked_children_count = summary.linkedChildrenCount ?? 0;
  }

  if (
    (session.role === "teacher" || session.role === "admin") &&
    "pendingGrading" in summary
  ) {
    dynamicVariables.assigned_courses = summary.assignedCourses ?? 0;
    dynamicVariables.pending_grading = summary.pendingGrading ?? 0;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", session.userId)
    .maybeSingle();

  const metadata =
    profile?.metadata && typeof profile.metadata === "object"
      ? (profile.metadata as Record<string, unknown>)
      : {};
  const batch =
    typeof metadata.batch_enrolled === "string" ? metadata.batch_enrolled : null;
  dynamicVariables.academic_year = formatAcademicYearLabel(batch);

  return {
    userId: session.userId,
    role: session.role,
    displayName: session.displayName,
    dynamicVariables,
  };
}
