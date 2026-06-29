import type { LearningActivityDay } from "@/lib/dashboard/learning-activity";

export type BadgeCategory = "academic" | "streak" | "project" | "special";

export type StudentBadge = {
  id: string;
  name: string;
  description: string;
  earnedDate: string | null;
  earned: boolean;
  category: BadgeCategory;
  grad: string;
  shadow: string;
};

export type StudentCertificate = {
  id: string;
  title: string;
  course: string;
  issuedDate: string;
  grade: string;
  grad: string;
};

export type AchievementCourseProgress = {
  courseId: string;
  courseTitle: string;
  curriculumTag: string | null;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
};

export type AchievementGradedSubmission = {
  grade: number;
  courseTitle: string;
  curriculumTag: string | null;
  assignmentTitle: string;
  gradedAt: string | null;
};

export type AchievementSnapshot = {
  streakDays: number;
  totalLessonsCompleted: number;
  maxLessonsInOneDay: number;
  submittedAssignmentCount: number;
  gradedSubmissions: AchievementGradedSubmission[];
  courseProgress: AchievementCourseProgress[];
  activity: LearningActivityDay[];
};

const SCHOLAR_THRESHOLD = 8;

const BADGE_STYLES: Record<
  string,
  { grad: string; shadow: string; category: BadgeCategory }
> = {
  "math-whiz": {
    grad: "linear-gradient(135deg,#FBBF24,#F59E0B)",
    shadow: "rgba(245,158,11,.35)",
    category: "academic",
  },
  "streak-30": {
    grad: "linear-gradient(135deg,#FB7185,#E11D48)",
    shadow: "rgba(244,63,94,.3)",
    category: "streak",
  },
  "code-master": {
    grad: "linear-gradient(135deg,#A78BFA,#7C3AED)",
    shadow: "rgba(139,92,246,.3)",
    category: "project",
  },
  "science-star": {
    grad: "linear-gradient(135deg,#34D399,#0E9F6E)",
    shadow: "rgba(16,185,129,.35)",
    category: "academic",
  },
  "history-buff": {
    grad: "linear-gradient(135deg,#FB7185,#E11D48)",
    shadow: "rgba(244,63,94,.3)",
    category: "academic",
  },
  "ai-explorer": {
    grad: "linear-gradient(135deg,#22D3EE,#0891B2)",
    shadow: "rgba(6,182,212,.35)",
    category: "academic",
  },
  bookworm: {
    grad: "linear-gradient(135deg,#6E8BFF,#3B5BFF)",
    shadow: "rgba(99,102,241,.3)",
    category: "special",
  },
  scholar: {
    grad: "linear-gradient(135deg,#FBBF24,#F59E0B)",
    shadow: "rgba(245,158,11,.35)",
    category: "special",
  },
  "speed-learner": {
    grad: "linear-gradient(135deg,#FBBF24,#F59E0B)",
    shadow: "rgba(245,158,11,.3)",
    category: "streak",
  },
  "top-performer": {
    grad: "linear-gradient(135deg,#6366F1,#8B5CF6)",
    shadow: "rgba(99,102,241,.35)",
    category: "special",
  },
};

const CERT_GRADS = [
  "linear-gradient(135deg,#6E8BFF,#3B5BFF)",
  "linear-gradient(135deg,#A78BFA,#7C3AED)",
  "linear-gradient(135deg,#34D399,#0E9F6E)",
  "linear-gradient(135deg,#22D3EE,#0891B2)",
  "linear-gradient(135deg,#FBBF24,#F59E0B)",
];

function tagIncludes(value: string | null | undefined, needle: string): boolean {
  return (value ?? "").toLowerCase().includes(needle);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function formatEarnedDate(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function gradeLabel(score: number | null): string {
  if (score == null) return "Completed";
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  return `${score}%`;
}

function buildBadge(
  id: string,
  name: string,
  description: string,
  earned: boolean,
  earnedDate: string | null,
): StudentBadge {
  const style = BADGE_STYLES[id] ?? BADGE_STYLES.scholar;
  return {
    id,
    name,
    description,
    earned,
    earnedDate: earned ? earnedDate : null,
    category: style.category,
    grad: earned ? style.grad : "linear-gradient(135deg,#C7CBE0,#9AA0B8)",
    shadow: earned ? style.shadow : "rgba(0,0,0,.1)",
  };
}

export function computeStudentAchievements(
  snapshot: AchievementSnapshot,
): { badges: StudentBadge[]; certificates: StudentCertificate[] } {
  const {
    streakDays,
    totalLessonsCompleted,
    maxLessonsInOneDay,
    submittedAssignmentCount,
    gradedSubmissions,
    courseProgress,
    activity,
  } = snapshot;

  const mathGrades = gradedSubmissions
    .filter(
      (row) =>
        tagIncludes(row.curriculumTag, "math") ||
        tagIncludes(row.courseTitle, "math"),
    )
    .map((row) => row.grade);
  const scienceGrades = gradedSubmissions
    .filter(
      (row) =>
        tagIncludes(row.curriculumTag, "science") ||
        tagIncludes(row.courseTitle, "science") ||
        tagIncludes(row.courseTitle, "physics") ||
        tagIncludes(row.courseTitle, "chem"),
    )
    .map((row) => row.grade);
  const codingLessons = courseProgress
    .filter(
      (row) =>
        tagIncludes(row.curriculumTag, "code") ||
        tagIncludes(row.courseTitle, "code") ||
        tagIncludes(row.courseTitle, "python"),
    )
    .reduce((sum, row) => sum + row.completedLessons, 0);
  const historyComplete = courseProgress.some(
    (row) =>
      (tagIncludes(row.curriculumTag, "history") ||
        tagIncludes(row.courseTitle, "history")) &&
      row.progressPercent >= 100,
  );
  const aiLessons = courseProgress
    .filter(
      (row) =>
        tagIncludes(row.curriculumTag, "ai") || tagIncludes(row.courseTitle, "ai"),
    )
    .reduce((sum, row) => sum + row.completedLessons, 0);

  const overallAvg = average(gradedSubmissions.map((row) => row.grade));
  const latestGradedAt = gradedSubmissions
    .map((row) => row.gradedAt)
    .filter(Boolean)
    .sort()
    .at(-1) ?? null;
  const streakEarnedAt =
    activity.find((day) => day.lessonsCompleted > 0 || day.assignmentsSubmitted > 0)
      ?.date ?? null;

  const baseBadges: StudentBadge[] = [
    buildBadge(
      "math-whiz",
      "Math Whiz",
      "Average 80%+ across 3+ math assignments",
      mathGrades.length >= 3 && (average(mathGrades) ?? 0) >= 80,
      formatEarnedDate(latestGradedAt),
    ),
    buildBadge(
      "streak-30",
      streakDays >= 30 ? "30-Day Streak" : "Learning Streak",
      streakDays >= 30 ? "Learned for 30 days in a row" : `Current streak: ${streakDays} day${streakDays === 1 ? "" : "s"}`,
      streakDays >= 30,
      formatEarnedDate(streakEarnedAt),
    ),
    buildBadge(
      "code-master",
      "Code Master",
      "Complete 5+ coding lessons",
      codingLessons >= 5,
      formatEarnedDate(latestGradedAt),
    ),
    buildBadge(
      "science-star",
      "Science Star",
      "Average 85%+ across 2+ science assignments",
      scienceGrades.length >= 2 && (average(scienceGrades) ?? 0) >= 85,
      formatEarnedDate(latestGradedAt),
    ),
    buildBadge(
      "history-buff",
      "History Buff",
      "Complete a history course",
      historyComplete,
      formatEarnedDate(latestGradedAt),
    ),
    buildBadge(
      "ai-explorer",
      "AI Explorer",
      "Complete 3+ AI lessons",
      aiLessons >= 3,
      formatEarnedDate(latestGradedAt),
    ),
    buildBadge(
      "bookworm",
      "Bookworm",
      "Complete 20 lessons total",
      totalLessonsCompleted >= 20,
      formatEarnedDate(latestGradedAt),
    ),
    buildBadge(
      "speed-learner",
      "Speed Learner",
      "Complete 5 lessons in one day",
      maxLessonsInOneDay >= 5,
      formatEarnedDate(latestGradedAt),
    ),
    buildBadge(
      "top-performer",
      "Top Performer",
      "Maintain 90%+ average across 3+ graded works",
      gradedSubmissions.length >= 3 && (overallAvg ?? 0) >= 90,
      formatEarnedDate(latestGradedAt),
    ),
  ];

  const earnedCount = baseBadges.filter((badge) => badge.earned).length;
  const scholarBadge = buildBadge(
    "scholar",
    "Scholar",
    `Earn ${SCHOLAR_THRESHOLD} achievement badges`,
    earnedCount >= SCHOLAR_THRESHOLD,
    earnedCount >= SCHOLAR_THRESHOLD ? formatEarnedDate(latestGradedAt) : null,
  );

  const badges = [...baseBadges, scholarBadge];

  const certificates: StudentCertificate[] = courseProgress
    .filter((row) => row.progressPercent >= 100 && row.totalLessons > 0)
    .map((row, index) => {
      const courseGrades = gradedSubmissions
        .filter((submission) => submission.courseTitle === row.courseTitle)
        .map((submission) => submission.grade);
      const courseAvg = average(courseGrades);
      const issued =
        gradedSubmissions
          .filter((submission) => submission.courseTitle === row.courseTitle)
          .map((submission) => submission.gradedAt)
          .filter(Boolean)
          .sort()
          .at(-1) ?? new Date().toISOString();

      return {
        id: `cert-${row.courseId}`,
        title: `${row.courseTitle} — Course Completion`,
        course: row.courseTitle,
        issuedDate: formatEarnedDate(issued) ?? "—",
        grade: gradeLabel(courseAvg),
        grad: CERT_GRADS[index % CERT_GRADS.length]!,
      };
    });

  return { badges, certificates };
}

export function countEarnedBadges(badges: StudentBadge[]): number {
  return badges.filter((badge) => badge.earned).length;
}

export function scholarProgress(badges: StudentBadge[]): {
  earned: number;
  threshold: number;
  remaining: number;
} {
  const earned = countEarnedBadges(badges.filter((badge) => badge.id !== "scholar"));
  return {
    earned,
    threshold: SCHOLAR_THRESHOLD,
    remaining: Math.max(0, SCHOLAR_THRESHOLD - earned),
  };
}
