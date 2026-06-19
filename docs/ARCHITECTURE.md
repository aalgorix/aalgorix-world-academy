# Aalgorix World Academy — Architecture (Step 1)

Premium EdTech LMS inspired by CambriLearn. This document defines the **directory layout**, **data model overview**, and **build sequence**. Implementation SQL lives in `supabase/migrations/`.

> **Enterprise extension:** For the full Cambridge/NIOS Grades 3–12 specification (boards, batches, subject-scoped RBAC, ERD, API, deployment), see [`ENTERPRISE_ARCHITECTURE.md`](./ENTERPRISE_ARCHITECTURE.md).

---

## 1. Directory File Tree

Target layout for Next.js App Router (TypeScript). Route groups `(name)` do not affect URLs. Role dashboards live under `app/(dashboard)/` with shared shell + role-specific segments.

```
aalgorix-world-academy/
├── .env.local.example                 # Supabase + Stripe public/secret keys (never commit .env.local)
├── docs/
│   └── ARCHITECTURE.md                # This file
├── supabase/
│   ├── config.toml                    # Supabase CLI (optional, later)
│   ├── migrations/
│   │   └── 20250521000000_foundation.sql
│   └── seed.sql                       # Dev fixtures (optional, later)
├── public/
│   ├── brand/                         # Logos, favicons
│   └── marketing/                     # Static hero assets
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root: fonts, providers, metadata
│   │   ├── globals.css
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   │
│   │   ├── (marketing)/               # Public, unauthenticated
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # Home / landing
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── curriculum/
│   │   │   │   └── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (auth)/                    # Login, signup, password reset
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   ├── page.tsx
│   │   │   │   └── parent/
│   │   │   │       └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts       # OAuth / magic-link handler
│   │   │
│   │   ├── (dashboard)/               # Authenticated app shell
│   │   │   ├── layout.tsx             # Sidebar, role switcher, notifications slot
│   │   │   ├── loading.tsx
│   │   │   │
│   │   │   ├── student/               # /student/*
│   │   │   │   ├── page.tsx           # Overview: enrolled courses, progress
│   │   │   │   ├── courses/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [courseSlug]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── modules/
│   │   │   │   │       │   └── [moduleId]/
│   │   │   │   │       │       └── page.tsx
│   │   │   │   │       └── lessons/
│   │   │   │   │           └── [lessonId]/
│   │   │   │   │               └── page.tsx   # Video player + resources
│   │   │   │   ├── assignments/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [assignmentId]/
│   │   │   │   │       └── page.tsx           # Submit / view feedback
│   │   │   │   └── progress/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── parent/                # /parent/*
│   │   │   │   ├── page.tsx           # Children overview
│   │   │   │   ├── children/
│   │   │   │   │   └── [studentId]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── progress/
│   │   │   │   │       │   └── page.tsx
│   │   │   │   │       └── grades/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── billing/
│   │   │   │   │   └── page.tsx       # Stripe portal / plans
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── teacher/               # /teacher/*
│   │   │   │   ├── page.tsx
│   │   │   │   ├── courses/
│   │   │   │   │   └── [courseId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── grading/
│   │   │   │   │   ├── page.tsx       # Queue of ungraded submissions
│   │   │   │   │   └── [submissionId]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── questions/         # Student Q&A inbox (later phase)
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── admin/                 # /admin/*
│   │   │       ├── page.tsx
│   │   │       ├── users/
│   │   │       │   └── page.tsx
│   │   │       ├── courses/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx
│   │   │       │   └── [courseId]/
│   │   │       │       └── edit/
│   │   │       │           └── page.tsx
│   │   │       ├── enrollments/
│   │   │       │   └── page.tsx
│   │   │       └── subscriptions/
│   │   │           └── page.tsx
│   │   │
│   │   └── api/                       # Route handlers (webhooks, server-only)
│   │       ├── webhooks/
│   │       │   └── stripe/
│   │       │       └── route.ts
│   │       └── health/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn/ui primitives (button, dialog, …)
│   │   ├── layout/                    # Header, sidebar, dashboard shell
│   │   ├── marketing/                 # Landing sections (later)
│   │   ├── course/                    # Module list, lesson player shell
│   │   ├── assignment/              # Submission forms, grade display
│   │   └── billing/                   # Plan cards, Stripe elements wrapper
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Browser client (createBrowserClient)
│   │   │   ├── server.ts              # Server Components / cookies
│   │   │   ├── middleware.ts          # Session refresh for middleware.ts
│   │   │   └── admin.ts               # Service role — webhooks only, never client
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── products.ts            # Tier → price ID mapping
│   │   ├── auth/
│   │   │   ├── roles.ts               # Role enum + guards
│   │   │   └── redirects.ts           # Post-login role → dashboard path
│   │   ├── db/
│   │   │   ├── queries/               # Typed query helpers per domain
│   │   │   │   ├── courses.ts
│   │   │   │   ├── enrollments.ts
│   │   │   │   ├── lessons.ts
│   │   │   │   ├── assignments.ts
│   │   │   │   └── submissions.ts
│   │   │   └── types.ts               # Generated or hand-maintained DB types
│   │   ├── storage/
│   │   │   └── paths.ts               # Bucket/path conventions
│   │   └── utils/
│   │       ├── cn.ts
│   │       └── dates.ts
│   │
│   ├── hooks/
│   │   ├── use-profile.ts
│   │   └── use-enrollment.ts
│   │
│   ├── actions/                       # Server Actions ('use server')
│   │   ├── auth.ts
│   │   ├── submissions.ts
│   │   ├── enrollments.ts
│   │   └── billing.ts
│   │
│   ├── types/
│   │   ├── database.ts                # Supabase generated types
│   │   └── app.ts                     # App-level DTOs
│   │
│   └── middleware.ts                  # Auth session + role-based route protection
│
├── components.json                    # shadcn config (when added)
├── tailwind.config.ts                 # Or Tailwind v4 @theme in globals.css
├── next.config.ts
├── package.json
└── tsconfig.json
```

### Routing conventions

| Segment | Purpose |
|--------|---------|
| `(marketing)` | SEO pages, no session required |
| `(auth)` | Supabase Auth UI flows |
| `(dashboard)/student` | Learner experience |
| `(dashboard)/parent` | Child progress + billing |
| `(dashboard)/teacher` | Grading + course oversight |
| `(dashboard)/admin` | CMS-style course/user management |
| `api/webhooks/stripe` | Subscription lifecycle (service role writes) |

### Middleware responsibilities (`src/middleware.ts`)

1. Refresh Supabase session cookie on every matched request.
2. Redirect unauthenticated users away from `(dashboard)/**`.
3. Redirect authenticated users away from `(auth)/login` to role home.
4. Enforce role ↔ path prefix (`/student` only if `profiles.role = student`, etc.).
5. Allow `api/webhooks/*` without session (verify Stripe signature in handler).

---

## 2. Data Model Overview

See `supabase/migrations/20250521000000_foundation.sql` for full DDL and RLS.

| Table | Purpose |
|-------|---------|
| `profiles` | 1:1 with `auth.users`; role + Stripe customer id |
| `student_parent_relations` | Parent ↔ student guardianship |
| `subscription_tiers` | Bronze / Silver / Gold style plans |
| `subscriptions` | Parent billing state (Stripe ids) |
| `courses`, `course_modules`, `lessons` | Curriculum hierarchy |
| `enrollments` | Student ↔ course access |
| `content_unlocks` | Per-enrollment lesson availability (sequential / drip / manual) |
| `lesson_progress` | Watch completion (unlocks next lesson when sequential) |
| `assignments` | Homework metadata + storage path |
| `submissions` | Uploads, grade /100, teacher feedback |

Enums: `user_role`, `enrollment_status`, `unlock_strategy`, `submission_status`.

Helper SQL functions (security definer, fixed `search_path`): `is_admin()`, `is_teacher()`, `parent_has_student()`, `student_is_enrolled_in_course()`.

---

## 3. Security Model (RLS Summary)

- **Profiles**: users read/update self; admins read all; parents read linked students.
- **Courses / modules / lessons**: published catalog readable by authenticated users; write admin/teacher only.
- **Enrollments**: student sees own; parent sees children’s; teacher/admin by course assignment.
- **Content unlocks**: visible only if enrollment belongs to user (student) or child (parent).
- **Assignments**: visible if enrolled in course (or lesson’s course).
- **Submissions**: student CRUD own (until graded); parent read-only for children; teacher update grades for assigned courses.

Full policies are in the migration file.

---

## 4. Initialization Plan (Build Order)

Build in vertical slices. Each phase should be deployable and testable before the next.

### Phase 0 — Foundation (current step)

- [x] Architecture doc + SQL migration
- [ ] Supabase project: run migration, enable Auth providers
- [ ] Storage buckets: `lesson-videos`, `assignment-files`, `submissions`, `avatars`
- [ ] `.env.local` + `lib/supabase/*` clients
- [ ] Generate `types/database.ts` via Supabase CLI

### Phase 1 — Auth & identity

1. `profiles` trigger on `auth.users` insert (role from signup metadata).
2. Middleware: session refresh + protected routes.
3. Auth pages: login, signup (role selection: parent vs student invite flow).
4. `lib/auth/redirects.ts` — post-login routing by role.
5. Parent links child: invite code or admin-created `student_parent_relations`.

### Phase 2 — Stripe subscriptions (parent billing)

1. `subscription_tiers` seed data + Stripe Products/Prices.
2. Checkout Session API route / Server Action (parent only).
3. Webhook: `customer.subscription.*` → upsert `subscriptions`, activate `enrollments`.
4. Parent billing page + Customer Portal.

### Phase 3 — Course catalog (admin + public)

1. Admin CRUD: courses → modules → lessons (ordering, publish flag).
2. Marketing curriculum page (read-only published courses).
3. Supabase Storage upload for lesson videos / assignment PDFs.

### Phase 4 — Student learning experience

1. Enrollment gate: only subscribed/enrolled students see course routes.
2. Course outline UI with lock icons from `content_unlocks`.
3. Lesson player + `lesson_progress` updates.
4. Unlock engine: on lesson complete, insert next `content_unlock` (sequential) or cron for drip.

### Phase 5 — Assignments & grading

1. Student assignment list + file upload to `submissions` bucket.
2. Teacher grading queue: filter `status = submitted`.
3. Grade + feedback form (0–100), status → `graded`.
4. Parent grades view (read-only via RLS).

### Phase 6 — Parent dashboard

1. Multi-child switcher.
2. Progress aggregates from `lesson_progress` + grades from `submissions`.
3. Notifications (email via Supabase Edge Functions or Resend — later).

### Phase 7 — Teacher & admin polish

1. Teacher course assignment table (optional `teacher_course_assignments`).
2. Admin analytics: enrollment counts, completion rates.
3. Q&A / messaging (new tables: `threads`, `messages`).

### Phase 8 — Premium CambriLearn parity (later)

- Live sessions / calendar
- Quizzes with auto-marking
- Certificates
- Multi-tenant `organizations` for white-label schools
- Mobile PWA

---

## Tech stack alignment

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 App Router, React 19 |
| UI | Tailwind CSS 4 + shadcn/ui (Phase 1+) |
| DB / Auth / Storage | Supabase |
| Payments | Stripe Subscriptions |

When adding shadcn: `npx shadcn@latest init` and place components in `src/components/ui/`.
