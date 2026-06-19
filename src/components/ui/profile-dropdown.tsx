"use client";

import { HelpCircle, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type MenuItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
};

type Props = {
  /** The coloured circle trigger — pass initials or an img */
  trigger: React.ReactNode;
  /** Display name shown at the top of the dropdown */
  displayName: string;
  /** Subtitle below the name (role / grade, etc.) */
  subtitle?: string;
  /** Extra nav items — injected above the always-present Sign out row */
  items: MenuItem[];
};

export function ProfileDropdown({ trigger, displayName, subtitle, items }: Props) {
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const ref               = useRef<HTMLDivElement>(null);
  const router            = useRouter();

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown",   handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown",   handler);
    };
  }, [open]);

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="focus:outline-none rounded-full"
      >
        {trigger}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[200] w-[230px] rounded-[18px] border border-slate-200 bg-white py-2 shadow-[0_8px_32px_rgba(0,0,0,.14)]"
          role="menu"
        >
          {/* Identity header */}
          <div className="px-4 pb-2.5 pt-3 border-b border-slate-100">
            <p className="text-[13.5px] font-extrabold text-slate-900 truncate">{displayName}</p>
            {subtitle && (
              <p className="text-[11.5px] text-slate-500 truncate mt-0.5">{subtitle}</p>
            )}
          </div>

          {/* Items */}
          <div className="py-1.5">
            {items.map((item) =>
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold transition-colors hover:bg-slate-50"
                  style={{ color: item.danger ? "#EF4444" : "#334155" }}
                >
                  <span style={{ color: item.danger ? "#EF4444" : "#64748B" }}>{item.icon}</span>
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={() => { setOpen(false); item.onClick?.(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold transition-colors hover:bg-slate-50 text-left"
                  style={{ color: item.danger ? "#EF4444" : "#334155" }}
                >
                  <span style={{ color: item.danger ? "#EF4444" : "#64748B" }}>{item.icon}</span>
                  {item.label}
                </button>
              )
            )}
          </div>

          {/* Sign out — always last */}
          <div className="border-t border-slate-100 pt-1.5 pb-1">
            <button
              role="menuitem"
              disabled={busy}
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] font-semibold transition-colors hover:bg-red-50 disabled:opacity-60 text-left"
              style={{ color: "#EF4444" }}
            >
              <LogOut size={15} style={{ color: "#EF4444" }} />
              {busy ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
