"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ============================================================
   Types
   ============================================================ */

interface Student {
  id: number;
  name: string;
  age: number;
  passion: string;
  icon: string;
  achievement: string;
  photo: string;
  avatarFrom: string;
  avatarTo: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

interface Decoration {
  symbol: string;
  top: string;
  left?: string;
  right?: string;
  size: string;
  delay: string;
  opacity: string;
}

/* ============================================================
   Data
   ============================================================ */

const STUDENTS: Student[] = [
  {
    id: 1,
    name: "Arjun",
    age: 19,
    passion: "Robotics",
    icon: "🤖",
    achievement: "Built a line-following robot and placed 2nd in the State STEM Challenge.",
    photo: "/images/students/arjun.jpg",
    avatarFrom: "from-indigo-500",
    avatarTo: "to-blue-600",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-200",
  },
  {
    id: 2,
    name: "Priya",
    age: 18,
    passion: "Astronomy",
    icon: "🔭",
    achievement: "Mapped 15 constellations and authored her own star-gazing journal.",
    photo: "/images/students/priya.jpg",
    avatarFrom: "from-violet-500",
    avatarTo: "to-purple-700",
    badgeBg: "bg-violet-50",
    badgeText: "text-violet-700",
    badgeBorder: "border-violet-200",
  },
  {
    id: 3,
    name: "Aisha",
    age: 11,
    passion: "Creative Writing",
    icon: "✍️",
    achievement: "Published her first short story in a regional youth literature magazine.",
    photo: "/images/students/aisha.jpg",
    avatarFrom: "from-rose-400",
    avatarTo: "to-pink-600",
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-200",
  },
  {
    id: 4,
    name: "Riya",
    age: 13,
    passion: "Music",
    icon: "🎵",
    achievement: "Composed an original piano piece and performed at a city youth concert.",
    photo: "/images/students/riya.jpg",
    avatarFrom: "from-amber-500",
    avatarTo: "to-orange-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
  },
  {
    id: 5,
    name: "Zara",
    age: 9,
    passion: "Art & Design",
    icon: "🎨",
    achievement: "Illustrated a children's storybook displayed at a local art exhibition.",
    photo: "/images/students/zara.jpg",
    avatarFrom: "from-fuchsia-500",
    avatarTo: "to-pink-500",
    badgeBg: "bg-fuchsia-50",
    badgeText: "text-fuchsia-700",
    badgeBorder: "border-fuchsia-200",
  },
  {
    id: 6,
    name: "Dev",
    age: 18,
    passion: "AI & Machine Learning",
    icon: "🧠",
    achievement: "Trained a plant-health classifier using photos from his own home garden.",
    photo: "/images/students/dev.jpg",
    avatarFrom: "from-slate-700",
    avatarTo: "to-indigo-700",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    badgeBorder: "border-slate-300",
  },
];

const DECORATIONS: Decoration[] = [
  { symbol: "📚", top: "10%",  left: "2.5%",  size: "text-3xl",        delay: "0s",    opacity: "opacity-[0.18]" },
  { symbol: "⚛️",  top: "18%",  right: "3%",  size: "text-2xl",        delay: "1.3s",  opacity: "opacity-[0.16]" },
  { symbol: "🎓", top: "68%",  left: "2%",   size: "text-2xl",        delay: "2.6s",  opacity: "opacity-[0.14]" },
  { symbol: "🔬", top: "78%",  right: "3.5%", size: "text-3xl",       delay: "0.9s",  opacity: "opacity-[0.14]" },
  { symbol: "✨", top: "42%",  left: "0.8%", size: "text-xl",         delay: "1.9s",  opacity: "opacity-[0.12]" },
  { symbol: "💡", top: "55%",  right: "1.5%", size: "text-2xl",       delay: "3.1s",  opacity: "opacity-[0.14]" },
];

/* duration of one full loop (16 duplicated cards) */
const DURATION_S = 48;

/* ============================================================
   StudentAvatar — renders photo or a gradient fallback
   ============================================================ */

function StudentAvatar({
  src,
  name,
  icon,
  from,
  to,
}: {
  src: string;
  name: string;
  icon: string;
  from: string;
  to: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br ${from} ${to} gap-2`}
      >
        <span className="text-5xl leading-none sm:text-6xl" aria-hidden>
          {icon}
        </span>
        <span className="text-sm font-bold text-white/90 sm:text-base">{name}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`${name} — student at Aalgorix World Academy`}
      fill
      sizes="(max-width: 640px) 180px, 220px"
      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
      onError={() => setFailed(true)}
    />
  );
}

/* ============================================================
   StudentCard
   ============================================================ */

function StudentCard({ student }: { student: Student }) {
  return (
    <article
      className="group relative w-[178px] shrink-0 cursor-default overflow-hidden rounded-[22px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.06] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(0,0,0,0.12)] focus-within:ring-2 focus-within:ring-indigo-400 focus-within:ring-offset-2 sm:w-[216px]"
      aria-label={`${student.name}, age ${student.age}, interested in ${student.passion}: ${student.achievement}`}
    >
      {/* ── Photo ── */}
      <div className="relative h-[218px] overflow-hidden bg-slate-100 sm:h-[264px]">
        <StudentAvatar
          src={student.photo}
          name={student.name}
          icon={student.icon}
          from={student.avatarFrom}
          to={student.avatarTo}
        />

        {/* Subtle dark-to-transparent gradient at bottom of photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent"
        />

        {/* Passion badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[5px] text-[11px] font-bold backdrop-blur-sm ${student.badgeBg} ${student.badgeText} ${student.badgeBorder}`}
          >
            <span aria-hidden>{student.icon}</span>
            {student.passion}
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="px-3.5 py-3 sm:px-4 sm:py-3.5">
        <div className="flex items-baseline justify-between gap-1">
          <h3 className="truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
            {student.name}
          </h3>
          <span className="shrink-0 text-[11px] font-semibold text-slate-400">Age {student.age}</span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-slate-500 sm:line-clamp-3 sm:text-[13px]">
          {student.achievement}
        </p>
      </div>

      {/* Hover inset glow ring */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 ring-1 ring-inset ring-indigo-400/40 transition-opacity duration-300 group-hover:opacity-100"
      />
    </article>
  );
}

/* ============================================================
   StudentShowcase (main export)
   ============================================================ */

export function StudentShowcase() {
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  /* Duplicate the array for a seamless infinite loop */
  const loopedStudents = [...STUDENTS, ...STUDENTS];

  const animationStyle = reducedMotion
    ? {}
    : {
        animation: `awa-marquee ${DURATION_S}s linear infinite`,
        animationPlayState: paused ? "paused" : "running",
        willChange: "transform",
      };

  return (
    <section
      className="relative overflow-hidden py-20 sm:py-28"
      style={{
        background: "linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 45%, #FFFFFF 100%)",
      }}
      aria-label="Student showcase — Learning Beyond Boundaries"
    >
      {/* ── Decorative floating elements ── */}
      {DECORATIONS.map((d, i) => (
        <div
          key={i}
          aria-hidden
          className={`awa-float-badge-a pointer-events-none absolute select-none ${d.size} ${d.opacity}`}
          style={{
            top: d.top,
            ...(d.left !== undefined ? { left: d.left } : { right: d.right }),
            animationDelay: d.delay,
          }}
        >
          {d.symbol}
        </div>
      ))}

      {/* ── Section header ── */}
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          <span className="text-xs font-semibold uppercase tracking-widest text-sky-700">
            Our Learners
          </span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
          Learning Beyond{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Boundaries
          </span>
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
          Meet our young learners exploring their passions through personalised homeschooling.
        </p>
      </div>

      {/* ── Carousel ── */}
      <div className="relative mt-14 sm:mt-16">
        {/* Left edge fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 sm:w-28"
          style={{
            background: "linear-gradient(to right, #F8FAFC, transparent)",
          }}
        />
        {/* Right edge fade */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 sm:w-28"
          style={{
            background: "linear-gradient(to left, #F8FAFC, transparent)",
          }}
        />

        {/* Scrollable outer — overflow-x on reduced-motion */}
        <div
          className={reducedMotion ? "overflow-x-auto pb-4" : "overflow-hidden"}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => {
            setTimeout(() => setPaused(false), 2000);
          }}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* Track */}
          <div
            className="flex gap-4 px-6 py-4 sm:gap-5"
            style={animationStyle}
            role="list"
            aria-label="Student cards — scroll to explore"
          >
            {loopedStudents.map((student, idx) => (
              <div key={`${student.id}-${idx}`} role="listitem">
                <StudentCard student={student} />
              </div>
            ))}
          </div>
        </div>

        {/* Pause indicator (visible on hover) */}
        {paused && !reducedMotion && (
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/60 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm"
          >
            Paused
          </div>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="relative mx-auto mt-14 max-w-xl px-4 text-center sm:mt-16 sm:px-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Ready to begin?
        </p>
        <p className="text-lg font-bold text-slate-800 sm:text-xl">
          Join Our Learning Community
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
          Every child&apos;s journey starts with a conversation. Let&apos;s find the perfect fit for yours.
        </p>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-xl hover:shadow-indigo-500/35 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            Book a Free Consultation
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h12M10 4l6 6-6 6" />
            </svg>
          </Link>

          <Link
            href="/ai-tutor"
            className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            Explore AI Tutor
          </Link>
        </div>
      </div>
    </section>
  );
}
