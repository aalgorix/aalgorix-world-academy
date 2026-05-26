"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const NAV_LINKS = [
  { href: "/courses", label: "Courses" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#curricula-pathways", label: "Curricula Pathways" },
  { href: "#published-courses", label: "Live Catalog" },
  { href: "#academy-benefits", label: "Academy Benefits" },
  { href: "#pricing", label: "Pricing" },
] as const;

const DRAWER_TRANSITION_MS = 300;

const linkClassName =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]";

const ctaClassName =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]";

const mobileNavLinkClassName =
  "block w-full border-b border-slate-100 pb-4 text-base font-bold tracking-tight text-slate-800 transition-colors duration-200 hover:text-indigo-600 active:scale-[0.98]";

const menuButtonClassName =
  "relative z-50 inline-flex h-11 min-h-11 w-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] pointer-events-auto touch-manipulation select-none";

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 pointer-events-none"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

const BRAND_ALT = "Aalgorix World Academy";

function BrandMark() {
  return (
    <span className="relative block h-[72px] w-52 shrink-0 sm:w-68">
      <Image
        src="/brand/awa-logo.png"
        alt={BRAND_ALT}
        fill
        priority
        unoptimized
        sizes="(max-width: 640px) 160px, 208px"
        className="object-contain block dark:hidden"
      />
      <Image
        src="/brand/awa-logo.png"
        alt=""
        fill
        priority
        unoptimized
        sizes="(max-width: 640px) 160px, 208px"
        className="object-contain hidden dark:block"
        aria-hidden
      />
    </span>
  );
}

function normalizeMenuTap(
  event: React.MouseEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement>,
) {
  event.preventDefault();
  event.stopPropagation();
}

export function MarketingNav() {
  const [isMounted, setIsMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerMounted, setDrawerMounted] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    setPortalTarget(document.body);
  }, [isMounted]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const openMobile = useCallback(
    (event: React.MouseEvent<HTMLButtonElement> | React.PointerEvent<HTMLButtonElement>) => {
      normalizeMenuTap(event);
      setMobileOpen(true);
    },
    [],
  );

  const handleBackdropClose = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      closeMobile();
    },
    [closeMobile],
  );

  const handleDrawerClose = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      normalizeMenuTap(event);
      closeMobile();
    },
    [closeMobile],
  );

  useEffect(() => {
    if (!mobileOpen) {
      setDrawerVisible(false);
      const timeout = window.setTimeout(() => {
        setDrawerMounted(false);
      }, DRAWER_TRANSITION_MS);
      return () => window.clearTimeout(timeout);
    }

    setDrawerMounted(true);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDrawerVisible(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [mobileOpen]);

  useEffect(() => {
    if (!isMounted || !drawerMounted) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMounted, drawerMounted]);

  useEffect(() => {
    if (!isMounted || !drawerMounted) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobile();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMounted, drawerMounted, closeMobile]);

  const mobileDrawer =
    isMounted && drawerMounted && portalTarget
      ? createPortal(
          <div className="fixed inset-0 z-40 h-dvh w-full lg:hidden" id="marketing-mobile-menu">
            <button
              type="button"
              aria-label="Close menu"
              tabIndex={drawerVisible ? 0 : -1}
              className={`fixed inset-0 z-40 h-dvh w-full bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out touch-manipulation ${
                drawerVisible
                  ? "pointer-events-auto cursor-pointer opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
              onClick={handleBackdropClose}
            />

            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              className={`fixed top-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col overflow-hidden bg-white p-6 shadow-xl transition-transform duration-300 ease-out ${
                drawerVisible ? "translate-x-0" : "translate-x-full pointer-events-none"
              }`}
            >
              <div className="mb-8 flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <Link
                  href="/"
                  className="min-w-0 transition-all duration-200 active:scale-[0.98]"
                  onClick={closeMobile}
                >
                  <BrandMark />
                </Link>
                <button
                  type="button"
                  className={menuButtonClassName}
                  aria-label="Close menu"
                  onClick={handleDrawerClose}
                >
                  <CloseIcon />
                </button>
              </div>

              <nav
                className="flex flex-1 flex-col gap-4 overflow-y-auto overscroll-contain"
                aria-label="Mobile"
              >
                {NAV_LINKS.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={mobileNavLinkClassName}
                    onClick={closeMobile}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="mt-6 flex shrink-0 flex-col gap-3 border-t border-slate-100 pt-6">
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-3.5 text-center text-base font-bold tracking-tight text-slate-800 transition-all duration-200 hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.98]"
                  onClick={closeMobile}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className={ctaClassName + " w-full py-3.5 text-base"}
                  onClick={closeMobile}
                >
                  Get Started
                </Link>
              </div>
            </aside>
          </div>,
          portalTarget,
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-30 isolate border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="relative z-10 flex shrink-0 items-center transition-all duration-200 active:scale-[0.98] pointer-events-auto"
          >
            <BrandMark />
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} className={linkClassName}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className={linkClassName}>
              Sign In
            </Link>
            <Link href="/signup" className={ctaClassName}>
              Get Started
            </Link>
          </div>

          <div className="relative z-50 shrink-0 pointer-events-auto lg:hidden">
            <button
              type="button"
              className={menuButtonClassName}
              aria-expanded={mobileOpen}
              aria-controls="marketing-mobile-menu"
              aria-haspopup="dialog"
              aria-label="Open menu"
              onClick={openMobile}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {mobileDrawer}
    </>
  );
}
