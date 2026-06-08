"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { appAuthHref, isExternalAuthHref } from "@/lib/app-auth-href";

type NavLink = Readonly<{
  href: string;
  label: string;
  description?: string;
  tags?: ReadonlyArray<string>;
  isExternal?: boolean;
}>;

type NavNode =
  | Readonly<{
      type: "dropdown";
      id: string;
      label: string;
      overviewHref?: string;
      items: ReadonlyArray<NavLink>;
    }>
  | Readonly<{
      type: "link";
      id: string;
      label: string;
      href: string;
    }>;

const NAV_NODES: ReadonlyArray<NavNode> = [
  {
    type: "dropdown",
    id: "academics",
    label: "Academics",
    overviewHref: "/academics",
    items: [
      {
        href: "/academics#life-journey",
        label: "Life Journey: How do we teach?",
        description: "Explore our student-centric pedagogical model and everyday learning workflows",
        tags: ["Our Method", "Learning Flow"],
      },
      {
        href: "/academics#project-based-learning",
        label: "Project-Based Learning",
        description: "Hands-on, experiential academic tracks built for real-world mastery and portfolio development",
        tags: ["Portfolio Building", "Real-World Tasks"],
      },
      {
        href: "/academics#curriculum-coach",
        label: "Curriculum Coach",
        description: "Accredited international tracks tailored to your pacing",
        tags: ["NIOS Board", "Cambridge International"],
      },
      {
        href: "/academics#inclusive-learning",
        label: "Inclusive Learning",
        description: "Dedicated homeschooling programs tailored for children with special needs.",
        tags: ["Special Needs", "Homeschooling"],
      },
    ],
  },
  {
    type: "dropdown",
    id: "extracurricular",
    label: "Extracurricular",
    overviewHref: "/extracurricular",
    items: [
      {
        href: "/extracurricular#life-coach-support",
        label: "Life Coach Support",
        description: "Instilling critical discipline and executive function habits",
        tags: ["Discipline", "Life Skills", "Confidence Mapping"],
      },
      {
        href: "/extracurricular#talent-support",
        label: "Talent Support",
        description: "Nurturing raw natural strengths and cultivating competitive portfolios",
        tags: ["Music", "Cricket", "Gaming", "Portfolio Curation"],
      },
    ],
  },
  {
    type: "dropdown",
    id: "our-tech",
    label: "Our Tech",
    items: [
      {
        href: "/ai-tutor",
        label: "AI Tutor",
        description: "Your personalized 24/7 contextual study companion sandbox",
        tags: ["Avatar Based Study", "Instant Answers", "Interactive Study"],
      },
      {
        href: "https://aimasterji.professorsai.org/",
        label: "AI Toy",
        description: "Advanced cognitive training terminal and mentor network link",
        tags: ["Child's Companion", "AI Mentor"],
        isExternal: true,
      },
    ],
  },
  {
    type: "dropdown",
    id: "why-us",
    label: "Why Us",
    items: [
      { href: "/why-us", label: "Why Us?" },
      { href: "/our-story", label: "Our Story" },
      { href: "/faq", label: "FAQ" },
      { href: "/contact", label: "Admission" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Join Us" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    type: "dropdown",
    id: "parent-portal",
    label: "Parent Portal",
    overviewHref: "/parent-portal",
    items: [
      { href: "/parent-portal#parent-faq-vault", label: "Parent FAQ Vault" },
      { href: "/parent-portal#global-family-community", label: "Global Family Community" },
      { href: "/parent-portal#accountability-handbook", label: "Accountability Handbook" },
      {
        href: "/parent-portal#sessions",
        label: "Sessions: When started?",
      },
    ],
  },
] as const;

type DropdownId = Extract<NavNode, { type: "dropdown" }>["id"];

const POPOVER_TRANSITION_MS = 300;

const mobilePopoverShellClassName =
  "absolute top-full left-4 right-4 z-50 mt-2 w-auto origin-top lg:hidden sm:left-auto sm:right-4 sm:w-80";

const mobilePopoverCardClassName =
  "overflow-hidden rounded-2xl border border-slate-200/20 bg-white/90 shadow-2xl backdrop-blur-xl";

const mobileAccordionTriggerClassName =
  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-800 transition-all duration-300 hover:bg-slate-100/80 active:scale-[0.98]";

const mobileSubLinkClassName =
  "block w-full rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-300 hover:bg-slate-100/80 hover:text-indigo-600 active:scale-[0.98]";

const mobileDirectLinkClassName =
  "flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 transition-all duration-300 hover:bg-slate-100/80 active:scale-[0.98]";

const linkClassName =
  "rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]";

const dropdownTriggerClassName =
  "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all duration-200 ease-out hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]";

const dropdownPanelWrapperClassName = "absolute top-full left-0 z-50 pt-2";

const dropdownPanelWrapperMegaClassName =
  "absolute top-full left-1/2 z-50 -translate-x-1/2 pt-2";

const dropdownPanelCardClassName =
  "w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl transition-all duration-200 ease-out";

const dropdownMegaPanelCardClassName =
  "w-[min(calc(100vw-2rem),44rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-xl transition-all duration-200 ease-out";

const dropdownCompactMegaPanelClassName =
  "w-[min(calc(100vw-2rem),34rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-xl transition-all duration-200 ease-out";

const dropdownItemClassName =
  "block rounded-lg px-3 py-2 text-sm text-slate-600 transition-all duration-200 ease-out hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]";

const dropdownRichItemClassName =
  "block h-full rounded-xl border border-slate-100 p-3 transition-all duration-300 ease-out hover:bg-slate-50 active:scale-[0.98]";

const navTagBadgeClassName =
  "rounded-md border border-indigo-100/20 bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600";

const mobileRichItemClassName =
  "block rounded-xl border border-slate-200/70 bg-white px-3 py-3 transition-all duration-300 hover:bg-slate-50 active:scale-[0.98]";

const ctaClassName =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98]";

const menuButtonClassName =
  "relative z-50 inline-flex h-11 min-h-11 w-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] pointer-events-auto touch-manipulation select-none";

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

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 pointer-events-none"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      aria-hidden
    >
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 7.5l5 5 5-5" />
    </svg>
  );
}

function BrandMark() {
  return (
    <Image
      src="/brand/awa-logo.svg"
      alt="Aalgorix World Academy Logo"
      width={150}
      height={40}
      className="h-8 w-auto sm:h-10"
      priority
    />
  );
}

function normalizeMenuTap(event: React.MouseEvent<HTMLButtonElement>) {
  event.preventDefault();
  event.stopPropagation();
}

function AuthNavLink({
  path,
  className,
  children,
  onClick,
}: {
  path: "/login" | "/signup";
  className: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const href = appAuthHref(path);

  if (isExternalAuthHref(href)) {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function NavTagBadge({ children }: { children: string }) {
  return <span className={navTagBadgeClassName}>{children ?? ""}</span>;
}

function isRichNavLink(item: NavLink) {
  return Boolean((item.description ?? "").length || (item.tags ?? []).length);
}

function dropdownUsesMegaLayout(items: ReadonlyArray<NavLink>) {
  return (items ?? []).some(isRichNavLink);
}

function getDesktopDropdownPanelClassName(items: ReadonlyArray<NavLink>) {
  const safeItems = items ?? [];
  if (!dropdownUsesMegaLayout(safeItems)) {
    return dropdownPanelCardClassName;
  }

  return safeItems.length >= 4 ? dropdownMegaPanelCardClassName : dropdownCompactMegaPanelClassName;
}

function getDesktopDropdownListClassName(items: ReadonlyArray<NavLink>) {
  const safeItems = items ?? [];
  if (!dropdownUsesMegaLayout(safeItems)) {
    return "space-y-1";
  }

  return safeItems.length >= 3
    ? "grid grid-cols-1 gap-2 lg:grid-cols-2"
    : "grid grid-cols-1 gap-2 sm:grid-cols-2";
}

function DesktopNavDropdownItem({
  item,
  onSelect,
}: {
  item: NavLink;
  onSelect: () => void;
}) {
  const href = item.href ?? "";
  const label = item.label ?? "";
  const description = item.description ?? "";
  const tags = item.tags ?? [];

  if (!isRichNavLink(item)) {
    return (
      <a href={href} className={dropdownItemClassName} role="menuitem" onClick={onSelect}>
        {label}
      </a>
    );
  }

  return (
    <a href={href} className={dropdownRichItemClassName} role="menuitem" onClick={onSelect}>
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      {description ? (
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      ) : null}
      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <NavTagBadge key={tag ?? ""}>{tag ?? ""}</NavTagBadge>
          ))}
        </div>
      ) : null}
    </a>
  );
}

function MobileNavDropdownItem({
  item,
  onNavigate,
}: {
  item: NavLink;
  onNavigate: () => void;
}) {
  const href = item.href ?? "";
  const label = item.label ?? "";
  const description = item.description ?? "";
  const tags = item.tags ?? [];

  if (!isRichNavLink(item)) {
    return (
      <a href={href} className={mobileSubLinkClassName} onClick={onNavigate}>
        {label}
      </a>
    );
  }

  return (
    <a href={href} className={mobileRichItemClassName} onClick={onNavigate}>
      <div className="text-sm font-semibold text-slate-900">{label}</div>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      {tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <NavTagBadge key={tag ?? ""}>{tag ?? ""}</NavTagBadge>
          ))}
        </div>
      ) : null}
    </a>
  );
}

function MobileAccordionSection({
  id,
  label,
  overviewHref,
  items,
  isExpanded,
  onToggle,
  onNavigate,
}: {
  id: string;
  label: string;
  overviewHref?: string;
  items: ReadonlyArray<NavLink>;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onNavigate: () => void;
}) {
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <div className="flex items-center gap-1">
        {overviewHref ? (
          <Link
            href={overviewHref}
            className={`${mobileAccordionTriggerClassName} flex-1`}
            onClick={onNavigate}
          >
            <span>{label}</span>
          </Link>
        ) : (
          <button
            type="button"
            className={`${mobileAccordionTriggerClassName} flex-1`}
            aria-expanded={isExpanded}
            aria-controls={`mobile-accordion-${id}`}
            onClick={() => onToggle(id)}
          >
            <span>{label}</span>
          </button>
        )}
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-all duration-300 hover:bg-slate-100/80 active:scale-[0.98]"
          aria-expanded={isExpanded}
          aria-controls={`mobile-accordion-${id}`}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${label} menu`}
          onClick={() => onToggle(id)}
        >
          <ChevronDownIcon open={isExpanded} />
        </button>
      </div>

      <div
        id={`mobile-accordion-${id}`}
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <ul className="space-y-1.5 px-1 pb-2 pt-1">
            {items.map((item) => (
              <li key={(item.href ?? "") + (item.label ?? "")}>
                <MobileNavDropdownItem item={item} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MobileNavPopover({
  visible,
  expandedAccordion,
  onToggleAccordion,
  onClose,
}: {
  visible: boolean;
  expandedAccordion: string | null;
  onToggleAccordion: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      id="marketing-mobile-menu"
      role="dialog"
      aria-modal="false"
      aria-label="Mobile navigation"
      className={`${mobilePopoverShellClassName} transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        visible
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0"
      }`}
    >
      <div className={mobilePopoverCardClassName}>
        <nav
          className="max-h-[min(70dvh,28rem)] overflow-y-auto overscroll-contain px-2 py-2"
          aria-label="Mobile"
        >
          {NAV_NODES.map((node) => {
            if (node.type === "dropdown") {
              return (
                <MobileAccordionSection
                  key={node.id}
                  id={node.id}
                  label={node.label}
                  overviewHref={node.overviewHref}
                  items={node.items}
                  isExpanded={expandedAccordion === node.id}
                  onToggle={onToggleAccordion}
                  onNavigate={onClose}
                />
              );
            }

            return (
              <div key={node.id} className="border-b border-slate-100 last:border-b-0">
                <a href={node.href} className={mobileDirectLinkClassName} onClick={onClose}>
                  {node.label}
                </a>
              </div>
            );
          })}
        </nav>

        <div className="space-y-1.5 border-t border-slate-100 px-2 py-2">
          <AuthNavLink
            path="/login"
            className="block w-full rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-slate-800 transition-all duration-200 hover:bg-slate-50 hover:text-indigo-600 active:scale-[0.98]"
            onClick={onClose}
          >
            Sign In
          </AuthNavLink>
          <AuthNavLink
            path="/signup"
            className={`${ctaClassName} w-full py-2.5 text-sm`}
            onClick={onClose}
          >
            Get Started
          </AuthNavLink>
        </div>
      </div>
    </div>
  );
}

function NavDropdown({
  id,
  label,
  overviewHref,
  items,
  openDropdown,
  onToggle,
  onSelect,
}: {
  id: DropdownId;
  label: string;
  overviewHref?: string;
  items: ReadonlyArray<NavLink>;
  openDropdown: DropdownId | null;
  onToggle: (id: DropdownId) => void;
  onSelect: () => void;
}) {
  const isOpen = openDropdown === id;
  const safeItems = items ?? [];
  const usesMegaLayout = dropdownUsesMegaLayout(safeItems);

  const visibleClassName = isOpen
    ? "opacity-100 pointer-events-auto translate-y-0"
    : "opacity-0 pointer-events-none -translate-y-1 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0";

  const panelWrapperClassName = usesMegaLayout
    ? dropdownPanelWrapperMegaClassName
    : dropdownPanelWrapperClassName;

  return (
    <div className="relative group flex items-center">
      {overviewHref ? (
        <Link
          href={overviewHref}
          className={`${dropdownTriggerClassName} rounded-r-none pr-1.5`}
          onClick={onSelect}
        >
          {label}
        </Link>
      ) : (
        <button
          type="button"
          className={dropdownTriggerClassName}
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => onToggle(id)}
        >
          {label}
        </button>
      )}
      <button
        type="button"
        className={`${dropdownTriggerClassName} rounded-l-none pl-1`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={`${isOpen ? "Close" : "Open"} ${label} menu`}
        onClick={() => onToggle(id)}
      >
        <ChevronDownIcon open={isOpen} />
      </button>

      <div
        className={`${panelWrapperClassName} ${visibleClassName} transition-all duration-200 ease-out`}
        role="menu"
        aria-hidden={!isOpen}
      >
        <div className={getDesktopDropdownPanelClassName(safeItems)}>
          <ul className={getDesktopDropdownListClassName(safeItems)}>
            {safeItems.map((item) => (
              <li key={(item.href ?? "") + (item.label ?? "")} role="none" className="min-w-0">
                <DesktopNavDropdownItem item={item} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [popoverMounted, setPopoverMounted] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownId | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const desktopNavRef = useRef<HTMLDivElement | null>(null);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setExpandedAccordion(null);
  }, []);

  const handleLogoClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") return;
    if (window.location.pathname !== "/") return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleDropdownMenu = useCallback((id: DropdownId) => {
    setOpenDropdown((current) => (current === id ? null : id));
  }, []);

  const closeDropdownMenu = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const toggleMobile = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    normalizeMenuTap(event);
    setMobileOpen((current) => !current);
  }, []);

  const toggleAccordion = useCallback((id: string) => {
    setExpandedAccordion((current) => (current === id ? null : id));
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      setPopoverVisible(false);
      const timeout = window.setTimeout(() => {
        setPopoverMounted(false);
      }, POPOVER_TRANSITION_MS);
      return () => window.clearTimeout(timeout);
    }

    setPopoverMounted(true);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPopoverVisible(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (headerRef.current?.contains(target)) return;
      closeMobile();
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        if (popoverMounted) closeMobile();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [popoverMounted, closeMobile]);

  useEffect(() => {
    if (!openDropdown) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (desktopNavRef.current?.contains(target)) return;
      setOpenDropdown(null);
    }
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onPointerDown, { capture: true } as any);
  }, [openDropdown]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 isolate border-b border-slate-200/80 bg-white/95 backdrop-blur-md"
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="relative z-10 shrink-0 transition-all duration-200 active:scale-[0.98] pointer-events-auto"
          onClick={handleLogoClick}
        >
          <BrandMark />
        </Link>

        <div
          ref={desktopNavRef}
          className="hidden flex-1 justify-center gap-x-2 lg:flex lg:gap-x-2"
          aria-label="Primary"
        >
          {NAV_NODES.map((node) =>
            node.type === "dropdown" ? (
              <NavDropdown
                key={node.id}
                id={node.id}
                label={node.label}
                overviewHref={node.overviewHref}
                items={node.items}
                openDropdown={openDropdown}
                onToggle={toggleDropdownMenu}
                onSelect={closeDropdownMenu}
              />
            ) : (
              <a key={node.id} href={node.href} className={linkClassName} onClick={closeDropdownMenu}>
                {node.label}
              </a>
            ),
          )}
        </div>

        <div className="hidden shrink-0 items-center justify-end gap-x-4 lg:flex">
          <AuthNavLink path="/login" className={linkClassName}>
            Sign In
          </AuthNavLink>
          <AuthNavLink path="/signup" className={ctaClassName}>
            Get Started
          </AuthNavLink>
        </div>

        <div className="relative z-50 ml-auto shrink-0 pointer-events-auto lg:hidden">
          <button
            type="button"
            className={menuButtonClassName}
            aria-expanded={mobileOpen}
            aria-controls="marketing-mobile-menu"
            aria-haspopup="true"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={toggleMobile}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {popoverMounted ? (
          <MobileNavPopover
            visible={popoverVisible}
            expandedAccordion={expandedAccordion}
            onToggleAccordion={toggleAccordion}
            onClose={closeMobile}
          />
        ) : null}
      </div>
    </header>
  );
}
