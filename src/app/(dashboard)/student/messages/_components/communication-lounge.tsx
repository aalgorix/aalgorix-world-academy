"use client";

import { useMemo, useState } from "react";

import type {
  LoungeChatMessage,
  MessageChannel,
  StudentMessagesPayload,
} from "@/lib/student/messages/types";

import { ChannelSelectionRail } from "./channel-selection-rail";
import { MessageStreamViewport } from "./message-stream-viewport";

type CommunicationLoungeProps = {
  payload: StudentMessagesPayload;
  initialChannelId: string | null;
};

function resolveInitialChannelId(
  channels: MessageChannel[],
  initialChannelId: string | null,
): string {
  if (initialChannelId && channels.some((channel) => channel.id === initialChannelId)) {
    return initialChannelId;
  }
  const teacherMatch = initialChannelId?.startsWith("teacher-")
    ? initialChannelId
    : initialChannelId
      ? `teacher-${initialChannelId}`
      : null;
  if (teacherMatch && channels.some((channel) => channel.id === teacherMatch)) {
    return teacherMatch;
  }
  return channels[0]?.id ?? "";
}

export function CommunicationLounge({
  payload,
  initialChannelId,
}: CommunicationLoungeProps) {
  const batchChannels = useMemo(
    () => payload.channels.filter((channel) => channel.kind === "batch"),
    [payload.channels],
  );
  const teacherChannels = useMemo(
    () => payload.channels.filter((channel) => channel.kind === "teacher"),
    [payload.channels],
  );

  const [activeChannelId, setActiveChannelId] = useState(() =>
    resolveInitialChannelId(payload.channels, initialChannelId),
  );
  const [threads, setThreads] = useState<Record<string, LoungeChatMessage[]>>(
    payload.threads,
  );
  const [draft, setDraft] = useState("");

  const activeChannel =
    payload.channels.find((channel) => channel.id === activeChannelId) ?? null;
  const activeMessages = threads[activeChannelId] ?? [];

  function sendMessage() {
    const body = draft.trim();
    if (!body || !activeChannelId) return;

    const entry: LoungeChatMessage = {
      id: `local-${Date.now()}`,
      authorName: "You",
      body,
      sentAtIso: new Date().toISOString(),
      isSelf: true,
    };

    setThreads((prev) => ({
      ...prev,
      [activeChannelId]: [...(prev[activeChannelId] ?? []), entry],
    }));
    setDraft("");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid min-h-[480px] grid-cols-1 md:min-h-[560px] md:grid-cols-[minmax(240px,300px)_1fr]">
        <ChannelSelectionRail
          batchChannels={batchChannels}
          teacherChannels={teacherChannels}
          activeChannelId={activeChannelId}
          onSelectChannel={setActiveChannelId}
        />
        <MessageStreamViewport
          channel={activeChannel}
          messages={activeMessages}
          draft={draft}
          onDraftChange={setDraft}
          onSend={sendMessage}
        />
      </div>
    </div>
  );
}
