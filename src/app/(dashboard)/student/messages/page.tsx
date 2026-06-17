"use client";

import { ArrowLeft, Paperclip, Search, Send, Smile } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Contact = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
};

type ChatMessage = {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
};

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const CONTACTS: Contact[] = [
  { id:"c1", name:"Mr. Raj Kumar",  role:"Maths teacher",   avatar:"RK", color:"#6366F1", lastMessage:"Great work on your quiz! Keep it up.",         lastTime:"11:42 AM", unread:1 },
  { id:"c2", name:"Ms. Priya Nair", role:"Science teacher",  avatar:"PN", color:"#10B981", lastMessage:"Please submit the lab report by Friday.",       lastTime:"9:15 AM",  unread:2 },
  { id:"c3", name:"Mr. Ali Hassan", role:"English teacher",  avatar:"AH", color:"#F59E0B", lastMessage:"Your essay was excellent, well done.",          lastTime:"Yesterday",unread:0 },
  { id:"c4", name:"Ms. Lena Torres",role:"Coding teacher",   avatar:"LT", color:"#A78BFA", lastMessage:"Remember to push your code to GitHub tonight.", lastTime:"Yesterday",unread:0 },
  { id:"c5", name:"Dr. Mehta",      role:"Class coordinator",avatar:"DM", color:"#FB7185", lastMessage:"Parent-teacher meeting is on 20 Jun.",          lastTime:"Mon",      unread:0 },
];

const THREADS: Record<string, ChatMessage[]> = {
  c1: [
    { id:"m1", from:"them", text:"Hi! Have you started revising Chapter 7?",                              time:"11:30 AM" },
    { id:"m2", from:"me",   text:"Yes sir, I've done the practice problems.",                             time:"11:35 AM" },
    { id:"m3", from:"them", text:"Great work on your quiz! Keep it up.",                                  time:"11:42 AM" },
  ],
  c2: [
    { id:"m1", from:"them", text:"Hello! Just wanted to check on your lab report progress.",             time:"9:00 AM" },
    { id:"m2", from:"me",   text:"I've completed the introduction and methodology sections.",             time:"9:08 AM" },
    { id:"m3", from:"them", text:"Please submit the lab report by Friday.",                              time:"9:15 AM" },
  ],
  c3: [
    { id:"m1", from:"them", text:"I've reviewed your essay on Shakespeare.",                             time:"Yesterday" },
    { id:"m2", from:"them", text:"Your essay was excellent, well done.",                                 time:"Yesterday" },
    { id:"m3", from:"me",   text:"Thank you so much, sir! I worked really hard on it.",                  time:"Yesterday" },
  ],
  c4: [
    { id:"m1", from:"them", text:"Have you pushed your project to GitHub?",                              time:"Yesterday" },
    { id:"m2", from:"me",   text:"Almost! I'm fixing the last bug.",                                     time:"Yesterday" },
    { id:"m3", from:"them", text:"Remember to push your code to GitHub tonight.",                        time:"Yesterday" },
  ],
  c5: [
    { id:"m1", from:"them", text:"We're scheduling parent-teacher meetings.",                            time:"Mon" },
    { id:"m2", from:"them", text:"Parent-teacher meeting is on 20 Jun.",                                 time:"Mon" },
    { id:"m3", from:"me",   text:"Thank you, I'll let my parents know.",                                 time:"Mon" },
  ],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MessagesPage() {
  const [activeId,  setActiveId]  = useState<string | null>(null);
  const [search,    setSearch]    = useState("");
  const [threads,   setThreads]   = useState(THREADS);
  const [input,     setInput]     = useState("");
  const [contacts,  setContacts]  = useState(CONTACTS);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = activeId ? contacts.find((c) => c.id === activeId) : null;
  const msgs   = activeId ? (threads[activeId] ?? []) : [];

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.role.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  function sendMessage() {
    if (!input.trim() || !activeId) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: ChatMessage = { id: Date.now().toString(), from: "me", text: input.trim(), time: now };
    setThreads((prev) => ({ ...prev, [activeId]: [...(prev[activeId] ?? []), newMsg] }));
    setContacts((prev) => prev.map((c) => c.id === activeId ? { ...c, lastMessage: input.trim(), lastTime: "Now" } : c));
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function openContact(id: string) {
    setActiveId(id);
    setContacts((prev) => prev.map((c) => c.id === id ? { ...c, unread: 0 } : c));
  }

  // -------------------------------------------------------------------------
  return (
    <div
      className="flex sd-float-up bg-white rounded-[22px] border border-[#ECEDF3] overflow-hidden mx-5 sm:mx-7 my-5"
      style={{ height: "calc(100vh - 100px)", boxShadow: "0 1px 2px rgba(20,22,46,.04),0 6px 18px rgba(20,22,46,.035)" }}
    >
      {/* ── Sidebar ─────────────────────────────────────── */}
      <div
        className={`flex flex-col border-r border-[#F0F1F6] ${active ? "hidden md:flex" : "flex"}`}
        style={{ width: 320, minWidth: 280 }}
      >
        {/* header */}
        <div className="px-5 pt-5 pb-3 border-b border-[#F0F1F6]">
          <h2 className="text-[17px] font-extrabold text-[#1A1B2E] mb-3">Messages</h2>
          <div className="flex items-center gap-2 bg-[#F6F7FB] border border-[#ECEDF3] rounded-[12px] px-3 py-2">
            <Search className="w-4 h-4 text-[#9AA0B8] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-[#1A1B2E] placeholder:text-[#A2A7BE]"
            />
          </div>
        </div>

        {/* contact list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => openContact(c.id)}
              className="w-full flex items-center gap-3 px-5 py-4 border-b border-[#F8F8FC] text-left transition-colors hover:bg-[#F6F7FB]"
              style={{ background: activeId === c.id ? "#EEF0FF" : "" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[13px] font-extrabold text-white"
                style={{ background: c.color }}
              >
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-bold text-[#1A1B2E] truncate">{c.name}</span>
                  <span className="text-[11px] font-semibold text-[#9AA0B8] shrink-0 ml-2">{c.lastTime}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[12.5px] text-[#6B6F8A] truncate">{c.lastMessage}</span>
                  {c.unread > 0 && (
                    <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-[#5B5BF0] flex items-center justify-center text-[10px] font-extrabold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat panel ──────────────────────────────────── */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0F1F6]"
            style={{ boxShadow: "0 1px 0 #F0F1F6" }}>
            <button
              onClick={() => setActiveId(null)}
              className="md:hidden mr-1 w-8 h-8 rounded-[10px] border border-[#ECEDF3] flex items-center justify-center text-[#6B6F8A]"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-extrabold text-white shrink-0"
              style={{ background: active.color }}
            >
              {active.avatar}
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-[#1A1B2E]">{active.name}</div>
              <div className="text-[12px] font-semibold text-[#9AA0B8]">{active.role}</div>
            </div>
          </div>

          {/* messages */}
          <div
            className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4"
            style={{ background: "#F9FAFC", scrollbarWidth: "thin" }}
          >
            {msgs.map((msg) => {
              const isMe = msg.from === "me";
              return (
                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  {!isMe && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white shrink-0"
                      style={{ background: active.color }}
                    >
                      {active.avatar}
                    </div>
                  )}
                  <div
                    className="max-w-[70%] px-4 py-3 rounded-[16px] text-[14px] leading-relaxed"
                    style={
                      isMe
                        ? { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", borderBottomRightRadius: 4 }
                        : { background: "#fff", color: "#1A1B2E", border: "1px solid #ECEDF3", borderBottomLeftRadius: 4, boxShadow: "0 1px 2px rgba(0,0,0,.04)" }
                    }
                  >
                    {msg.text}
                    <div className="mt-1 text-right text-[10.5px]" style={{ opacity: 0.6 }}>{msg.time}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* input */}
          <div className="px-5 py-4 border-t border-[#F0F1F6] bg-white">
            <div className="flex items-center gap-2 bg-[#F6F7FB] border border-[#ECEDF3] rounded-[16px] px-4 py-2.5">
              <button className="text-[#9AA0B8] hover:text-[#5B5BF0] transition-colors">
                <Paperclip className="w-4.5 h-4.5" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message…"
                className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-[#1A1B2E] placeholder:text-[#A2A7BE]"
              />
              <button className="text-[#9AA0B8] hover:text-[#5B5BF0] transition-colors">
                <Smile className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* empty state – no active chat on desktop */
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center px-8">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg,#EEF0FF,#E4E7FE)" }}
          >
            <Send className="w-7 h-7 text-[#5B5BF0]" />
          </div>
          <p className="text-[17px] font-extrabold text-[#1A1B2E]">Select a conversation</p>
          <p className="mt-2 text-[13.5px] text-[#9AA0B8]">Choose a contact from the list to start chatting.</p>
        </div>
      )}
    </div>
  );
}
