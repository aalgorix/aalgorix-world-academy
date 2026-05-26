import Link from "next/link";

import type { HubTeacherContact } from "@/lib/student/hub/types";

type TeacherMessageShortcutsProps = {
  teachers: HubTeacherContact[];
};

export function TeacherMessageShortcuts({ teachers }: TeacherMessageShortcutsProps) {
  return (
    <section
      aria-label="Teacher message hub shortcuts"
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">
        Teacher message hub
      </h2>
      {teachers.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {teachers.map((teacher) => (
            <li key={teacher.id}>
              <Link
                href={`/student/messages?teacher=${teacher.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#fafafa] p-3 transition-all duration-200 hover:border-indigo-200 hover:bg-white hover:shadow-sm active:scale-[0.98]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-xs font-extrabold text-white shadow-sm ring-1 ring-slate-200">
                  {teacher.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-slate-900">
                    {teacher.fullName}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {teacher.courseTitle}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Assigned grading teachers will appear here once course staffing is complete.
        </p>
      )}
    </section>
  );
}
