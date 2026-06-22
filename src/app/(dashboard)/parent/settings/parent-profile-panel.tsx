"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateParentProfileAction } from "./actions";

export function ParentProfilePanel({
  fullName,
  email,
  phone,
}: {
  fullName: string;
  email: string;
  phone: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const result = await updateParentProfileAction(new FormData(e.currentTarget));
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? "Update failed.");
      return;
    }

    setMessage("Profile updated.");
    router.refresh();
  }

  return (
    <div
      className="bg-white border border-stone-200 rounded-[22px] overflow-hidden"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04)" }}
    >
      <div className="px-6 py-4 border-b border-stone-100">
        <h2 className="text-[16px] font-extrabold text-stone-900">Your profile</h2>
        <p className="text-[13px] text-stone-500 mt-0.5">Guardian account details</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
        <div>
          <label className="block text-[12px] font-extrabold uppercase tracking-wider text-stone-500 mb-1.5">
            Full name
          </label>
          <input
            name="full_name"
            defaultValue={fullName}
            required
            className="w-full border border-stone-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <label className="block text-[12px] font-extrabold uppercase tracking-wider text-stone-500 mb-1.5">
            Email
          </label>
          <input
            value={email}
            disabled
            className="w-full border border-stone-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium bg-stone-50 text-stone-500"
          />
        </div>

        <div>
          <label className="block text-[12px] font-extrabold uppercase tracking-wider text-stone-500 mb-1.5">
            Phone
          </label>
          <input
            name="phone"
            defaultValue={phone}
            placeholder="Optional"
            className="w-full border border-stone-200 rounded-[12px] px-4 py-2.5 text-[13.5px] font-medium outline-none focus:border-amber-400"
          />
        </div>

        {error && (
          <div className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-[12px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] font-semibold text-emerald-800">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="self-start inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg,#D97706,#B45309)" }}
        >
          {loading && <Loader2 size={15} className="animate-spin" />}
          {loading ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
