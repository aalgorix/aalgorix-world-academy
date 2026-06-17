"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Clock,
  Code,
  FileText,
  FlaskConical,
  Globe,
  Lock,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------
type AssessmentType = "quiz" | "test" | "mock_exam";
type AssessmentState = "upcoming" | "available" | "completed" | "locked";

type Assessment = {
  id: string;
  title: string;
  subject: string;
  subject_key: string;
  type: AssessmentType;
  state: AssessmentState;
  duration: string;
  questions: number;
  dateLabel: string;
  score: number | null;
  maxScore: number;
  passMark: number;
};

const SUBJECT_STYLE: Record<string, { solid: string; bg: string; border: string; grad: string }> = {
  math:    { solid:"#4F6BFF", bg:"#EDF1FF", border:"#DCE3FF", grad:"linear-gradient(135deg,#6E8BFF,#3B5BFF)" },
  science: { solid:"#10B981", bg:"#E7F8F1", border:"#CFEEE1", grad:"linear-gradient(135deg,#34D399,#0E9F6E)" },
  english: { solid:"#F59E0B", bg:"#FEF3E2", border:"#FCE6C2", grad:"linear-gradient(135deg,#FBBF24,#F59E0B)" },
  coding:  { solid:"#8B5CF6", bg:"#F3EEFE", border:"#E6DBFB", grad:"linear-gradient(135deg,#A78BFA,#7C3AED)" },
  ai:      { solid:"#06B6D4", bg:"#E2F7FB", border:"#C7EFF5", grad:"linear-gradient(135deg,#22D3EE,#0891B2)" },
  history: { solid:"#F43F5E", bg:"#FEECEF", border:"#FBD5DC", grad:"linear-gradient(135deg,#FB7185,#E11D48)" },
};

const SUBJECT_ICON: Record<string, React.ReactNode> = {
  math:    <Calculator   className="w-5 h-5 text-white" />,
  science: <FlaskConical className="w-5 h-5 text-white" />,
  english: <BookOpen     className="w-5 h-5 text-white" />,
  coding:  <Code         className="w-5 h-5 text-white" />,
  ai:      <Brain        className="w-5 h-5 text-white" />,
  history: <Globe        className="w-5 h-5 text-white" />,
};

const MOCK_ASSESSMENTS: Assessment[] = [
  // Upcoming / available
  { id:"a1", title:"Algebra Mid-Term Quiz",         subject:"Mathematics",      subject_key:"math",    type:"quiz",      state:"available",  duration:"30 min", questions:20, dateLabel:"Due today",     score:null,  maxScore:100, passMark:60 },
  { id:"a2", title:"Cell Biology Chapter Test",     subject:"Science",          subject_key:"science", type:"test",      state:"upcoming",   duration:"45 min", questions:30, dateLabel:"Jun 19",        score:null,  maxScore:100, passMark:50 },
  { id:"a3", title:"Poetry Analysis Assessment",    subject:"English",          subject_key:"english", type:"test",      state:"upcoming",   duration:"40 min", questions:25, dateLabel:"Jun 20",        score:null,  maxScore:100, passMark:55 },
  { id:"a4", title:"Python Loops & Functions Quiz", subject:"Coding",           subject_key:"coding",  type:"quiz",      state:"locked",     duration:"25 min", questions:15, dateLabel:"Jun 22",        score:null,  maxScore:100, passMark:60 },
  { id:"a5", title:"AI Foundations Unit Test",      subject:"AI Foundations",   subject_key:"ai",      state:"upcoming", type:"test",        duration:"50 min", questions:35, dateLabel:"Jun 24",        score:null,  maxScore:100, passMark:60 },
  { id:"a6", title:"Term Mock Exam – Mathematics",  subject:"Mathematics",      subject_key:"math",    type:"mock_exam", state:"locked",     duration:"90 min", questions:60, dateLabel:"Jul 3",         score:null,  maxScore:100, passMark:40 },
  // Completed
  { id:"c1", title:"Quadratic Equations Quiz",      subject:"Mathematics",      subject_key:"math",    type:"quiz",      state:"completed",  duration:"30 min", questions:20, dateLabel:"Jun 10",        score:92,    maxScore:100, passMark:60 },
  { id:"c2", title:"Photosynthesis Quiz",           subject:"Science",          subject_key:"science", type:"quiz",      state:"completed",  duration:"20 min", questions:15, dateLabel:"Jun 9",         score:88,    maxScore:100, passMark:50 },
  { id:"c3", title:"Grammar & Comprehension Test",  subject:"English",          subject_key:"english", type:"test",      state:"completed",  duration:"45 min", questions:30, dateLabel:"Jun 7",         score:76,    maxScore:100, passMark:55 },
  { id:"c4", title:"Variables & Data Types Quiz",   subject:"Coding",           subject_key:"coding",  type:"quiz",      state:"completed",  duration:"20 min", questions:15, dateLabel:"Jun 5",         score:95,    maxScore:100, passMark:60 },
  { id:"c5", title:"Ancient Civilisations Test",    subject:"World History",    subject_key:"history", type:"test",      state:"completed",  duration:"40 min", questions:25, dateLabel:"Jun 3",         score:84,    maxScore:100, passMark:50 },
];

const TYPE_LABEL: Record<AssessmentType, string> = {
  quiz:      "Quiz",
  test:      "Chapter test",
  mock_exam: "Mock exam",
};

const TYPE_COLOR: Record<AssessmentType, { bg: string; text: string }> = {
  quiz:      { bg: "#EEF0FF", text: "#5B5BF0" },
  test:      { bg: "#E7F8F1", text: "#0E9F6E" },
  mock_exam: { bg: "#FEECEF", text: "#E11D48" },
};

type Tab = "upcoming" | "results" | "performance";

// ---------------------------------------------------------------------------
// Performance radar (subject bar chart)
// ---------------------------------------------------------------------------
function PerformanceTab() {
  const subjectData = [
    { name: "Mathematics", score: 92, grad: SUBJECT_STYLE.math.grad, tests: 2 },
    { name: "Science",     score: 88, grad: SUBJECT_STYLE.science.grad, tests: 2 },
    { name: "English",     score: 76, grad: SUBJECT_STYLE.english.grad, tests: 2 },
    { name: "Coding",      score: 95, grad: SUBJECT_STYLE.coding.grad, tests: 2 },
    { name: "History",     score: 84, grad: SUBJECT_STYLE.history.grad, tests: 1 },
  ];

  const scores = [92, 88, 76, 95, 84];
  const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
  const highest = Math.max(...scores);
  const lowest  = Math.min(...scores);

  return (
    <div className="flex flex-wrap gap-5">
      {/* subject bars */}
      <div
        className="flex-1 min-w-[280px] bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
        style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
      >
        <div className="text-[17px] font-extrabold text-[#1A1B2E] mb-1">
          Subject performance
        </div>
        <div className="text-[12.5px] font-medium text-[#9AA0B8] mb-5">
          Average scores across all completed assessments
        </div>
        <div className="flex flex-col gap-4">
          {subjectData.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <div className="w-[110px] shrink-0 text-[13px] font-semibold text-[#41435F]">
                {s.name}
              </div>
              <div className="flex-1 h-[9px] bg-[#EEF0F5] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: s.grad }}
                  initial={{ width: 0 }}
                  animate={{ width: `${s.score}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <div className="w-[42px] shrink-0 text-right text-[13px] font-extrabold text-[#1A1B2E]">
                {s.score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* summary stats */}
      <div className="flex flex-col gap-4 min-w-[220px]">
        {[
          { label: "Average score",    value: `${avg}%`,     icon: <TrendingUp className="w-5 h-5" style={{ color: "#6366F1" }} />, bg: "#EEF0FF" },
          { label: "Highest score",    value: `${highest}%`, icon: <CheckCircle2 className="w-5 h-5" style={{ color: "#10B981" }} />, bg: "#E7F8F1" },
          { label: "Lowest score",     value: `${lowest}%`,  icon: <FileText className="w-5 h-5" style={{ color: "#F59E0B" }} />, bg: "#FEF3E2" },
          { label: "Tests completed",  value: MOCK_ASSESSMENTS.filter((a) => a.state === "completed").length, icon: <CheckCircle2 className="w-5 h-5" style={{ color: "#8B5CF6" }} />, bg: "#F3EEFE" },
        ].map(({ label, value, icon, bg }) => (
          <div
            key={label}
            className="bg-white border border-[#ECEDF3] rounded-[20px] p-4 flex items-center gap-3"
            style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
          >
            <div className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0" style={{ background: bg }}>
              {icon}
            </div>
            <div>
              <div className="text-[20px] font-extrabold text-[#1A1B2E] leading-none">{value}</div>
              <div className="text-[12px] font-semibold text-[#6B6F8A] mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Assessment card
// ---------------------------------------------------------------------------
function AssessmentCard({ a }: { a: Assessment }) {
  const style = SUBJECT_STYLE[a.subject_key] ?? SUBJECT_STYLE.math!;
  const icon  = SUBJECT_ICON[a.subject_key];
  const typeColor = TYPE_COLOR[a.type];
  const passed = a.score != null && a.score >= a.passMark;

  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[20px] overflow-hidden flex flex-col transition-shadow hover:shadow-md"
      style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
    >
      {/* gradient header */}
      <div
        className="h-[80px] relative flex items-center px-4"
        style={{
          background: style.grad,
          opacity: a.state === "locked" ? 0.7 : 1,
        }}
      >
        <div
          aria-hidden
          className="absolute -top-5 -right-3 w-[80px] h-[80px] rounded-full"
          style={{ background: "rgba(255,255,255,.14)" }}
        />
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,.22)", backdropFilter: "blur(4px)" }}
        >
          {a.state === "locked" ? <Lock className="w-5 h-5 text-white" /> : icon}
        </div>
        {/* type badge */}
        <span
          className="absolute top-3 right-3 text-[10.5px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: typeColor.bg, color: typeColor.text }}
        >
          {TYPE_LABEL[a.type]}
        </span>
        {/* score badge */}
        {a.score != null && (
          <span
            className="absolute bottom-3 right-3 text-[13px] font-extrabold text-white"
          >
            {a.score}/{a.maxScore}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <h3 className="text-[15px] font-extrabold text-[#1A1B2E] leading-snug">
          {a.title}
        </h3>
        <div className="text-[12px] font-semibold text-[#9AA0B8]">{a.subject}</div>

        <div className="flex flex-wrap gap-3 text-[12px] text-[#9AA0B8] font-medium">
          <span className="flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" /> {a.duration}
          </span>
          <span className="flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> {a.questions} questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {a.dateLabel}
          </span>
        </div>

        {/* pass/fail badge for completed */}
        {a.state === "completed" && a.score != null && (
          <div
            className="flex items-center justify-between rounded-[10px] px-3 py-2"
            style={{ background: passed ? "#E7F8F1" : "#FEECEF" }}
          >
            <span className="text-[12px] font-semibold" style={{ color: passed ? "#0E9F6E" : "#E11D48" }}>
              {passed ? "Passed ✓" : "Below pass mark"}
            </span>
            <span className="text-[14px] font-extrabold" style={{ color: passed ? "#0E9F6E" : "#E11D48" }}>
              {a.score}%
            </span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-1">
          {a.state === "available" && (
            <button
              className="w-full py-2.5 rounded-[11px] text-[13px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: style.grad }}
            >
              Start assessment
            </button>
          )}
          {a.state === "upcoming" && (
            <div
              className="w-full py-2.5 rounded-[11px] text-[13px] font-bold text-center"
              style={{ background: style.bg, color: style.solid }}
            >
              Opens {a.dateLabel}
            </div>
          )}
          {a.state === "locked" && (
            <div className="w-full py-2.5 rounded-[11px] text-[13px] font-bold text-center bg-[#EEF0F5] text-[#9AA0B8] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Complete prior lessons
            </div>
          )}
          {a.state === "completed" && (
            <button className="w-full py-2.5 rounded-[11px] text-[13px] font-bold bg-[#EEF0F5] text-[#6B6F8A] transition-colors hover:bg-[#E0E3FF] hover:text-[#5B5BF0]">
              Review answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AssessmentsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");

  const upcoming  = MOCK_ASSESSMENTS.filter((a) => a.state !== "completed");
  const results   = MOCK_ASSESSMENTS.filter((a) => a.state === "completed");
  const available = MOCK_ASSESSMENTS.filter((a) => a.state === "available");

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "upcoming",     label: "Upcoming",    count: upcoming.length },
    { key: "results",      label: "Results",     count: results.length },
    { key: "performance",  label: "Performance" },
  ];

  return (
    <div
      className="mx-auto w-full sd-float-up"
      style={{ maxWidth: 1320, padding: "28px 32px 60px" }}
    >
      {/* heading */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">
          Assessments
        </h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">
          Quizzes, chapter tests, and mock exams across your subjects.
        </p>
      </div>

      {/* available now banner */}
      {tab === "upcoming" && available.length > 0 && (
        <div
          className="relative overflow-hidden rounded-[22px] p-5 sm:p-7 mb-6 text-white"
          style={{ background: "linear-gradient(125deg,#5B5BF0 0%,#7158F0 48%,#8B5CF6 100%)", boxShadow: "0 14px 34px rgba(99,102,241,.28)" }}
        >
          <div aria-hidden className="pointer-events-none absolute -top-8 -right-8 w-[160px] h-[160px] rounded-full"
            style={{ background: "radial-gradient(circle,rgba(255,255,255,.18),transparent 65%)" }} />
          <div className="relative flex flex-wrap items-center gap-4 justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: "rgba(255,255,255,.78)" }}>
                Ready to attempt
              </div>
              <div className="text-[22px] font-extrabold">
                {available.length} assessment{available.length !== 1 ? "s" : ""} available now
              </div>
              <p className="text-[13.5px] mt-1" style={{ color: "rgba(255,255,255,.85)" }}>
                {available.map((a) => a.title).join(" · ")}
              </p>
            </div>
            <button
              className="shrink-0 bg-white text-[#5B5BF0] font-bold text-[13.5px] px-5 py-3 rounded-[13px] transition-opacity hover:opacity-90"
              style={{ boxShadow: "0 8px 20px rgba(0,0,0,.14)" }}
            >
              Start now
            </button>
          </div>
        </div>
      )}

      {/* tab bar */}
      <div
        className="bg-white border border-[#ECEDF3] rounded-[16px] p-1.5 flex gap-1 mb-6 w-fit"
        style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 4px 12px rgba(20,22,46,.03)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all"
            style={
              tab === t.key
                ? { background: "#1A1B2E", color: "#fff" }
                : { background: "transparent", color: "#6B6F8A" }
            }
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={
                  tab === t.key
                    ? { background: "rgba(255,255,255,.2)", color: "#fff" }
                    : { background: "#EEF0F5", color: "#6B6F8A" }
                }
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Upcoming ─────────────────────────────────────────────── */}
      {tab === "upcoming" && (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}
        >
          {upcoming.map((a) => (
            <AssessmentCard key={a.id} a={a} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────── */}
      {tab === "results" && (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))" }}
        >
          {results.map((a) => (
            <AssessmentCard key={a.id} a={a} />
          ))}
        </div>
      )}

      {/* ── Performance ──────────────────────────────────────────── */}
      {tab === "performance" && <PerformanceTab />}
    </div>
  );
}
