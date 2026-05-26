"use client";

import Link from "next/link";
import { useState } from "react";

import type { AcademicsCourseTrack } from "@/lib/student/academics/types";

type CurriculumTracksTreeProps = {
  courses: AcademicsCourseTrack[];
};

export function CurriculumTracksTree({ courses }: CurriculumTracksTreeProps) {
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    () => new Set(courses.slice(0, 1).map((course) => course.courseId)),
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
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
        <p className="text-base font-bold text-slate-900">No curriculum tracks yet</p>
        <p className="mt-2 text-sm text-slate-600">
          Once you are enrolled in a published course, your module and lesson tree will
          appear here with links into your classroom workspace.
        </p>
        <Link
          href="/courses"
          className="mt-5 inline-flex rounded-xl border-2 border-slate-900 px-4 py-2.5 text-sm font-bold text-slate-900 transition-all hover:bg-white active:scale-[0.98]"
        >
          Browse open curricula
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {courses.map((course) => {
        const courseOpen = expandedCourses.has(course.courseId);
        const tags = [course.gradeLevel, course.curriculumTag].filter(Boolean);

        return (
          <li
            key={course.enrollmentId}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-[#fafafa] shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleCourse(course.courseId)}
              className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-all hover:bg-white active:scale-[0.995]"
            >
              <span className="min-w-0">
                <span className="block text-base font-extrabold text-slate-900">
                  {course.courseTitle || "Untitled track"}
                </span>
                {tags.length > 0 ? (
                  <span className="mt-1 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                ) : null}
                <span className="mt-2 block text-xs font-semibold text-indigo-700">
                  {course.progressPercent}% syllabus milestones complete
                </span>
              </span>
              <span className="shrink-0 text-lg font-light text-slate-400" aria-hidden>
                {courseOpen ? "−" : "+"}
              </span>
            </button>

            {courseOpen ? (
              <ul className="border-t border-slate-200 bg-white px-3 pb-3">
                {course.modules.map((module) => {
                  const moduleOpen = expandedModules.has(module.id);
                  return (
                    <li key={module.id} className="mt-2">
                      <button
                        type="button"
                        onClick={() => toggleModule(module.id)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-800 transition-all hover:bg-[#fafafa] active:scale-[0.98]"
                      >
                        {module.title || "Module"}
                        <span className="text-slate-400">{moduleOpen ? "−" : "+"}</span>
                      </button>

                      {moduleOpen ? (
                        <ul className="ml-3 space-y-1 border-l-2 border-indigo-100 pl-4">
                          {module.lessons.map((lesson) => (
                            <li key={lesson.id}>
                              <Link
                                href={lesson.workspaceHref}
                                className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-all hover:bg-indigo-50 active:scale-[0.98]"
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <span
                                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                      lesson.completed
                                        ? "bg-emerald-500"
                                        : "bg-slate-300 group-hover:bg-indigo-400"
                                    }`}
                                    aria-hidden
                                  />
                                  <span className="truncate text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                                    {lesson.title || "Lesson"}
                                  </span>
                                </span>
                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                  {lesson.milestoneLabel}
                                </span>
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
