"use client";

import { Mic, MicOff, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Role = "ai" | "user";

type Message = {
  id: string;
  role: Role;
  text: string;
};

// ---------------------------------------------------------------------------
// Simulated AI responses (replace with real API call when backend is ready)
// ---------------------------------------------------------------------------
function aiReply(q: string): string {
  const l = q.toLowerCase();

  if (l.includes("quadratic") || l.includes("algebra") || l.includes("equation"))
    return "Great question! A quadratic equation has the form **ax² + bx + c = 0**. You can solve it by:\n\n1. **Factoring** — split the middle term\n2. **Completing the square** — rearrange to (x+p)² = q\n3. **Quadratic formula** — x = (−b ± √(b²−4ac)) / 2a\n\nWant me to walk through a worked example step by step?";

  if (l.includes("cell") || l.includes("biology"))
    return "A cell is the basic unit of life! Key organelles:\n\n• **Nucleus** — control centre, holds DNA\n• **Mitochondria** — energy (ATP) production\n• **Cell membrane** — controls what enters/exits\n• **Ribosome** — protein synthesis\n\nPlant cells also have a **cell wall** and **chloroplasts**. Want 3 practice questions on this?";

  if (l.includes("practice") || l.includes("quiz") || l.includes("question"))
    return "Here are 3 practice questions:\n\n**1)** Solve x² − 5x + 6 = 0\n**2)** Factor x² + 7x + 12\n**3)** Find the vertex of y = x² − 4x + 3\n\nTake your time and reply with your answers — I'll check them and explain any mistakes!";

  if (l.includes("hello") || l.includes("hi") || l.includes("hey"))
    return "Hey! Ready to learn something awesome today? 🚀 You can ask me about any subject — homework help, concept explanations, or practice questions. What are we working on?";

  if (l.includes("python") || l.includes("code") || l.includes("loop") || l.includes("function"))
    return "Python loops are fundamental! Here's a quick summary:\n\n```python\n# for loop — iterate a known number of times\nfor i in range(5):\n    print(i)\n\n# while loop — repeat while condition is true\nx = 0\nwhile x < 5:\n    x += 1\n```\n\nFunctions let you reuse code:\n```python\ndef greet(name):\n    return f\"Hello, {name}!\"\n```\n\nShall I give you a coding challenge?";

  if (l.includes("photosynthesis") || l.includes("plant"))
    return "Photosynthesis is how plants make food using sunlight! The equation:\n\n**6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂**\n\nIt happens in two stages:\n1. **Light reactions** (in thylakoids) — capture solar energy, produce ATP\n2. **Calvin cycle** (in stroma) — uses ATP to build glucose\n\nWant a diagram-style breakdown or practice questions?";

  if (l.includes("poem") || l.includes("poetry") || l.includes("english") || l.includes("literature"))
    return "Great choice! When analysing poetry, use **SMILE**:\n\n• **S**tructure — how is it laid out? Stanzas, rhyme scheme?\n• **M**ood & tone — happy, melancholic, defiant?\n• **I**magery — what pictures does the poet paint?\n• **L**anguage — metaphor, simile, personification, alliteration?\n• **E**ffect — what is the poet trying to make you feel?\n\nWhich poem are you studying? I can help you annotate it.";

  return "Good question! Let me break that down clearly:\n\n1. **Core idea** — the fundamental concept you need to grasp\n2. **Example** — a concrete case to make it stick\n3. **Tip** — a shortcut or mnemonic to remember it\n\nWant the short version or a deep dive? Just tell me how much detail you need!";
}

const QUICK_CHIPS = [
  "Explain quadratic equations",
  "Cell biology help",
  "Python loops & functions",
  "Give me practice questions",
  "How does photosynthesis work?",
  "Help with poetry analysis",
];

const INITIAL_MESSAGE: Message = {
  id: "init",
  role: "ai",
  text: "Hi! I'm your Aalgorix AI Tutor. 👋 I can explain concepts, check homework, and build practice questions tailored just for you. What are we working on today?",
};

// ---------------------------------------------------------------------------
// Message bubble
// ---------------------------------------------------------------------------
function MessageBubble({ msg }: { msg: Message }) {
  const isAI = msg.role === "ai";

  // Very simple markdown: **bold**, newlines → <br>, ```code```
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
      {/* avatar */}
      <div
        className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5"
        style={
          isAI
            ? { background: "linear-gradient(135deg,#22D3EE,#8B5CF6)" }
            : { background: "linear-gradient(135deg,#FBBF24,#F59E0B)" }
        }
      >
        {isAI ? <Sparkles className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
      </div>

      {/* bubble */}
      <div
        className="max-w-[75%] rounded-[16px] px-4 py-3 text-[14px] leading-relaxed"
        style={
          isAI
            ? { background: "#fff", border: "1px solid #ECEDF3", color: "#1A1B2E", boxShadow: "0 1px 2px rgba(20,22,46,.04),0 4px 12px rgba(20,22,46,.04)" }
            : { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff" }
        }
      >
        <pre className="whitespace-pre-wrap font-sans text-[14px] leading-relaxed m-0">
          {renderText(msg.text)}
        </pre>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AiTutorPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput]       = useState("");
  const [typing, setTyping]     = useState(false);
  const [voiceOn, setVoiceOn]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
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
    <div className="flex flex-col sd-float-up" style={{ height: "calc(100vh - 69px)" }}>
      {/* header */}
      <div
        className="shrink-0 flex items-center gap-4 px-6 py-4 border-b border-[#ECEDF3] bg-white"
        style={{ boxShadow: "0 1px 0 #ECEDF3" }}
      >
        <div
          className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#22D3EE,#8B5CF6)", boxShadow: "0 6px 16px rgba(139,92,246,.4)" }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-[16px] font-extrabold text-[#1A1B2E]">Aalgorix AI Tutor</div>
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-[#9AA0B8] font-mono">
            <span className="sd-pulse-dot w-2 h-2 rounded-full bg-[#34D399] shrink-0" />
            Online · ready to help
          </div>
        </div>

        {/* voice toggle */}
        <button
          onClick={() => setVoiceOn((v) => !v)}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-[11px] text-[13px] font-bold border transition-all"
          style={
            voiceOn
              ? { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "#fff", border: "none" }
              : { background: "#fff", color: "#6B6F8A", border: "1px solid #ECEDF3" }
          }
        >
          {voiceOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{voiceOn ? "Voice on" : "Voice off"}</span>
        </button>
      </div>

      {/* messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col gap-4"
        style={{ background: "#F6F7FB", scrollbarWidth: "thin" }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {/* typing indicator */}
        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#22D3EE,#8B5CF6)" }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white border border-[#ECEDF3] rounded-[16px] px-4 py-3 flex items-center gap-1.5"
              style={{ boxShadow: "0 1px 2px rgba(20,22,46,.04)" }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#9AA0B8] awa-typing-1"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* quick chips */}
      <div
        className="shrink-0 px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto border-t border-[#ECEDF3] bg-white"
        style={{ scrollbarWidth: "none" }}
      >
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => sendMessage(chip)}
            className="shrink-0 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-[#ECEDF3] bg-white text-[#5B5BF0] whitespace-nowrap transition-colors hover:bg-[#EEF0FF]"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* input bar */}
      <div className="shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-[#ECEDF3]">
        <div className="flex items-center gap-3 bg-[#F6F7FB] border border-[#ECEDF3] rounded-[16px] px-4 py-3">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything — homework, concepts, practice questions…"
            className="flex-1 bg-transparent border-none outline-none text-[14px] font-medium text-[#1A1B2E] placeholder:text-[#A2A7BE]"
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
        <p className="mt-2 text-center text-[11px] text-[#C4C7D9]">
          AI responses are for learning guidance only. Always verify with your teacher.
        </p>
      </div>
    </div>
  );
}
