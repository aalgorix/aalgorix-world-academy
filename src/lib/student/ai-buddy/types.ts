export type AiBuddyLessonNode = {
  id: string;
  title: string;
  completed: boolean;
  workspaceHref: string;
};

export type AiBuddyModuleNode = {
  id: string;
  title: string;
  lessons: AiBuddyLessonNode[];
};

export type AiBuddyCourseNode = {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  modules: AiBuddyModuleNode[];
};

export type AiBuddySelectionLevel = "course" | "module" | "lesson";

export type AiBuddyActiveSelection = {
  level: AiBuddySelectionLevel;
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  moduleId: string;
  moduleTitle: string;
  lessonId: string;
  lessonTitle: string;
  workspaceHref: string;
};

export type AiBuddyWorkspacePayload = {
  displayName: string;
  courses: AiBuddyCourseNode[];
  defaultSelection: AiBuddyActiveSelection | null;
};

export const LESSON_SHORTCUT_PROMPTS = [
  "Generate Quiz Cards for this Unit",
  "Deconstruct and Simplify Key Concepts",
  "Deep-Dive into Practice Questions",
] as const;
