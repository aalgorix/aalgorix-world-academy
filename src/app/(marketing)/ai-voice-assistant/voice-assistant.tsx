"use client";

import { useConversation } from "@11labs/react";
import type { Status } from "@11labs/react";
import { useCallback, useState } from "react";

/* ============================================================
   Environment
   ============================================================ */

const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID ?? "";

/* ============================================================
   Types & helpers
   ============================================================ */

type UIState = "idle" | "connecting" | "listening" | "speaking" | "ending" | "error";

function resolveUIState(status: Status, isSpeaking: boolean, hasError: boolean): UIState {
  if (hasError) return "error";
  switch (status) {
    case "connecting":    return "connecting";
    case "disconnecting": return "ending";
    case "connected":     return isSpeaking ? "speaking" : "listening";
    default:              return "idle";
  }
}

const STATUS_META: Record<UIState, { label: string; dot: string; text: string }> = {
  idle:       { label: "Ready to talk",        dot: "bg-slate-300",               text: "text-slate-500" },
  connecting: { label: "Connecting...",         dot: "bg-amber-400 animate-pulse", text: "text-amber-600" },
  listening:  { label: "Listening...",          dot: "bg-emerald-400 animate-pulse", text: "text-emerald-600" },
  speaking:   { label: "Speaking...",           dot: "bg-violet-500 animate-pulse", text: "text-violet-600" },
  ending:     { label: "Ending session...",     dot: "bg-slate-400 animate-pulse", text: "text-slate-500" },
  error:      { label: "Something went wrong.", dot: "bg-red-400",                 text: "text-red-600" },
};

const BTN_META: Record<UIState, { from: string; to: string; glow: string }> = {
  idle:       { from: "from-indigo-600", to: "to-violet-600",  glow: "shadow-indigo-500/40" },
  connecting: { from: "from-indigo-400", to: "to-violet-400",  glow: "shadow-indigo-300/30" },
  listening:  { from: "from-emerald-500", to: "to-teal-500",   glow: "shadow-emerald-500/40" },
  speaking:   { from: "from-violet-600", to: "to-fuchsia-600", glow: "shadow-violet-500/40" },
  ending:     { from: "from-slate-400",  to: "to-slate-500",   glow: "shadow-slate-400/20" },
  error:      { from: "from-red-500",    to: "to-rose-500",    glow: "shadow-red-500/30" },
};

const RING_COLOR: Record<UIState, string> = {
  idle:       "bg-indigo-400/30",
  connecting: "bg-indigo-400/20",
  listening:  "bg-emerald-400/30",
  speaking:   "bg-violet-500/30",
  ending:     "bg-slate-400/20",
  error:      "bg-red-400/20",
};

/* ============================================================
   Small sub-components
   ============================================================ */

function MicrophoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10 text-white sm:h-12 sm:w-12"
      fill="none"
      aria-hidden
    >
      <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
      <path
        d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SoundWaveBars() {
  const delays = ["0s", "0.15s", "0.3s", "0.15s", "0s"];
  return (
    <div className="flex items-center gap-[3px]" aria-hidden>
      {delays.map((delay, i) => (
        <span
          key={i}
          className="awa-soundbar-bar w-[3px] rounded-full bg-white/90"
          style={{ height: 20, animationDelay: delay }}
        />
      ))}
    </div>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10 text-white sm:h-12 sm:w-12" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-10 w-10 animate-spin text-white/80 sm:h-12 sm:w-12"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ConfigError() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" d="M12 9v4M12 17h.01" />
            <path strokeLinecap="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-bold text-red-900">Agent ID not configured</h2>
        <p className="mt-2 text-sm leading-relaxed text-red-700">
          Add{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_ELEVENLABS_AGENT_ID
          </code>{" "}
          to your <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs">.env.local</code> file and
          restart the dev server.
        </p>
      </div>
    </section>
  );
}

/* ============================================================
   Main component
   ============================================================ */

export function VoiceAssistant() {
  /* Guard: agent ID must be configured */
  if (!AGENT_ID) return <ConfigError />;

  return <VoiceAssistantInner />;
}

function VoiceAssistantInner() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { startSession, endSession, status, isSpeaking } = useConversation({
    onConnect: () => setErrorMsg(null),
    onDisconnect: () => setErrorMsg(null),
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "An unexpected error occurred.";
      setErrorMsg(msg);
    },
  });

  const uiState = resolveUIState(status, isSpeaking, errorMsg !== null);
  const isActive = status === "connected" || status === "connecting" || status === "disconnecting";
  const isLoading = status === "connecting" || status === "disconnecting";
  const { label, dot, text } = STATUS_META[uiState];
  const { from, to, glow } = BTN_META[uiState];
  const ringColor = RING_COLOR[uiState];

  const handleToggle = useCallback(async () => {
    setErrorMsg(null);
    if (isActive) {
      await endSession();
      return;
    }
    try {
      /* Explicitly request mic permission for clear browser prompt */
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await startSession({ agentId: AGENT_ID });
    } catch (err) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setErrorMsg("Microphone access was denied. Please allow access in your browser settings and try again.");
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Could not start the session. Please try again.");
      }
    }
  }, [isActive, startSession, endSession]);

  return (
    <section
      className="relative flex min-h-[calc(100svh-4rem)] flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white px-4 py-16"
      aria-label="AI Voice Assistant interface"
    >
      {/* ── Ambient aurora blobs ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="awa-aurora-orb-1 absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-violet-400/15 blur-[100px]" />
        <div className="awa-aurora-orb-2 absolute -left-32 top-1/2 h-[400px] w-[400px] rounded-full bg-indigo-400/10 blur-[90px]" />
        <div className="awa-aurora-orb-3 absolute -bottom-24 right-1/4 h-[350px] w-[350px] rounded-full bg-fuchsia-400/8 blur-[80px]" />
      </div>

      {/* ── Glassmorphism card ── */}
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/85 px-6 py-10 shadow-2xl shadow-slate-900/8 backdrop-blur-xl sm:px-10 sm:py-14">

        {/* ── Top border glow ── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-3xl"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6) 40%, rgba(99,102,241,0.7) 60%, transparent)",
          }}
        />

        {/* ── Header ── */}
        <header className="text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
              AI Voice Assistant
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Talk to Our AI Assistant
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500 sm:text-base">
            Ask questions about admissions, courses, homeschooling, AI programs, and student support.
          </p>
        </header>

        {/* ── Central microphone button + ripple rings ── */}
        <div className="my-10 flex flex-col items-center justify-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Ripple rings — only when active */}
            {isActive && !isLoading && (
              <>
                <span className={`awa-ripple-ring ${ringColor}`} aria-hidden />
                <span className={`awa-ripple-ring ${ringColor}`} aria-hidden />
                <span className={`awa-ripple-ring ${ringColor}`} aria-hidden />
              </>
            )}

            {/* Main circular button */}
            <button
              type="button"
              onClick={handleToggle}
              disabled={isLoading}
              aria-label={
                isActive
                  ? `End session — currently ${uiState}`
                  : "Start voice session with AI assistant"
              }
              aria-live="polite"
              className={[
                "relative flex h-28 w-28 items-center justify-center rounded-full",
                "bg-gradient-to-br",
                from, to,
                "shadow-2xl", glow,
                "transition-all duration-300",
                "hover:scale-105 hover:shadow-2xl",
                "active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-4",
                isLoading ? "opacity-70 cursor-wait" : "cursor-pointer",
                "sm:h-36 sm:w-36",
              ].join(" ")}
            >
              {uiState === "connecting" && <SpinnerIcon />}
              {uiState === "speaking"   && <SoundWaveBars />}
              {uiState === "ending"     && <StopIcon />}
              {(uiState === "idle" || uiState === "listening" || uiState === "error") && <MicrophoneIcon />}
            </button>
          </div>

          {/* ── Status pill ── */}
          <div role="status" aria-live="polite" aria-atomic="true">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
              <span className={`text-sm font-semibold ${text}`}>{label}</span>
            </div>
          </div>
        </div>

        {/* ── CTA button ── */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isLoading}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5",
              "bg-gradient-to-r", from, to,
              "text-sm font-bold text-white",
              "shadow-lg", glow,
              "transition-all duration-200",
              "hover:opacity-90 hover:shadow-xl",
              "active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2",
              isLoading ? "opacity-60 cursor-wait" : "",
              "min-w-[160px]",
            ].join(" ")}
          >
            {isLoading ? (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {status === "connecting" ? "Connecting…" : "Ending…"}
              </>
            ) : isActive ? (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                End Session
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
                  <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
                  <path d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
                Start Talking
              </>
            )}
          </button>
        </div>

        {/* ── Error message ── */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm leading-relaxed text-red-700"
          >
            {errorMsg}
          </div>
        )}

        {/* ── Ambient note ── */}
        {!isActive && !errorMsg && (
          <p className="mt-6 text-center text-xs text-slate-400">
            Microphone access required · Your conversation is private
          </p>
        )}
      </div>
    </section>
  );
}
