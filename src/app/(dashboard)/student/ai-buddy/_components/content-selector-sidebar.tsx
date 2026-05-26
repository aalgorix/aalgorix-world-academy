"use client";

import type {
  AiBuddyActiveSelection,
  AiBuddyCourseNode,
  AiBuddySelectionLevel,
} from "@/lib/student/ai-buddy/types";

type ContentSelectorSidebarProps = {
  courses: AiBuddyCourseNode[];
  activeSelection: AiBuddyActiveSelection | null;
  onSelect: (selection: AiBuddyActiveSelection) => void;
};

function isActive(
  active: AiBuddyActiveSelection | null,
  level: AiBuddySelectionLevel,
  ids: { courseId: string; moduleId?: string; lessonId?: string },
): boolean {
  if (!active || active.level !== level) return false;
  if (active.courseId !== ids.courseId) return false;
  if (level === "course") return true;
  if (active.moduleId !== (ids.moduleId ?? "")) return false;
  if (level === "module") return true;
  return active.lessonId === (ids.lessonId ?? "");
}

export function ContentSelectorSidebar({
  courses,
  activeSelection,
  onSelect,
}: ContentSelectorSidebarProps) {
  if (courses.length === 0) {
    return (
      <aside className="flex h-full flex-col border-r border-slate-200 bg-[#fafafa] p-4">
        <h2 className="text-sm font-extrabold text-slate-900">Active content</h2>
        <p className="mt-3 text-sm text-slate-600">
          Enroll in a published course to bind AI study context to your curriculum tracks.
        </p>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Active content selector"
      className="flex h-full flex-col border-r border-slate-200 bg-[#fafafa]"
    >
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <h2 className="text-sm font-extrabold text-slate-900">Active content</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Select a course, module, or lesson track
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-4">
          {courses.map((course) => (
            <li key={course.enrollmentId}>
              <button
                type="button"
                onClick={() =>
                  onSelect({
                    level: "course",
                    enrollmentId: course.enrollmentId,
                    courseId: course.courseId,
                    courseTitle: course.courseTitle,
                    moduleId: "",
                    moduleTitle: "",
                    lessonId: "",
                    lessonTitle: "",
                    workspaceHref: "",
                  })
                }
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-bold transition-all active:scale-[0.98] ${
                  isActive(activeSelection, "course", { courseId: course.courseId })
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-900 hover:bg-white"
                }`}
              >
                {course.courseTitle || "Untitled course"}
              </button>

              <ul className="mt-1 ml-2 space-y-1 border-l border-slate-200 pl-3">
                {course.modules.map((module) => (
                  <li key={module.id}>
                    <button
                      type="button"
                      onClick={() =>
                        onSelect({
                          level: "module",
                          enrollmentId: course.enrollmentId,
                          courseId: course.courseId,
                          courseTitle: course.courseTitle,
                          moduleId: module.id,
                          moduleTitle: module.title,
                          lessonId: "",
                          lessonTitle: "",
                          workspaceHref: "",
                        })
                      }
                      className={`w-full rounded-lg px-2 py-1.5 text-left text-xs font-bold transition-all active:scale-[0.98] ${
                        isActive(activeSelection, "module", {
                          courseId: course.courseId,
                          moduleId: module.id,
                        })
                          ? "bg-indigo-100 text-indigo-900 ring-1 ring-indigo-200"
                          : "text-slate-700 hover:bg-white"
                      }`}
                    >
                      {module.title || "Module"}
                    </button>

                    <ul className="mt-0.5 ml-2 space-y-0.5 border-l border-indigo-100 pl-2">
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() =>
                              onSelect({
                                level: "lesson",
                                enrollmentId: course.enrollmentId,
                                courseId: course.courseId,
                                courseTitle: course.courseTitle,
                                moduleId: module.id,
                                moduleTitle: module.title,
                                lessonId: lesson.id,
                                lessonTitle: lesson.title,
                                workspaceHref: lesson.workspaceHref,
                              })
                            }
                            className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition-all active:scale-[0.98] ${
                              isActive(activeSelection, "lesson", {
                                courseId: course.courseId,
                                moduleId: module.id,
                                lessonId: lesson.id,
                              })
                                ? "bg-slate-900 text-white"
                                : "text-slate-600 hover:bg-white hover:text-slate-900"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                lesson.completed ? "bg-emerald-400" : "bg-slate-300"
                              }`}
                              aria-hidden
                            />
                            <span className="truncate">
                              {lesson.title || "Lesson"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
