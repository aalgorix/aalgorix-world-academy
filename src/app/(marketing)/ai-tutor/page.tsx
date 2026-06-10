import Link from "next/link";

import { BrochureModalCta } from "../brochure-modal-cta";
import { MarketingNav } from "../marketing-nav";

const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]";

const btnGhost =
  "inline-flex items-center justify-center rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98]";

const TALENT_FARMING = [
  {
    title: "Discover strengths",
    body: "Patterns in practice—not only scores—reveal what to nurture next.",
  },
  {
    title: "Depth over dabbling",
    body: "Reps, feedback, and stretch work beat one-off “talent” events.",
  },
  {
    title: "Visible outcomes",
    body: "Projects and artefacts students can show as they grow.",
  },
  {
    title: "Humans + AI",
    body: "Tutor for pace and practice; coaches and teachers set the frame.",
  },
] as const;

const AI_TUTOR_FEATURES = [
  {
    title: "Personalised learning",
    body: "Pace, level, and practice adjust to the learner.",
  },
  {
    title: "Instant feedback",
    body: "Hints, explanations, and targeted practice.",
  },
  {
    title: "Progress visibility",
    body: "Parents see growth, gaps, and next steps.",
  },
  {
    title: "Special learning needs",
    body: "Flexible routines and extra support when needed.",
  },
] as const;

const AI_TUTOR_LOOP = [
  {
    step: "01",
    title: "Diagnose level & gaps",
    body: "Quick checks identify what the learner knows, what’s missing, and what’s next.",
  },
  {
    step: "02",
    title: "Explain in the right way",
    body: "Multiple explanations + examples until the concept clicks.",
  },
  {
    step: "03",
    title: "Practice with guidance",
    body: "Adaptive questions, hints, and step-by-step solutions build mastery.",
  },
  {
    step: "04",
    title: "Track progress for parents",
    body: "Clear reports that show growth, consistency, and areas needing attention.",
  },
] as const;

const AI_TUTOR_NOTES = [
  {
    title: "Human in the loop",
    body: "AI supports learning, while faculty + life coach provide structure, motivation, and standards.",
  },
  {
    title: "Designed for home learning",
    body: "Short sessions, regulated screen time, and practical offline suggestions for balance.",
  },
  {
    title: "Built for diverse learners",
    body: "Personalised pacing and routines can be adjusted for many special learning needs.",
  },
] as const;

function CheckIcon() {
  return (
    <span
      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
      aria-hidden
    >
      <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6l2.5 2.5 4.5-5" />
      </svg>
    </span>
  );
}

export default function AiTutorPage() {
  return (
    <>
      <MarketingNav />
      <main className="flex-1 bg-slate-50">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
            <Link
              href="/"
              className="inline-flex text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-violet-600"
            >
              ← Back to home
            </Link>

            <div className="mx-auto mt-8 max-w-3xl text-center lg:mt-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">AI Tutor</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                A personal AI tutor that adapts to your child
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600">
                Our AI tutoring system supports Grade 3 to Grade 12 with personalised learning paths, instant
                feedback, and clear progress tracking—so parents get clarity and students build confidence.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/ai-voice-assistant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnPrimary}
                >
                  Try AI Assistant
                </a>
                <Link href="/contact" className={btnGhost}>
                  Talk to Admissions
                </Link>
                <BrochureModalCta className={btnGhost} />
              </div>
            </div>

            <ul className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {AI_TUTOR_FEATURES.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Talent farming</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                We grow talent on purpose—not by accident
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                For us, <span className="font-semibold text-slate-700">talent farming</span> means spotting
                strengths early, building depth through practice and projects, and turning progress into{" "}
                <span className="font-semibold text-slate-700">portfolio-ready work</span> from Grade 3 through
                Grade 12. The <span className="font-semibold text-slate-700">AI Tutor</span> is the daily layer
                that adapts, closes gaps, and shows where a learner accelerates or stalls—signals we pair with
                faculty and talent pathways.
              </p>
            </div>

            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TALENT_FARMING.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link href="/why-us" className="font-semibold text-indigo-700 hover:text-violet-700">
                Talent support
              </Link>
              <span className="text-slate-300" aria-hidden>
                ·
              </span>
              <Link href="/our-story" className="font-semibold text-indigo-700 hover:text-violet-700">
                Learning model
              </Link>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">How the AI Tutor helps</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                A simple loop: assess → teach → practice → track
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                The AI Tutor works like a patient guide. It finds the right starting point, teaches in small
                steps, and keeps students moving forward with the right practice.
              </p>
            </div>

            <ol className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
              {AI_TUTOR_LOOP.map((item) => (
                <li
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Step {item.step}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </li>
              ))}
            </ol>

            <ul className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-3">
              {AI_TUTOR_NOTES.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
                >
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-slate-900 py-14 text-white sm:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Want to see it in action?</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Try the assistant, then talk to admissions for the right plan for your child.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://aimasterji.professorsai.org/"
                target="_blank"
                rel="noopener noreferrer"
                className={btnPrimary}
              >
                Try AI Assistant
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border-2 border-slate-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:border-slate-400 hover:bg-slate-800 active:scale-[0.98]"
              >
                Book a Call
              </Link>
              <div className="hidden sm:block text-slate-400" aria-hidden>
                <CheckIcon />
              </div>
              <Link href="/why-us" className="text-sm font-semibold text-indigo-300 hover:text-white">
                View full Why Us page →
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

