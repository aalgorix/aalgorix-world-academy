"use client";

import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Message = { id: string; from: "me" | "other"; text: string; time: string };
type Contact = { id: string; name: string; role: string; initials: string; color: string; unread: number; lastMsg: string; messages: Message[] };

const CONTACTS: Contact[] = [
  {
    id: "c1", name: "Priya Sharma", role: "Student — Math G8", initials: "PS", color: "#0D9488", unread: 2, lastMsg: "Sir, I didn't understand Q4…",
    messages: [
      { id: "m1", from: "other", text: "Good morning Sir! I have a question about last week's homework.", time: "9:02 AM" },
      { id: "m2", from: "me",    text: "Sure Priya, go ahead!", time: "9:05 AM" },
      { id: "m3", from: "other", text: "Sir, I didn't understand Q4 on the algebraic expressions sheet.", time: "9:06 AM" },
      { id: "m4", from: "other", text: "Should we expand and simplify, or just factor?", time: "9:06 AM" },
    ],
  },
  {
    id: "c2", name: "Arjun Mehta", role: "Student — Physics G9", initials: "AM", color: "#6366F1", unread: 0, lastMsg: "Understood, thank you!",
    messages: [
      { id: "m5", from: "other", text: "Sir, is tomorrow's class online or offline?", time: "Yesterday" },
      { id: "m6", from: "me",    text: "It will be online via the usual Zoom link.", time: "Yesterday" },
      { id: "m7", from: "other", text: "Understood, thank you!", time: "Yesterday" },
    ],
  },
  {
    id: "c3", name: "Sneha Kulkarni", role: "Parent — Chemistry G10", initials: "SK", color: "#EC4899", unread: 1, lastMsg: "Please share her progress report",
    messages: [
      { id: "m8", from: "other", text: "Hello, I'm Sneha's mother. How is she doing in class?", time: "Mon" },
      { id: "m9", from: "me",    text: "She is doing very well! Active participation and good assignments.", time: "Mon" },
      { id: "m10", from: "other", text: "Please share her progress report when possible.", time: "Mon" },
    ],
  },
  {
    id: "c4", name: "Rahul Verma", role: "Student — Math G8", initials: "RV", color: "#F59E0B", unread: 0, lastMsg: "I submitted the assignment",
    messages: [
      { id: "m11", from: "other", text: "Sir, I submitted the assignment a bit late. Will it still be graded?", time: "Tue" },
      { id: "m12", from: "me",    text: "Yes Rahul, I'll review it. Please submit on time next week.", time: "Tue" },
      { id: "m13", from: "other", text: "Thank you sir.", time: "Tue" },
    ],
  },
  {
    id: "c5", name: "Ms. Ananya Roy", role: "Admin", initials: "AR", color: "#22D3EE", unread: 0, lastMsg: "Schedule updated for next week",
    messages: [
      { id: "m14", from: "other", text: "Hi, just a heads up — the schedule for next week has been updated.", time: "Mon" },
      { id: "m15", from: "other", text: "You have an extra session on Wednesday afternoon.", time: "Mon" },
      { id: "m16", from: "me",    text: "Got it, I'll update my calendar.", time: "Mon" },
    ],
  },
];

const REPLY_SUGGESTIONS = [
  "I'll review and get back to you shortly.",
  "Please check the study material shared earlier.",
  "I'll address this in tomorrow's class.",
  "Good question — let me explain in detail.",
];

export default function TeacherMessagesPage() {
  const [contacts, setContacts] = useState<Contact[]>(CONTACTS);
  const [activeId,  setActiveId]  = useState<string>(CONTACTS[0]!.id);
  const [draft,     setDraft]     = useState("");
  const [typing,    setTyping]    = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = contacts.find((c) => c.id === activeId)!;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active.messages.length]);

  function send(text = draft) {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = { id: `m${Date.now()}`, from: "me", text: text.trim(), time: now };
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMsg: text.trim(), unread: 0 }
          : c
      )
    );
    setDraft("");
    // Simulate reply
    setTyping(true);
    setTimeout(() => {
      const replies = ["Got it, thanks!", "Understood.", "Thank you Sir / Ma'am!", "Okay, I'll keep that in mind."];
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        from: "other",
        text: replies[Math.floor(Math.random() * replies.length)]!,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      };
      setContacts((prev) =>
        prev.map((c) =>
          c.id === activeId ? { ...c, messages: [...c.messages, reply], lastMsg: reply.text } : c
        )
      );
      setTyping(false);
    }, 1800);
  }

  return (
    <div className="mx-auto w-full sd-float-up" style={{ maxWidth: 1320, padding: "28px 32px 80px" }}>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900">Messages</h1>
        <p className="mt-1 text-[14px] font-medium text-slate-500">Communicate with students, parents, and staff.</p>
      </div>

      <div className="flex gap-4 h-[600px]">
        {/* Contact list */}
        <div className="w-[280px] shrink-0 bg-white border border-slate-200 rounded-[22px] overflow-hidden flex flex-col"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          <div className="px-4 py-3.5 border-b border-slate-100">
            <span className="text-[14px] font-extrabold text-slate-900">Conversations</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50" style={{ scrollbarWidth: "none" }}>
            {contacts.map((c) => (
              <button key={c.id} onClick={() => { setActiveId(c.id); setContacts(prev => prev.map(x => x.id === c.id ? {...x, unread: 0} : x)); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={c.id === activeId ? { background: "#F0FDF9" } : {}}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
                  style={{ background: c.color }}>
                  {c.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-slate-900 truncate">{c.name}</span>
                    {c.unread > 0 && (
                      <span className="ml-1 shrink-0 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-extrabold flex items-center justify-center">
                        {c.unread}
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px] text-slate-500 truncate">{c.lastMsg}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 bg-white border border-slate-200 rounded-[22px] overflow-hidden flex flex-col"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,.04),0 6px 18px rgba(0,0,0,.03)" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white shrink-0"
              style={{ background: active.color }}>
              {active.initials}
            </div>
            <div>
              <div className="text-[14px] font-extrabold text-slate-900">{active.name}</div>
              <div className="text-[12px] text-slate-500">{active.role}</div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3" style={{ background: "#F8FAFC", scrollbarWidth: "none" }}>
            {active.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[72%]">
                  <div className="px-4 py-2.5 rounded-[16px] text-[13.5px] leading-relaxed"
                    style={msg.from === "me"
                      ? { background: "#0D9488", color: "#fff", borderBottomRightRadius: 4 }
                      : { background: "#fff", color: "#0F172A", border: "1px solid #E2E8F0", borderBottomLeftRadius: 4 }}>
                    {msg.text}
                  </div>
                  <div className={`text-[11px] text-slate-400 mt-1 ${msg.from === "me" ? "text-right" : "text-left"}`}>{msg.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="px-4 py-3 bg-white border border-slate-200 rounded-[16px] rounded-bl-[4px] flex gap-1">
                  {[0,1,2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 sd-pulse-dot" style={{ animationDelay: `${i*0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          <div className="px-4 py-2 border-t border-slate-100 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {REPLY_SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)}
                className="shrink-0 text-[11.5px] font-semibold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-700 transition-colors whitespace-nowrap">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center gap-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Type a message…"
              className="flex-1 bg-slate-50 border border-slate-200 rounded-[12px] px-4 py-2.5 text-[13.5px] outline-none focus:border-teal-400 transition-colors"
            />
            <button onClick={() => send()}
              className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white transition-opacity hover:opacity-80"
              style={{ background: "#0D9488" }}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty prompt if no contacts */}
      {contacts.length === 0 && (
        <div className="bg-white rounded-[22px] border border-dashed border-slate-300 px-8 py-20 text-center mt-6">
          <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
          <p className="text-[17px] font-extrabold text-slate-900">No messages yet</p>
        </div>
      )}
    </div>
  );
}
