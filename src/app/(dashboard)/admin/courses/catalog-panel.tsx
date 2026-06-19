"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";

import {
  createLesson,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  toggleCoursePublished,
  type CatalogActionState,
} from "./actions";
import { CreateCourseModal } from "./create-course-modal";
import { EditCourseModal } from "./edit-course-modal";
import { LessonMediaUploadZones } from "./lesson-media-upload-zones";
import { UploadLessonVideo } from "./upload-lesson-video";
import {
  dangerButtonClassName,
  fieldInputClassName,
  fieldLabelClassName,
  fieldTextareaClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "./form-classes";
import type { CatalogCourse, CatalogStats } from "./types";

type CatalogPanelProps = {
  courses: CatalogCourse[];
  stats: CatalogStats;
};

const emptyActionState: CatalogActionState | null = null;

function ActionBanner({ message, error }: { message?: string; error?: string }) {
  if (!message && !error) return null;
  return (
    <p
      role="status"
      className={
        error
          ? "rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          : "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
      }
    >
      {error ?? message}
    </p>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint ? (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function ModuleSection({ course }: { course: CatalogCourse }) {
  const [moduleState, moduleAction, modulePending] = useActionState(
    createModule,
    emptyActionState,
  );
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    course.modules[0]?.id ?? null,
  );
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<CatalogActionState | null>(null);

  function runAsync(action: () => Promise<CatalogActionState>) {
    startTransition(async () => {
      const result = await action();
      setFeedback(result);
    });
  }

  return (
    <div className="space-y-4">
      <form action={moduleAction} className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-900/50">
        <input type="hidden" name="course_id" value={course.id} />
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          Add module to <span className="text-indigo-600 dark:text-indigo-400">{course.title}</span>
        </p>
        <ActionBanner
          message={moduleState?.ok ? moduleState.message : undefined}
          error={moduleState && !moduleState.ok ? moduleState.error : undefined}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={fieldLabelClassName}>
              Module title <span className="text-rose-500">*</span>
            </label>
            <input
              name="title"
              required
              className={fieldInputClassName}
              placeholder="Getting Started"
            />
          </div>
          <div>
            <label className={fieldLabelClassName}>Description</label>
            <input
              name="description"
              className={fieldInputClassName}
              placeholder="Optional module summary"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={modulePending}
          className={`${primaryButtonClassName} mt-3`}
        >
          {modulePending ? "Adding…" : "Add module"}
        </button>
      </form>

      {feedback ? (
        <ActionBanner message={feedback.ok ? feedback.message : undefined} error={feedback.error} />
      ) : null}

      {course.modules.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No modules yet. Create the first module above.
        </p>
      ) : (
        <ul className="space-y-3">
          {course.modules.map((module) => (
            <li
              key={module.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() =>
                    setExpandedModuleId((id) => (id === module.id ? null : module.id))
                  }
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {module.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {module.lessons.length} lesson
                    {module.lessons.length === 1 ? "" : "s"} · sort {module.sort_order}
                  </p>
                </button>
                <button
                  type="button"
                  disabled={pending}
                  className={dangerButtonClassName}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Delete module “${module.title}” and all nested lessons?`,
                      )
                    ) {
                      runAsync(() => deleteModule(module.id));
                    }
                  }}
                >
                  Delete
                </button>
              </div>

              {expandedModuleId === module.id ? (
                <div className="space-y-4 px-4 py-4">
                  {module.description ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {module.description}
                    </p>
                  ) : null}

                  <LessonForm
                    courseId={course.id}
                    moduleId={module.id}
                    moduleTitle={module.title}
                  />

                  {module.lessons.length > 0 ? (
                    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
                      {module.lessons.map((lesson) => (
                        <li
                          key={lesson.id}
                          className="px-3 py-2.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                {lesson.title}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {lesson.is_preview ? "Preview lesson" : "Enrolled content"} ·
                                sort {lesson.sort_order}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={pending}
                              className={dangerButtonClassName}
                              onClick={() => {
                                if (window.confirm(`Delete lesson “${lesson.title}”?`)) {
                                  runAsync(() => deleteLesson(lesson.id));
                                }
                              }}
                            >
                              Remove
                            </button>
                          </div>
                          <UploadLessonVideo
                            courseId={course.id}
                            lessonId={lesson.id}
                            lessonTitle={lesson.title}
                            currentPath={lesson.video_storage_path}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No lessons in this module yet.
                    </p>
                  )}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LessonForm({
  courseId,
  moduleId,
  moduleTitle,
}: {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
}) {
  const [lessonState, lessonAction, lessonPending] = useActionState(
    createLesson,
    emptyActionState,
  );
  const [videoStoragePath, setVideoStoragePath] = useState("");
  const [resourcePaths, setResourcePaths] = useState<string[]>([]);

  return (
    <form
      action={lessonAction}
      className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-950/60"
    >
      <input type="hidden" name="module_id" value={moduleId} />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Attach lesson · {moduleTitle}
      </p>
      <ActionBanner
        message={lessonState?.ok ? lessonState.message : undefined}
        error={lessonState && !lessonState.ok ? lessonState.error : undefined}
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={fieldLabelClassName}>
            Lesson title <span className="text-rose-500">*</span>
          </label>
          <input
            name="title"
            required
            className={fieldInputClassName}
            placeholder="Variables & Types"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={fieldLabelClassName}>Description</label>
          <textarea
            name="description"
            className={fieldTextareaClassName}
            rows={2}
            placeholder="Learning objectives"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={fieldLabelClassName}>Duration (seconds)</label>
          <input
            name="video_duration_seconds"
            type="number"
            min={0}
            className={fieldInputClassName}
            placeholder="600"
          />
        </div>
      </div>

      <LessonMediaUploadZones
        courseId={courseId}
        videoStoragePath={videoStoragePath}
        onVideoStoragePathChange={setVideoStoragePath}
        resourcePaths={resourcePaths}
        onResourcePathsChange={setResourcePaths}
      />

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
        <input
          type="checkbox"
          name="is_preview"
          className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
        />
        Free preview (no enrollment required)
      </label>
      <button
        type="submit"
        disabled={lessonPending}
        className={`${secondaryButtonClassName} mt-3`}
      >
        {lessonPending ? "Saving…" : "Attach lesson"}
      </button>
    </form>
  );
}

function CourseCard({ course }: { course: CatalogCourse }) {
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<CatalogActionState | null>(null);

  function runAsync(action: () => Promise<CatalogActionState>) {
    startTransition(async () => {
      const result = await action();
      setFeedback(result);
    });
  }

  const lessonCount = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  );

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              {course.title}
            </h3>
            <span
              className={
                course.is_published
                  ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
              }
            >
              {course.is_published ? "Published" : "Draft"}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            /{course.slug}
          </p>
          {course.description ? (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {course.description}
            </p>
          ) : null}
          <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            {course.grade_level ? (
              <div>
                <dt className="inline font-medium">Grade:</dt>{" "}
                <dd className="inline">{course.grade_level}</dd>
              </div>
            ) : null}
            {course.curriculum_tag ? (
              <div>
                <dt className="inline font-medium">Curriculum:</dt>{" "}
                <dd className="inline">{course.curriculum_tag}</dd>
              </div>
            ) : null}
            <div>
              <dt className="inline font-medium">Unlock:</dt>{" "}
              <dd className="inline">{course.unlock_strategy.replaceAll("_", " ")}</dd>
            </div>
            <div>
              <dt className="inline font-medium">Structure:</dt>{" "}
              <dd className="inline">
                {course.modules.length} modules · {lessonCount} lessons
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </button>
          <button
            type="button"
            disabled={pending}
            className={secondaryButtonClassName}
            onClick={() =>
              runAsync(() => toggleCoursePublished(course.id, !course.is_published))
            }
          >
            {course.is_published ? "Unpublish" : "Publish"}
          </button>
          <button
            type="button"
            className={secondaryButtonClassName}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? "Collapse" : "Manage structure"}
          </button>
          <button
            type="button"
            disabled={pending}
            className={dangerButtonClassName}
            onClick={() => {
              if (
                window.confirm(
                  `Delete “${course.title}” and all modules and lessons? This cannot be undone.`,
                )
              ) {
                runAsync(() => deleteCourse(course.id));
              }
            }}
          >
            Delete course
          </button>
        </div>
      </header>

      {feedback ? (
        <div className="border-b border-slate-100 px-5 py-2 dark:border-slate-800">
          <ActionBanner
            message={feedback.ok ? feedback.message : undefined}
            error={feedback.error}
          />
        </div>
      ) : null}

      {expanded ? (
        <div className="px-5 py-4">
          <ModuleSection course={course} />
        </div>
      ) : null}

      <EditCourseModal
        course={course}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={(message) => setFeedback({ ok: true, message })}
      />
    </article>
  );
}

export function CatalogPanel({ courses, stats }: CatalogPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
          >
            ← Admin home
          </Link>
          <p className="mt-3 text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Phase 3 · Curriculum catalog
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Course catalog
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
            Manage the <code className="text-sm">courses</code> →{" "}
            <code className="text-sm">course_modules</code> →{" "}
            <code className="text-sm">lessons</code> hierarchy. All writes run through
            server actions with your session and Postgres RLS (
            <code className="text-sm">is_teacher()</code>).
          </p>
        </div>
        <button
          type="button"
          className={primaryButtonClassName}
          onClick={() => setModalOpen(true)}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          New course
        </button>
      </div>

      {banner ? (
        <p
          role="status"
          className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {banner}
        </p>
      ) : null}

      <section
        aria-label="Catalog statistics"
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Total courses" value={stats.totalCourses} />
        <StatCard
          label="Published"
          value={stats.publishedCourses}
          hint="Visible to learners when enrolled"
        />
        <StatCard label="Drafts" value={stats.draftCourses} />
        <StatCard
          label="Lessons"
          value={stats.totalLessons}
          hint={`${stats.totalModules} modules across catalog`}
        />
      </section>

      <section className="mt-10 space-y-6" aria-label="Course list">
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-slate-600 dark:text-slate-400">
              No courses in the catalog yet.
            </p>
            <button
              type="button"
              className={`${primaryButtonClassName} mt-4`}
              onClick={() => setModalOpen(true)}
            >
              Create your first course
            </button>
          </div>
        ) : (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        )}
      </section>

      <CreateCourseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(message) => setBanner(message)}
      />
    </div>
  );
}
