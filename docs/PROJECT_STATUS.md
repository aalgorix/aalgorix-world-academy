# Aalgorix World Academy — Engineering Source of Truth

**Repository:** `aalgorix-world-academy`  
**Document version:** 2.5  
**Last updated:** June 22, 2026  
**Status:** Phase 0–8 substantially complete · Full Student Dashboard Suite live (12 pages) · Full Teacher Dashboard Suite live (9 pages) · Marketing Landing Page Live · Admin/Parent portals functional · **No payment integration — enrollment is admin-managed** · Zero tests

---

## 1. Executive Summary & Tech Stack

### 1.1 Product Definition

**Aalgorix World Academy** is a premium, highly scalable EdTech platform and Learning Management System (LMS) modeled on the pedagogical and commercial workflows of [CambriLearn](https://www.cambrilearn.com). The system targets four distinct actor classes—**Students**, **Parents**, **Teachers**, and **Admins**—within a single academy tenant, with curriculum delivery, gated content progression, assignment lifecycles, and (eventually) subscription-gated enrollment.

The platform is being constructed as a **modular monolith** on Next.js, with PostgreSQL row-level security as the authoritative authorization plane and Supabase as the managed backend substrate. The **public marketing gateway** at `/` is live, presenting the full CambriLearn-formula acquisition surface ahead of LMS feature delivery.

### 1.2 Technology Stack (Authoritative)

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| **Application framework** | Next.js (App Router) | 16.2.x |
| **Language** | TypeScript | 5.x, strict mode |
| **UI runtime** | React | 19.2.x |
| **Compiler optimization** | React Compiler | Enabled via `reactCompiler: true` in `next.config.ts` and `babel-plugin-react-compiler` |
| **Styling** | Tailwind CSS | v4 (`@import "tailwindcss"`, `@theme inline` in `globals.css`) |
| **Component library** | shadcn/ui | **Planned** — not yet initialized; auth and marketing surfaces use bespoke Tailwind primitives |
| **Public marketing UI** | Next.js Route Groups + Tailwind v4 | `(marketing)` route group at `/`; native utility tokens only; React Compiler–verified production builds |
| **Database** | PostgreSQL (Supabase) | Foundation migration deployed |
| **Auth** | Supabase Auth | Email/password, Google OAuth, password recovery |
| **Object storage** | Supabase Storage | Buckets documented; policies pending Phase 3+ |
| **SSR auth bridge** | `@supabase/ssr` | Cookie-backed server/browser client split |
| **Payments** | None — offline tuition collection | Enrollment is created manually by admin after direct payment; no payment gateway integration |

### 1.3 Environment Contract

Configuration is driven by `.env.local` (see `.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; parent link code redemption)
- `MARKETING_SITE_URL` / `NEXT_PUBLIC_MARKETING_URL`
- `AUTH_COOKIE_DOMAIN` (production; optional locally)

### 1.4 Engineering attributions (presentation layer)

The initial public gateway is implemented without third-party UI kits. The following conventions are authoritative for all marketing and auth presentation work:

| Attribution | Implementation detail |
|-------------|----------------------|
| **Styling substrate** | Native **Tailwind CSS v4** primitive tokens and utilities (`@import "tailwindcss"`, `@theme inline` in `src/app/globals.css`) — no component-library abstraction layer on the marketing surface |
| **Route organization** | **Next.js 16 parenthetical Route Groups** — `(marketing)`, `(auth)`, and `(dashboard)` isolate directory concerns without altering URL segments, preserving a clean security boundary between public, identity, and authenticated shells |
| **Compilation** | **Automatic React Compiler** (`reactCompiler: true` in `next.config.ts`) — marketing Server Components and the navigation client island compile cleanly under `npm run build` with zero manual memoization |
| **Client boundaries** | Interactive navigation (mobile drawer, portal overlay) is isolated to a single `"use client"` module; the page body remains a Server Component for optimal hydration and SEO |

---

## 2. Completed Milestones (What Is Done)

All items below have been implemented and verified via successful `npm run build` (Next.js 16 Turbopack production compilation) and `npx tsc --noEmit` (zero TypeScript errors).

### 2.1 Phase 0 — Foundation & Data Plane

#### Database architecture

Foundational schema deployed through:

`supabase/migrations/20250521000000_foundation.sql`

**Core entities (deployed):**

| Table | Responsibility |
|-------|----------------|
| `profiles` | 1:1 extension of `auth.users`; `user_role` enum: `student`, `parent`, `teacher`, `admin` |
| `student_parent_relations` | Guardianship graph; `is_primary_billing_contact` for future Stripe owner mapping |
| `subscription_tiers` | Plan catalog (Stripe price IDs) — data model only |
| `subscriptions` | Parent-owned billing records — data model only |
| `courses` | Top-level curriculum; `unlock_strategy` (`sequential`, `drip`, `all_at_once`, `manual`) |
| `course_modules` | Ordered units within a course |
| `lessons` | Video/resource metadata; `is_preview` for marketing teasers |
| `enrollments` | Student ↔ course access contract |
| `content_unlocks` | Per-enrollment lesson availability (sequential/drip/manual) |
| `lesson_progress` | Watch state; feeds sequential unlock engine |
| `assignments` | Homework metadata; `max_points` default 100 |
| `submissions` | Student uploads; `grade` 0–100; teacher `feedback` |
| `teacher_course_assignments` | Scopes teacher grading to assigned courses |

**Database automation:**

- `handle_new_user()` trigger on `auth.users` INSERT → auto-provisions `public.profiles` with `role` and `full_name` from `raw_user_meta_data`
- `set_updated_at()` triggers on mutable tables

#### Security shell (Row-Level Security)

RLS is **enabled on all public tables**. Authorization is enforced through **security definer** SQL helpers:

| Function | Purpose |
|----------|---------|
| `is_admin()` | Elevated platform operators |
| `is_teacher()` | Teachers and admins |
| `parent_has_student(uuid)` | Parental line-of-sight to child records |
| `student_is_enrolled_in_course(uuid)` | Enrollment gate for assignments |
| `student_is_enrolled_in_lesson(uuid)` | Lesson visibility via module graph |
| `lesson_is_unlocked_for_student(uuid)` | `content_unlocks` + preview lesson bypass |

**Policy highlights:**

- Students read only active enrollments, unlocked lessons, and own submissions (write while `draft` / `returned`)
- Parents read linked children’s enrollments, progress, submissions (grades read-only)
- Teachers mutate grades only when `teacher_course_assignments` matches assignment course
- Admins hold override policies on management tables

Cross-tenant isolation is achieved by binding every query to `auth.uid()` and graph-aware helper functions—not application-layer filters alone.

---

### 2.2 Phase 1 — Auth, Identity & Edge Routing

#### Supabase SSR client layer

| File | Runtime | Responsibility |
|------|---------|----------------|
| `src/lib/supabase/client.ts` | Browser | `createBrowserClient` singleton for Client Components |
| `src/lib/supabase/server.ts` | Server | `createServerClient` with `cookies()` read/write for RSC, Actions, Route Handlers |
| `src/lib/supabase/middleware.ts` | Edge (proxy) | Session refresh + authorization routing |
| `src/lib/env.ts` | Isomorphic | Validates Supabase URL and anon/publishable key |

#### Edge routing gate (Next.js 16 Proxy)

Network-level protection is implemented via the **Next.js 16 proxy convention** (successor to legacy `middleware.ts`):

- **Entry:** `src/proxy.ts` — exports `proxy()` and `config.matcher`
- **Logic delegate:** `src/lib/supabase/middleware.ts` → `updateSession()`

**Proxy responsibilities:**

1. Instantiate per-request Supabase server client with full `getAll` / `setAll` cookie bridging (prevents stale JWT and random logout bugs).
2. Call `supabase.auth.getUser()` to refresh session material on every matched navigation.
3. **Unauthenticated guard:** Redirect to `/login?next=…` when accessing `/student`, `/parent`, `/teacher`, `/admin`.
4. **Authenticated auth-page guard:** Redirect signed-in users away from `/login`, `/signup`, `/forgot-password` to role home—**except** `/reset-password` (recovery completion surface).
5. **Role prefix enforcement:** Prevent horizontal privilege movement (e.g., student cannot browse `/parent/*`).

#### Multi-tenant authentication (identity flows)

| Flow | Route(s) | Mechanism |
|------|----------|-----------|
| Email/password signup | `/signup` | `signUp()` with `options.data.role` + `full_name` → DB trigger |
| Email/password login | `/login` | `signInWithPassword()` → profile role lookup → dashboard redirect |
| Google OAuth SSO | `/login` | `signInWithOAuth({ provider: 'google' })` → `/auth/callback` |
| Forgot password | `/forgot-password` | `resetPasswordForEmail()` → email deep link |
| Reset password | `/reset-password` | `updateUser({ password })` after recovery session established |
| OAuth / recovery callback | `/auth/callback` | `exchangeCodeForSession()` with **`next` param precedence** |

**Auth callback priority (critical):**

```
1. safeRedirectPath(next)   → e.g. /reset-password
2. getDashboardPathForRole(profile.role)
3. Fallback: /
```

Implemented in `src/app/auth/callback/route.ts` with open-redirect hardening via `safeRedirectPath()` in `src/lib/auth/redirects.ts`.

#### Auth UI surfaces (Tailwind v4)

- Shared chrome: `src/components/auth/auth-shell.tsx`
- Login: `src/app/(auth)/login/login-form.tsx` (Google button, forgot-password link, email form)
- Signup: `src/app/(auth)/signup/page.tsx` (role selector: Student / Parent / Teacher)
- Recovery: `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/reset-password/page.tsx`
- Sign-out: `src/components/auth/sign-out-button.tsx`

#### Dashboard stubs (redirect targets only)

Minimal Server Component placeholders existed post-Phase 1 and have since been replaced by full implementations. See Phase 3–7 below.

---

### 2.3 Phase 3 — Course Catalog, Storage & Admin Back-office ✅

Full Admin course management and Teacher grading portals are implemented.

| Deliverable | Status | Files |
|-------------|--------|-------|
| **Admin: Course CRUD** | ✅ Complete | `admin/courses/page.tsx`, `catalog-panel.tsx`, `actions.ts` |
| **Admin: Module + Lesson CRUD** | ✅ Complete | Included in `admin/courses/actions.ts` |
| **Admin: TUS video upload** | ✅ Complete | `lesson-media-upload-zones.tsx`, `upload-lesson-video.tsx` |
| **Admin: Worksheet PDF upload** | ✅ Complete | XHR upload in `admin-media-upload.ts` |
| **Admin: Publish/unpublish** | ✅ Complete | `toggleCoursePublished` server action |
| **Admin: Teacher assignment** | ✅ Complete | `admin/staffing/` — `staffing-panel.tsx`, `assign-course-modal.tsx` |
| **Teacher: Grading station** | ✅ Complete | `teacher/grading/` — `grading-station.tsx`, grade + feedback + return flow |
| **Parent: Child linking** | ✅ Complete | Link code redemption + unlink; requires `parent_link_codes` migration deployed |
| **Parent: Dashboard suite** | ✅ Complete | ParentShell; dashboard, assignments, activity, teachers, fees, settings, report card |
| **Parent: Progress monitoring** | ✅ Complete | `parent/page.tsx`, shared `lib/parent/queries.ts` |
| **Parent: Report card** | ✅ Complete | `parent/report-card/[childId]/page.tsx` |

---

### 2.4 Phase 4–5 — Student LMS Workspace ✅

Full student lesson workspace and assignment lifecycle.

| Deliverable | Status | Files |
|-------------|--------|-------|
| **Student: Course listing** | ✅ Complete | `student/courses/page.tsx` |
| **Student: Lesson workspace** | ✅ Complete | `student/courses/[courseId]/lessons/[lessonId]/page.tsx` + `lesson-workspace.tsx` |
| **Student: Lesson progress toggle** | ✅ Complete | `toggleLessonProgress` server action |
| **Student: Homework submission** | ✅ Complete | `submitHomework` server action + file drag-drop |
| **Student: Profile editing** | ✅ Complete | `student/profile/` + `profile-form.tsx` |
| **Student: Parent link code gen** | ✅ Complete | `student/settings/actions.ts` (HMAC-SHA256, 24h TTL) |
| **Content unlock engine** | ✅ Complete | `computeLessonStatuses()` in `workspace.ts` — all 4 strategies |

---

### 2.6 Phase 8 — Full Teacher Dashboard Suite ✅ (June 2026)

The entire teacher-facing dashboard has been designed, implemented, and wired. All 9 navigation routes are live. The existing grading station is now embedded within the new shell.

#### Teacher Shell (`components/teacher/teacher-shell.tsx`)
Responsive teal-accented sidebar layout (full on desktop, icon-only on tablet, drawer on mobile) with 9 nav items, notification bell, search bar, and a mobile bottom tab bar.

#### Teacher Layout (`app/(dashboard)/teacher/layout.tsx`)
Server component that authenticates the user, verifies `teacher` (or `admin`) role, fetches the teacher's name and first assigned subject for the profile chip, and wraps all teacher routes in `TeacherShell`.

#### All Teacher Pages

| Route | Type | Data | Key Features |
|-------|------|------|-------------|
| `/teacher` | RSC | Real | Hero banner, 6 stat cards, recent submissions feed, per-course card grid, CTA to grading queue |
| `/teacher/grading` | RSC + Client | Real | Full grading station — existing feature, now wrapped in teacher shell |
| `/teacher/courses` | RSC | Real | Course cards with enrollment count, pending submission count, publish status, grade-action link |
| `/teacher/students` | RSC | Real | All enrolled students across assigned courses; per-course chip filters, avatars, enrolment info |
| `/teacher/schedule` | RSC + client | **Real** | Assignment deadlines + live sessions for assigned courses |
| `/teacher/messages` | RSC + client | **Real** | Course-scoped messaging with enrolled students |
| `/teacher/reports` | RSC | Real | Grade distribution bar chart, per-course avg % and pending count from real submission data |
| `/teacher/profile` | RSC | Real | Profile card with avatar, email, courses assigned, teaching responsibilities grid |
| `/teacher/settings` | Client | Local state | Theme toggle, language picker, notification toggles, security, privacy |

---

### 2.5 Phase 6–7 — Full Student Dashboard Suite ✅ (June 2026)

The entire student-facing dashboard has been designed, implemented and wired. All 12 navigation routes are live.

#### Student Shell (`components/student/student-shell.tsx`)
Responsive sidebar layout (full on desktop, icon-only on tablet, drawer on mobile) with 12 nav items and a mobile bottom tab bar.

#### Dashboard Home (`student/page.tsx`)
Rich interactive home page: real streak (activity-derived), weekly lesson goal, attendance ring, today's schedule, notification previews, performance charts from graded submissions; badges section still mock.

#### All Student Pages

| Route | Type | Data | Key Features |
|-------|------|------|-------------|
| `/student/courses` | RSC | Real | Progress bars, In Progress / Completed sections |
| `/student/live` | RSC + client | **Real** | `live_class_sessions` — join links when published |
| `/student/assignments` | RSC + Client | Real | `AssignmentsList` — tabbed by All/Todo/Submitted/Graded/Needs Revision |
| `/student/assessments` | RSC + client | **Real** | Published assignments + graded submissions |
| `/student/attendance` | RSC + client | **Real (derived)** | Weekday activity from lesson completions + submissions |
| `/student/tutor` | Client | Simulated | Full chat UI, typing indicator, quick chips, voice toggle |
| `/student/certificates` | Client | Mock | Badges (earned/locked grid) + Certificates (download + share); Scholar progress bar |
| `/student/reports` | RSC | Real + mock charts | Per-course progress bars, avg grade, `PerformanceCharts` with real subject data |
| `/student/messages` | RSC + client | **Real** | Teachers from enrolled courses; persisted chat threads |
| `/student/calendar` | RSC + client | **Real** | Assignment due dates + live sessions from enrolled courses |
| `/student/notifications` | RSC | Real | Pending + submitted submissions |
| `/student/settings` | Client | Local state | Theme toggle, language picker, notification toggles, security, privacy |

---

### 2.3 Phase 1b — Public Marketing Gateway ✅

The primary public-facing presentation layer is **fully implemented and live** at `/`, replacing the interim minimal landing stub.

| Deliverable | Status | Operational files |
|-------------|--------|-------------------|
| **Public marketing layout shell** | ✅ Complete | `src/app/(marketing)/layout.tsx` — light-theme wrapper, route-level metadata |
| **CambriLearn-formula landing page** | ✅ Complete | `src/app/(marketing)/page.tsx` — announcement bar, hero, social proof, Curriculum grid, onboarding pipeline, benefits, pricing band, footer (Server Component) |
| **Sticky navigation & mobile drawer** | ✅ Complete | `src/app/(marketing)/marketing-nav.tsx` — optimized client boundary: portal-based drawer, `h-dvh` viewport alignment, hydration mount guard, touch-hardened open handlers |

**Surface coverage (verified):**

- [x] Top accreditation announcement strip
- [x] Sticky desktop/mobile navigation with `/login` and `/signup` CTAs
- [x] Split-column conversion hero with Tailwind-built platform mockup
- [x] Four-column social proof metrics strip
- [x] Curriculum pathways selector grid (four flagship tracks)
- [x] Four-step “How Online School Works” pipeline
- [x] Academy benefits / SLA feature grid
- [x] Pricing presentation band (pre-Stripe placeholder tiers)
- [x] Multi-column marketing footer

**Navigation hardening:** Mobile menu uses `createPortal` to `document.body`, strict `isMounted` client guard, `pointer-events-auto` tap targets (44×44px minimum), `stopPropagation` on open/close handlers, and dynamic viewport units (`h-dvh`) for physical iOS/Android device reliability.

---

## 3. Directory Structure Map

**Current implemented tree (Phase 0–7, as of June 18, 2026):**

```
aalgorix-world-academy/
├── docs/
│   ├── ARCHITECTURE.md              # Original architecture target & phase plan
│   ├── ENTERPRISE_ARCHITECTURE.md   # Cambridge/NIOS enterprise LMS spec (boards, batches, RBAC, ERD)
│   ├── PROJECT_STATUS.md            # This file (engineering source of truth)
│   └── MASTER_DOCUMENTATION.md     # Full CTO audit document
├── design-reference/                # UI design references (HTML mockups)
├── supabase/
│   └── migrations/
│       ├── 20250521000000_foundation.sql   # Complete schema + RLS (13 tables)
│       └── 20250620000000_platform_settings.sql  # Admin platform settings singleton
├── .env.local.example
├── next.config.ts               # reactCompiler: true
├── package.json
├── vercel.json                  # Apex → www permanent redirect
├── src/
│   ├── proxy.ts                 # ◄ Next.js 16 edge proxy entry (session + RBAC routing)
│   ├── app/
│   │   ├── layout.tsx           # Root HTML shell, Geist fonts, metadata
│   │   ├── globals.css          # Tailwind v4 @theme tokens + sd-float-up animations
│   │   │
│   │   ├── (marketing)/         # Public gateway — serves /
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         # Full CambriLearn-formula landing (RSC)
│   │   │   ├── marketing-nav.tsx
│   │   │   ├── marketing-footer.tsx
│   │   │   ├── animated-stats.tsx
│   │   │   ├── brochure-modal-cta.tsx
│   │   │   ├── published-courses-section.tsx
│   │   │   ├── academics/, ai-tutor/, ai-voice-assistant/
│   │   │   ├── blog/            # Contentful-driven blog
│   │   │   ├── contact/, courses/, donate/, extracurricular/
│   │   │   ├── faq/, our-story/, parent-portal/, why-us/
│   │   │
│   │   ├── (auth)/              # Unauthenticated auth UX
│   │   │   ├── login/           # Email + Google OAuth
│   │   │   ├── signup/          # Role selector
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (dashboard)/         # All authenticated LMS surfaces
│   │   │   ├── layout.tsx       # Server-side getUser() gate
│   │   │   │
│   │   │   ├── student/         # ◄ FULL SUITE (12 pages)
│   │   │   │   ├── layout.tsx       # StudentShell wrapper (fetches user profile)
│   │   │   │   ├── page.tsx         # Dashboard home — rich stats + widgets
│   │   │   │   ├── revision-alert-ribbon.tsx
│   │   │   │   ├── courses/page.tsx
│   │   │   │   ├── courses/[courseId]/lessons/[lessonId]/
│   │   │   │   │   ├── page.tsx, lesson-workspace.tsx
│   │   │   │   │   ├── curriculum-sidebar.tsx, actions.ts
│   │   │   │   ├── live/page.tsx        # Live sessions + recordings
│   │   │   │   ├── assignments/page.tsx # Real Supabase data
│   │   │   │   ├── assessments/page.tsx # Mock data
│   │   │   │   ├── attendance/page.tsx  # Mock data
│   │   │   │   ├── tutor/page.tsx       # AI chat UI
│   │   │   │   ├── certificates/page.tsx
│   │   │   │   ├── reports/page.tsx     # Real Supabase data + charts
│   │   │   │   ├── messages/page.tsx    # Mock data
│   │   │   │   ├── calendar/page.tsx    # Mock data
│   │   │   │   ├── notifications/page.tsx
│   │   │   │   ├── profile/             # Profile form + avatar
│   │   │   │   └── settings/page.tsx    # Theme/notif/security/privacy prefs
│   │   │   │
│   │   │   ├── teacher/
│   │   │   │   ├── page.tsx
│   │   │   │   └── grading/             # Grading station
│   │   │   │
│   │   │   ├── parent/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── report-card/[childId]/
│   │   │   │   └── settings/            # Link code redemption
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── page.tsx
│   │   │       ├── courses/             # Full course CRUD + media upload
│   │   │       └── staffing/            # Teacher assignment
│   │   │
│   │   ├── api/
│   │   │   ├── brochure/route.ts
│   │   │   └── contact-inquiry/route.ts
│   │   └── auth/callback/route.ts       # PKCE/OAuth code exchange
│   │
│   ├── components/
│   │   ├── auth/                # Auth UI primitives
│   │   ├── blog/                # Blog card + rich-text renderer
│   │   ├── brand/               # AWA logo
│   │   ├── dashboard/           # Shared: dashboard-shell, stat-card, action-card
│   │   └── student/             # ◄ All student dashboard widgets
│   │       ├── student-shell.tsx        # Full sidebar + topbar + mobile nav
│   │       ├── hero-banner.tsx
│   │       ├── stat-ring-card.tsx
│   │       ├── continue-learning.tsx
│   │       ├── todays-schedule.tsx
│   │       ├── performance-charts.tsx   # Supports real subjectStats prop
│   │       ├── ai-tutor-card.tsx
│   │       ├── pending-submissions-card.tsx
│   │       ├── notifications-card.tsx
│   │       ├── attendance-mini-card.tsx
│   │       ├── badges-section.tsx
│   │       └── assignments-list.tsx     # Tabbed assignment list (client)
│   │
│   └── lib/
│       ├── env.ts, domains.ts, app-auth-href.ts
│       ├── auth/                # roles.ts, redirects.ts
│       ├── supabase/            # client.ts, server.ts, admin.ts, middleware.ts
│       ├── contentful/          # Full CMS integration
│       ├── curriculum/          # public-catalog.ts
│       ├── dashboard/           # course-progress.ts, relations.ts, submission-status.ts
│       ├── email/               # smtp.ts
│       ├── parent-link/         # HMAC link code system
│       ├── routing/             # host-routing.ts
│       ├── storage/             # TUS video + XHR PDF upload
│       ├── student/             # workspace.ts, curriculum-types.ts
│       └── theme/               # global-theme.ts
```

### Layer purposes (inline reference)

| Path | Layer | Purpose |
|------|-------|---------|
| `src/proxy.ts` | **Edge network gate** | Executes before route handlers; refreshes Supabase cookies; enforces authentication and role-prefix alignment on every matched request. |
| `src/lib/supabase/` | **Data access adapters** | Framework-correct SSR cookie bridging. Separates browser vs server runtimes per Supabase guidance. |
| `src/lib/auth/` | **Authorization vocabulary** | Pure TypeScript role types and path algebra—keeps proxy and callback logic DRY. |
| `src/app/(marketing)/` | **Public gateway** | Unauthenticated marketing presentation at `/`; Tailwind v4 primitives; minimal client boundary in `marketing-nav.tsx`. |
| `src/app/(auth)/` | **Identity acquisition** | Sign-in, registration, and credential recovery without exposing dashboard chrome. |
| `src/app/(dashboard)/` | **Role-scoped product surface** | Future home for LMS workflows; currently stubbed post-auth landing zones. |
| `src/app/auth/callback/` | **Auth handshake termination** | Converts OAuth/recovery `code` query param into HTTP-only session cookies. |

---

## 4. Identity Merging & Security Logic

### 4.1 Automatic identity linking (Supabase Auth)

Supabase Auth maintains a single canonical row in `auth.users` per human operator. When **Automatic Identity Linking** is enabled (recommended production default), the following reconciliation rules apply:

| Scenario | Behavior |
|----------|----------|
| User registers with email/password, later signs in with **Google using the same verified email** | Supabase links the Google provider identity to the existing user UUID. **No duplicate `profiles` row** is created because the `handle_new_user` trigger fires only on INSERT. |
| User first signs in with Google, later sets a password on the same account | Email identity attaches to the same `auth.users.id`; profile row remains stable. |
| Conflicting unverified emails across providers | Linking is blocked until verification converges—protects account takeover. |

**Engineering implications for Aalgorix:**

1. **`profiles.id` is the immutable foreign key** for enrollments, submissions, and billing (future). All application queries must key off `auth.uid()` → `profiles.id`, never email strings.
2. **Role metadata on Google-first users:** OAuth sign-in does not pass `role` in `user_metadata` unless configured via Auth Hooks or post-login onboarding. Google-only users default to `student` per `handle_new_user()` until an admin or onboarding flow updates `profiles.role`.
3. **Password recovery on linked accounts:** `resetPasswordForEmail` targets the unified user; recovery callback uses `?next=/reset-password` so users complete rotation before dashboard redirect.
4. **RLS remains correct after merge:** Policies reference `auth.uid()`, which is stable across provider linkage—no orphaned submission rows.

### 4.2 Defense-in-depth summary

```
┌─────────────────────────────────────────────────────────────┐
│  Browser / Client Component (@supabase/ssr browser client)   │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  src/proxy.ts  — session refresh + route RBAC                  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  Server Components / Route Handlers (server client + RLS)    │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  PostgreSQL RLS — authoritative data plane authorization     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. The Forward-Looking Roadmap

Phases are ordered for **vertical slice delivery**. **Stripe billing is intentionally deferred to the finale** so curriculum and pedagogy features can be validated against real enrollments seeded administratively.

| Phase | Name | Scope | Primary deliverables |
|-------|------|-------|----------------------|
| **0** | Foundation | ✅ **Complete** | SQL migration, RLS shell, architecture docs |
| **1** | Auth & Identity | ✅ **Complete** | SSR clients, proxy gate, email/Google OAuth, password recovery, role routing |
| **1b** | Public Marketing Gateway | ✅ **Complete** | `(marketing)` route group, full landing at `/`, sticky nav + mobile drawer, 12+ marketing pages |
| **3** | Course Catalog & Storage | ✅ **Complete** | Admin course CRUD, TUS video upload, worksheet upload, teacher assignment, publish/unpublish |
| **4** | Student LMS Workspace | ✅ **Complete** | Lesson workspace, video player, homework submission, content unlock engine, lesson progress |
| **5** | Teacher Portal & Grading Queue | ✅ **Complete** | Grading station, file download, grade 0–100, return for revision |
| **6** | Parent Performance Dashboard | ✅ **Complete** | ParentShell + 7 routes; progress, assignments, activity, teachers, fees, settings, report card |
| **7** | Full Student Dashboard Suite | ✅ **Complete** | All 12 student routes: dashboard, courses, live, assignments, assessments, attendance, AI tutor, certificates, reports, messages, calendar, settings |
| **8** | Full Teacher Dashboard Suite | ✅ **Complete** | All 9 teacher routes: dashboard, grading, courses, students, schedule, messages, reports, profile, settings |
| **9** | Real Data Wiring | 🔶 In progress | Calendar, attendance, assessments, live, schedule, messages, dashboard widgets wired; certificates/badges + AI tutor still mock |
| **Next** | Admin polish | 🔶 In progress | Course edit, enrollment lifecycle, user edit, platform settings (`platform_settings` migration) |

### 5.1 Phase dependency graph (logical)

```
Phase 0 ──► Phase 1 ──► Phase 3 (Catalog)
                              │
                              ▼
                         Phase 4 (Student LMS)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Phase 5 (Teacher)   Phase 6 (Parent)
                    │                   │
                    └─────────┬─────────┘
                              ▼
                         Phase 7 (Admin CMS)
                              │
                              ▼
                    Phase 2 FINALE (Stripe)
```

### 5.2 Next priorities (current sprint)

The following remain to be completed before MVP readiness:

1. **Add `parent_link_codes` migration** to Supabase (2h)
2. **Admin enrollment management UI** — `/admin/enrollments` page (1 week)
3. **Admin user provisioning UI** — `/admin/users` page (1 week)
4. **Test suite** — Vitest unit tests + Playwright E2E (1 week)
5. **Error monitoring** — Sentry or Vercel Error Tracking (4h)
6. **Security headers** in `next.config.ts` (2h)
7. **Real DB tables** for messages, tutor conversations; dashboard home widgets (streak, notifications card, today's schedule)
8. **Apply `live_class_sessions` migration** — `supabase/migrations/20250622000000_live_class_sessions.sql`

### 5.3 Explicitly out of scope (longer term)

- shadcn/ui component installation and design system tokens
- Payment/billing integration (removed by design — offline tuition collection)
- Dynamic CMS-driven marketing copy (pathways currently static in `page.tsx`)
- Real-time messaging (Supabase Realtime), live classes backend (Jitsi/Daily.co)
- Quiz/Assessment engine backend
- Certificate PDF generation (react-pdf)
- Multi-organization white-label tenancy
- Progressive Web App (PWA)

---

## Appendix A — Quick verification checklist

| Check | Command / action |
|-------|------------------|
| Production compile | `npm run build` |
| TypeScript check | `npx tsc --noEmit` — must return zero errors |
| Lint | `npm run lint` |
| Local dev + marketing | `npm run dev` → `http://localhost:3000` |
| DB tables | Supabase Table Editor → 13 `public` tables |
| Google OAuth | `/login` → Continue with Google → role dashboard |
| Password recovery | `/forgot-password` → email → `/reset-password` → dashboard |
| Proxy active | Build output lists `ƒ Proxy (Middleware)` |
| Student dashboard | `/student` — verify all 12 sidebar nav links resolve without 404 |
| Student assignments | `/student/assignments` — verify real data loads from Supabase |
| Student reports | `/student/reports` — verify real course progress + grades appear |
| Student AI tutor | `/student/tutor` — verify chat sends and receives responses |

## Appendix B — Related documentation

| Document | Location |
|----------|----------|
| Target architecture & full future tree | `docs/ARCHITECTURE.md` |
| Enterprise LMS spec (Cambridge/NIOS, batches, RBAC, ERD, API) | `docs/ENTERPRISE_ARCHITECTURE.md` |
| Database DDL + RLS source | `supabase/migrations/20250521000000_foundation.sql` |
| Agent / Next.js 16 conventions | `AGENTS.md` |

---

*This file is the engineering source of truth for repository state. **It is kept up to date after every significant code change.** Last updated: June 18, 2026.*
