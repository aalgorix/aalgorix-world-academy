"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  CalendarDays,
  Flame,
  GraduationCap,
  Play,
} from "lucide-react";
import Link from "next/link";

interface HeroBannerProps {
  name: string;
  gradeLabel: string;
  yearLabel: string;
  streakDays: number;
  goalDone: number;
  goalTotal: number;
  todayLabel: string;
  motivation: string;
}

export function HeroBanner({
  name,
  gradeLabel,
  yearLabel,
  streakDays,
  goalDone,
  goalTotal,
  todayLabel,
  motivation,
}: HeroBannerProps) {
  const goalPct = Math.round((goalDone / goalTotal) * 100);
  const R = 44;
  const C = +(2 * Math.PI * R).toFixed(1);
  const offset = +(C - (goalPct / 100) * C).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0.4, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[26px] text-white"
      style={{
        background:
          "linear-gradient(125deg,#5B5BF0 0%,#7158F0 48%,#8B5CF6 100%)",
        boxShadow: "0 18px 44px rgba(99,102,241,.30)",
        padding: "clamp(24px,4vw,34px) clamp(22px,4vw,38px)",
      }}
    >
      {/* decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[60px] -right-[30px] w-[240px] h-[240px] rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(255,255,255,.18),transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[90px] right-[120px] w-[200px] h-[200px] rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(34,211,238,.30),transparent 65%)",
        }}
      />

      <div className="relative flex flex-wrap items-center justify-between gap-7">
        {/* left – text + chips + CTAs */}
        <div className="flex-1 min-w-0" style={{ flexBasis: "360px" }}>
          <p
            className="text-[11px] font-semibold uppercase tracking-[1.5px] font-mono"
            style={{ color: "rgba(255,255,255,.78)" }}
          >
            {todayLabel}
          </p>
          <h1 className="mt-2 mb-2 text-[clamp(26px,3.4vw,38px)] font-extrabold tracking-tight leading-tight">
            Welcome back, {name} 👋
          </h1>
          <p
            className="text-[15px] font-medium leading-relaxed max-w-[440px]"
            style={{ color: "rgba(255,255,255,.85)" }}
          >
            {motivation}
          </p>

          {/* chips */}
          <div className="flex flex-wrap gap-2 mt-4 mb-5">
            {[
              {
                icon: <GraduationCap className="w-3.5 h-3.5 shrink-0" />,
                label: gradeLabel,
              },
              {
                icon: <Calendar className="w-3.5 h-3.5 shrink-0" />,
                label: yearLabel,
              },
              {
                icon: (
                  <Flame className="w-3.5 h-3.5 shrink-0 text-yellow-300" />
                ),
                label: `${streakDays}-day streak`,
              },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-bold"
                style={{
                  background: "rgba(255,255,255,.16)",
                  border: "1px solid rgba(255,255,255,.18)",
                }}
              >
                {icon}
                {label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Link
              href="/student/courses"
              className="flex items-center gap-2 px-5 py-3 rounded-[13px] font-bold text-sm bg-white text-[#5B5BF0] transition-transform active:scale-[.98] hover:shadow-lg"
              style={{ boxShadow: "0 8px 20px rgba(0,0,0,.14)" }}
            >
              <Play className="w-4 h-4 fill-[#5B5BF0]" />
              Continue learning
            </Link>
            <Link
              href="/student/calendar"
              className="flex items-center gap-2 px-5 py-3 rounded-[13px] font-bold text-sm transition-colors"
              style={{
                background: "rgba(255,255,255,.10)",
                border: "1px solid rgba(255,255,255,.35)",
                color: "#fff",
              }}
            >
              <CalendarDays className="w-4 h-4" />
              View timetable
            </Link>
          </div>
        </div>

        {/* right – weekly goal ring */}
        <div
          className="shrink-0 rounded-[20px] p-5 text-center"
          style={{
            background: "rgba(255,255,255,.14)",
            border: "1px solid rgba(255,255,255,.2)",
            backdropFilter: "blur(6px)",
            minWidth: "150px",
          }}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.5px] font-mono mb-3"
            style={{ color: "rgba(255,255,255,.78)" }}
          >
            Weekly goal
          </p>
          <div className="relative w-[104px] h-[104px] mx-auto">
            <svg width="104" height="104" viewBox="0 0 104 104">
              <circle
                cx="52"
                cy="52"
                r={R}
                fill="none"
                stroke="rgba(255,255,255,.22)"
                strokeWidth="9"
              />
              <motion.circle
                cx="52"
                cy="52"
                r={R}
                fill="none"
                stroke="#fff"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={C}
                initial={{ strokeDashoffset: C }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                transform="rotate(-90 52 52)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold">{goalPct}%</span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: "rgba(255,255,255,.8)" }}
              >
                {goalDone}/{goalTotal} days
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
