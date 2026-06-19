"use client";

import { useActionState, useEffect, useState } from "react";

import { updateCourse, type CatalogActionState } from "./actions";
import {
  fieldInputClassName,
  fieldLabelClassName,
  fieldTextareaClassName,
  primaryButtonClassName,
  secondaryButtonClassName,
} from "./form-classes";
import type { CatalogCourse } from "./types";

type EditCourseModalProps = {
  course: CatalogCourse;
  open: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
};

const initialState: CatalogActionState | null = null;

export function EditCourseModal({
  course,
  open,
  onClose,
  onSuccess,
}: EditCourseModalProps) {
  const [state, formAction, pending] = useActionState(updateCourse, initialState);
  const [unlockStrategy, setUnlockStrategy] = useState(course.unlock_strategy);

  useEffect(() => {
    if (state?.ok) {
      onSuccess?.(state.message ?? "Course updated.");
      onClose();
    }
  }, [state, onClose, onSuccess]);

  useEffect(() => {
    if (!open) return;
    setUnlockStrategy(course.unlock_strategy);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, course.unlock_strategy]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[min(90dvh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Edit course</h2>
          <p className="mt-1 text-sm text-slate-500 font-mono">/{course.slug}</p>
        </div>

        <form action={formAction} className="space-y-4 px-6 py-5">
          <input type="hidden" name="course_id" value={course.id} />

          {state && !state.ok && state.error ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {state.error}
            </p>
          ) : null}

          <div>
            <label className={fieldLabelClassName}>
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              name="title"
              required
              defaultValue={course.title}
              className={fieldInputClassName}
            />
          </div>

          <div>
            <label className={fieldLabelClassName}>Description</label>
            <textarea
              name="description"
              defaultValue={course.description ?? ""}
              className={fieldTextareaClassName}
              rows={3}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={fieldLabelClassName}>Grade level</label>
              <input
                name="grade_level"
                defaultValue={course.grade_level ?? ""}
                className={fieldInputClassName}
                placeholder="Grade 10"
              />
            </div>
            <div>
              <label className={fieldLabelClassName}>Curriculum tag</label>
              <input
                name="curriculum_tag"
                defaultValue={course.curriculum_tag ?? ""}
                className={fieldInputClassName}
                placeholder="Cambridge"
              />
            </div>
          </div>

          <div>
            <label className={fieldLabelClassName}>Thumbnail URL</label>
            <input
              name="thumbnail_url"
              defaultValue={course.thumbnail_url ?? ""}
              className={fieldInputClassName}
            />
          </div>

          <div>
            <label className={fieldLabelClassName}>Unlock strategy</label>
            <select
              name="unlock_strategy"
              value={unlockStrategy}
              onChange={(e) => setUnlockStrategy(e.target.value)}
              className={fieldInputClassName}
            >
              <option value="sequential">Sequential</option>
              <option value="all_at_once">All at once</option>
              <option value="drip">Drip</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {unlockStrategy === "drip" ? (
            <div>
              <label className={fieldLabelClassName}>Drip interval (days)</label>
              <input
                name="drip_interval_days"
                type="number"
                min={1}
                defaultValue={course.drip_interval_days ?? 7}
                className={fieldInputClassName}
              />
            </div>
          ) : null}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className={secondaryButtonClassName}>
              Cancel
            </button>
            <button type="submit" disabled={pending} className={primaryButtonClassName}>
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
