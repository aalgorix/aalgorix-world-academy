# Aalgorix World Academy — Source Project Tree

Annotated directory layout for the **source-focused** codebase. Excludes generated folders (`node_modules/`, `.next/`, `.git/`).

Each entry includes a one-line **purpose** — why the file exists or what it does in the system.

---

```
aalgorix-world-academy/
├── docs/
│   ├── ARCHITECTURE.md
│   │   └── Master architecture doc: route groups, data model overview, phased build plan, and target directory conventions.
│   ├── PROJECT_STATUS.md
│   │   └── Engineering source of truth: completed milestones, tech stack, phase status, and what is deferred (e.g. Stripe).
│   └── PROJECT_TREE.md
│       └── This file — navigable tree with per-file purpose notes for onboarding and audits.
│
├── public/
│   ├── brand/
│   │   ├── awa-logo.png
│   │   │   └── Horizontal PNG wordmark for marketing navbar (light backgrounds).
│   │   └── awa-logo-circular.svg
│   │       └── Circular SVG mark for footer and compact brand placements.
│   ├── file.svg
│   │   └── Default Next.js starter asset (unused in product UI; safe to remove later).
│   ├── globe.svg
│   │   └── Default Next.js starter asset (unused in product UI).
│   ├── next.svg
│   │   └── Default Next.js starter asset (unused in product UI).
│   ├── vercel.svg
│   │   └── Default Next.js starter asset (unused in product UI).
│   └── window.svg
│       └── Default Next.js starter asset (unused in product UI).
│
├── src/
│   ├── app/
│   │   ├── (auth)/                          # Route group: public identity flows (URLs: /login, /signup, …)
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   │       └── Password reset request form; emails Supabase recovery link.
│   │   │   ├── login/
│   │   │   │   ├── login-form.tsx
│   │   │   │   │   └── Client form: email/password + Google OAuth; role-aware redirect after sign-in.
│   │   │   │   └── page.tsx
│   │   │   │       └── Login page shell wrapping `login-form` in `AuthShell`.
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx
│   │   │   │       └── Set new password after user follows recovery link from email.
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   │       └── Registration page; creates auth user and initial profile role.
│   │   │   └── layout.tsx
│   │   │       └── Auth segment layout: page title metadata for account routes.
│   │   │
│   │   ├── (dashboard)/                     # Route group: authenticated LMS (requires session)
│   │   │   ├── admin/
│   │   │   │   ├── courses/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   │   └── Server actions: CRUD for courses, modules, lessons, publish flags, ordering.
│   │   │   │   │   ├── catalog-panel.tsx
│   │   │   │   │   │   └── Admin UI to browse/edit course tree (modules & lessons) in one panel.
│   │   │   │   │   ├── create-course-modal.tsx
│   │   │   │   │   │   └── Modal form to create a new course with slug, metadata, unlock strategy.
│   │   │   │   │   ├── form-classes.ts
│   │   │   │   │   │   └── Shared Tailwind input/select class strings for admin course forms.
│   │   │   │   │   ├── lesson-media-upload-zones.tsx
│   │   │   │   │   │   └── Drag-and-drop zones for lesson video/resource uploads to Supabase Storage.
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── Admin course catalog page (`/admin/courses`).
│   │   │   │   │   ├── types.ts
│   │   │   │   │   │   └── TypeScript types for admin course editor state and API payloads.
│   │   │   │   │   ├── upload-lesson-video.tsx
│   │   │   │   │   │   └── Client uploader component wired to storage paths and progress UI.
│   │   │   │   │   └── upload-progress-bar.tsx
│   │   │   │   │       └── Visual upload progress indicator for large lesson video files.
│   │   │   │   ├── staffing/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   │   └── Server actions: assign teachers to courses, list staff assignments.
│   │   │   │   │   ├── assign-course-modal.tsx
│   │   │   │   │   │   └── Modal to link a teacher profile to a course.
│   │   │   │   │   ├── form-classes.ts
│   │   │   │   │   │   └── Shared form styling for staffing admin forms.
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── Staffing management page (`/admin/staffing`).
│   │   │   │   │   ├── staffing-panel.tsx
│   │   │   │   │   │   └── Table/panel UI listing teachers and their course assignments.
│   │   │   │   │   └── types.ts
│   │   │   │   │       └── Types for staffing rows and assignment operations.
│   │   │   │   └── page.tsx
│   │   │   │       └── Admin home dashboard (`/admin`) with links to courses and staffing.
│   │   │   │
│   │   │   ├── parent/
│   │   │   │   ├── report-card/
│   │   │   │   │   └── [childId]/
│   │   │   │   │       ├── layout.tsx
│   │   │   │   │       │   └── Print-friendly layout wrapper for official transcript view.
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       │   └── Scholastic report / transcript page for one linked child.
│   │   │   │   │       └── print-transcript-button.tsx
│   │   │   │   │           └── Client control to trigger browser print of transcript.
│   │   │   │   ├── settings/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   │   └── Server actions: link child via code, unlink learner relations.
│   │   │   │   │   ├── connect-child-panel.tsx
│   │   │   │   │   │   └── UI for entering a student parent-link code to attach a child.
│   │   │   │   │   ├── linked-learners-panel.tsx
│   │   │   │   │   │   └── Lists children linked to this parent account with unlink actions.
│   │   │   │   │   └── page.tsx
│   │   │   │   │       └── Parent settings hub (`/parent/settings`).
│   │   │   │   ├── child-nav.tsx
│   │   │   │   │   └── Tab/nav to switch between linked children on parent views.
│   │   │   │   ├── course-progress-panel.tsx
│   │   │   │   │   └── Progress bars and completion stats per child per course.
│   │   │   │   ├── grading-timeline.tsx
│   │   │   │   │   └── Chronological feed of graded submissions and teacher feedback.
│   │   │   │   ├── page.tsx
│   │   │   │   │   └── Parent overview dashboard (`/parent`) for all linked learners.
│   │   │   │   ├── scholastic-summary.tsx
│   │   │   │   │   └── Aggregate grades/scores summary cards for the active child.
│   │   │   │   └── types.ts
│   │   │   │       └── Shared parent dashboard TypeScript types (child, course, submission shapes).
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── courses/
│   │   │   │   │   └── [courseId]/
│   │   │   │   │       └── lessons/
│   │   │   │   │           └── [lessonId]/
│   │   │   │   │               ├── actions.ts
│   │   │   │   │               │   └── Server actions: submit assignments, mark progress, fetch workspace data.
│   │   │   │   │               ├── curriculum-sidebar.tsx
│   │   │   │   │               │   └── Lesson/module navigation sidebar for the active course.
│   │   │   │   │               ├── lesson-workspace.tsx
│   │   │   │   │               │   └── Main lesson UI: video, resources, submission form, gating rules.
│   │   │   │   │               └── page.tsx
│   │   │   │   │                   └── Lesson player route (`/student/courses/.../lessons/...`).
│   │   │   │   ├── notifications/
│   │   │   │   │   └── page.tsx
│   │   │   │   │       └── Student notifications inbox placeholder/page.
│   │   │   │   ├── profile/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   │   └── Server actions: update student profile fields (bio, cohort, grade).
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── Student profile page (`/student/profile`).
│   │   │   │   │   ├── profile-form.tsx
│   │   │   │   │   │   └── Editable profile form with validation and save states.
│   │   │   │   │   └── types.ts
│   │   │   │   │       └── Profile form types aligned with `profiles` table columns.
│   │   │   │   ├── settings/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   │   └── Server actions: generate parent link code, unlink parent.
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── Student settings page (`/student/settings`).
│   │   │   │   │   └── parent-link-panel.tsx
│   │   │   │   │       └── Shows parent link code for guardians; unlink parent control.
│   │   │   │   ├── page.tsx
│   │   │   │   │   └── Student home (`/student`): enrolled courses and entry points.
│   │   │   │   └── revision-alert-ribbon.tsx
│   │   │   │       └── Banner when assignments need revision/resubmission.
│   │   │   │
│   │   │   ├── teacher/
│   │   │   │   ├── grading/
│   │   │   │   │   ├── actions.ts
│   │   │   │   │   │   └── Server actions: load queue, save grades and written feedback.
│   │   │   │   │   ├── grading-station.tsx
│   │   │   │   │   │   └── Full grading workstation UI (queue, rubric, feedback editor).
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── Teacher grading page (`/teacher/grading`).
│   │   │   │   │   └── types.ts
│   │   │   │   │       └── Types for submission queue items and grading payloads.
│   │   │   │   └── page.tsx
│   │   │   │       └── Teacher home (`/teacher`) with quick links to grading.
│   │   │   │
│   │   │   └── layout.tsx
│   │   │       └── Dashboard gate: requires Supabase session; redirects anonymous users to `/login`.
│   │   │
│   │   ├── (marketing)/                   # Route group: public marketing site (URLs unchanged)
│   │   │   ├── courses/
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx
│   │   │   │   │       └── Public course detail/landing for one catalog slug.
│   │   │   │   ├── course-card.tsx
│   │   │   │   │   └── Reusable card component for course grid on catalog pages.
│   │   │   │   └── page.tsx
│   │   │   │       └── Public course catalog listing (`/courses`).
│   │   │   ├── layout.tsx
│   │   │   │   └── Marketing wrapper: light theme shell and SEO metadata for public pages.
│   │   │   ├── marketing-nav.tsx
│   │   │   │   └── Sticky header nav: brand logo, anchor links, mobile drawer, auth CTAs.
│   │   │   ├── page.tsx
│   │   │   │   └── Homepage (`/`): hero, pathways, benefits, pricing, footer (inline).
│   │   │   └── published-courses-section.tsx
│   │   │       └── Server section that lists live/preview courses from the public catalog API.
│   │   │
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts
│   │   │           └── OAuth/magic-link callback; exchanges code for session cookies.
│   │   │
│   │   ├── favicon.ico
│   │   │   └── Browser tab icon for the academy site.
│   │   ├── globals.css
│   │   │   └── Global Tailwind v4 theme, CSS variables, and base document styles.
│   │   └── layout.tsx
│   │       └── Root HTML shell: Geist fonts, metadata, wraps all route groups.
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── auth-field-classes.ts
│   │   │   │   └── Shared Tailwind classes for auth form inputs (login/signup).
│   │   │   ├── auth-shell.tsx
│   │   │   │   └── Centered card layout for login, signup, and password pages.
│   │   │   ├── google-icon.tsx
│   │   │   │   └── Inline SVG for “Sign in with Google” buttons.
│   │   │   └── sign-out-button.tsx
│   │   │       └── Client button that calls Supabase `signOut` and redirects home.
│   │   └── dashboard/
│   │       ├── action-card.tsx
│   │       │   └── Clickable dashboard tile linking to a feature area.
│   │       ├── dashboard-shell.tsx
│   │       │   └── Consistent page chrome: eyebrow, title, subtitle, sign-out footer.
│   │       └── stat-card.tsx
│   │           └── Metric summary card for dashboard overview grids.
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── redirects.ts
│   │   │   │   └── Maps `user_role` to default post-login dashboard path.
│   │   │   └── roles.ts
│   │   │       └── Role enum helpers and guards used across server components/actions.
│   │   ├── curriculum/
│   │   │   └── public-catalog.ts
│   │   │       └── Queries published courses/lessons for marketing pages (preview-safe).
│   │   ├── dashboard/
│   │   │   ├── course-progress.ts
│   │   │   │   └── Computes completion percentages from lesson/submission state.
│   │   │   ├── relations.ts
│   │   │   │   └── Loads parent↔student links and billing-contact flags.
│   │   │   └── submission-status.ts
│   │   │       └── Normalizes assignment submission states for UI badges and gating.
│   │   ├── parent-link/
│   │   │   └── codes.ts
│   │   │       └── Generate/validate parent link codes for guardian pairing.
│   │   ├── storage/
│   │   │   ├── admin-media-upload.ts
│   │   │   │   └── Server-side upload helpers for admin lesson media buckets.
│   │   │   └── paths.ts
│   │   │       └── Canonical Supabase Storage path builders (videos, resources).
│   │   ├── student/
│   │   │   ├── curriculum-types.ts
│   │   │   │   └── TypeScript shapes for modules, lessons, and workspace navigation.
│   │   │   └── workspace.ts
│   │   │       └── Fetches student course workspace: modules, lesson lock state, submissions.
│   │   ├── supabase/
│   │   │   ├── admin.ts
│   │   │   │   └── Service-role Supabase client for privileged server operations only.
│   │   │   ├── client.ts
│   │   │   │   └── Browser Supabase client for client components.
│   │   │   ├── middleware.ts
│   │   │   │   └── Session refresh logic used by `src/proxy.ts` on each request.
│   │   │   └── server.ts
│   │   │       └── Cookie-backed Supabase client for Server Components and actions.
│   │   └── env.ts
│   │       └── Typed, validated access to required environment variables.
│   │
│   └── proxy.ts
│       └── Next.js 16 request proxy: refreshes Supabase auth session on navigations.
│
├── supabase/
│   └── migrations/
│       ├── 20250521000000_foundation.sql
│       │   └── Core schema: profiles, roles, courses, modules, lessons, enrollments, RLS baseline.
│       ├── 20250522000000_phase3_storage_public_catalog.sql
│       │   └── Storage buckets/policies and public catalog views for marketing course listings.
│       ├── 20250523000000_student_lms_storage.sql
│       │   └── Student-facing storage policies and submission-related tables/policies.
│       ├── 20250524000000_lesson_video_path_convention.sql
│       │   └── Standardizes lesson video object key paths in Storage.
│       ├── 20250525000000_parent_link_codes.sql
│       │   └── Parent link code table and RPC for guardian–student pairing.
│       ├── 20250526000000_parent_unlink_relations.sql
│       │   └── Allows parents to remove a linked student relation safely.
│       └── 20250527000000_student_unlink_parent.sql
│           └── Allows students to revoke parent linkage from their settings.
│
├── .env.local
│   └── Local secrets (Supabase keys, app URL) — gitignored; not committed.
├── .env.local.example
│   └── Template documenting required environment variables for new developers.
├── .gitignore
│   └── Git ignore rules (env files, `.next`, `node_modules`, etc.).
├── AGENTS.md
│   └── Cursor/Claude agent rules pointer (references Next.js 16 breaking-change docs).
├── CLAUDE.md
│   └── Symlink-style pointer to `AGENTS.md` for Claude Code workspaces.
├── eslint.config.mjs
│   └── ESLint flat config for TypeScript/React/Next.js lint rules.
├── next.config.ts
│   └── Next.js config (React Compiler enabled).
├── next-env.d.ts
│   └── Auto-generated Next.js TypeScript references (do not edit manually).
├── package.json
│   └── npm scripts and dependency manifest.
├── package-lock.json
│   └── Locked dependency versions for reproducible installs.
├── postcss.config.mjs
│   └── PostCSS pipeline for Tailwind CSS v4.
├── README.md
│   └── Quickstart: dev server, default create-next-app notes.
└── tsconfig.json
    └── TypeScript compiler options and path aliases (`@/*` → `src/*`).
```

---

## Route map (quick reference)

| URL prefix | Route group | Primary audience |
|------------|-------------|------------------|
| `/` | `(marketing)` | Prospective families |
| `/courses` | `(marketing)` | Public catalog |
| `/login`, `/signup` | `(auth)` | All users |
| `/student/*` | `(dashboard)` | Learners |
| `/parent/*` | `(dashboard)` | Guardians |
| `/teacher/*` | `(dashboard)` | Instructors |
| `/admin/*` | `(dashboard)` | Academy operators |

---

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — planned vs implemented layout and data model
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) — phase completion and stack details

*Last generated from repository snapshot. Update this file when adding routes, migrations, or shared libraries.*
