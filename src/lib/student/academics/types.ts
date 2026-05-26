import type { SubmissionStatus } from "@/lib/dashboard/submission-status";

export type AcademicsTabId = "curriculum" | "vault" | "assignments";

export type AcademicsLessonNode = {
  id: string;
  title: string;
  completed: boolean;
  workspaceHref: string;
  milestoneLabel: string;
};

export type AcademicsModuleNode = {
  id: string;
  title: string;
  lessons: AcademicsLessonNode[];
};

export type AcademicsCourseTrack = {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  gradeLevel: string;
  curriculumTag: string;
  progressPercent: number;
  modules: AcademicsModuleNode[];
};

export type AcademicsStudyMaterial = {
  id: string;
  title: string;
  courseTitle: string;
  moduleTitle: string;
  fileName: string;
  storagePath: string;
  downloadUrl: string | null;
  lessonHref: string;
};

export type AcademicsClassVideo = {
  id: string;
  title: string;
  courseTitle: string;
  moduleTitle: string;
  durationLabel: string;
  durationSeconds: number;
  lessonHref: string;
};

export type AcademicsSubmissionRecord = {
  id: string;
  assessmentName: string;
  trackTitle: string;
  turnedInLabel: string;
  status: SubmissionStatus;
  statusLabel: string;
  grade: number | null;
  workspaceHref: string | null;
  notificationsHref: string;
};

export type AcademicsSummaryMetrics = {
  activeEnrollments: number;
  meanProgressPercent: number;
  awaitingReviewCount: number;
  revisionRequestedCount: number;
};

export type StudentAcademicsPayload = {
  displayName: string;
  metrics: AcademicsSummaryMetrics;
  courses: AcademicsCourseTrack[];
  materials: AcademicsStudyMaterial[];
  videos: AcademicsClassVideo[];
  submissions: AcademicsSubmissionRecord[];
};
