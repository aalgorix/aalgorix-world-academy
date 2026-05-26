"use client";

type RadialDialProps = {
  label: string;
  value: number;
  suffix?: string;
  accentClass: string;
  trackClass?: string;
};

export function RadialDial({
  label,
  value,
  suffix = "%",
  accentClass,
  trackClass = "text-slate-200",
}: RadialDialProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            strokeWidth="8"
            className={trackClass}
            stroke="currentColor"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={accentClass}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold tabular-nums text-slate-900">
            {suffix === "%" ? clamped : value}
          </span>
          {suffix ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-bold text-slate-700">{label}</p>
    </div>
  );
}
