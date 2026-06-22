-- Live class sessions for enrolled students and assigned teachers.

create type public.live_session_status as enum (
  'scheduled',
  'live',
  'completed',
  'cancelled'
);

create table public.live_class_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  starts_at timestamptz not null,
  duration_minutes smallint not null default 60 check (duration_minutes > 0),
  meeting_url text,
  recording_url text,
  status public.live_session_status not null default 'scheduled',
  is_published boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index live_class_sessions_course_idx on public.live_class_sessions (course_id);
create index live_class_sessions_starts_at_idx on public.live_class_sessions (starts_at);

create trigger live_class_sessions_updated_at
  before update on public.live_class_sessions
  for each row execute function public.set_updated_at();

alter table public.live_class_sessions enable row level security;

-- Students: read published sessions for enrolled courses
create policy "Students read live sessions for enrolled courses"
  on public.live_class_sessions for select
  using (
    is_published
    and student_is_enrolled_in_course(course_id)
  );

-- Parents: read published sessions for linked children's courses
create policy "Parents read live sessions for children courses"
  on public.live_class_sessions for select
  using (
    is_published
    and exists (
      select 1
      from public.enrollments e
      join public.student_parent_relations spr on spr.student_id = e.student_id
      where e.course_id = live_class_sessions.course_id
        and e.status = 'active'
        and spr.parent_id = auth.uid()
    )
  );

-- Teachers: manage sessions for assigned courses
create policy "Teachers manage live sessions for assigned courses"
  on public.live_class_sessions for all
  using (
    is_teacher()
    and exists (
      select 1 from public.teacher_course_assignments tca
      where tca.course_id = live_class_sessions.course_id
        and tca.teacher_id = auth.uid()
    )
  )
  with check (
    is_teacher()
    and exists (
      select 1 from public.teacher_course_assignments tca
      where tca.course_id = live_class_sessions.course_id
        and tca.teacher_id = auth.uid()
    )
  );

-- Admins: full access
create policy "Admins manage live class sessions"
  on public.live_class_sessions for all
  using (is_admin())
  with check (is_admin());
