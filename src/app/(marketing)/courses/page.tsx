import type { Metadata } from "next";
import Link from "next/link";

import { fetchPublishedCourses } from "@/lib/curriculum/public-catalog";

import { MarketingNav } from "../marketing-nav";
import { PublicCourseCard } from "./course-card";

export const metadata: Metadata = {
  title: "Course Catalog — Aalgorix World Academy",
  description:
    "Browse published courses, modules, and lesson outlines from Aalgorix World Academy.",
};

const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500";

export default async function PublicCoursesPage() {
  const { courses, error } = await fetchPublishedCourses();

  return (
    <>
      <MarketingNav />
      <main className="flex-1 bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              ← Back to home
            </Link>
            <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Published catalog
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Available courses
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Live courses from our curriculum team. Enroll through your family dashboard
              once your enrollment is confirmed by the academy.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Could not load courses: {error}
            </p>
          ) : null}

          {courses.length === 0 && !error ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="text-slate-600">
                No published courses yet. Check back soon or book a consultation.
              </p>
              <Link href="/signup" className={`${btnPrimary} mt-6`}>
                Create an account
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <PublicCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
