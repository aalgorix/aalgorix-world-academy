import Link from "next/link";

import { profileInitials } from "@/lib/student/profile-display";

type StudentTopNavbarProps = {
  displayName: string | null;
  email: string;
  avatarUrl: string | null;
  notificationCount: number;
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 2a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 4 14h12a1 1 0 0 0 .707-1.707L16 11.586V8a6 6 0 0 0-6-6Zm0 16a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function StudentTopNavbar({
  displayName,
  email,
  avatarUrl,
  notificationCount,
}: StudentTopNavbarProps) {
  const initials = profileInitials(displayName, email);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex min-w-0 shrink-0 items-center">
        <Link
          href="/student"
          className="truncate text-sm font-extrabold tracking-tight text-slate-900 transition-all duration-200 hover:text-indigo-700 active:scale-[0.98] sm:text-base"
        >
          AALGORIX WORLD ACADEMY
        </Link>
      </div>

      <div className="hidden flex-1 justify-center px-4 sm:flex">
        <div className="relative w-full max-w-md">
          <SearchIcon />
          <input
            type="search"
            name="global-search"
            placeholder="Search courses, tasks, study materials, announcements..."
            className="w-full rounded-xl border border-slate-200 bg-[#fafafa] py-2 pr-4 pl-10 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
            aria-label="Search workspace"
          />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Link
          href="/student/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-[#fafafa] active:scale-[0.98]"
          aria-label={
            notificationCount > 0
              ? `Notifications, ${notificationCount} alerts`
              : "Notifications"
          }
        >
          <BellIcon />
          {notificationCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          ) : null}
        </Link>

        <Link
          href="/student/profile"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-sm ring-1 ring-slate-200 transition-all duration-200 hover:ring-indigo-300 active:scale-[0.98]"
          aria-label="Open profile and passport"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase avatar URLs
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-extrabold text-slate-700">{initials}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
