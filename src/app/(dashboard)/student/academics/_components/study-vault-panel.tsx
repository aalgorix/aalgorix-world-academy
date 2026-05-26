import Link from "next/link";

import type {
  AcademicsClassVideo,
  AcademicsStudyMaterial,
} from "@/lib/student/academics/types";

type StudyVaultPanelProps = {
  materials: AcademicsStudyMaterial[];
  videos: AcademicsClassVideo[];
};

export function StudyVaultPanel({ materials, videos }: StudyVaultPanelProps) {
  return (
    <div className="space-y-8">
      <section aria-label="Study material sheets">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-slate-900">Study material sheets</h3>
          <span className="text-xs font-semibold text-slate-500">
            {materials.length} resource{materials.length === 1 ? "" : "s"}
          </span>
        </div>

        {materials.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {materials.map((item) => (
              <li
                key={item.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
              >
                <span className="inline-flex w-fit rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                  Printable
                </span>
                <p className="mt-2 font-bold text-slate-900">
                  {item.title || "Lesson material"}
                </p>
                <p className="text-xs text-slate-500">
                  {item.courseTitle || "Course"} · {item.moduleTitle || "Module"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {item.fileName || item.storagePath || "File pending upload"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.downloadUrl ? (
                    <a
                      href={item.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                    >
                      Download sheet
                    </a>
                  ) : null}
                  <Link
                    href={item.lessonHref}
                    className="inline-flex rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 transition-all hover:bg-[#fafafa] active:scale-[0.98]"
                  >
                    Open lesson
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            Printable study sheets from your teachers will appear here when lesson
            resources are published.
          </p>
        )}
      </section>

      <section aria-label="Instructional class videos">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-slate-900">Class video library</h3>
          <span className="text-xs font-semibold text-slate-500">
            {videos.length} recording{videos.length === 1 ? "" : "s"}
          </span>
        </div>

        {videos.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-violet-200 hover:shadow-md"
              >
                <div className="bg-gradient-to-br from-violet-600 to-indigo-700 px-4 py-5 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                    On-demand
                  </span>
                  <p className="mt-2 line-clamp-2 text-sm font-extrabold leading-snug">
                    {video.title || "Class recording"}
                  </p>
                  <p className="mt-2 font-mono text-xs font-bold tabular-nums opacity-90">
                    {video.durationLabel}
                  </p>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="text-xs text-slate-500">
                    {video.courseTitle || "Course"} · {video.moduleTitle || "Module"}
                  </p>
                  <Link
                    href={video.lessonHref}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-violet-700 active:scale-[0.98]"
                  >
                    Watch in classroom
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            Recorded lecture clips with duration metrics appear here once videos are
            attached to your lessons.
          </p>
        )}
      </section>
    </div>
  );
}
