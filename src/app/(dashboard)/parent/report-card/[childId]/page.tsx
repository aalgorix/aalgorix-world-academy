import Link from "next/link";
import { redirect } from "next/navigation";

import {
  computeProgressPercent,
  fetchCompletedLessonsByEnrollment,
  fetchLessonTotalsByCourse,
} from "@/lib/dashboard/course-progress";
import { unwrapOne } from "@/lib/dashboard/relations";
import { getDashboardPathForRole } from "@/lib/auth/redirects";
import { isUserRole } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";

import { PrintTranscriptButton } from "./print-transcript-button";

type PageProps = {
  params: Promise<{ childId: string }>;
};

type ChildProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
};

type CourseRow = {
  id: string;
  title: string;
  curriculum_tag: string | null;
  grade_level: string | null;
};

type EnrollmentRow = {
  id: string;
  courses: CourseRow | CourseRow[] | null;
};

type RawGradedSubmissionRow = {
  id: string;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  assignments: {
    title: string;
    course_id: string;
    courses: { id: string; title: string } | { id: string; title: string }[] | null;
    lessons: { title: string } | { title: string }[] | null;
  } | {
    title: string;
    course_id: string;
    courses: { id: string; title: string } | { id: string; title: string }[] | null;
    lessons: { title: string } | { title: string }[] | null;
  }[] | null;
};

type TranscriptCourseRow = {
  courseId: string;
  title: string;
  curriculumTag: string;
  gradeLevel: string | null;
  progressPercent: number;
  certifiedFinalScore: number | null;
};

type GradedAssessmentRow = {
  id: string;
  evaluatedAt: string;
  lessonTitle: string;
  assignmentTitle: string;
  courseTitle: string;
  grade: number;
  feedback: string;
};

function formatDisplayDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
    new Date(iso),
  );
}

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(iso),
  );
}

function resolveGradeTrack(courses: CourseRow[]): string {
  const levels = courses
    .map((course) => course.grade_level?.trim())
    .filter((level): level is string => Boolean(level));

  if (levels.length === 0) return "General academic track";
  const unique = [...new Set(levels)];
  return unique.length === 1 ? unique[0] : unique.join(" · ");
}

function averageRounded(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function buildCourseFinalScores(
  gradedRows: GradedAssessmentRow[],
): Map<string, number> {
  const buckets = new Map<string, number[]>();

  for (const row of gradedRows) {
    const list = buckets.get(row.courseTitle) ?? [];
    list.push(row.grade);
    buckets.set(row.courseTitle, list);
  }

  const finals = new Map<string, number>();
  for (const [courseTitle, grades] of buckets) {
    const mean = averageRounded(grades);
    if (mean != null) finals.set(courseTitle, mean);
  }

  return finals;
}

function normalizeGradedSubmission(row: RawGradedSubmissionRow): GradedAssessmentRow | null {
  if (row.grade == null || !row.graded_at) return null;

  const assignment = unwrapOne(row.assignments);
  if (!assignment) return null;

  const course = unwrapOne(assignment.courses);
  const lesson = unwrapOne(assignment.lessons);

  return {
    id: row.id,
    evaluatedAt: row.graded_at,
    lessonTitle: lesson?.title ?? assignment.title,
    assignmentTitle: assignment.title,
    courseTitle: course?.title ?? "Course",
    grade: row.grade,
    feedback: row.feedback?.trim() || "No written feedback provided.",
  };
}

export default async function ParentReportCardPage({ params }: PageProps) {
  const { childId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reportPath = `/parent/report-card/${childId}`;

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(reportPath)}`);
  }

  const { data: parentProfile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (parentProfile?.role !== "parent") {
    const destination =
      parentProfile?.role && isUserRole(parentProfile.role)
        ? getDashboardPathForRole(parentProfile.role)
        : "/login";
    redirect(destination);
  }

  const { data: relation } = await supabase
    .from("student_parent_relations")
    .select("id")
    .eq("parent_id", user.id)
    .eq("student_id", childId)
    .maybeSingle();

  if (!relation) {
    redirect("/parent");
  }

  const [
    { data: childProfile },
    { data: enrollmentRows },
    { data: submissionRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("id", childId)
      .single(),
    supabase
      .from("enrollments")
      .select(
        `
        id,
        courses (
          id,
          title,
          curriculum_tag,
          grade_level
        )
      `,
      )
      .eq("student_id", childId)
      .eq("status", "active"),
    supabase
      .from("submissions")
      .select(
        `
        id,
        grade,
        feedback,
        graded_at,
        assignments (
          title,
          course_id,
          courses (
            id,
            title
          ),
          lessons (
            title
          )
        )
      `,
      )
      .eq("student_id", childId)
      .eq("status", "graded"),
  ]);

  if (!childProfile) {
    redirect("/parent");
  }

  const child = childProfile as ChildProfileRow;
  const learnerName = child.full_name?.trim() || child.email;
  const registrationDate = formatDisplayDate(child.created_at);
  const calendarTermYear = String(new Date().getFullYear());

  const childEnrollments =
    (enrollmentRows as EnrollmentRow[] | null)?.flatMap((row) => {
      const course = unwrapOne(row.courses);
      if (!course) return [];
      return [{ enrollmentId: row.id, course }];
    }) ?? [];

  const enrollmentIds = childEnrollments.map((row) => row.enrollmentId);
  const courseIds = childEnrollments.map((row) => row.course.id);
  const courses = childEnrollments.map((row) => row.course);

  const [lessonTotals, completedByEnrollment] = await Promise.all([
    fetchLessonTotalsByCourse(supabase, courseIds),
    fetchCompletedLessonsByEnrollment(supabase, enrollmentIds),
  ]);

  const gradedAssessments = ((submissionRows ?? []) as RawGradedSubmissionRow[])
    .map(normalizeGradedSubmission)
    .filter((row): row is GradedAssessmentRow => row !== null)
    .sort(
      (a, b) =>
        new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime(),
    );

  const finalScoreByCourseTitle = buildCourseFinalScores(gradedAssessments);

  const transcriptCourses: TranscriptCourseRow[] = childEnrollments.map(
    ({ enrollmentId, course }) => {
      const total = lessonTotals.get(course.id) ?? 0;
      const completed = completedByEnrollment.get(enrollmentId) ?? 0;
      return {
        courseId: course.id,
        title: course.title,
        curriculumTag: course.curriculum_tag?.trim() || "—",
        gradeLevel: course.grade_level,
        progressPercent: computeProgressPercent(completed, total),
        certifiedFinalScore: finalScoreByCourseTitle.get(course.title) ?? null,
      };
    },
  );

  const cumulativeAverage = averageRounded(
    gradedAssessments.map((row) => row.grade),
  );
  const gradeClassificationTrack = resolveGradeTrack(courses);

  return (
    <>
      <div className="print:hidden mx-auto w-full" style={{ maxWidth: 1320, padding: "28px 32px 40px" }}>
        <div className="mb-6">
          <p className="text-[12px] font-bold uppercase tracking-widest text-amber-600">
            Official scholastic records
          </p>
          <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-stone-900">
            Academic transcript & report card
          </h1>
          <p className="mt-1 text-[14px] font-medium text-stone-500">
            Institutional certificate review for {learnerName}. Export a print-ready PDF for your records.
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/parent?child=${childId}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 transition-colors hover:text-amber-900"
          >
            <span aria-hidden>←</span>
            Back to dashboard
          </Link>
          <PrintTranscriptButton />
        </div>

        <p className="mb-6 text-sm text-stone-600">
          The transcript below mirrors the official document that will print. Use the button above to
          open your browser&apos;s print dialog and save as PDF.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 print:mx-0 print:max-w-none print:px-0 print:pb-0">
        <article
          className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10 print:w-full print:rounded-none print:border-slate-300 print:bg-white print:p-8 print:text-black print:shadow-none"
          aria-label="Official academic transcript"
        >
          <header className="border-b-2 border-slate-900 pb-6 print:border-black print:pb-4">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-700 print:text-black print:text-[10px]">
              Aalgorix World Academy
            </p>
            <h1 className="mt-3 text-center text-xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-2xl print:text-sm print:text-black">
              AALGORIX WORLD ACADEMY — OFFICIAL ACADEMIC TRANSCRIPT
            </h1>
          </header>

          <section
            className="mt-8 grid gap-4 border border-slate-200 sm:grid-cols-2 print:mt-4 print:gap-2 print:border-slate-400 print:text-xs"
            aria-label="Learner metadata"
          >
            <MetadataCell label="Learner Name" value={learnerName} />
            <MetadataCell
              label="Current Grade Classification Track"
              value={gradeClassificationTrack}
            />
            <MetadataCell
              label="Active Calendar Term Year"
              value={calendarTermYear}
            />
            <MetadataCell
              label="Cumulative Platform Grade Average"
              value={
                cumulativeAverage != null ? `${cumulativeAverage}%` : "Not yet recorded"
              }
            />
            <MetadataCell
              label="Registration Date"
              value={registrationDate}
              className="sm:col-span-2 print:col-span-2"
            />
          </section>

          <section className="mt-10 print:mt-6" aria-labelledby="course-matrix-heading">
            <h2
              id="course-matrix-heading"
              className="text-sm font-bold uppercase tracking-widest text-slate-700 print:text-xs print:text-black"
            >
              Core course progression matrix
            </h2>
            {transcriptCourses.length > 0 ? (
              <div className="mt-4 overflow-x-auto print:mt-2">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm print:text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 print:border-black">
                      <th className="py-2 pr-4 font-bold uppercase tracking-wide text-slate-700 print:text-black">
                        Course name
                      </th>
                      <th className="py-2 pr-4 font-bold uppercase tracking-wide text-slate-700 print:text-black">
                        Curriculum tag
                      </th>
                      <th className="py-2 pr-4 font-bold uppercase tracking-wide text-slate-700 print:text-black">
                        Live progress
                      </th>
                      <th className="py-2 font-bold uppercase tracking-wide text-slate-700 print:text-black">
                        Certified final score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcriptCourses.map((course) => (
                      <tr
                        key={course.courseId}
                        className="border-b border-slate-200 print:border-slate-400"
                      >
                        <td className="py-3 pr-4 font-semibold text-slate-900 print:text-black">
                          {course.title}
                        </td>
                        <td className="py-3 pr-4 text-slate-700 print:text-black">
                          {course.curriculumTag}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200 print:border print:border-slate-400 print:bg-white">
                              <div
                                className="h-full bg-slate-900 print:bg-black"
                                style={{ width: `${course.progressPercent}%` }}
                              />
                            </div>
                            <span className="tabular-nums font-bold text-slate-900 print:text-black">
                              {course.progressPercent}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 tabular-nums font-bold text-slate-900 print:text-black">
                          {course.certifiedFinalScore != null
                            ? `${course.certifiedFinalScore}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600 print:text-xs print:text-black">
                No active enrollments on record for this learner.
              </p>
            )}
          </section>

          <section className="mt-10 print:mt-6" aria-labelledby="assessments-log-heading">
            <h2
              id="assessments-log-heading"
              className="text-sm font-bold uppercase tracking-widest text-slate-700 print:text-xs print:text-black"
            >
              Chronological graded assessments log
            </h2>
            {gradedAssessments.length > 0 ? (
              <div className="mt-4 overflow-x-auto print:mt-2">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm print:text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 print:border-black">
                      <th className="py-2 pr-3 font-bold uppercase tracking-wide text-slate-700 print:text-black">
                        Date of evaluation
                      </th>
                      <th className="py-2 pr-3 font-bold uppercase tracking-wide text-slate-700 print:text-black">
                        Unit / lesson title
                      </th>
                      <th className="py-2 pr-3 font-bold uppercase tracking-wide text-slate-700 print:text-black">
                        Scored metric
                      </th>
                      <th className="py-2 font-bold uppercase tracking-wide text-slate-700 print:text-black">
                        Teacher feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradedAssessments.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-slate-200 align-top print:border-slate-400"
                      >
                        <td className="py-3 pr-3 whitespace-nowrap text-slate-700 print:text-black">
                          {formatShortDate(entry.evaluatedAt)}
                        </td>
                        <td className="py-3 pr-3">
                          <p className="font-semibold text-slate-900 print:text-black">
                            {entry.lessonTitle}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-600 print:text-black">
                            {entry.courseTitle} · {entry.assignmentTitle}
                          </p>
                        </td>
                        <td className="py-3 pr-3">
                          <span className="inline-flex rounded-md border border-slate-900 px-2 py-0.5 text-sm font-extrabold tabular-nums text-slate-900 print:border-black print:text-xs print:text-black">
                            {entry.grade}%
                          </span>
                        </td>
                        <td className="py-3 text-slate-800 print:text-black">
                          <blockquote className="border-l-2 border-slate-300 pl-3 italic leading-relaxed print:border-slate-500 print:pl-2 print:not-italic">
                            &ldquo;{entry.feedback}&rdquo;
                          </blockquote>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600 print:text-xs print:text-black">
                No graded submissions on record. Final scores will appear after teacher
                evaluation.
              </p>
            )}
          </section>

          <footer className="mt-12 border-t border-slate-300 pt-8 print:mt-8 print:border-slate-400 print:pt-6">
            <p className="text-xs leading-relaxed text-slate-600 print:text-[10px] print:text-black">
              This document is an official scholastic record generated from the Aalgorix
              World Academy learning platform. Scores reflect teacher-graded submissions
              (0–100). Progress metrics derive from verified lesson completion data.
              Unauthorized alteration voids this transcript.
            </p>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 print:mt-6 print:gap-6">
              <SignatureLine label="Registrar Verification Signature Seal" />
              <SignatureLine label="Date of Verification" />
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}

function MetadataCell({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`border border-slate-200 bg-slate-50/80 px-4 py-3 print:border-slate-400 print:bg-white ${className}`}
    >
      <dt className="text-xs font-bold uppercase tracking-widest text-slate-500 print:text-[10px] print:text-black">
        {label}
      </dt>
      <dd className="mt-1 text-base font-semibold text-slate-900 print:text-sm print:text-black">
        {value}
      </dd>
    </div>
  );
}

function SignatureLine({ label }: { label: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-700 print:text-[10px] print:text-black">
        {label}
      </p>
      <div
        className="mt-6 border-b border-slate-900 print:mt-4 print:border-black"
        aria-hidden
      >
        <span className="sr-only">Signature line</span>
      </div>
    </div>
  );
}
