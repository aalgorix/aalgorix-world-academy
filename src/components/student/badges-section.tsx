import {
  Award,
  BookOpen,
  Code,
  Flame,
  FlaskConical,
  Globe,
  Medal,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  countEarnedBadges,
  scholarProgress,
  type StudentBadge,
} from "@/lib/student/achievements";

const ICONS: Record<string, ReactNode> = {
  "math-whiz": <Trophy className="w-6 h-6 text-white" />,
  "streak-30": <Flame className="w-6 h-6 text-white" />,
  "code-master": <Code className="w-6 h-6 text-white" />,
  "science-star": <FlaskConical className="w-6 h-6 text-white" />,
  "history-buff": <Globe className="w-6 h-6 text-white" />,
  "ai-explorer": <Sparkles className="w-6 h-6 text-white" />,
  bookworm: <BookOpen className="w-6 h-6 text-white" />,
  scholar: <Medal className="w-6 h-6 text-white" />,
  "speed-learner": <Zap className="w-6 h-6 text-white" />,
  "top-performer": <Star className="w-6 h-6 text-white" />,
};

interface BadgesSectionProps {
  badges: StudentBadge[];
}

export function BadgesSection({ badges }: BadgesSectionProps) {
  const earned = countEarnedBadges(badges);
  const scholar = scholarProgress(badges);

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
            {scholar.remaining > 0
              ? `${earned} earned · ${scholar.remaining} more to Scholar status`
              : "Scholar status achieved — outstanding work!"}
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

      {badges.length === 0 ? (
        <p className="text-center text-[13px] text-[#9AA0B8] py-8">
          Complete lessons and assignments to start earning badges.
        </p>
      ) : (
        <div
          className="grid gap-3.5"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}
        >
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="border border-[#F0F1F6] rounded-[16px] p-4 flex flex-col items-center text-center gap-2.5 transition-transform hover:-translate-y-0.5"
              style={{
                background: badge.earned ? "#fff" : "#FAFAFC",
                opacity: badge.earned ? 1 : 0.6,
              }}
            >
              <div
                className="w-[54px] h-[54px] rounded-[16px] flex items-center justify-center"
                style={{
                  background: badge.grad,
                  boxShadow: badge.earned ? `0 6px 16px ${badge.shadow}` : "none",
                }}
              >
                {ICONS[badge.id] ?? <Medal className="w-6 h-6 text-white" />}
              </div>
              <div className="text-[13.5px] font-bold text-[#1A1B2E]">
                {badge.name}
              </div>
              <div className="text-[11px] font-medium text-[#9AA0B8]">
                {badge.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
