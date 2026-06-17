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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type BadgeStatus = "earned" | "locked";

type Badge = {
  id: string;
  name: string;
  description: string;
  earnedDate: string | null;
  status: BadgeStatus;
  icon: React.ReactNode;
  grad: string;
  shadow: string;
  category: "academic" | "streak" | "project" | "special";
};

type Certificate = {
  id: string;
  title: string;
  course: string;
  issuedDate: string;
  grade: string;
  grad: string;
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const BADGES: Badge[] = [
  { id:"b1", name:"Math Whiz",      description:"Aced 10 consecutive quizzes",   earnedDate:"May 28, 2026", status:"earned", icon:<Trophy      className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#FBBF24,#F59E0B)", shadow:"rgba(245,158,11,.4)",  category:"academic" },
  { id:"b2", name:"30-Day Streak",  description:"Logged in and learned every day",earnedDate:"Jun 1, 2026",  status:"earned", icon:<Flame       className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#FB7185,#E11D48)", shadow:"rgba(244,63,94,.35)", category:"streak"   },
  { id:"b3", name:"Code Master",    description:"Completed 5 coding projects",    earnedDate:"Jun 5, 2026",  status:"earned", icon:<Code        className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#A78BFA,#7C3AED)", shadow:"rgba(139,92,246,.35)",category:"project"  },
  { id:"b4", name:"Science Star",   description:"Top scores in lab reports",      earnedDate:"Jun 8, 2026",  status:"earned", icon:<FlaskConical className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#34D399,#0E9F6E)", shadow:"rgba(16,185,129,.35)",category:"academic" },
  { id:"b5", name:"History Buff",   description:"Completed World History module", earnedDate:"Jun 12, 2026", status:"earned", icon:<Globe       className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#FB7185,#E11D48)", shadow:"rgba(244,63,94,.3)", category:"academic" },
  { id:"b6", name:"AI Explorer",    description:"Finished AI Foundations unit 1", earnedDate:"Jun 14, 2026", status:"earned", icon:<Sparkles    className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#22D3EE,#0891B2)", shadow:"rgba(6,182,212,.35)", category:"academic" },
  { id:"b7", name:"Bookworm",       description:"Read 20 lesson resources",       earnedDate:null,           status:"locked", icon:<BookOpen    className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#C7CBE0,#9AA0B8)", shadow:"rgba(0,0,0,.1)",     category:"special"  },
  { id:"b8", name:"Scholar",        description:"Earn 8 badges total",            earnedDate:null,           status:"locked", icon:<Medal       className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#C7CBE0,#9AA0B8)", shadow:"rgba(0,0,0,.1)",     category:"special"  },
  { id:"b9", name:"Speed Learner",  description:"Complete 5 lessons in one day",  earnedDate:null,           status:"locked", icon:<Zap         className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#C7CBE0,#9AA0B8)", shadow:"rgba(0,0,0,.1)",     category:"streak"   },
  { id:"b10",name:"Top Performer",  description:"Rank in top 10% of your cohort", earnedDate:null,           status:"locked", icon:<Star        className="w-6 h-6 text-white" />, grad:"linear-gradient(135deg,#C7CBE0,#9AA0B8)", shadow:"rgba(0,0,0,.1)",     category:"special"  },
];

const CERTIFICATES: Certificate[] = [
  { id:"c1", title:"Mathematics — Term 1 Excellence", course:"Mathematics",    issuedDate:"Jun 10, 2026", grade:"A+", grad:"linear-gradient(135deg,#6E8BFF,#3B5BFF)" },
  { id:"c2", title:"Coding Fundamentals — Module 1",  course:"Coding",         issuedDate:"Jun 5, 2026",  grade:"A",  grad:"linear-gradient(135deg,#A78BFA,#7C3AED)" },
  { id:"c3", title:"Science — Cell Biology Unit",     course:"Science",        issuedDate:"Jun 8, 2026",  grade:"A",  grad:"linear-gradient(135deg,#34D399,#0E9F6E)" },
];

type Tab = "badges" | "certificates";

// ---------------------------------------------------------------------------
// Badge card
// ---------------------------------------------------------------------------
function BadgeCard({ badge }: { badge: Badge }) {
  const earned = badge.status === "earned";
  return (
    <div
      className="border border-[#F0F1F6] rounded-[18px] p-5 flex flex-col items-center text-center gap-2.5 transition-all"
      style={{ background: earned ? "#fff" : "#FAFAFC", opacity: earned ? 1 : 0.6 }}
    >
      <div
        className="w-[58px] h-[58px] rounded-[18px] flex items-center justify-center relative"
        style={{ background: badge.grad, boxShadow: earned ? `0 8px 20px ${badge.shadow}` : "none" }}
      >
        {!earned && (
          <div className="absolute inset-0 rounded-[18px] bg-white/40 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#9AA0B8]" />
          </div>
        )}
        {earned && badge.icon}
      </div>
      <div className="text-[14px] font-extrabold text-[#1A1B2E]">{badge.name}</div>
      <div className="text-[11.5px] font-medium text-[#9AA0B8] leading-snug">{badge.description}</div>
      {earned && badge.earnedDate && (
        <div className="text-[11px] font-semibold text-[#10B981]">✓ {badge.earnedDate}</div>
      )}
      {!earned && (
        <div className="text-[11px] font-semibold text-[#C4C7D9]">🔒 Locked</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Certificate card
// ---------------------------------------------------------------------------
function CertificateCard({ cert }: { cert: Certificate }) {
  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] overflow-hidden"
      style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
    >
      {/* certificate preview */}
      <div
        className="relative h-[140px] flex flex-col items-center justify-center px-6 text-white text-center"
        style={{ background: cert.grad }}
      >
        <div aria-hidden className="absolute -top-8 -right-8 w-[120px] h-[120px] rounded-full pointer-events-none"
          style={{ background: "rgba(255,255,255,.12)" }} />
        <Award className="w-8 h-8 mb-2 opacity-90" />
        <div className="text-[15px] font-extrabold leading-snug">{cert.title}</div>
        <div className="text-[12px] font-medium mt-1" style={{ color: "rgba(255,255,255,.8)" }}>
          {cert.course}
        </div>
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
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[11px] text-[13px] font-bold bg-[#1A1B2E] text-white transition-opacity hover:opacity-90">
            <Download className="w-4 h-4" /> Download
          </button>
          <button className="w-[42px] h-[42px] rounded-[11px] border border-[#ECEDF3] bg-white flex items-center justify-center text-[#6B6F8A] transition-colors hover:border-[#DDE0FF] hover:text-[#5B5BF0]">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function CertificatesPage() {
  const [tab, setTab] = useState<Tab>("badges");

  const earned = BADGES.filter((b) => b.status === "earned").length;
  const total  = BADGES.length;
  const toScholar = Math.max(0, 8 - earned);

  const tabs: { key: Tab; label: string }[] = [
    { key: "badges",       label: `Badges (${earned}/${total})` },
    { key: "certificates", label: `Certificates (${CERTIFICATES.length})` },
  ];

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 60px" }}>
      {/* heading */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Certificates &amp; Achievements</h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">
          {toScholar > 0
            ? `You're ${toScholar} badge${toScholar !== 1 ? "s" : ""} away from Scholar status — keep going!`
            : "Scholar status achieved! Outstanding work."}
        </p>
      </div>

      {/* progress bar to scholar */}
      <div className="bg-white border border-[#ECEDF3] rounded-[20px] p-5 mb-6 flex flex-wrap items-center gap-4"
        style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}>
        <div
          className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#FBBF24,#F59E0B)", boxShadow: "0 6px 14px rgba(245,158,11,.35)" }}
        >
          <Medal className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[14px] font-bold text-[#1A1B2E]">Scholar progress</span>
            <span className="text-[13px] font-extrabold text-[#F59E0B]">{earned}/8 badges</span>
          </div>
          <div className="h-2.5 bg-[#EEF0F5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, (earned / 8) * 100)}%`, background: "linear-gradient(135deg,#FBBF24,#F59E0B)" }}
            />
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="bg-white border border-[#ECEDF3] rounded-[16px] p-1.5 flex gap-1 mb-6 w-fit"
        style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 4px 12px rgba(20,22,46,.03)" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-5 py-2.5 rounded-[12px] text-[13.5px] font-bold transition-all"
            style={
              tab === t.key
                ? { background: "#1A1B2E", color: "#fff" }
                : { background: "transparent", color: "#6B6F8A" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* badges grid */}
      {tab === "badges" && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
          {BADGES.map((b) => <BadgeCard key={b.id} badge={b} />)}
        </div>
      )}

      {/* certificates grid */}
      {tab === "certificates" && (
        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))" }}>
          {CERTIFICATES.map((c) => <CertificateCard key={c.id} cert={c} />)}
          {CERTIFICATES.length === 0 && (
            <div className="col-span-full rounded-[22px] border border-dashed border-[#D6D8E4] bg-white px-8 py-16 text-center">
              <Award className="w-10 h-10 text-[#C4C7D9] mx-auto mb-4" />
              <p className="text-[17px] font-extrabold text-[#1A1B2E]">No certificates yet</p>
              <p className="mt-2 text-[13.5px] text-[#9AA0B8]">Complete courses to earn your first certificate.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
