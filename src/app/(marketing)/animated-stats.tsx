"use client";

import { useEffect, useRef, useState } from "react";

type StatItem = {
  numericTarget?: number;
  suffix?: string;
  display: string;
  label: string;
  detail: string;
};

const STATS: ReadonlyArray<StatItem> = [
  {
    numericTarget: 2,
    suffix: "×",
    display: "2×",
    label: "Learning Outcomes",
    detail: "Harvard research shows 2× learning growth with personalised AI Tutor support.",
  },
  {
    numericTarget: 98,
    suffix: "%",
    display: "98%",
    label: "Student Satisfaction",
    detail: "98% of students report a positive, confidence-building learning experience.",
  },
  {
    numericTarget: 100,
    suffix: "%",
    display: "100%",
    label: "Global Athlete Support",
    detail: "Fully certified curriculum pathways for student-athletes worldwide.",
  },
  {
    display: "24/7",
    label: "Learner Support",
    detail: "On-demand academic mentorship across all international time zones.",
  },
] as const;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function StatCounter({
  target,
  suffix,
  duration,
  active,
}: {
  target: number;
  suffix: string;
  duration: number;
  active: boolean;
}) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    cancelAnimationFrame(rafRef.current);
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutCubic(progress) * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, target, duration]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

export function AnimatedStats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-slate-900" aria-label="Academy outcomes">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-px bg-slate-800 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-slate-900 px-6 py-12 text-center lg:py-16">
              <p className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                {stat.numericTarget !== undefined ? (
                  <StatCounter
                    target={stat.numericTarget}
                    suffix={stat.suffix ?? ""}
                    duration={2000}
                    active={active}
                  />
                ) : (
                  stat.display
                )}
              </p>
              <p className="mt-2 text-sm font-bold text-indigo-300">{stat.label}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
