"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

/* ============================================================
   Types & constants
   ============================================================ */

type WidgetState = "expanded" | "minimized" | "dismissed";

const SPRING = { type: "spring", stiffness: 360, damping: 26 } as const;

const VIDEO_SRC = "/videos/banner-video.mp4";

/* ============================================================
   Sub-components
   ============================================================ */

function IconClose() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconMinus() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="relative h-6 w-6 translate-x-0.5 text-white"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

/* ============================================================
   Main component
   ============================================================ */

export function FloatingVideoBanner() {
  const [widgetState, setWidgetState] = useState<WidgetState>("expanded");
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();

  /* Start / pause video based on widget state */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (widgetState === "expanded") {
      /* preload="none" means nothing is fetched until .play() — true lazy load */
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [widgetState]);

  const dismiss = useCallback(() => setWidgetState("dismissed"), []);
  const minimize = useCallback(() => setWidgetState("minimized"), []);
  const expand = useCallback(() => setWidgetState("expanded"), []);

  if (widgetState === "dismissed") return null;

  return (
    <div
      /* bottom-16 = 64 px clears the StickyCta bar (~56 px) */
      className="fixed bottom-16 right-4 z-50 sm:right-6"
      role="complementary"
      aria-label="Academy preview video"
    >
      <AnimatePresence mode="wait" initial={false}>

        {/* ════════════════════════════════════════════════
            MINIMIZED — pulsing circular play button
            ════════════════════════════════════════════════ */}
        {widgetState === "minimized" && (
          <motion.button
            key="minimized"
            type="button"
            aria-label="Expand academy preview video"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={SPRING}
            whileHover={prefersReducedMotion ? {} : { scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            onClick={expand}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 shadow-xl shadow-indigo-600/50 ring-2 ring-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-400 focus-visible:ring-offset-2"
          >
            {/* Outer pulse ring */}
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-indigo-500/40 animate-ping"
              style={{ animationDuration: "2.8s" }}
            />
            <IconPlay />
          </motion.button>
        )}

        {/* ════════════════════════════════════════════════
            EXPANDED — glassmorphism video panel
            ════════════════════════════════════════════════ */}
        {widgetState === "expanded" && (
          <motion.div
            key="expanded"
            role="region"
            aria-label="Academy preview video player"
            /* 240 × 135 mobile  →  320 × 180 desktop (16 / 9) */
            initial={{ opacity: 0, scale: 0.82, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.82, y: 28 }}
            transition={SPRING}
            whileHover={prefersReducedMotion ? {} : { y: -5, transition: { type: "spring", stiffness: 300, damping: 22 } }}
            className={[
              "relative w-60 sm:w-80",
              "overflow-hidden rounded-[20px]",
              /* glass */
              "border border-white/10 bg-slate-900/95 backdrop-blur-xl",
              /* glow shadow */
              "shadow-2xl shadow-indigo-600/25",
              /* subtle inner ring */
              "ring-1 ring-indigo-500/20",
            ].join(" ")}
            style={{ isolation: "isolate" }}
          >
            {/* ── Ambient top border glow ── */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(139,92,246,0.8) 40%, rgba(99,102,241,0.9) 60%, transparent)",
              }}
            />

            {/* ── Video (full bleed — no chrome bars) ── */}
            <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
              {/* Floating controls — top-right overlay */}
              <div className="absolute right-2 top-2 z-20 flex items-center gap-1">
                {/* Minimise */}
                <motion.button
                  type="button"
                  aria-label="Minimise video"
                  whileTap={{ scale: 0.88 }}
                  onClick={minimize}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white/80 backdrop-blur-sm transition-colors duration-150 hover:bg-black/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <IconMinus />
                </motion.button>

                {/* Close */}
                <motion.button
                  type="button"
                  aria-label="Close video"
                  whileTap={{ scale: 0.88 }}
                  onClick={dismiss}
                  className="flex h-6 w-6 items-center justify-center rounded-md bg-black/50 text-white/80 backdrop-blur-sm transition-colors duration-150 hover:bg-red-600/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <IconClose />
                </motion.button>
              </div>

              {/* Subtle inset glow vignette */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-10"
                style={{ boxShadow: "inset 0 0 24px rgba(99,102,241,0.1)" }}
              />

              <video
                ref={videoRef}
                className="block h-full w-full object-cover"
                muted
                loop
                playsInline
                preload="none"
                aria-hidden
                tabIndex={-1}
                disablePictureInPicture
                controlsList="nodownload noplaybackrate nofullscreen noremoteplayback"
              >
                <source src={VIDEO_SRC} type="video/mp4" />
              </video>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
