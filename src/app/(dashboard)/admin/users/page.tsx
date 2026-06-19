import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { UsersPanel } from "./users-panel";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  phone: string | null;
  created_at: string;
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/users");

  const { data: profileRows } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, phone, created_at")
    .order("created_at", { ascending: false });

  const profiles = (profileRows ?? []) as ProfileRow[];

  return (
    <div
      className="mx-auto w-full sd-float-up"
      style={{ maxWidth: 1320, padding: "28px 32px 80px" }}
    >
      <UsersPanel profiles={profiles} initialQuery={q ?? ""} />
    </div>
  );
}
