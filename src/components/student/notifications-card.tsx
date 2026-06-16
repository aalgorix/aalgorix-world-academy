import { Bell, ClipboardList, Megaphone, Sparkles, Video } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type NotificationItem = {
  icon: ReactNode;
  iconBg: string;
  text: string;
  timeLabel: string;
};

// Static notification previews – real ones live at /student/notifications
const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    icon: <Video className="w-4.5 h-4.5" style={{ color: "#4F6BFF" }} />,
    iconBg: "#EDF1FF",
    text: "Mathematics live class starts in 30 minutes",
    timeLabel: "8:30 AM",
  },
  {
    icon: <ClipboardList className="w-4.5 h-4.5" style={{ color: "#8B5CF6" }} />,
    iconBg: "#F3EEFE",
    text: "Algebra Problem Set 7 is due today",
    timeLabel: "1 hour ago",
  },
  {
    icon: <Megaphone className="w-4.5 h-4.5" style={{ color: "#F59E0B" }} />,
    iconBg: "#FEF3E2",
    text: "Ms. Bennett posted new poetry resources",
    timeLabel: "3 hours ago",
  },
  {
    icon: <Sparkles className="w-4.5 h-4.5" style={{ color: "#06B6D4" }} />,
    iconBg: "#E2F7FB",
    text: "AI Tutor: 3 new practice sets ready for you",
    timeLabel: "Yesterday",
  },
];

export function NotificationsCard() {
  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] p-[20px]"
      style={{
        boxShadow:
          "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
      }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="text-[16px] font-extrabold text-[#1A1B2E]">
          Notifications
        </div>
        <Link href="/student/notifications" aria-label="View all notifications">
          <Bell className="w-[18px] h-[18px] text-[#9AA0B8]" />
        </Link>
      </div>

      <div className="flex flex-col gap-0.5">
        {MOCK_NOTIFICATIONS.map((n, idx) => (
          <div
            key={idx}
            className="flex gap-3 py-2.5 border-b border-[#F4F5F9] last:border-b-0"
          >
            <div
              className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0"
              style={{ background: n.iconBg }}
            >
              {n.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#1A1B2E] leading-snug">
                {n.text}
              </div>
              <div className="text-[10.5px] font-semibold text-[#9AA0B8] mt-0.5 font-mono">
                {n.timeLabel}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
