"use client";

import { motion } from "framer-motion";

type SubjectStat = {
  name: string;
  score: number;
  grad: string;
};

type WeekBar = {
  day: string;
  hours: number;
};

interface PerformanceChartsProps {
  weeklyHours?: WeekBar[];
  quizScores?: number[];
  subjectStats?: SubjectStat[];
}

const BAR_FILLS = [
  "#C7D0FF", "#A9B6FF", "#8B9DFF", "#6366F1", "#8B9DFF", "#C7D0FF", "#A9B6FF",
];

function buildLinePath(
  vals: number[],
  w: number,
  h: number,
  pad: number,
): { line: string; area: string; pts: { x: number; y: number }[] } {
  const max = Math.max(...vals);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const step = (w - pad * 2) / (vals.length - 1);
  const pts = vals.map((v, i) => ({
    x: +(pad + i * step).toFixed(1),
    y: +(h - pad - ((v - min) / range) * (h - pad * 2)).toFixed(1),
  }));
  const line = pts.map((p, i) => (i ? "L" : "M") + p.x + " " + p.y).join(" ");
  const area =
    line + ` L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;
  return { line, area, pts };
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[130px] items-center justify-center rounded-[14px] border border-dashed border-[#E0E2EC] bg-[#FAFBFF] px-4 text-center text-[12.5px] font-medium text-[#9AA0B8]">
      {label}
    </div>
  );
}

export function PerformanceCharts({
  weeklyHours,
  quizScores,
  subjectStats,
}: PerformanceChartsProps) {
  const hasWeekly = (weeklyHours?.length ?? 0) > 0;
  const hasQuiz = (quizScores?.length ?? 0) >= 2;
  const hasSubjects = (subjectStats?.length ?? 0) > 0;

  if (!hasWeekly && !hasQuiz && !hasSubjects) {
    return (
      <div
        className="bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
        style={{
          boxShadow:
            "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
        }}
      >
        <div className="text-[17px] font-extrabold text-[#1A1B2E] mb-2">
          Performance analytics
        </div>
        <p className="text-[13px] text-[#9AA0B8]">
          Complete lessons and receive graded work to see your learning trends here.
        </p>
      </div>
    );
  }

  const weekly = weeklyHours ?? [];
  const quiz = quizScores ?? [];
  const subjects = subjectStats ?? [];
  const maxH = hasWeekly ? Math.max(...weekly.map((b) => b.hours), 0.1) : 1;
  const quizLatest = hasQuiz ? quiz[quiz.length - 1] : null;
  const quizChart = hasQuiz ? buildLinePath(quiz, 240, 130, 8) : null;

  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
      style={{
        boxShadow:
          "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[17px] font-extrabold text-[#1A1B2E]">
          Performance analytics
        </div>
        <div className="text-[11px] font-semibold text-[#9AA0B8] font-mono uppercase tracking-wide">
          This week
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mt-3.5">
        <div className="flex-1 min-w-[200px]">
          <div className="text-[12.5px] font-semibold text-[#6B6F8A] mb-3.5">
            Weekly learning time (hrs)
          </div>
          {hasWeekly ? (
            <div className="flex items-end gap-2.5 h-[130px]">
              {weekly.map((b, i) => {
                const heightPct = Math.round((b.hours / maxH) * 100);
                return (
                  <div
                    key={b.day}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                  >
                    <span className="text-[10.5px] font-bold text-[#41435F] font-mono">
                      {b.hours}
                    </span>
                    <motion.div
                      className="w-full max-w-[26px] rounded-t-lg rounded-b-sm"
                      style={{ minHeight: 6, background: BAR_FILLS[i % BAR_FILLS.length] }}
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{
                        duration: 0.6,
                        delay: i * 0.07,
                        ease: "easeOut",
                      }}
                    />
                    <span className="text-[10.5px] font-semibold text-[#9AA0B8]">
                      {b.day}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyChart label="No lesson activity recorded this week yet." />
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="text-[12.5px] font-semibold text-[#6B6F8A]">
              Grade trend
            </div>
            {quizLatest != null ? (
              <div className="text-[14px] font-extrabold text-[#0E9F6E]">
                Latest {quizLatest}%
              </div>
            ) : null}
          </div>
          {hasQuiz && quizChart ? (
            <svg
              viewBox="0 0 240 130"
              className="w-full overflow-visible"
              style={{ height: 130 }}
            >
              <defs>
                <linearGradient id="qg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8B5CF6" stopOpacity="0.28" />
                  <stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={quizChart.area} fill="url(#qg)" />
              <motion.path
                d={quizChart.line}
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              {quizChart.pts.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="3.5"
                  fill="#fff"
                  stroke="#8B5CF6"
                  strokeWidth="2.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.06 }}
                />
              ))}
            </svg>
          ) : (
            <EmptyChart label="At least two graded submissions are needed for a trend line." />
          )}
        </div>
      </div>

      <div className="border-t border-[#F0F1F6] mt-4 pt-4 flex flex-col gap-3">
        <div className="text-[12.5px] font-semibold text-[#6B6F8A]">
          Subject-wise performance
        </div>
        {hasSubjects ? (
          subjects.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <div className="w-[96px] shrink-0 text-[12.5px] font-semibold text-[#41435F]">
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
              <div className="w-[38px] shrink-0 text-right text-[13px] font-extrabold text-[#1A1B2E]">
                {s.score}%
              </div>
            </div>
          ))
        ) : (
          <EmptyChart label="Graded coursework will appear here by subject." />
        )}
      </div>
    </div>
  );
}
