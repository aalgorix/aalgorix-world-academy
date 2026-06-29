"use client";

import {
  ConversationProvider,
  useConversation,
  type ConversationStatus,
  type HookOptions,
} from "@elevenlabs/react";
import { Loader2, Send, Sparkles } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import type { LmsAiSessionContext } from "@/lib/ai/lms-context";
import {
  fetchLmsTool,
  warmLmsToolCache,
  type LmsToolSegment,
} from "@/lib/ai/client-tool-responses";

const AALGO_AGENT_ID =
  process.env.NEXT_PUBLIC_ELEVENLABS_STUDENT_AGENT_ID ?? "";

export type AalgoAudience = "student" | "parent" | "teacher";

const AUDIENCE_COPY: Record<
  AalgoAudience,
  {
    emptyTitle: string;
    emptyHint: string;
    placeholder: string;
    disclaimer: string;
  }
> = {
  student: {
    emptyTitle: "Your AI study tutor",
    emptyHint:
      "Type a question below — homework help, concept explanations, or study tips.",
    placeholder: "Ask about homework, concepts, or study strategies…",
    disclaimer:
      "Study guidance only — verify important answers with your teacher.",
  },
  parent: {
    emptyTitle: "Your family learning assistant",
    emptyHint:
      "Ask about curriculum topics, study support, or how to help your child learn.",
    placeholder: "Ask about subjects, progress, or learning strategies…",
    disclaimer:
      "Guidance only — confirm important details with your child's teacher.",
  },
  teacher: {
    emptyTitle: "Your AI teaching assistant",
    emptyHint:
      "Lesson ideas, rubrics, practice questions, or concept explanations.",
    placeholder:
      "Lesson ideas, rubrics, practice questions, concept explanations…",
    disclaimer:
      "Teaching guidance only — review before sharing with students.",
  },
};

type ChatRole = "user" | "agent";

type AgentTextPart = {
  text: string;
  type: "start" | "delta" | "stop";
  event_id: number;
};

type ServerMessage = {
  message: string;
  event_id?: number;
  role: ChatRole;
};

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  eventId?: number;
  streaming?: boolean;
};

function nextMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function statusLabel(status: ConversationStatus, isTyping: boolean): string {
  if (isTyping) return "Aalgo is typing…";
  switch (status) {
    case "connecting":
      return "Connecting…";
    case "connected":
      return "Online · ready to chat";
    case "error":
      return "Connection error";
    default:
      return "Offline";
  }
}

function statusDotClass(status: ConversationStatus, isTyping: boolean): string {
  if (isTyping) return "bg-violet-500 animate-pulse";
  switch (status) {
    case "connecting":
      return "bg-amber-400 animate-pulse";
    case "connected":
      return "bg-emerald-400";
    case "error":
      return "bg-red-400";
    default:
      return "bg-slate-300";
  }
}

function MissingAgentConfig() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md rounded-[22px] border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <h2 className="text-lg font-extrabold text-red-900">
          Aalgo AI is not configured
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-red-700">
          Add{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_ELEVENLABS_STUDENT_AGENT_ID
          </code>{" "}
          to{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">
            .env.local
          </code>{" "}
          (separate from the marketing voice assistant agent) and restart the dev
          server.
        </p>
      </div>
    </div>
  );
}

function createLmsClientTools(getSession: () => LmsAiSessionContext) {
  const call = (segment: LmsToolSegment) => {
    const session = getSession();
    return fetchLmsTool(segment, session.userId, session);
  };

  return {
    get_lms_summary: () => call("summary"),
    get_due_assignments: () => call("assignments"),
    get_attendance_summary: () => call("attendance"),
    get_upcoming_schedule: () => call("schedule"),
    get_recent_grades: () => call("grades"),
  };
}

function AalgoHeader({
  status,
  isTyping,
}: {
  status: ConversationStatus;
  isTyping: boolean;
}) {
  return (
    <header
      className="shrink-0 flex items-center gap-4 border-b border-[#ECEDF3] bg-white px-4 py-3.5 sm:px-6"
      style={{ boxShadow: "0 1px 0 #ECEDF3" }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] text-white sm:h-[46px] sm:w-[46px] sm:rounded-[14px]"
        style={{
          background: "linear-gradient(135deg,#22D3EE,#8B5CF6)",
          boxShadow: "0 6px 16px rgba(139,92,246,.35)",
        }}
      >
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-extrabold text-[#1A1B2E] sm:text-[16px]">
          Aalgo AI
        </h1>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#9AA0B8] font-mono sm:text-[11.5px]">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${statusDotClass(status, isTyping)}`}
            aria-hidden
          />
          {statusLabel(status, isTyping)}
        </p>
      </div>
    </header>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[min(100%,34rem)] rounded-[18px] px-4 py-3 text-[14px] leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-[6px] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white"
            : "rounded-bl-[6px] border border-[#E8E9F0] bg-white text-[#1A1B2E]",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
        {message.streaming ? (
          <span className="mt-1 inline-block h-4 w-0.5 animate-pulse bg-violet-400" />
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({
  connected,
  copy,
}: {
  connected: boolean;
  copy: (typeof AUDIENCE_COPY)[AalgoAudience];
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <div
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-[18px] text-white"
        style={{
          background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
          boxShadow: "0 8px 24px rgba(99,102,241,.35)",
        }}
      >
        <Sparkles className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-extrabold text-[#1A1B2E]">{copy.emptyTitle}</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#6B6F8A]">
        {connected ? copy.emptyHint : "Connecting to Aalgo…"}
      </p>
    </div>
  );
}

function AalgoChatInner({
  audience,
  session,
}: {
  audience: AalgoAudience;
  session: LmsAiSessionContext;
}) {
  const copy = AUDIENCE_COPY[audience];
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const clientTools = useMemo(
    () => createLmsClientTools(() => sessionRef.current),
    [],
  );

  const startLmsSession = useCallback(
    (startSession: (options?: HookOptions) => void) => {
      startSession({
        textOnly: true,
        userId: sessionRef.current.userId,
        dynamicVariables: sessionRef.current.dynamicVariables,
        clientTools,
      });
    },
    [clientTools],
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const connectAttempted = useRef(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const upsertAgentStream = useCallback((part: AgentTextPart) => {
    setMessages((prev) => {
      const index = prev.findIndex(
        (item) => item.eventId === part.event_id && item.role === "agent",
      );

      if (part.type === "start") {
        if (index >= 0) return prev;
        return [
          ...prev,
          {
            id: `agent-${part.event_id}`,
            eventId: part.event_id,
            role: "agent",
            text: part.text,
            streaming: true,
          },
        ];
      }

      if (part.type === "delta") {
        if (index >= 0) {
          const next = [...prev];
          next[index] = {
            ...next[index],
            text: next[index].text + part.text,
            streaming: true,
          };
          return next;
        }
        return [
          ...prev,
          {
            id: `agent-${part.event_id}`,
            eventId: part.event_id,
            role: "agent",
            text: part.text,
            streaming: true,
          },
        ];
      }

      if (part.type === "stop") {
        setIsTyping(false);
        if (index >= 0) {
          const next = [...prev];
          next[index] = {
            ...next[index],
            text: part.text || next[index].text,
            streaming: false,
          };
          return next;
        }
        if (!part.text.trim()) return prev;
        return [
          ...prev,
          {
            id: `agent-${part.event_id}`,
            eventId: part.event_id,
            role: "agent",
            text: part.text,
            streaming: false,
          },
        ];
      }

      return prev;
    });
  }, []);

  const handleServerMessage = useCallback((payload: ServerMessage) => {
    const text = payload.message.trim();
    if (!text) return;
    setIsTyping(false);

    setMessages((prev) => {
      if (
        payload.event_id != null &&
        prev.some((item) => item.eventId === payload.event_id)
      ) {
        if (payload.role === "agent") {
          return prev.map((item) =>
            item.eventId === payload.event_id
              ? { ...item, text, streaming: false }
              : item,
          );
        }
        return prev;
      }

      return [
        ...prev,
        {
          id: nextMessageId(payload.role),
          eventId: payload.event_id,
          role: payload.role,
          text,
        },
      ];
    });
  }, []);

  const {
    startSession,
    endSession,
    sendUserMessage,
    sendUserActivity,
    status,
  } = useConversation({
    textOnly: true,
    clientTools,
    onConnect: () => {
      setErrorMsg(null);
      warmLmsToolCache(sessionRef.current.userId);
    },
    onDisconnect: () => setIsTyping(false),
    onError: (message) => setErrorMsg(message),
    onMessage: handleServerMessage,
    onAgentChatResponsePart: upsertAgentStream,
    onAgentTyping: () => setIsTyping(true),
  });

  const connected = status === "connected";
  const isConnecting = status === "connecting";
  const canSend = connected && draft.trim().length > 0;

  useEffect(() => {
    if (connectAttempted.current || status !== "disconnected") return;
    connectAttempted.current = true;
    startLmsSession(startSession);
  }, [status, startSession, startLmsSession]);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text || !connected) return;

    appendMessage({
      id: nextMessageId("user"),
      role: "user",
      text,
    });
    sendUserMessage(text);
    setDraft("");
    setIsTyping(false);
  }, [appendMessage, connected, draft, sendUserMessage]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleRetry = async () => {
    setErrorMsg(null);
    connectAttempted.current = false;
    if (status === "connected" || status === "connecting") {
      endSession();
    }
    connectAttempted.current = true;
    startLmsSession(startSession);
  };

  return (
    <div className="aalgo-ai-workspace flex min-h-[calc(100dvh-4rem)] flex-col">
      <AalgoHeader status={status} isTyping={isTyping} />

      <div className="relative flex min-h-0 flex-1 flex-col bg-[#F6F7FB]">
        <div
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.length === 0 ? (
            <EmptyState connected={connected} copy={copy} />
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} />
              ))}
              {isTyping && !messages.some((item) => item.streaming) ? (
                <div className="flex justify-start">
                  <div className="rounded-[18px] rounded-bl-[6px] border border-[#E8E9F0] bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5" aria-hidden>
                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:120ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <div ref={scrollAnchorRef} />
        </div>

        {errorMsg ? (
          <div
            role="alert"
            className="mx-4 mb-3 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-6"
          >
            <p>{errorMsg}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-2 font-semibold text-red-800 underline-offset-2 hover:underline"
            >
              Try again
            </button>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-[#ECEDF3] bg-white px-4 py-3.5 sm:px-6"
        >
          <label htmlFor={inputId} className="sr-only">
            Message Aalgo AI
          </label>
          <div className="mx-auto flex w-full max-w-3xl items-end gap-2.5">
            <textarea
              id={inputId}
              rows={1}
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (connected) sendUserActivity();
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                isConnecting
                  ? "Connecting to Aalgo…"
                  : connected
                    ? copy.placeholder
                    : "Waiting for connection…"
              }
              disabled={!connected}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[14px] border border-[#E0E2EC] bg-[#F9FAFC] px-4 py-3 text-[14px] text-[#1A1B2E] placeholder:text-[#9AA0B8] focus:border-[#8B5CF6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                boxShadow: "0 4px 14px rgba(99,102,241,.35)",
              }}
            >
              {isConnecting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] font-medium text-[#9AA0B8]">
            {copy.disclaimer}
          </p>
        </form>
      </div>
    </div>
  );
}

export type AalgoAiWorkspaceProps = {
  audience?: AalgoAudience;
  session: LmsAiSessionContext;
};

export function AalgoAiWorkspace({
  audience = "student",
  session,
}: AalgoAiWorkspaceProps) {
  if (!AALGO_AGENT_ID) {
    return (
      <div className="aalgo-ai-workspace flex min-h-[calc(100dvh-4rem)] flex-col">
        <AalgoHeader status="disconnected" isTyping={false} />
        <MissingAgentConfig />
      </div>
    );
  }

  return (
    <ConversationProvider agentId={AALGO_AGENT_ID} textOnly>
      <AalgoChatInner audience={audience} session={session} />
    </ConversationProvider>
  );
}
