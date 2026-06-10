import Link from "next/link";

import { AnimatedStats } from "./animated-stats";
import { BrochureModalCta } from "./brochure-modal-cta";
import { CollaborationsCarousel } from "./collaborations-carousel";
import { FAQ_ENTRIES } from "./faq/faq-content";
import { MarketingNav } from "./marketing-nav";
import { StickyCta } from "./sticky-cta";
import { StudentShowcase } from "./student-showcase";

/* ============================================================
   Static data
   ============================================================ */

const AI_TUTOR_FEATURES = [
  {
    title: "24/7 On-Demand Answers",
    body: "Instant, accurate responses any time of day — no waiting for a teacher.",
  },
  {
    title: "Adaptive Difficulty",
    body: "Automatically calibrates lesson complexity to match your child's exact mastery level.",
  },
  {
    title: "Multi-Subject Mastery",
    body: "Covers every core subject from Mathematics and Science to English and History.",
  },
  {
    title: "Progress Intelligence",
    body: "Identifies gaps and strengths, building a personalised mastery roadmap over time.",
  },
] as const;

const LEARNING_SYSTEM = [
  {
    num: "01",
    title: "Assess",
    body: "Baseline diagnostic to understand level, learning gaps, and individual strengths.",
  },
  {
    num: "02",
    title: "Personalise",
    body: "AI-first curriculum plan plus supplementary courses designed for mastery.",
  },
  {
    num: "03",
    title: "Coach",
    body: "Faculty guidance combined with a life coach for consistency and lasting motivation.",
  },
  {
    num: "04",
    title: "Track",
    body: "Progress updates delivered to parents — clear, simple, and actionable.",
  },
] as const;

const STEPS = [
  {
    num: "01",
    title: "Book a Free Consultation",
    body: "Connect with education advisors to audit tracking requirements, residency rules, and university targets.",
  },
  {
    num: "02",
    title: "Choose Curriculum & Subjects",
    body: "Pick pathways aligned with target global universities, sport commitments, and pacing preferences.",
  },
  {
    num: "03",
    title: "Get Set Up",
    body: "Review custom timetables, order textbooks, and trigger a 7-day trial before your first live class.",
  },
  {
    num: "04",
    title: "Start Interactive Learning",
    body: "Attend weekly live classes, complete structured coursework, and track progress in your family dashboard.",
  },
] as const;

const FUTURE_READY_PILLARS = [
  {
    title: "AI Tutor",
    body: "Adaptive learning that matches pace, level, and goals — available around the clock.",
    icon: "🤖",
    accent: "from-indigo-600/10 to-violet-600/10 ring-indigo-500/20",
    iconBg: "from-indigo-600 to-violet-600",
  },
  {
    title: "Industry-Trained Faculty",
    body: "Clear explanations, high standards, and expert mentoring from certified specialists.",
    icon: "🎓",
    accent: "from-violet-600/10 to-fuchsia-600/10 ring-violet-500/20",
    iconBg: "from-violet-600 to-fuchsia-600",
  },
  {
    title: "Life Coach + Skills",
    body: "Discipline, confidence, communication, and leadership for a well-rounded learner.",
    icon: "🌟",
    accent: "from-rose-600/10 to-orange-600/10 ring-rose-500/20",
    iconBg: "from-rose-500 to-orange-500",
  },
  {
    title: "Talent Support",
    body: "Identify strengths early and nurture them consistently for a bright, distinct future.",
    icon: "🏆",
    accent: "from-emerald-600/10 to-teal-600/10 ring-emerald-500/20",
    iconBg: "from-emerald-500 to-teal-600",
  },
  {
    title: "Special Learning Needs",
    body: "Flexible pacing and dedicated extra support for learners who need more personalised care.",
    icon: "💛",
    accent: "from-sky-600/10 to-indigo-600/10 ring-sky-500/20",
    iconBg: "from-sky-500 to-indigo-500",
  },
] as const;

const HOME_GRADE_BANDS = [
  {
    grades: "Grade 3–5",
    title: "Foundations",
    body: "Confidence in basics and curiosity-led learning that builds a love for discovery.",
    color: "from-indigo-600 to-violet-600",
  },
  {
    grades: "Grade 6–8",
    title: "Explore",
    body: "Concept depth, projects, and structured study habits for sustained academic growth.",
    color: "from-violet-600 to-fuchsia-600",
  },
  {
    grades: "Grade 9–10",
    title: "Build Concepts",
    body: "Mastery plus supplementary courses to close gaps and accelerate understanding.",
    color: "from-rose-500 to-pink-600",
  },
  {
    grades: "Grade 11–12",
    title: "Future Ready",
    body: "Real-world skills, portfolio development, and university-ready outcomes.",
    color: "from-emerald-500 to-teal-600",
  },
] as const;

const FEATURES = [
  {
    title: "Live Specialist Classes",
    body: "45-minute sessions with certified educators, auto-recorded for revision and catch-up.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <rect x="3" y="5" width="14" height="10" rx="2" />
        <path strokeLinecap="round" d="M17 9l4-2v10l-4-2" />
      </svg>
    ),
  },
  {
    title: "Teacher-Marked Assessments",
    body: "Homework marked and returned with written feedback within an 8-working-day SLA.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" d="M7 4h10l3 4v12H4V4h3" />
        <path strokeLinecap="round" d="M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    title: "Student Tracker Dashboard",
    body: "Real-time progress monitoring accessible by both students and parents simultaneously.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" d="M4 19V5M4 19h16" />
        <path strokeLinecap="round" d="M8 15l3-4 3 3 4-6" />
      </svg>
    ),
  },
  {
    title: "Direct Teacher Messaging",
    body: "Secure business-hour channels via text, audio, or video for structured academic support.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" d="M4 6h16v10H8l-4 4V6z" />
        <path strokeLinecap="round" d="M8 10h8M8 13h5" />
      </svg>
    ),
  },
  {
    title: "Parent Dashboard",
    body: "Full visibility into your child's grades, attendance, and progress — always up to date.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    title: "Curriculum Coach",
    body: "Internationally accredited tracks tailored to your child's pacing and university pathway.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
        <path strokeLinecap="round" d="M12 3L2 9l10 6 10-6-10-6zM2 9v6l10 6 10-6V9" />
      </svg>
    ),
  },
] as const;

const STUDENT_TESTIMONIALS = [
  {
    name: "Arjun M.",
    grade: "Grade 10 · Mathematics",
    quote:
      "My math grades jumped from a C to an A+ in just 12 weeks. The AI Tutor explains everything at exactly my pace — I actually enjoy studying now.",
    improvement: "+2 Grades",
    avatar: "A",
    avatarColor: "from-indigo-500 to-violet-600",
  },
  {
    name: "Sophia L.",
    grade: "Grade 8 · Science",
    quote:
      "I used to dread science lessons. Now I look forward to every session. The 1-on-1 support and interactive experiments completely changed my mindset.",
    improvement: "Olympiad Winner",
    avatar: "S",
    avatarColor: "from-violet-500 to-fuchsia-600",
  },
  {
    name: "Rohan K.",
    grade: "Grade 12 · All Subjects",
    quote:
      "I balanced cricket training with full academics — something I never thought possible. AWA built me a schedule that actually worked. Heading to university abroad.",
    improvement: "University Offer",
    avatar: "R",
    avatarColor: "from-emerald-500 to-teal-600",
  },
] as const;

const PARENT_TESTIMONIALS = [
  {
    name: "Priya M.",
    role: "Parent · Grade 9 Student",
    quote:
      "The parent dashboard is a game-changer. I get real-time updates on my son's progress without having to chase teachers. The transparency is completely unmatched.",
    avatar: "P",
    avatarColor: "from-rose-400 to-pink-600",
  },
  {
    name: "David L.",
    role: "Parent · Grade 11 Student",
    quote:
      "As a working parent, flexibility was non-negotiable. AWA delivered that and so much more — expert teachers, AI support, and my daughter is genuinely thriving.",
    avatar: "D",
    avatarColor: "from-sky-500 to-blue-600",
  },
  {
    name: "Fatima A.",
    role: "Parent · Grade 7 Student",
    quote:
      "My daughter's confidence has transformed completely. The life coach sessions alongside academics gave her skills I never expected a 12-year-old to have.",
    avatar: "F",
    avatarColor: "from-amber-400 to-orange-500",
  },
] as const;

/* ============================================================
   Reusable primitives
   ============================================================ */

function StarIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4 text-amber-400"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SectionBadge({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <p
      className={`text-sm font-semibold uppercase tracking-[0.2em] ${
        dark ? "text-indigo-300" : "text-indigo-600"
      }`}
    >
      {children}
    </p>
  );
}

/* ============================================================
   Page component
   ============================================================ */

export default function MarketingPage() {
  return (
    <>
      {/* ── Announcement bar ───────────────────────────────── */}
      <div className="w-full bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-800 text-white">
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-2 px-4 py-2 sm:h-10 sm:flex-row sm:items-center sm:px-6 sm:py-0 lg:px-8">
          <p className="m-0 min-w-0 flex-1 text-left text-[11px] font-medium leading-snug tracking-wide sm:text-sm sm:leading-none">
            ⚡ Enrolling for the 2026 Academic Term: Secure Your Global Road to Success Today&nbsp;|{" "}
            <Link
              href="/contact"
              className="inline underline decoration-white/40 underline-offset-2 transition-all duration-200 hover:decoration-white active:scale-[0.98]"
            >
              Book a free consultation →
            </Link>
          </p>
          <div className="flex w-full flex-wrap items-center gap-1.5 text-[10px] sm:w-auto sm:justify-end sm:text-[11px]">
            <Link href="/contact" className="rounded border border-white/10 bg-white/10 px-2 py-0.5 font-medium text-white transition-all hover:bg-white/20">
              Enroll Now
            </Link>
            <Link href="/faq" className="rounded border border-white/10 bg-white/10 px-2 py-0.5 font-medium text-white transition-all hover:bg-white/20">
              FAQ
            </Link>
            <Link href="/blog" className="rounded border border-white/10 bg-white/10 px-2 py-0.5 font-medium text-white transition-all hover:bg-white/20">
              Blog
            </Link>
            <a
              href="https://wa.me/+919167495565"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-emerald-600 px-2 py-0.5 font-semibold text-white transition-all hover:bg-emerald-500"
            >
              WhatsApp
            </a>
            <Link href="/donate" className="rounded bg-red-600 px-2 py-0.5 font-semibold text-white transition-all hover:bg-red-500">
              Donate Now
            </Link>
          </div>
        </div>
      </div>

      {/* ── Sticky navigation ──────────────────────────────── */}
      <MarketingNav />

      <main>
        {/* ═══════════════════════════════════════════════════
            SECTION 1 — HERO (Light Aurora)
            ═══════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white"
          aria-label="Aalgorix World Academy — Premium AI-Powered Online Schooling"
        >
          {/* Aurora orbs — soft pastels on white */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="awa-aurora-orb-1 absolute -right-48 -top-48 h-[700px] w-[700px] rounded-full bg-violet-400/20 blur-[130px]" />
            <div className="awa-aurora-orb-2 absolute -left-48 top-1/2 h-[600px] w-[600px] rounded-full bg-indigo-400/15 blur-[110px]" />
            <div className="awa-aurora-orb-3 absolute -bottom-32 right-1/3 h-[500px] w-[500px] rounded-full bg-fuchsia-400/10 blur-[90px]" />
          </div>

          {/* Subtle dot grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.045]"
            style={{
              backgroundImage:
                "radial-gradient(circle, #6366f1 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative mx-auto grid min-h-[88vh] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
            {/* ── Left: copy ── */}
            <div className="max-w-xl lg:max-w-none">
              {/* Live badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
                <span aria-hidden className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
                Prepare your child for an Algorithmic Tomorrow
                </span>
              </div>

              {/* H1 */}
              <h1 className="mt-5 text-[2rem] font-black leading-[1.05] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] xl:text-[3.25rem]">
                Holistic Elite Education.{" "}
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  Driven by AI Cognitive Tutor.
                </span>
              </h1>

              {/* Body */}
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                We protect your child&apos;s well-being while identifying their core strengths,
                cultivating vital communication skills, and nurturing their distinct talents
                for an automated tomorrow.
              </p>

              {/* Sub-line */}
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Grade 3–12&nbsp;·&nbsp;Live Classes&nbsp;·&nbsp;AI-Personalised&nbsp;·&nbsp;Globally Accredited
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/40 active:scale-[0.98]"
                >
                  Enroll Your Child
                  <ArrowRight />
                </Link>
                <Link
                  href="/ai-tutor"
                  className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98]"
                >
                  Try AI Tutor
                </Link>
                <BrochureModalCta className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98]" />
              </div>

              {/* Social proof micro */}
              <div className="mt-8 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2" aria-hidden>
                    {(
                      [
                        "from-indigo-500 to-violet-600",
                        "from-violet-500 to-fuchsia-600",
                        "from-emerald-500 to-teal-600",
                        "from-rose-500 to-pink-600",
                      ] as const
                    ).map((color, i) => (
                      <div
                        key={i}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br text-xs font-bold text-white ${color}`}
                      >
                        {["A", "S", "R", "M"][i]}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    <span className="font-bold text-slate-900">500+</span>&nbsp;families worldwide
                  </p>
                </div>
                <div className="flex items-center gap-1" aria-label="Rated 4.9 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold text-slate-700">4.9 / 5</span>
                </div>
              </div>
            </div>

            {/* ── Right: video card ── */}
            <div className="relative mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
              {/* Floating stat — satisfaction */}
              <div
                aria-hidden
                className="awa-float-badge-a absolute -left-5 top-10 z-10 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-200/80 sm:block"
              >
                <p className="text-2xl font-black text-slate-900">98%</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">Student Satisfaction</p>
              </div>
              {/* Floating stat — outcomes */}
              <div
                aria-hidden
                className="awa-float-badge-b absolute -right-5 bottom-14 z-10 hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl shadow-slate-200/80 sm:block"
              >
                <p className="text-2xl font-black text-slate-900">2×</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">Better Outcomes</p>
              </div>

              {/* Video frame */}
              <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 via-violet-50/60 to-white p-2 shadow-2xl shadow-indigo-500/20 ring-1 ring-violet-100">
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 lg:aspect-[4/3]">
                  <video
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
                    preload="auto"
                    aria-hidden
                    tabIndex={-1}
                  >
                    <source src="/videos/awa-hero-video.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 1.5 — STUDENT SHOWCASE
            ═══════════════════════════════════════════════════ */}
        <StudentShowcase />

        {/* ═══════════════════════════════════════════════════
            SECTION 2 — FUTURE-READY PILLARS
            ═══════════════════════════════════════════════════ */}
        <section id="ai-tutor" className="scroll-mt-24 border-b border-slate-100 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <SectionBadge>Future-ready homeschooling</SectionBadge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Strong academics. Real-world skills.{" "}
                <span className="bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                  Powered by an AI Tutor.
                </span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Designed for{" "}
                <strong className="font-semibold text-slate-800">Grade 3 to Grade 12</strong>.
                Learn from the safety of your home with personalised learning paths,
                supplementary courses, and mentorship that builds life skills.
              </p>
            </div>

            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {FUTURE_READY_PILLARS.map((pillar) => (
                <li
                  key={pillar.title}
                  className={`rounded-2xl bg-gradient-to-br p-6 ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${pillar.accent}`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-xl ${pillar.iconBg}`}
                    aria-hidden
                  >
                    {pillar.icon}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 3 — AI TUTOR SHOWCASE (Dark)
            ═══════════════════════════════════════════════════ */}
        <section className="bg-slate-950 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">

              {/* Mock chat window */}
              <div className="relative">
                {/* Ambient glow behind card */}
                <div
                  aria-hidden
                  className="absolute inset-0 -m-6 rounded-3xl bg-indigo-600/10 blur-3xl"
                />
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-indigo-500/10">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 border-b border-white/10 bg-slate-950/60 px-4 py-3">
                    <div className="flex gap-1.5" aria-hidden>
                      <span className="h-3 w-3 rounded-full bg-red-500/70" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                      <span className="h-3 w-3 rounded-full bg-green-500/70" />
                    </div>
                    <div className="flex flex-1 justify-center">
                      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-0.5 text-xs text-slate-400">
                        Aalgo — AI Tutor
                      </div>
                    </div>
                  </div>

                  {/* AI avatar header */}
                  <div className="flex items-center gap-3 border-b border-white/10 bg-slate-800/40 px-4 py-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
                      aria-hidden
                    >
                      AI
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Aalgo</p>
                      <p className="flex items-center gap-1.5 text-xs text-emerald-400">
                        <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Online · Grade 3–12 Expert
                      </p>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div aria-label="AI Tutor chat demonstration" className="space-y-4 px-4 py-5">
                    <div className="flex justify-end">
                      <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                        Can you help me understand quadratic equations?
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white"
                      >
                        AI
                      </div>
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 px-4 py-2.5 text-sm leading-relaxed text-slate-200">
                        Of course! A quadratic equation has the form{" "}
                        <code className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 font-mono text-xs text-indigo-300">
                          ax² + bx + c = 0
                        </code>
                        . Let me walk you through it with a step-by-step visual example...
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="max-w-[78%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white">
                        What is the quadratic formula?
                      </div>
                    </div>

                    {/* Typing indicator */}
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[10px] font-bold text-white"
                      >
                        AI
                      </div>
                      <div className="rounded-2xl bg-slate-800 px-4 py-3.5">
                        <div className="flex items-center gap-1.5" aria-label="Aalgo is typing">
                          <span aria-hidden className="awa-typing-1 h-2 w-2 rounded-full bg-slate-400" />
                          <span aria-hidden className="awa-typing-2 h-2 w-2 rounded-full bg-slate-400" />
                          <span aria-hidden className="awa-typing-3 h-2 w-2 rounded-full bg-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="border-t border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5">
                      <span className="flex-1 text-sm text-slate-500" aria-hidden>
                        Ask anything across any subject…
                      </span>
                      <div
                        aria-hidden
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600"
                      >
                        <ArrowRight className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                    AI-Powered Learning
                  </span>
                </div>

                <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Meet Aalgo — Your Child&apos;s Personal AI Tutor
                </h2>

                <p className="mt-4 text-lg leading-relaxed text-slate-300">
                  Aalgo adapts to every student&apos;s unique learning style, pace, and gaps.
                  From Grade 3 to Grade 12 — available 24/7 with instant, personalised answers
                  across every subject.
                </p>

                <ul className="mt-8 space-y-5" aria-label="AI Tutor features">
                  {AI_TUTOR_FEATURES.map((feature) => (
                    <li key={feature.title} className="flex items-start gap-3">
                      <div
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600"
                        aria-hidden
                      >
                        <CheckIcon />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{feature.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{feature.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Link
                    href="/ai-tutor"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]"
                  >
                    Explore AI Tutor
                    <ArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 4 — ANIMATED STATS
            ═══════════════════════════════════════════════════ */}
        <AnimatedStats />

        {/* ═══════════════════════════════════════════════════
            SECTION 5 — HOW IT WORKS (Learning System)
            ═══════════════════════════════════════════════════ */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-slate-100 bg-slate-50 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <SectionBadge>How it works</SectionBadge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                A simple system that delivers results
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Personalised learning isn&apos;t just &ldquo;more content&rdquo;. It&apos;s the right
                sequence, the right pace, and the right support—so your child builds mastery and
                confidence.
              </p>
            </div>

            <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4" aria-label="Learning system steps">
              {LEARNING_SYSTEM.map((step, index) => (
                <li key={step.num} className="relative">
                  {index < LEARNING_SYSTEM.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute right-0 top-7 hidden h-px w-8 translate-x-full bg-gradient-to-r from-indigo-300 to-violet-300 lg:block"
                    />
                  )}
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-md">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
                      {step.num}
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 6 — GRADE JOURNEY
            ═══════════════════════════════════════════════════ */}
        <section id="life-journey" className="scroll-mt-24 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <SectionBadge>Grade 3 to Grade 12</SectionBadge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                AI-first curriculum with international board affiliation
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Built to prepare children for an{" "}
                <strong className="font-semibold text-slate-800">algorithmic world</strong>—with a
                strong academic base and a consistent focus on real-world skills and life skills.
              </p>
            </div>

            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Grade bands">
              {HOME_GRADE_BANDS.map((band) => (
                <li
                  key={band.grades}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl"
                >
                  {/* Hover gradient overlay */}
                  <div
                    aria-hidden
                    className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-5 ${band.color}`}
                  />
                  <div
                    className={`mb-4 inline-flex items-center rounded-full bg-gradient-to-r px-3 py-1 text-xs font-bold text-white ${band.color}`}
                  >
                    {band.grades}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{band.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{band.body}</p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]"
              >
                Explore Programs
                <ArrowRight />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98]"
              >
                Talk to Admissions
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 7 — ENROLLMENT JOURNEY
            ═══════════════════════════════════════════════════ */}
        <section
          id="get-started"
          className="scroll-mt-24 border-t border-slate-100 bg-slate-50 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <SectionBadge>How to enroll</SectionBadge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How Online School Works
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                A clear four-step pipeline from first consultation to live, interactive learning.
              </p>
            </div>

            <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4" aria-label="Enrollment steps">
              {STEPS.map((step, index) => (
                <li key={step.num} className="relative">
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute right-0 top-7 hidden h-px w-8 translate-x-full bg-gradient-to-r from-indigo-300 to-violet-300 lg:block"
                    />
                  )}
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-md">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/25">
                      {step.num}
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 8 — STUDENT SUCCESS STORIES
            ═══════════════════════════════════════════════════ */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <SectionBadge>Student Success Stories</SectionBadge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Real results, real students
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Students from Grade 3 to 12 are achieving outcomes they never thought possible.
              </p>
            </div>

            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {STUDENT_TESTIMONIALS.map((t) => (
                <article
                  key={t.name}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5" aria-label="5 star rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="mt-4 flex-1 text-base leading-relaxed text-slate-700">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  {/* Footer */}
                  <footer className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md ${t.avatarColor}`}
                      aria-hidden
                    >
                      {t.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.grade}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                      {t.improvement}
                    </span>
                  </footer>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 9 — PARENT TESTIMONIALS
            ═══════════════════════════════════════════════════ */}
        <section className="bg-slate-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <SectionBadge>What Parents Say</SectionBadge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Trusted by families worldwide
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Parents from across the globe share their experience with Aalgorix World Academy.
              </p>
            </div>

            <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {PARENT_TESTIMONIALS.map((t) => (
                <figure
                  key={t.name}
                  className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg"
                >
                  {/* Opening quote mark */}
                  <svg
                    aria-hidden
                    className="h-8 w-8 text-indigo-200"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>

                  <blockquote className="mt-4 flex-1 text-base leading-relaxed text-slate-700">
                    {t.quote}
                  </blockquote>

                  <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-md ${t.avatarColor}`}
                      aria-hidden
                    >
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5" aria-label="5 star rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 10 — ACADEMY FEATURES
            ═══════════════════════════════════════════════════ */}
        <section id="academy-benefits" className="scroll-mt-24 border-t border-slate-100 bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <SectionBadge>Academy Benefits</SectionBadge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Everything your family needs in one place
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Day-to-day platform mechanics designed for accountability, feedback, and complete
                family visibility.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 ring-1 ring-indigo-100 transition-all duration-300 group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white group-hover:ring-0">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 11 — FAQ
            ═══════════════════════════════════════════════════ */}
        <section
          id="parent-faq-vault"
          className="scroll-mt-24 border-t border-slate-100 bg-slate-50 py-24 sm:py-32"
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <SectionBadge>FAQ</SectionBadge>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">
                Quick answers about AI Tutor, personalised learning, life skills, and admissions.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {FAQ_ENTRIES.map((entry) => (
                <details
                  key={entry.id}
                  className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 open:border-indigo-200 open:shadow-md"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                    <span>{entry.question}</span>
                    <span
                      aria-hidden
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-200 group-open:rotate-45 group-open:bg-indigo-100 group-open:text-indigo-700"
                    >
                      +
                    </span>
                  </summary>
                  <div className="border-t border-slate-100 px-5 pb-4 pt-3">
                    <p className="text-sm leading-relaxed text-slate-600">{entry.answer}</p>
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98]"
              >
                Explore Programs
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]"
              >
                Talk to Admissions
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 transition-all duration-200 hover:text-violet-700 active:scale-[0.98]"
              >
                View all FAQ →
              </Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            SECTION 12 — COLLABORATIONS CAROUSEL
            ═══════════════════════════════════════════════════ */}
        <CollaborationsCarousel />

        {/* ═══════════════════════════════════════════════════
            SECTION 13 — FINAL CTA (Dark Premium)
            ═══════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-slate-950 py-24 sm:py-32">
          {/* Background glow */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-indigo-600/15 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300">
                Limited Spots Available
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to build a{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                future-ready
              </span>{" "}
              learning path?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
              Talk to admissions to find the right program for Grade 3 to 12. We&apos;ll recommend a
              personalised plan, supplementary courses, and the right mix of academics, AI support,
              and real-world skills.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-indigo-900 shadow-xl shadow-slate-950/30 transition-all duration-200 hover:bg-indigo-50 active:scale-[0.98]"
              >
                Enroll / Chat Now
                <ArrowRight />
              </Link>
              <a
                href="https://aimasterji.professorsai.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10 active:scale-[0.98]"
              >
                Try AI Assistant
              </a>
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Free consultation&nbsp;
              <span className="mx-2 opacity-40">·</span>
              No obligation&nbsp;
              <span className="mx-2 opacity-40">·</span>
              Response within 24 hours
            </p>
          </div>
        </section>
      </main>

      {/* ── Sticky enroll CTA ──────────────────────────────── */}
      <StickyCta />
    </>
  );
}
