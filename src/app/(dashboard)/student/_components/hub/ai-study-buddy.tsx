"use client";

import { useState } from "react";

import type { HubAiContext } from "@/lib/student/hub/types";

type AiStudyBuddyProps = {
  context: HubAiContext;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type BuddyMessage = {
  id: string;
  role: "user" | "assistant";
  body: string;
};

export function AiStudyBuddy({ context, open, onOpenChange }: AiStudyBuddyProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<BuddyMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      body: `I'm your AI Study Buddy. Ask me about ${context.lessonTitle ?? context.courseTitle} or request a quick quiz.`,
    },
  ]);

  function sendPrompt() {
    const prompt = input.trim();
    if (!prompt) return;

    const contextLine = [
      context.courseTitle,
      context.moduleTitle,
      context.lessonTitle,
    ]
      .filter(Boolean)
      .join(" › ");

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", body: prompt },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        body: `Context: ${contextLine}. Here's a focused study tip: break "${prompt}" into three checkpoints and verify each against your lesson notes before moving on.`,
      },
    ]);
    setInput("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="fixed bottom-6 right-4 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-900 shadow-lg transition-all duration-200 hover:border-indigo-300 hover:shadow-xl active:scale-[0.98] lg:right-6"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
          AI
        </span>
        AI Buddy Tab
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close AI Study Buddy"
            onClick={() => onOpenChange(false)}
          />
          <aside
            role="dialog"
            aria-labelledby="ai-buddy-title"
            className="relative flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
              <div>
                <h2 id="ai-buddy-title" className="text-sm font-extrabold text-slate-900">
                  AI Study Buddy Tab
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {context.lessonTitle ?? context.moduleTitle ?? context.courseTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
              >
                Close
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "ml-8 bg-slate-900 text-white"
                      : "mr-4 bg-[#fafafa] text-slate-800 ring-1 ring-slate-200"
                  }`}
                >
                  {msg.body}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-2">
              {["Explain this lesson", "Generate a 5-question quiz", "Summarize key terms"].map(
                (chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setInput(chip)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]"
                  >
                    {chip}
                  </button>
                ),
              )}
            </div>

            <footer className="border-t border-slate-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendPrompt();
                  }}
                  placeholder="Ask a context-aware question…"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={sendPrompt}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-700 active:scale-[0.98]"
                >
                  Ask
                </button>
              </div>
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  );
}
