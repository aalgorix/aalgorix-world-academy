"use client";

import { useState } from "react";

import { formatShortDate } from "@/lib/student/hub/format";
import type { HubChatMessage, HubTeacherContact } from "@/lib/student/hub/types";

type ChatChannelsPanelProps = {
  cohortMessages: HubChatMessage[];
  teacherContacts: HubTeacherContact[];
  teacherThreads: Record<string, HubChatMessage[]>;
};

type ChatPane = "cohort" | "teacher";

export function ChatChannelsPanel({
  cohortMessages,
  teacherContacts,
  teacherThreads,
}: ChatChannelsPanelProps) {
  const [pane, setPane] = useState<ChatPane>("cohort");
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(
    teacherContacts[0]?.id ?? null,
  );
  const [draft, setDraft] = useState("");
  const [localCohort, setLocalCohort] = useState(cohortMessages);
  const [localThreads, setLocalThreads] = useState(teacherThreads);

  const activeTeacher = teacherContacts.find((t) => t.id === activeTeacherId);
  const messages =
    pane === "cohort"
      ? localCohort
      : (activeTeacherId ? localThreads[activeTeacherId] : undefined) ?? [];

  function sendMessage() {
    const body = draft.trim();
    if (!body) return;
    const entry: HubChatMessage = {
      id: `local-${Date.now()}`,
      authorName: "You",
      body,
      sentAtIso: new Date().toISOString(),
      isSelf: true,
    };
    if (pane === "cohort") {
      setLocalCohort((prev) => [...prev, entry]);
    } else if (activeTeacherId) {
      setLocalThreads((prev) => ({
        ...prev,
        [activeTeacherId]: [...(prev[activeTeacherId] ?? []), entry],
      }));
    }
    setDraft("");
  }

  return (
    <section
      aria-label="Messaging"
      id="hub-messages"
      className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setPane("cohort")}
          className={`flex-1 px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.98] ${
            pane === "cohort" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Group chat
        </button>
        <button
          type="button"
          onClick={() => setPane("teacher")}
          className={`flex-1 px-3 py-2.5 text-xs font-bold transition-all active:scale-[0.98] ${
            pane === "teacher" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Teacher counsel
        </button>
      </div>

      {pane === "teacher" ? (
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-2">
          {teacherContacts.length === 0 ? (
            <p className="px-2 py-1 text-xs text-slate-500">No assigned instructors yet.</p>
          ) : (
            teacherContacts.map((teacher) => (
              <button
                key={teacher.id}
                type="button"
                onClick={() => setActiveTeacherId(teacher.id)}
                className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-1 transition-all active:scale-[0.98] ${
                  activeTeacherId === teacher.id ? "bg-indigo-50 ring-1 ring-indigo-200" : ""
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                  {teacher.initials}
                </span>
                <span className="max-w-[72px] truncate text-[10px] font-semibold text-slate-700">
                  {teacher.fullName.split(" ")[0]}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}

      <div className="flex max-h-52 flex-1 flex-col gap-2 overflow-y-auto p-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[90%] rounded-xl px-3 py-2 text-xs ${
              msg.isSelf
                ? "ml-auto bg-slate-900 text-white"
                : "bg-[#fafafa] text-slate-800 ring-1 ring-slate-200"
            }`}
          >
            {!msg.isSelf ? (
              <p className="mb-0.5 font-bold text-[10px] uppercase tracking-wide opacity-70">
                {msg.authorName}
              </p>
            ) : null}
            <p>{msg.body}</p>
            <p className="mt-1 text-[10px] opacity-60">{formatShortDate(msg.sentAtIso)}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 p-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder={
              pane === "cohort"
                ? "Message your cohort…"
                : `Message ${activeTeacher?.fullName ?? "instructor"}…`
            }
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none ring-slate-900 focus:ring-2"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
