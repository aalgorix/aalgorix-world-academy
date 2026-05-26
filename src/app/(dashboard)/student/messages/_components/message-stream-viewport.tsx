"use client";

import { useEffect, useRef } from "react";

import { formatShortDate } from "@/lib/student/hub/format";
import type { LoungeChatMessage, MessageChannel } from "@/lib/student/messages/types";

type MessageStreamViewportProps = {
  channel: MessageChannel | null;
  messages: LoungeChatMessage[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
};

export function MessageStreamViewport({
  channel,
  messages,
  draft,
  onDraftChange,
  onSend,
}: MessageStreamViewportProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length, channel?.id]);

  if (!channel) {
    return (
      <div className="flex h-full min-h-[480px] flex-col items-center justify-center bg-white p-8 text-center md:min-h-[560px]">
        <p className="text-base font-bold text-slate-900">Select a channel</p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Choose a batch cohort stream or a teacher guidance thread from the left rail to
          open your message viewport.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label={`Message stream for ${channel.label}`}
      className="flex h-full min-h-[480px] flex-col bg-white md:min-h-[560px]"
    >
      <header className="border-b border-slate-200 px-4 py-4 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
          {channel.kind === "batch" ? "Batch channel" : "Private guidance"}
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-slate-900">
          {channel.label || "Conversation"}
        </h2>
        <p className="text-xs text-slate-500">{channel.subtitle || ""}</p>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4 sm:px-6"
        role="log"
        aria-live="polite"
      >
        {messages.length > 0 ? (
          messages.map((message) => (
            <article
              key={message.id}
              className={`flex max-w-[85%] flex-col ${
                message.isSelf ? "ml-auto items-end" : "items-start"
              }`}
            >
              {!message.isSelf ? (
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  {message.authorName}
                </p>
              ) : null}
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  message.isSelf
                    ? "rounded-br-md bg-slate-900 text-white"
                    : "rounded-bl-md bg-[#fafafa] text-slate-800 ring-1 ring-slate-200"
                }`}
              >
                {message.body}
              </div>
              <time
                dateTime={message.sentAtIso}
                className="mt-1 text-[10px] font-medium text-slate-400"
              >
                {formatShortDate(message.sentAtIso)}
              </time>
            </article>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
            No messages in this thread yet. Say hello to start the conversation.
          </p>
        )}
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4 sm:px-6">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            onSend();
          }}
        >
          <label htmlFor="message-draft" className="sr-only">
            Message text
          </label>
          <input
            id="message-draft"
            type="text"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder={`Message ${channel.label}…`}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-[#fafafa] px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
          >
            Send Message
          </button>
        </form>
      </footer>
    </section>
  );
}
