"use client";

import { Mic, MicOff, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Role = "ai" | "user";

type Message = {
  id: string;
  role: Role;
  text: string;
};

function aiReply(q: string): string {
  const l = q.toLowerCase();

  if (l.includes("lesson plan") || l.includes("lesson outline"))
    return "Here's a simple lesson plan structure:\n\n1. **Learning objective** — what students should know/do by the end\n2. **Starter** (5 min) — recall prior knowledge\n3. **Teach** (15–20 min) — core concept with examples\n4. **Practice** (15 min) — guided then independent work\n5. **Plenary** (5 min) — exit ticket or summary\n\nTell me the topic and grade level and I can flesh this out.";

  if (l.includes("rubric") || l.includes("marking"))
    return "A clear rubric has 3–4 levels (e.g. Emerging → Developing → Secure → Advanced) across criteria like:\n\n• **Knowledge** — accuracy of content\n• **Application** — use of examples / method\n• **Communication** — structure and clarity\n\nShare the assignment type and I'll suggest criteria and descriptors.";

  if (l.includes("practice") || l.includes("questions") || l.includes("quiz"))
    return "I can generate practice questions by topic and difficulty. For example:\n\n**Easy:** Define the key term\n**Medium:** Apply the concept to a new scenario\n**Hard:** Compare two approaches and justify\n\nWhich subject, topic, and how many questions do you need?";

  if (l.includes("differentiat") || l.includes("mixed ability"))
    return "Differentiation ideas:\n\n• **Support** — sentence starters, worked examples, smaller steps\n• **Core** — standard task for most learners\n• **Stretch** — open-ended extension or cross-topic links\n\nSame learning objective, varied entry points. What topic are you teaching?";

  if (l.includes("hello") || l.includes("hi") || l.includes("hey"))
    return "Hello! I'm here to help with lesson ideas, assessments, rubrics, and clear explanations you can use with your class. What are you working on?";

  return "Good question. I can help you break this into:\n\n1. **Teaching angle** — how to introduce the idea\n2. **Common misconceptions** — what to watch for\n3. **Quick check** — a question to verify understanding\n\nShare more detail (subject, grade, topic) and I'll tailor the answer.";
}

const QUICK_CHIPS = [
  "Draft a lesson plan outline",
  "Generate practice questions",
  "Suggest a marking rubric",
  "Differentiation for mixed ability",
  "Explain a concept for my class",
  "Revision summary for students",
];

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "ai",
  text: "Hi! I'm Aalgo AI. 👋 I can help with lesson planning, rubrics, practice questions, and explaining concepts for your classes. What do you need today?",
};

function MessageBubble({ msg }: { msg: Message }) {
  const isAI = msg.role === "ai";

  function renderText(text: string) {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={j}>{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            ),
          )}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  }

  return (
    <div className={`flex gap-3 ${isAI ? "" : "flex-row-reverse"}`}>
      <div
        className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5"
        style={
          isAI
            ? { background: "linear-gradient(135deg,#22D3EE,#8B5CF6)" }
            : { background: "linear-gradient(135deg,#0D9488,#065F46)" }
        }
      >
        {isAI ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
      </div>

      <div
        className="max-w-[75%] rounded-[16px] px-4 py-3 text-[14px] leading-relaxed"
        style={
          isAI
            ? { background: "#fff", border: "1px solid #E2E8F0", color: "#1A1B2E", boxShadow: "0 1px 2px rgba(20,22,46,.04),0 4px 12px rgba(20,22,46,.04)" }
            : { background: "linear-gradient(135deg,#0D9488,#065F46)", color: "#fff" }
        }
      >
        <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed m-0">
          {renderText(msg.text)}
        </pre>
      </div>
    </div>
  );
}

export default function TeacherAalgoPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const reply = aiReply(trimmed);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: reply }]);
      setTyping(false);
    }, 1000 + Math.random() * 600);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex flex-col sd-float-up" style={{ height: "calc(100vh - 64px)" }}>
      <div
        className="shrink-0 flex items-center gap-4 px-6 py-4 border-b border-slate-200 bg-white"
        style={{ boxShadow: "0 1px 0 #E2E8F0" }}
      >
        <div
          className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#22D3EE,#8B5CF6)", boxShadow: "0 6px 16px rgba(139,92,246,.4)" }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-[16px] font-extrabold text-slate-900">Aalgo AI</div>
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400 font-mono">
            <span className="sd-pulse-dot w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            Online · ready to help
          </div>
        </div>

        <button
          onClick={() => setVoiceOn((v) => !v)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-[11px] text-[13px] font-bold border transition-all"
          style={
            voiceOn
              ? { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none" }
              : { background: "#fff", color: "#64748B", border: "1px solid #E2E8F0" }
          }
        >
          {voiceOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{voiceOn ? "Voice on" : "Voice off"}</span>
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col gap-4"
        style={{ background: "#F1F5F9", scrollbarWidth: "thin" }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#22D3EE,#8B5CF6)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-[16px] px-4 py-3 flex items-center gap-1.5"
              style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04)" }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-slate-400 awa-typing-1"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div
        className="shrink-0 px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto border-t border-slate-200 bg-white"
        style={{ scrollbarWidth: "none" }}
      >
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => sendMessage(chip)}
            className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-slate-200 bg-white text-teal-700 whitespace-nowrap transition-colors hover:bg-teal-50"
          >
            {chip}
          </button>
        ))}
      </div>

      <div className="shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-[16px] px-4 py-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Lesson ideas, rubrics, practice questions, concept explanations…"
            className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-slate-900 placeholder:text-slate-400"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-[11px] flex items-center justify-center text-white transition-opacity disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          AI responses are for teaching guidance only. Review before sharing with students.
        </p>
      </div>
    </div>
  );
}
