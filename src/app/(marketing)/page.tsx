import Image from "next/image";
import Link from "next/link";

import { MarketingNav } from "./marketing-nav";
import { PublishedCoursesSection } from "./published-courses-section";

const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]";

const btnGhost =
  "inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98]";

const btnLink =
  "inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 transition-all duration-200 hover:text-violet-700 active:scale-[0.98]";

const PATHWAYS = [
  {
    badge: "British International",
    badgeClass: "bg-indigo-100 text-indigo-800 ring-indigo-200",
    title: "British International Curriculum",
    ages: "Ages 5–18",
    summary:
      "Primary through A-Levels with Cambridge-aligned progression: Primary, IGCSE, AS-Level, and A-Levels for UK and global university entry.",
    accent: "from-indigo-50 to-violet-50 ring-indigo-100",
  },
  {
    badge: "South African CAPS",
    badgeClass: "bg-amber-100 text-amber-900 ring-amber-200",
    title: "National South African CAPS / SACAI",
    ages: "Grade R – Grade 12",
    summary:
      "Full national pathway from foundation phase to matric, SACAI-accredited assessments, and university exemption readiness.",
    accent: "from-amber-50 to-orange-50 ring-amber-100",
  },
  {
    badge: "IEB Pathway",
    badgeClass: "bg-emerald-100 text-emerald-900 ring-emerald-200",
    title: "Independent Examinations Board (IEB)",
    ages: "Grade 1 – Grade 12",
    summary:
      "Rigorous independent schooling standard favoured by top South African universities and selective scholarship programmes.",
    accent: "from-emerald-50 to-teal-50 ring-emerald-100",
  },
  {
    badge: "American NCAA",
    badgeClass: "bg-violet-100 text-violet-900 ring-violet-200",
    title: "American High School Diploma",
    ages: "Grades 9–12",
    summary:
      "NCAA eligibility stream with Carnegie-unit credit tracking for US college athletics and international admissions offices.",
    accent: "from-violet-50 to-indigo-50 ring-violet-100",
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

const FEATURES = [
  {
    title: "Live Specialist Classes",
    body: "45-minute sessions with certified educators, auto-recorded for revision and catch-up.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="5" width="14" height="10" rx="2" />
        <path strokeLinecap="round" d="M17 9l4-2v10l-4-2" />
      </svg>
    ),
  },
  {
    title: "Teacher-Marked Assessments",
    body: "Homework marked and returned with written feedback within an 8-working-day SLA.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" d="M7 4h10l3 4v12H4V4h3" />
        <path strokeLinecap="round" d="M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    title: "Student Tracker Dashboard",
    body: "Real-time progress monitoring accessible by both students and parents simultaneously.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" d="M4 19V5M4 19h16" />
        <path strokeLinecap="round" d="M8 15l3-4 3 3 4-6" />
      </svg>
    ),
  },
  {
    title: "Direct Teacher Messaging",
    body: "Secure business-hour channels via text, audio, or video for structured academic support.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" d="M4 6h16v10H8l-4 4V6z" />
        <path strokeLinecap="round" d="M8 10h8M8 13h5" />
      </svg>
    ),
  },
] as const;

const PROOF_STATS = [
  {
    value: "98%",
    label: "University Acceptance",
    detail: "Accepted at Oxford, Cambridge, Harvard, Stanford",
  },
  {
    value: "80,000+",
    label: "Students Worldwide",
    detail: "Global cohort across time zones",
  },
  {
    value: "100+",
    label: "Countries Served",
    detail: "Expatriate and homeschooling families",
  },
  {
    value: "4.7★",
    label: "Average Parent Rating",
    detail: "Verified family satisfaction scores",
  },
] as const;

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "From $89",
    period: "/ month per student",
    features: ["Core live classes", "Digital resources", "Parent dashboard"],
  },
  {
    name: "Premium",
    price: "From $149",
    period: "/ month per student",
    highlight: true,
    features: [
      "Everything in Starter",
      "Teacher-marked assessments",
      "Priority advisor access",
    ],
  },
  {
    name: "Elite",
    price: "Custom",
    period: "multi-child & athlete plans",
    features: [
      "Dedicated success manager",
      "Custom pacing & timetables",
      "NCAA / IEB audit support",
    ],
  },
] as const;

export default function MarketingPage() {
  return (
    <>
      {/* 1. Top announcement bar */}
      <div className="bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-800 px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        <p>
          Cognia Accredited &amp; NCAA Approved for International University Admissions
          <span className="mx-2 hidden opacity-60 sm:inline">|</span>
          <Link
            href="#how-it-works"
            className="mt-1 inline-block underline decoration-white/40 underline-offset-2 transition-all duration-200 hover:decoration-white active:scale-[0.98] sm:mt-0 sm:inline"
          >
            Book a free consultation →
          </Link>
        </p>
      </div>

      {/* 2. Sticky navigation */}
      <MarketingNav />

      <main>
        {/* 3. Conversion hero */}
        <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 via-white to-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl"
          />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <p className="mb-4 inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-800">
                Accredited Online Academy
              </p>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
                One Academy.{" "}
                <span className="bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                  Six Accredited Curricula Pathways.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Provide your child with internationally recognized schooling taught by
                degree-qualified specialist teachers. Flexible pacing tailored for
                homeschooling, elite athletes, and global families.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/signup" className={btnPrimary}>
                  Enroll Your Child
                </Link>
                <a href="#how-it-works" className={btnGhost}>
                  Speak with an Advisor
                </a>
              </div>
              <p className="mt-6 text-sm text-slate-500">
                7-day trial available · No credit card required to consult
              </p>
            </div>

            {/* Platform mockup */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xl shadow-slate-300/40 ring-1 ring-slate-100">
                <div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    Student Workspace
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-5">
                  <div className="space-y-3 sm:col-span-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur">
                          <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5 text-white" fill="currentColor">
                            <path d="M8 5v14l11-7L8 5z" />
                          </svg>
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                        <p className="text-xs font-medium text-white">
                          Live Class Recording · Mathematics AS
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-700">Week Timeline</p>
                      <div className="mt-2 flex gap-1">
                        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                          <div
                            key={day}
                            className={`flex-1 rounded-md py-2 text-center text-[10px] font-medium ${
                              i === 2
                                ? "bg-indigo-600 text-white"
                                : "bg-white text-slate-500 ring-1 ring-slate-200"
                            }`}
                          >
                            {day}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:col-span-2">
                    <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                        Grade Analytics
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">87%</p>
                      <p className="text-xs text-slate-500">Term average</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100">
                        <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                      </div>
                    </div>
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 p-3">
                      <p className="text-xs font-semibold text-indigo-900">Assignments</p>
                      <ul className="mt-2 space-y-1.5 text-[11px] text-slate-600">
                        <li className="flex justify-between">
                          <span>Essay — History</span>
                          <span className="font-medium text-amber-700">Due Fri</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Problem Set — Physics</span>
                          <span className="font-medium text-emerald-700">Marked</span>
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-2 text-center text-[10px] font-medium text-violet-800">
                      Parent view synced
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Social proof strip */}
        <section
          className="border-y border-slate-200 bg-slate-900 text-white"
          aria-label="Academy outcomes"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-700 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
            {PROOF_STATS.map((stat) => (
              <div key={stat.label} className="px-6 py-8 text-center lg:py-10">
                <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-semibold text-indigo-200">{stat.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Curricula pathways */}
        <section
          id="curricula-pathways"
          className="scroll-mt-24 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Curricula Pathways
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Four flagship tracks within the AWA ecosystem—each with specialist teachers,
                structured pacing, and university-aligned outcomes.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {PATHWAYS.map((path) => (
                <article
                  key={path.title}
                  className={`flex flex-col rounded-2xl bg-gradient-to-br p-6 ring-1 ${path.accent}`}
                >
                  <span
                    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ${path.badgeClass}`}
                  >
                    {path.badge}
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-slate-900">{path.title}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{path.ages}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                    {path.summary}
                  </p>
                  <a href="#how-it-works" className={`mt-6 ${btnLink}`}>
                    Explore Pathway
                    <span aria-hidden>→</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <PublishedCoursesSection />

        {/* 6. How online school works */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-slate-100 bg-slate-50 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How Online School Works
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                A clear four-step pipeline from first consultation to live, interactive learning.
              </p>
            </div>
            <ol className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.num} className="relative">
                  {index < STEPS.length - 1 ? (
                    <span
                      aria-hidden
                      className="absolute right-0 top-8 hidden h-0.5 w-8 translate-x-full bg-gradient-to-r from-indigo-300 to-violet-300 lg:block"
                    />
                  ) : null}
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white">
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

        {/* 7. Ecosystem advantages */}
        <section
          id="academy-benefits"
          className="scroll-mt-24 bg-white py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Academy Benefits
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Day-to-day platform mechanics designed for accountability, feedback, and family
                visibility.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    {feature.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 text-center sm:p-8">
              <p className="text-sm font-semibold text-indigo-900">
                Assessment SLA: written feedback returned within{" "}
                <span className="font-extrabold">8 working days</span> on all teacher-marked
                submissions.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing — nav anchor */}
        <section id="pricing" className="scroll-mt-24 border-t border-slate-100 bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Flexible Plans
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Transparent monthly pathways—upgrade as your learner progresses. Full billing
                integration arrives in a later release.
              </p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {PRICING_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`flex flex-col rounded-2xl border p-8 ${
                    "highlight" in tier && tier.highlight
                      ? "border-indigo-300 bg-white shadow-xl shadow-indigo-100 ring-2 ring-indigo-500"
                      : "border-slate-200 bg-white shadow-sm"
                  }`}
                >
                  {"highlight" in tier && tier.highlight ? (
                    <span className="mb-4 w-fit rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
                      Most Popular
                    </span>
                  ) : (
                    <span className="mb-4 h-6" />
                  )}
                  <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                  <p className="mt-2">
                    <span className="text-3xl font-extrabold text-slate-900">{tier.price}</span>
                    <span className="text-sm text-slate-500">{tier.period}</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-0.5 text-emerald-600" aria-hidden>
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={
                      "highlight" in tier && tier.highlight
                        ? btnPrimary + " mt-8 w-full"
                        : btnGhost + " mt-8 w-full"
                    }
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-800 py-16 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              Ready to enroll your child?
            </h2>
            <p className="mt-4 text-indigo-100">
              Join families worldwide who trust accredited online schooling with specialist
              teachers and transparent progress tracking.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-800 transition-all duration-200 hover:bg-indigo-50 active:scale-[0.98]"
              >
                Enroll Your Child
              </Link>
              <Link
                href="/login"
                className="inline-flex rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-[0.98]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start lg:col-span-1">
              <Link
                href="/"
                className="inline-flex transition-all duration-200 active:scale-[0.98]"
                aria-label="Aalgorix World Academy home"
              >
                <span className="relative block h-36 w-36 shrink-0">
                  <Image
                    src="/brand/awa-logo-circular.svg"
                    alt="Aalgorix World Academy"
                    fill
                    sizes="144px"
                    className="object-contain h-full w-full"
                  />
                </span>
              </Link>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Curricula
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#curricula-pathways" className="transition-all duration-200 hover:text-white active:scale-[0.98]">
                    British International
                  </a>
                </li>
                <li>
                  <a href="#curricula-pathways" className="transition-all duration-200 hover:text-white active:scale-[0.98]">
                    CAPS / SACAI
                  </a>
                </li>
                <li>
                  <a href="#curricula-pathways" className="transition-all duration-200 hover:text-white active:scale-[0.98]">
                    IEB Pathway
                  </a>
                </li>
                <li>
                  <a href="#curricula-pathways" className="transition-all duration-200 hover:text-white active:scale-[0.98]">
                    American NCAA Stream
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Platform
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#how-it-works" className="transition-all duration-200 hover:text-white active:scale-[0.98]">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#academy-benefits" className="transition-all duration-200 hover:text-white active:scale-[0.98]">
                    Academy Benefits
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition-all duration-200 hover:text-white active:scale-[0.98]">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/login" className="transition-all duration-200 hover:text-white active:scale-[0.98]">
                    Student &amp; Parent Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Resources
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <span className="text-slate-500">Admissions Guide (coming soon)</span>
                </li>
                <li>
                  <span className="text-slate-500">University Tracker (coming soon)</span>
                </li>
                <li>
                  <span className="text-slate-500">Parent Handbook (coming soon)</span>
                </li>
                <li>
                  <Link href="/signup" className="font-semibold text-indigo-300 transition-all duration-200 hover:text-white active:scale-[0.98]">
                    Create Account →
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Aalgorix World Academy. All rights reserved.</p>
            <p className="text-center sm:text-right">
              Inspired by CambriLearn workflows · Privacy · Terms
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
