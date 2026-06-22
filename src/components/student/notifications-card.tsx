import { Bell, ClipboardList, Megaphone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import type { NotificationPreview } from "@/lib/student/queries";

const KIND_STYLE: Record<
  NotificationPreview["kind"],
  { icon: ReactNode; iconBg: string }
> = {
  graded: {
    icon: <ClipboardList className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />,
    iconBg: "#F3EEFE",
  },
  returned: {
    icon: <Megaphone className="w-4.5 h-4.5" style={{ color: "#F59E0B" }} />,
    iconBg: "#FEF3E2",
  },
  due: {
    icon: <ClipboardList className="w-4.5 h-4.5" style={{ color: "#4F6BFF" }} />,
    iconBg: "#EDF1FF",
  },
};

export function NotificationsCard({ items }: { items: NotificationPreview[] }) {
  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] p-[20px]"
      style={{
        boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
      }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="text-[16px] font-extrabold text-[#1A1B2E]">Notifications</div>
        <Link href="/student/notifications" aria-label="View all notifications">
          <Bell className="w-[18px] h-[18px] text-[#9AA0B8]" />
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] font-medium text-[#9AA0B8] py-2">
          No recent grade updates yet.
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {items.map((n, idx) => {
            const style = KIND_STYLE[n.kind];
            return (
              <div
                key={idx}
                className="flex gap-3 py-2.5 border-b border-[#F4F5F9] last:border-b-0"
              >
                <div
                  className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0"
                  style={{ background: style.iconBg }}
                >
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#1A1B2E] leading-snug">{n.text}</div>
                  <div className="text-[10.5px] font-semibold text-[#9AA0B8] mt-0.5 font-mono">
                    {n.timeLabel}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
