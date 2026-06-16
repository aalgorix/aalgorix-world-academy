import {
  Award,
  Code,
  Flame,
  FlaskConical,
  Medal,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type BadgeItem = {
  name: string;
  description: string;
  icon: ReactNode;
  grad: string;
  shadow: string;
  earned: boolean;
};

const BADGES: BadgeItem[] = [
  {
    name: "Math Whiz",
    description: "Aced 10 quizzes",
    icon: <Trophy className="w-6 h-6 text-white" />,
    grad: "linear-gradient(135deg,#FBBF24,#F59E0B)",
    shadow: "rgba(245,158,11,.35)",
    earned: true,
  },
  {
    name: "30-Day Streak",
    description: "Learned daily",
    icon: <Flame className="w-6 h-6 text-white" />,
    grad: "linear-gradient(135deg,#FB7185,#E11D48)",
    shadow: "rgba(244,63,94,.3)",
    earned: true,
  },
  {
    name: "Code Master",
    description: "Built 5 projects",
    icon: <Code className="w-6 h-6 text-white" />,
    grad: "linear-gradient(135deg,#A78BFA,#7C3AED)",
    shadow: "rgba(139,92,246,.3)",
    earned: true,
  },
  {
    name: "Science Star",
    description: "Top lab reports",
    icon: <FlaskConical className="w-6 h-6 text-white" />,
    grad: "linear-gradient(135deg,#34D399,#0E9F6E)",
    shadow: "rgba(16,185,129,.3)",
    earned: true,
  },
  {
    name: "Scholar",
    description: "2 badges to go",
    icon: <Medal className="w-6 h-6 text-white" />,
    grad: "linear-gradient(135deg,#C7CBE0,#9AA0B8)",
    shadow: "rgba(0,0,0,.1)",
    earned: false,
  },
];

export function BadgesSection() {
  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] p-[22px]"
      style={{
        boxShadow:
          "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
      }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2.5 mb-4">
        <div>
          <div className="text-[17px] font-extrabold text-[#1A1B2E]">
            Certificates &amp; achievements
          </div>
          <div className="text-[12.5px] font-medium text-[#9AA0B8] mt-0.5">
            Keep the streak going — you&apos;re 2 badges from Scholar status
          </div>
        </div>
        <Link
          href="/student/certificates"
          className="border border-[#ECEDF3] bg-white text-[#5B5BF0] text-[12.5px] font-bold px-3 py-2 rounded-[10px] flex items-center gap-1.5 transition-colors hover:bg-[#EEF0FF]"
        >
          <Award className="w-4 h-4" />
          View all
        </Link>
      </div>

      <div
        className="grid gap-3.5"
        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}
      >
        {BADGES.map((b) => (
          <div
            key={b.name}
            className="border border-[#F0F1F6] rounded-[16px] p-4 flex flex-col items-center text-center gap-2.5 transition-transform hover:-translate-y-0.5"
            style={{
              background: b.earned ? "#fff" : "#FAFAFC",
              opacity: b.earned ? 1 : 0.6,
            }}
          >
            <div
              className="w-[54px] h-[54px] rounded-[16px] flex items-center justify-center"
              style={{
                background: b.grad,
                boxShadow: `0 6px 16px ${b.shadow}`,
              }}
            >
              {b.icon}
            </div>
            <div className="text-[13.5px] font-bold text-[#1A1B2E]">
              {b.name}
            </div>
            <div className="text-[11px] font-medium text-[#9AA0B8]">
              {b.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
