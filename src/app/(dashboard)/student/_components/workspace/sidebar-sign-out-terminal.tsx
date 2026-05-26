"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function SidebarSignOutTerminal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="w-full rounded-xl border border-slate-700/80 bg-slate-800/40 px-4 py-3 text-left text-sm font-bold text-slate-300 opacity-80 transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white hover:opacity-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        Session
      </span>
      <span className="mt-0.5 block">
        {loading ? "Signing out…" : "Sign Out / Exit Terminal"}
      </span>
    </button>
  );
}
