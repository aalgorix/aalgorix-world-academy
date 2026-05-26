import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fetchStudentMessagesData } from "@/lib/student/messages/fetch-student-messages-data";

import { CommunicationLounge } from "./_components/communication-lounge";

type StudentMessagesPageProps = {
  searchParams: Promise<{ teacher?: string }>;
};

export default async function StudentMessagesPage({
  searchParams,
}: StudentMessagesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/student/messages");
  }

  const result = await fetchStudentMessagesData(supabase, user.id);

  if (!result.ok) {
    redirect(result.redirectTo);
  }

  const params = await searchParams;
  const teacherQuery = params.teacher?.trim() ?? "";
  const initialChannelId = teacherQuery ? `teacher-${teacherQuery}` : null;

  const data = result.data;
  const displayName = data.displayName.trim() || "Student";
  const batchLabel = data.batchCode.trim() || "Intake cohort pending on profile";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Communication lounge
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Student messaging desk
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as{" "}
          <span className="font-semibold text-slate-800">{displayName}</span>. Batch
          channel:{" "}
          <span className="font-semibold text-slate-800">{batchLabel}</span>.
        </p>
      </header>

      <CommunicationLounge payload={data} initialChannelId={initialChannelId} />
    </div>
  );
}
