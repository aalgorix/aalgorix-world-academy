import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { fetchStudentHubData } from "@/lib/student/hub/fetch-student-hub-data";

import { AnnouncementsBulletin } from "./_components/hub/announcements-bulletin";
import { CurrentAffairsCarousel } from "./_components/hub/current-affairs-carousel";
import { GreetingTelemetryCard } from "./_components/hub/greeting-telemetry-card";
import { OperationsInteractiveStack } from "./_components/hub/operations-interactive-stack";
import { TeacherMessageShortcuts } from "./_components/hub/teacher-message-shortcuts";

export default async function StudentHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/student");
  }

  const result = await fetchStudentHubData(supabase, user.id);

  if (!result.ok) {
    redirect(result.redirectTo);
  }

  const data = result.data;

  return (
    <div
      id="hub-overview"
      className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-6 lg:grid-cols-12"
    >
      <div className="space-y-6 lg:col-span-8">
        <GreetingTelemetryCard
          displayName={data.displayName}
          batchCode={data.batchCode}
          todayLabel={data.todayLabel}
          revisionCount={data.revisionCount}
          telemetry={data.telemetry}
        />

        <OperationsInteractiveStack
          payload={{
            courses: data.courses,
            assignments: data.assignments,
            vaultItems: data.vaultItems,
            liveSession: data.liveSession,
            aiContext: data.aiContext,
          }}
        />
      </div>

      <aside
        aria-label="Infomedia and team channels"
        className="space-y-6 lg:col-span-4"
        id="hub-messages"
      >
        <AnnouncementsBulletin announcements={data.announcements} />
        <CurrentAffairsCarousel newsCards={data.newsCards} />
        <TeacherMessageShortcuts teachers={data.teacherContacts} />
      </aside>
    </div>
  );
}
