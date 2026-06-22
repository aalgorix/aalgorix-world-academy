import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { ConnectChildPanel } from "./connect-child-panel";
import { LinkedLearnersPanel } from "./linked-learners-panel";
import { ParentProfilePanel } from "./parent-profile-panel";

export default async function ParentSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/parent/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email, phone")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "parent") redirect("/parent");

  const { data: relations } = await supabase
    .from("student_parent_relations")
    .select("student_id")
    .eq("parent_id", user.id);

  const studentIds = relations?.map((row) => row.student_id) ?? [];

  const { data: studentProfiles } =
    studentIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", studentIds)
      : { data: [] };

  const linkedChildren = studentProfiles ?? [];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 800, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-stone-900">Family settings</h1>
        <p className="mt-1 text-[14px] font-medium text-stone-500">
          Link learners, manage your profile, and control family access.
        </p>
      </div>

      <div className="space-y-6">
        <ParentProfilePanel
          fullName={profile.full_name ?? ""}
          email={profile.email}
          phone={profile.phone ?? ""}
        />
        <ConnectChildPanel />
        <LinkedLearnersPanel linkedChildren={linkedChildren} />
        <div className="rounded-[22px] border border-stone-200 bg-white p-5">
          <Link href="/parent" className="text-[13px] font-bold text-amber-700 hover:text-amber-900">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
