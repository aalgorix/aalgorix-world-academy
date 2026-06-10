"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function StickyCta() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 700);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="complementary"
      aria-label="Enrollment call to action"
      className={`fixed bottom-0 left-0 right-0 z-40 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="border-t border-slate-200/60 bg-white/96 px-4 py-3 shadow-2xl shadow-slate-950/15 backdrop-blur-lg sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              <span className="hidden sm:inline">
                Ready to give your child a world-class education?{" "}
              </span>
              <span className="sm:hidden">Secure your child&apos;s future today.</span>
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Free consultation&nbsp;·&nbsp;No obligation&nbsp;·&nbsp;Response within 24&nbsp;hours
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]"
            >
              Enroll Now
            </Link>
            <button
              type="button"
              aria-label="Dismiss enrollment banner"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-[0.98]"
              onClick={() => setDismissed(true)}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
