import type { SubmissionStatus } from "@/lib/dashboard/submission-status";

export type HubNavSection =
  | "overview"
  | "academics"
  | "schedule"
  | "messages"
  | "profile";

export type AcademicTabId = "curriculum" | "assignments" | "vault";

export type HubTelemetry = {
  attendancePercent: number;
  courseCompletionPercent: number;
  gpaAverage: number | null;
};

export type HubLiveSession = {
  id: string;
  title: string;
  courseId: string | null;
  courseTitle: string;
  startsAtIso: string;
  joinUrl: string | null;
};

export type HubCurriculumLesson = {
  id: string;
  title: string;
  completed: boolean;
  href: string;
  resourcePaths: string[];
  hasVideo: boolean;
};

export type HubCurriculumModule = {
  id: string;
  title: string;
  lessons: HubCurriculumLesson[];
};

export type HubEnrolledCourse = {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  progressPercent: number;
  modules: HubCurriculumModule[];
};

export type HubAssignmentRow = {
  id: string;
  title: string;
  courseTitle: string;
  kind: "homework" | "test";
  status: SubmissionStatus;
  statusLabel: string;
  grade: number | null;
  dueAtIso: string | null;
  submittedAtIso: string | null;
  workspaceHref: string | null;
};

export type HubVaultItem = {
  id: string;
  title: string;
  courseTitle: string;
  kind: "material" | "video";
  href: string | null;
  fileName: string | null;
};

export type HubAnnouncement = {
  id: string;
  title: string;
  body: string;
  postedAtIso: string;
  authorLabel: string;
};

export type HubNewsCard = {
  id: string;
  title: string;
  summary: string;
  category: string;
  imageGradient: string;
  externalUrl: string;
};

export type HubChatMessage = {
  id: string;
  authorName: string;
  body: string;
  sentAtIso: string;
  isSelf: boolean;
};

export type HubTeacherContact = {
  id: string;
  fullName: string;
  courseTitle: string;
  initials: string;
};

export type HubAiContext = {
  courseId: string | null;
  courseTitle: string;
  moduleTitle: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
};

export type StudentHubPayload = {
  studentId: string;
  displayName: string;
  batchCode: string;
  todayLabel: string;
  revisionCount: number;
  telemetry: HubTelemetry;
  liveSession: HubLiveSession;
  expectedLectureCount: number;
  attendedLectureCount: number;
  courses: HubEnrolledCourse[];
  assignments: HubAssignmentRow[];
  vaultItems: HubVaultItem[];
  announcements: HubAnnouncement[];
  newsCards: HubNewsCard[];
  cohortMessages: HubChatMessage[];
  teacherContacts: HubTeacherContact[];
  teacherThreads: Record<string, HubChatMessage[]>;
  aiContext: HubAiContext;
};
