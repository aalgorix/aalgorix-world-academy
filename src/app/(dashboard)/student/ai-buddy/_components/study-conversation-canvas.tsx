"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  LESSON_SHORTCUT_PROMPTS,
  type AiBuddyActiveSelection,
} from "@/lib/student/ai-buddy/types";

type ConversationMessage = {
  id: string;
  role: "user" | "assistant";
  body: string;
};

type StudyConversationCanvasProps = {
  selection: AiBuddyActiveSelection | null;
  displayName: string;
};

function contextLabel(selection: AiBuddyActiveSelection): string {
  const parts = [
    selection.courseTitle,
    selection.moduleTitle,
    selection.lessonTitle,
  ].filter((part) => part.trim().length > 0);
  return parts.join(" › ") || "Your enrolled curriculum";
}

function buildWelcomeMessage(
  selection: AiBuddyActiveSelection | null,
  displayName: string,
): string {
  const name = displayName.trim() || "Student";
  if (!selection) {
    return `Hello ${name}. Select a course, module, or lesson on the left to begin a context-aware study session.`;
  }
  if (selection.level === "lesson") {
    return `Hello ${name}. I'm focused on "${selection.lessonTitle || "this lesson"}". Use the study shortcuts below or ask any question about this unit.`;
  }
  if (selection.level === "module") {
    return `Hello ${name}. Module context: "${selection.moduleTitle || "this module"}". Select a specific lesson to unlock quiz and practice shortcuts.`;
  }
  return `Hello ${name}. Course context: "${selection.courseTitle || "this course"}". Drill into a module and lesson for targeted AI coaching.`;
}

function buildAssistantReply(
  selection: AiBuddyActiveSelection | null,
  prompt: string,
): string {
  const context = selection ? contextLabel(selection) : "General study";
  if (selection?.level === "lesson") {
    if (prompt.includes("Quiz Cards")) {
      return `Context: ${context}. I'll generate five flashcard pairs covering definitions, worked examples, and common misconceptions for this unit. Start with the core vocabulary from your lesson notes.`;
    }
    if (prompt.includes("Deconstruct")) {
      return `Context: ${context}. Let's simplify the unit into three layers: (1) big idea, (2) supporting evidence, (3) one practice application you can explain aloud in 60 seconds.`;
    }
    if (prompt.includes("Practice Questions")) {
      return `Context: ${context}. Here is a practice arc: one recall question, one application problem, and one explain-your-reasoning prompt—each aligned to your lesson objectives.`;
    }
  }
  return `Context: ${context}. Regarding "${prompt}": break the problem into checkpoints, verify each against your lesson materials, and note any step that still feels uncertain.`;
}

export function StudyConversationCanvas({
  selection,
  displayName,
}: StudyConversationCanvasProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectionKey = selection
    ? `${selection.level}-${selection.courseId}-${selection.moduleId}-${selection.lessonId}`
    : "none";

  useEffect(() => {
    setMessages([
      {
        id: `welcome-${selectionKey}`,
        role: "assistant",
        body: buildWelcomeMessage(selection, displayName),
      },
    ]);
    setDraft("");
  }, [selectionKey, selection, displayName]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const lessonSelected = selection?.level === "lesson";
  const safeCourseTitle = selection?.courseTitle ?? "";
  const safeModuleTitle = selection?.moduleTitle ?? "";
  const safeLessonTitle = selection?.lessonTitle ?? "";
  const workspaceHref = selection?.workspaceHref ?? "";

  function submitPrompt(prompt: string) {
    const text = prompt.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", body: text },
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        body: buildAssistantReply(selection, text),
      },
    ]);
    setDraft("");
  }

  return (
    <section
      aria-label="AI study conversation"
      className="flex h-full min-h-[520px] flex-col bg-white md:min-h-[600px]"
    >
      <header className="border-b border-slate-200 px-4 py-4 sm:px-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600">
          AI study conversation
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-slate-900">
          {lessonSelected
            ? safeLessonTitle || "Lesson workspace"
            : safeModuleTitle || safeCourseTitle || "Select study context"}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {lessonSelected
            ? `${safeCourseTitle} › ${safeModuleTitle}`
            : "Choose a lesson track to enable unit shortcuts"}
        </p>
        {lessonSelected && workspaceHref ? (
          <Link
            href={workspaceHref}
            className="mt-2 inline-flex text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            Open classroom workspace →
          </Link>
        ) : null}
      </header>

      {lessonSelected ? (
        <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-[#fafafa] px-4 py-3 sm:px-6">
          {LESSON_SHORTCUT_PROMPTS.map((shortcut) => (
            <button
              key={shortcut}
              type="button"
              onClick={() => submitPrompt(shortcut)}
              className="rounded-full border border-violet-200 bg-white px-3 py-1.5 text-[11px] font-bold text-violet-900 transition-all hover:border-violet-300 hover:bg-violet-50 active:scale-[0.98]"
            >
              {shortcut}
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
        role="log"
        aria-live="polite"
      >
        {messages.map((message) => (
          <article
            key={message.id}
            className={`flex max-w-[90%] ${message.role === "user" ? "ml-auto justify-end" : ""}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "user"
                  ? "rounded-br-md bg-slate-900 text-white"
                  : "rounded-bl-md bg-[#fafafa] text-slate-800 ring-1 ring-slate-200"
              }`}
            >
              {message.body}
            </div>
          </article>
        ))}
      </div>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white p-4 sm:px-6">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            submitPrompt(draft);
          }}
        >
          <label htmlFor="ai-buddy-prompt" className="sr-only">
            Study prompt
          </label>
          <textarea
            id="ai-buddy-prompt"
            name="prompt"
            rows={2}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitPrompt(draft);
              }
            }}
            placeholder={
              lessonSelected
                ? `Ask about ${safeLessonTitle || "this lesson"}…`
                : "Select a lesson to unlock shortcuts, or ask a general study question…"
            }
            className="min-h-[52px] min-w-0 flex-1 resize-none rounded-xl border border-slate-200 bg-[#fafafa] px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white transition-all hover:from-indigo-700 hover:to-violet-700 active:scale-[0.98]"
          >
            Send
          </button>
        </form>
      </footer>
    </section>
  );
}
