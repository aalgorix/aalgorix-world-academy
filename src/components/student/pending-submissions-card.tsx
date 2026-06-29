import Link from "next/link";

type PendingItem = {
  id: string;
  title: string;
  courseTitle: string;
  dueLabel: string;
  priority: "high" | "medium" | "low";
  workspaceHref: string | null;
};

interface PendingSubmissionsCardProps {
  items: PendingItem[];
}

const PRIORITY_COLORS: Record<PendingItem["priority"], string> = {
  high: "#FB7185",
  medium: "#F59E0B",
  low: "#10B981",
};

const DUE_COLORS: Record<PendingItem["priority"], string> = {
  high: "#E11D48",
  medium: "#B45309",
  low: "#6B6F8A",
};

export function PendingSubmissionsCard({ items }: PendingSubmissionsCardProps) {
  return (
    <div
      className="bg-white border border-[#ECEDF3] rounded-[22px] p-[20px]"
      style={{
        boxShadow:
          "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-[16px] font-extrabold text-[#1A1B2E]">
          Assignments to complete
        </div>
        <span className="text-[11.5px] font-bold text-[#5B5BF0] bg-[#EEF0FF] px-2 py-1 rounded-full">
          {items.length} open
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-[13px] text-[#9AA0B8] text-center py-4">
          All caught up! No open assignments right now.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.workspaceHref ?? "/student/notifications"}
              className="flex items-center gap-3 p-3 border border-[#F0F1F6] rounded-[14px] cursor-pointer transition-colors hover:border-[#DDE0FF] hover:bg-[#FAFBFF]"
            >
              <span
                className="w-[9px] h-[42px] rounded-full shrink-0"
                style={{ background: PRIORITY_COLORS[item.priority] }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-[#1A1B2E] truncate">
                  {item.title}
                </div>
                <div className="text-[11.5px] font-medium text-[#9AA0B8]">
                  {item.courseTitle}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div
                  className="text-[12px] font-bold"
                  style={{ color: DUE_COLORS[item.priority] }}
                >
                  {item.dueLabel}
                </div>
                <div className="text-[10px] font-semibold text-[#9AA0B8] uppercase font-mono">
                  {item.priority}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href="/student/assignments"
        className="w-full mt-3 flex items-center justify-center text-[13px] font-bold text-white bg-[#1A1B2E] py-3 rounded-[12px] transition-opacity hover:opacity-90"
      >
        View all assignments
      </Link>
    </div>
  );
}

export type { PendingItem };
