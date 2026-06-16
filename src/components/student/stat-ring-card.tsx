import type { ReactNode } from "react";
import { TrendingUp } from "lucide-react";

type RingStatCardProps = {
  kind: "ring";
  /** 0-100 */
  percent: number;
  ringColor: string;
  label: string;
  trend: string;
};

type IconStatCardProps = {
  kind: "icon";
  big: string;
  icon: ReactNode;
  iconBg: string;
  label: string;
  trend: string;
};

export type StatRingCardProps = RingStatCardProps | IconStatCardProps;

export function StatRingCard(props: StatRingCardProps) {
  const R = 23;
  const C = +(2 * Math.PI * R).toFixed(1);

  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[20px] p-[18px] flex flex-col gap-[13px]"
      style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
    >
      <div className="flex items-start justify-between">
        {/* icon / ring */}
        {props.kind === "ring" ? (
          <div className="relative w-[54px] h-[54px] shrink-0">
            <svg width="54" height="54" viewBox="0 0 54 54">
              <circle
                cx="27" cy="27" r={R}
                fill="none" stroke="#EEF0F5" strokeWidth="6"
              />
              <circle
                cx="27" cy="27" r={R}
                fill="none"
                stroke={props.ringColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={+(C - (props.percent / 100) * C).toFixed(1)}
                transform="rotate(-90 27 27)"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[13px] font-extrabold text-[#1A1B2E]">
              {props.percent}%
            </span>
          </div>
        ) : (
          <div
            className="w-[46px] h-[46px] rounded-[13px] flex items-center justify-center shrink-0"
            style={{ background: props.iconBg }}
          >
            {props.icon}
          </div>
        )}

        {/* trend badge */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#E9F9F1] text-[#0E9F6E] text-[11.5px] font-bold">
          <TrendingUp className="w-3 h-3" />
          {props.trend}
        </div>
      </div>

      <div>
        {props.kind === "icon" && (
          <div className="text-2xl font-extrabold text-[#1A1B2E] leading-none">
            {props.big}
          </div>
        )}
        <div className="text-[13px] font-semibold text-[#6B6F8A] mt-1.5">
          {props.label}
        </div>
      </div>
    </div>
  );
}
