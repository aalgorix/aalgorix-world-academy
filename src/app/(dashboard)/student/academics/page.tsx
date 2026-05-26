import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fetchStudentAcademicsData } from "@/lib/student/academics/fetch-student-academics-data";

import { AcademicsQuadPanel } from "./_components/academics-quad-panel";
import { AcademicsSummaryMetricsBar } from "./_components/academics-summary-metrics";

export default async function StudentAcademicsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/student/academics");
  }

  const result = await fetchStudentAcademicsData(supabase, user.id);

  if (!result.ok) {
    redirect(result.redirectTo);
  }

  const data = result.data;
  const displayName = data.displayName.trim() || "Student";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Academics quad
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Curriculum, vault &amp; assessment records
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as{" "}
          <span className="font-semibold text-slate-800">{displayName}</span>. Browse
          enrolled tracks, download study assets, and review graded coursework.
        </p>
      </header>

      <AcademicsSummaryMetricsBar metrics={data.metrics} />

      <AcademicsQuadPanel
        courses={data.courses}
        materials={data.materials}
        videos={data.videos}
        submissions={data.submissions}
      />
    </div>
  );
}
