"use client";

import { ArrowLeft, Paperclip, Search, Send, Smile } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  ensureConversationAction,
  sendMessageAction,
} from "@/lib/messages/actions";
import type { ConversationContact, MessageRow } from "@/lib/messages/queries";

type MessagingPanelProps = {
  contacts: ConversationContact[];
  viewerId: string;
  participantRole: "student" | "teacher";
  revalidatePath: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

function contactKey(c: ConversationContact) {
  return `${c.courseId}:${c.peerId}`;
}

export function MessagingPanel({
  contacts: initialContacts,
  viewerId,
  participantRole,
  revalidatePath,
  emptyTitle = "No contacts yet",
  emptyDescription = "Teachers from your enrolled courses will appear here.",
}: MessagingPanelProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = activeKey
    ? contacts.find((c) => contactKey(c) === activeKey) ?? null
    : null;
  const msgs = active?.messages ?? [];

  const filtered = contacts.filter(
    (c) =>
      c.peerName.toLowerCase().includes(search.toLowerCase()) ||
      c.peerRole.toLowerCase().includes(search.toLowerCase()) ||
      c.courseTitle.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length, activeKey]);

  function appendLocalMessage(key: string, message: MessageRow) {
    setContacts((prev) =>
      prev.map((c) => {
        if (contactKey(c) !== key) return c;
        return {
          ...c,
          messages: [...c.messages, message],
          lastMessage: message.body,
          lastTime: "Now",
          unread: 0,
        };
      }),
    );
  }

  function sendMessage() {
    if (!input.trim() || !active) return;
    const key = contactKey(active);
    const body = input.trim();
    setInput("");
    setError(null);

    const optimistic: MessageRow = {
      id: `temp-${Date.now()}`,
      senderId: viewerId,
      body,
      createdAt: new Date().toISOString(),
    };
    appendLocalMessage(key, optimistic);

    startTransition(async () => {
      let conversationId = active.conversationId;

      if (!conversationId) {
        const studentId = participantRole === "student" ? viewerId : active.peerId;
        const teacherId = participantRole === "teacher" ? viewerId : active.peerId;
        const ensured = await ensureConversationAction({
          courseId: active.courseId,
          studentId,
          teacherId,
        });
        if (!ensured.ok) {
          setError(ensured.error);
          return;
        }
        conversationId = ensured.conversationId;
        setContacts((prev) =>
          prev.map((c) =>
            contactKey(c) === key ? { ...c, conversationId } : c,
          ),
        );
      }

      const result = await sendMessageAction(conversationId, body, [revalidatePath]);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 60px" }}>
        <div className="mb-6">
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Messages</h1>
          <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">Chat with your teachers.</p>
        </div>
        <div className="rounded-[22px] border border-dashed border-[#ECEDF3] bg-white px-8 py-16 text-center">
          <p className="text-[16px] font-bold text-[#1A1B2E]">{emptyTitle}</p>
          <p className="mt-2 text-[14px] font-medium text-[#9AA0B8]">{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 60px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#1A1B2E]">Messages</h1>
        <p className="mt-1 text-[14px] font-medium text-[#9AA0B8]">Chat with your teachers and coordinators.</p>
      </div>

      <div
        className="bg-white border border-[#ECEDF3] rounded-[22px] overflow-hidden flex"
        style={{
          height: "calc(100vh - 220px)",
          minHeight: 480,
          boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)",
        }}
      >
        {/* contact list */}
        <div
          className={`flex flex-col border-r border-[#ECEDF3] bg-[#FAFAFC] ${
            activeKey ? "hidden sm:flex" : "flex"
          }`}
          style={{ width: 300, minWidth: 260 }}
        >
          <div className="p-4 border-b border-[#ECEDF3]">
            <div className="flex items-center gap-2 bg-white border border-[#ECEDF3] rounded-[12px] px-3 py-2">
              <Search className="w-4 h-4 text-[#9AA0B8] shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-[#1A1B2E] placeholder:text-[#A2A7BE]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((c) => {
              const key = contactKey(c);
              const isActive = key === activeKey;
              return (
                <button
                  key={key}
                  onClick={() => setActiveKey(key)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white"
                  style={{ background: isActive ? "#fff" : undefined }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
                    style={{ background: c.accentColor }}
                  >
                    {c.peerInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13.5px] font-bold text-[#1A1B2E] truncate">{c.peerName}</span>
                      <span className="text-[10.5px] font-semibold text-[#9AA0B8] shrink-0">{c.lastTime}</span>
                    </div>
                    <div className="text-[11.5px] font-medium text-[#9AA0B8] truncate">{c.peerRole}</div>
                    <div className="text-[12px] font-medium text-[#6B6F8A] truncate mt-0.5">{c.lastMessage}</div>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#6366F1] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {c.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* chat pane */}
        <div className={`flex-1 flex flex-col min-w-0 ${!activeKey ? "hidden sm:flex" : "flex"}`}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-[#9AA0B8] text-[14px] font-medium">
              Select a conversation
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-[#ECEDF3]">
                <button onClick={() => setActiveKey(null)} className="sm:hidden text-[#6B6F8A]">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white"
                  style={{ background: active.accentColor }}
                >
                  {active.peerInitials}
                </div>
                <div>
                  <div className="text-[14px] font-extrabold text-[#1A1B2E]">{active.peerName}</div>
                  <div className="text-[12px] font-medium text-[#9AA0B8]">{active.peerRole}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                {msgs.length === 0 && (
                  <p className="text-center text-[13px] text-[#9AA0B8] font-medium py-8">
                    Say hello to start the conversation.
                  </p>
                )}
                {msgs.map((m) => {
                  const isMe = m.senderId === viewerId;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[75%] rounded-[16px] px-4 py-2.5 text-[13.5px] font-medium leading-relaxed"
                        style={
                          isMe
                            ? { background: "#6366F1", color: "#fff" }
                            : { background: "#F0F1F6", color: "#1A1B2E" }
                        }
                      >
                        {m.body}
                        <div
                          className="text-[10px] font-semibold mt-1 opacity-70"
                          style={{ textAlign: isMe ? "right" : "left" }}
                        >
                          {new Date(m.createdAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {error && (
                <p className="px-5 text-[12px] font-semibold text-red-600">{error}</p>
              )}

              <div className="px-4 py-3 border-t border-[#ECEDF3] flex items-end gap-2">
                <button className="w-9 h-9 rounded-[10px] border border-[#ECEDF3] flex items-center justify-center text-[#9AA0B8]">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button className="w-9 h-9 rounded-[10px] border border-[#ECEDF3] flex items-center justify-center text-[#9AA0B8]">
                  <Smile className="w-4 h-4" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Type a message…"
                  rows={1}
                  className="flex-1 bg-[#F8F8FC] border border-[#ECEDF3] rounded-[14px] px-4 py-2.5 text-[14px] font-medium text-[#1A1B2E] placeholder:text-[#A2A7BE] resize-none outline-none focus:border-[#C7D0FF]"
                />
                <button
                  onClick={sendMessage}
                  disabled={pending || !input.trim()}
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white disabled:opacity-50"
                  style={{ background: "#6366F1" }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
