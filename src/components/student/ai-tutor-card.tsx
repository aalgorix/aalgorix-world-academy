import { MessageCircle, Mic, Sparkles } from "lucide-react";
import Link from "next/link";

const QUICK_CHIPS = [
  "Ask questions",
  "Homework help",
  "Explain concepts",
  "Practice sets",
];

export function AiTutorCard() {
  return (
    <div
      className="relative overflow-hidden rounded-[22px] text-white p-[22px]"
      style={{
        background:
          "linear-gradient(160deg,#15172E 0%,#241F4D 60%,#3A2A66 100%)",
        boxShadow: "0 14px 34px rgba(30,20,70,.4)",
      }}
    >
      {/* decorative orb */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-8 w-[140px] h-[140px] rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(139,92,246,.55),transparent 65%)",
        }}
      />

      <div className="relative">
        {/* header */}
        <div className="flex items-center gap-3 mb-3.5">
          <div
            className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg,#22D3EE,#8B5CF6)",
              boxShadow: "0 6px 16px rgba(139,92,246,.5)",
            }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-[16px] font-extrabold">Aalgorix AI Tutor</div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#A8AECF] font-mono">
              <span className="sd-pulse-dot w-[7px] h-[7px] rounded-full bg-[#34D399] shrink-0" />
              Online · ready to help
            </div>
          </div>
        </div>

        <p className="text-[13px] font-medium text-[#C3C7E6] leading-relaxed mb-4">
          Stuck on a problem? I can explain concepts, check homework, and build
          practice questions just for you.
        </p>

        {/* quick-action chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {QUICK_CHIPS.map((chip) => (
            <span
              key={chip}
              className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(255,255,255,.10)",
                border: "1px solid rgba(255,255,255,.14)",
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        {/* action buttons */}
        <div className="flex gap-2">
          <Link
            href="/student/tutor"
            className="flex-1 flex items-center justify-center gap-1.5 bg-white text-[#241F4D] text-[13px] font-bold py-2.5 rounded-[12px] transition-opacity hover:opacity-90"
          >
            <MessageCircle className="w-4 h-4" />
            Chat now
          </Link>
          <Link
            href="/student/tutor"
            className="shrink-0 flex items-center justify-center gap-1.5 text-[13px] font-bold py-2.5 px-3.5 rounded-[12px]"
            style={{
              background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.25)",
              color: "#fff",
            }}
          >
            <Mic className="w-4 h-4" />
            Voice
          </Link>
        </div>
      </div>
    </div>
  );
}
