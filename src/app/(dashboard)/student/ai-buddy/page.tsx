import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fetchAiBuddyWorkspaceData } from "@/lib/student/ai-buddy/fetch-ai-buddy-workspace-data";

import { AiBuddyWorkspace } from "./_components/ai-buddy-workspace";

export default async function StudentAiBuddyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/student/ai-buddy");
  }

  const result = await fetchAiBuddyWorkspaceData(supabase, user.id);

  if (!result.ok) {
    redirect(result.redirectTo);
  }

  const data = result.data;
  const displayName = data.displayName.trim() || "Student";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-violet-600">
          AI study buddy
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Conversational study workspace
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as{" "}
          <span className="font-semibold text-slate-800">{displayName}</span>. Bind
          AI coaching to an enrolled course, module, or lesson—shortcuts unlock at the
          lesson level.
        </p>
      </header>

      <AiBuddyWorkspace payload={data} />
    </div>
  );
}
