"use client";

import {
  Award,
  BookOpen,
  Code,
  Download,
  Flame,
  FlaskConical,
  Globe,
  Lock,
  Medal,
  Share2,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";

import {
  countEarnedBadges,
  scholarProgress,
  type StudentBadge,
  type StudentCertificate,
} from "@/lib/student/achievements";

const BADGE_ICONS: Record<string, React.ReactNode> = {
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

type Tab = "badges" | "certificates";

function BadgeCard({ badge }: { badge: StudentBadge }) {
  return (
    <div
      className="border border-[#F0F1F6] rounded-[18px] p-5 flex flex-col items-center text-center gap-2.5 transition-all"
      style={{
        background: badge.earned ? "#fff" : "#FAFAFC",
        opacity: badge.earned ? 1 : 0.6,
      }}
    >
      <div
        className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center relative"
        style={{
          background: badge.grad,
          boxShadow: badge.earned ? `0 8px 20px ${badge.shadow}` : "none",
        }}
      >
        {!badge.earned ? (
          <div className="absolute inset-0 rounded-[18px] bg-white/40 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#9AA0B8]" />
          </div>
        ) : (
          BADGE_ICONS[badge.id] ?? <Medal className="w-6 h-6 text-white" />
        )}
      </div>
      <div className="text-[14px] font-extrabold text-[#1A1B2E]">{badge.name}</div>
      <div className="text-[11.5px] font-medium text-[#9AA0B8] leading-snug">
        {badge.description}
      </div>
      {badge.earned && badge.earnedDate ? (
        <div className="text-[11px] font-semibold text-[#10B981]">
          Earned {badge.earnedDate}
        </div>
      ) : (
        <div className="text-[11px] font-semibold text-[#C4C7D9]">Locked</div>
      )}
    </div>
  );
}

function CertificateCard({ cert }: { cert: StudentCertificate }) {
  function handleShare() {
    const text = `${cert.title} — ${cert.grade} (${cert.issuedDate})`;
    if (navigator.share) {
      void navigator.share({ title: cert.title, text });
      return;
    }
    void navigator.clipboard.writeText(text);
  }

  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] overflow-hidden"
      style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
    >
      <div
        className="relative h-[140px] flex flex-col items-center justify-center px-6 text-white text-center"
        style={{ background: cert.grad }}
      >
        <Award className="w-8 h-8 mb-2 opacity-90" />
        <div className="text-[15px] font-extrabold leading-snug">{cert.title}</div>
        <div className="text-[12px] font-medium mt-1 opacity-80">{cert.course}</div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold text-[#9AA0B8]">Issued</div>
            <div className="text-[14px] font-bold text-[#1A1B2E]">{cert.issuedDate}</div>
          </div>
          <div className="text-right">
            <div className="text-[12px] font-semibold text-[#9AA0B8]">Grade</div>
            <div className="text-[22px] font-extrabold text-[#0E9F6E]">{cert.grade}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[11px] text-[13px] font-bold bg-[#1A1B2E] text-white transition-opacity hover:opacity-90"
          >
            <Download className="w-4 h-4" /> Print
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="w-[42px] h-[42px] rounded-[11px] border border-[#ECEDF3] bg-white flex items-center justify-center text-[#6B6F8A] transition-colors hover:border-[#DDE0FF] hover:text-[#5B5BF0]"
            aria-label="Share certificate"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CertificatesView({
  badges,
  certificates,
}: {
  badges: StudentBadge[];
  certificates: StudentCertificate[];
}) {
  const [tab, setTab] = useState<Tab>("badges");
  const earned = countEarnedBadges(badges);
  const scholar = scholarProgress(badges);

  const tabs: { key: Tab; label: string }[] = [
    { key: "badges", label: `Badges (${earned}/${badges.length})` },
    { key: "certificates", label: `Certificates (${certificates.length})` },
  ];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 60px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">
          Certificates &amp; Achievements
        </h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">
          {scholar.remaining > 0
            ? `You're ${scholar.remaining} badge${scholar.remaining !== 1 ? "s" : ""} away from Scholar status — keep going!`
            : "Scholar status achieved! Outstanding work."}
        </p>
      </div>

      <div
        className="bg-white border border-[#ECEDF3] rounded-[20px] p-5 mb-6 flex flex-wrap items-center gap-4"
        style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
      >
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg,#FBBF24,#F59E0B)",
            boxShadow: "0 6px 14px rgba(245,158,11,.35)",
          }}
        >
          <Medal className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[14px] font-bold text-[#1A1B2E]">Scholar progress</span>
            <span className="text-[13px] font-extrabold text-[#F59E0B]">
              {scholar.earned}/{scholar.threshold} badges
            </span>
          </div>
          <div className="h-2.5 bg-[#EEF0F5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, (scholar.earned / scholar.threshold) * 100)}%`,
                background: "linear-gradient(135deg,#FBBF24,#F59E0B)",
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="bg-white border border-[#ECEDF3] rounded-[16px] p-1.5 flex gap-1 mb-6 w-fit"
        style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 4px 12px rgba(20,22,46,.03)" }}
      >
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className="px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all"
            style={
              tab === item.key
                ? { background: "#1A1B2E", color: "#fff" }
                : { background: "transparent", color: "#6B6F8A" }
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "badges" && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}
        >
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      )}

      {tab === "certificates" && (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}
        >
          {certificates.map((cert) => (
            <CertificateCard key={cert.id} cert={cert} />
          ))}
          {certificates.length === 0 && (
            <div className="col-span-full rounded-[22px] border border-dashed border-[#D6D8E4] bg-white px-8 py-16 text-center">
              <Award className="w-10 h-10 text-[#C4C7D9] mx-auto mb-4" />
              <p className="text-[17px] font-extrabold text-[#1A1B2E]">No certificates yet</p>
              <p className="mt-2 text-[13.5px] text-[#9AA0B8]">
                Complete a full course to earn your first certificate.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
