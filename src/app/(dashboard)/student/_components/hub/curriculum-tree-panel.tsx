"use client";

import Link from "next/link";
import { useState } from "react";

import type { HubEnrolledCourse } from "@/lib/student/hub/types";

type CurriculumTreePanelProps = {
  courses: HubEnrolledCourse[];
  onLessonFocus?: (courseId: string, lessonId: string, lessonTitle: string, moduleTitle: string) => void;
};

export function CurriculumTreePanel({
  courses,
  onLessonFocus,
}: CurriculumTreePanelProps) {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    () => new Set(courses.slice(0, 1).map((c) => c.courseId)),
  );
  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => new Set());

  function toggleCourse(courseId: string) {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  }

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  if (courses.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
        <p className="font-semibold text-slate-900">No active enrollments</p>
        <p className="mt-2 text-sm text-slate-600">
          Your curriculum tree appears when you are enrolled in a published course.
        </p>
        <Link
          href="/courses"
          className="mt-4 inline-flex rounded-xl border-2 border-slate-900 px-4 py-2 text-sm font-bold text-slate-900 transition-all active:scale-[0.98] hover:bg-white"
        >
          Browse curricula
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {courses.map((course) => {
        const courseOpen = expandedCourses.has(course.courseId);
        return (
          <li
            key={course.enrollmentId}
            className="overflow-hidden rounded-xl border border-slate-200 bg-[#fafafa]"
          >
            <button
              type="button"
              onClick={() => toggleCourse(course.courseId)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-all hover:bg-white active:scale-[0.995]"
            >
              <span>
                <span className="block text-sm font-bold text-slate-900">
                  {course.courseTitle}
                </span>
                <span className="text-xs text-slate-500">
                  {course.progressPercent}% complete
                </span>
              </span>
              <span className="text-slate-400" aria-hidden>
                {courseOpen ? "−" : "+"}
              </span>
            </button>

            {courseOpen ? (
              <ul className="border-t border-slate-200 px-2 pb-2">
                {course.modules.map((module) => {
                  const moduleOpen = expandedModules.has(module.id);
                  return (
                    <li key={module.id} className="mt-1">
                      <button
                        type="button"
                        onClick={() => toggleModule(module.id)}
                        className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs font-bold text-slate-700 transition-all hover:bg-white active:scale-[0.98]"
                      >
                        {module.title}
                        <span className="text-slate-400">{moduleOpen ? "−" : "+"}</span>
                      </button>
                      {moduleOpen ? (
                        <ul className="ml-2 space-y-0.5 border-l border-slate-200 pl-3">
                          {module.lessons.map((lesson) => (
                            <li key={lesson.id}>
                              <Link
                                href={lesson.href}
                                onClick={() =>
                                  onLessonFocus?.(
                                    course.courseId,
                                    lesson.id,
                                    lesson.title,
                                    module.title,
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-700 transition-all hover:bg-white hover:text-slate-900 active:scale-[0.98]"
                              >
                                <span
                                  className={`h-2 w-2 shrink-0 rounded-full ${lesson.completed ? "bg-emerald-500" : "bg-slate-300"}`}
                                  aria-hidden
                                />
                                {lesson.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
