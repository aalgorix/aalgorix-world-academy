import { redirect } from "next/navigation";

import { requireParentSession } from "@/lib/parent/queries";

export default async function ParentReportCardIndexPage() {
  const session = await requireParentSession("/parent/report-card");

  if (session.children.length === 0) {
    redirect("/parent/settings");
  }

  redirect(`/parent/report-card/${session.children[0].id}`);
}
