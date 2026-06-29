import { redirect } from "next/navigation";

import { CertificatesView } from "@/components/student/certificates-view";
import { fetchStudentAchievementSnapshot } from "@/lib/student/queries";
import { createClient } from "@/lib/supabase/server";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/student/certificates");

  const achievements = await fetchStudentAchievementSnapshot(user.id);

  return (
    <CertificatesView
      badges={achievements.badges}
      certificates={achievements.certificates}
    />
  );
}
