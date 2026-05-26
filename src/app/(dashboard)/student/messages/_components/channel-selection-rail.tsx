"use client";

import type { MessageChannel } from "@/lib/student/messages/types";

type ChannelSelectionRailProps = {
  batchChannels: MessageChannel[];
  teacherChannels: MessageChannel[];
  activeChannelId: string;
  onSelectChannel: (channelId: string) => void;
};

function ChannelButton({
  channel,
  active,
  onSelect,
}: {
  channel: MessageChannel;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 active:scale-[0.98] ${
        active
          ? "border-l-2 border-indigo-500 bg-indigo-50/80 pl-[10px] ring-1 ring-indigo-100"
          : "border-l-2 border-transparent hover:bg-white"
      }`}
      aria-current={active ? "true" : undefined}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
          channel.kind === "batch"
            ? "bg-violet-600 text-white"
            : "bg-slate-900 text-white"
        }`}
      >
        {channel.initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-slate-900">
          {channel.label || "Channel"}
        </span>
        <span className="block truncate text-xs text-slate-500">
          {channel.subtitle || "—"}
        </span>
      </span>
    </button>
  );
}

export function ChannelSelectionRail({
  batchChannels,
  teacherChannels,
  activeChannelId,
  onSelectChannel,
}: ChannelSelectionRailProps) {
  return (
    <aside
      aria-label="Messaging channels"
      className="flex h-full min-h-[480px] flex-col border-r border-slate-200 bg-[#fafafa] md:min-h-[560px]"
    >
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <h2 className="text-sm font-extrabold text-slate-900">Channels</h2>
        <p className="mt-0.5 text-xs text-slate-500">Batch cohorts &amp; teacher guidance</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <section aria-label="Batch enrolled channels">
          <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Batch enrolled channels
          </h3>
          <ul className="mt-2 space-y-1">
            {batchChannels.length > 0 ? (
              batchChannels.map((channel) => (
                <li key={channel.id}>
                  <ChannelButton
                    channel={channel}
                    active={activeChannelId === channel.id}
                    onSelect={() => onSelectChannel(channel.id)}
                  />
                </li>
              ))
            ) : (
              <li className="px-2 py-3 text-xs text-slate-500">
                Your intake batch channel will appear when batch metadata is assigned on
                your profile.
              </li>
            )}
          </ul>
        </section>

        <section aria-label="Teacher guidance" className="mt-6">
          <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Teacher guidance
          </h3>
          <ul className="mt-2 space-y-1">
            {teacherChannels.length > 0 ? (
              teacherChannels.map((channel) => (
                <li key={channel.id}>
                  <ChannelButton
                    channel={channel}
                    active={activeChannelId === channel.id}
                    onSelect={() => onSelectChannel(channel.id)}
                  />
                </li>
              ))
            ) : (
              <li className="px-2 py-3 text-xs text-slate-500">
                Assigned grading teachers will appear here once course staffing is
                configured.
              </li>
            )}
          </ul>
        </section>
      </div>
    </aside>
  );
}
