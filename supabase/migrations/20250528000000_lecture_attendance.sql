-- Lecture attendance events (live class join tracking)

create table public.lecture_attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  session_title text not null,
  session_starts_at timestamptz,
  joined_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index lecture_attendance_student_idx on public.lecture_attendance (student_id);
create index lecture_attendance_joined_idx on public.lecture_attendance (student_id, joined_at desc);

alter table public.lecture_attendance enable row level security;

create policy "Students insert own lecture attendance"
  on public.lecture_attendance for insert
  to authenticated
  with check (student_id = auth.uid());

create policy "Students read own lecture attendance"
  on public.lecture_attendance for select
  to authenticated
  using (student_id = auth.uid());

create policy "Parents read linked student lecture attendance"
  on public.lecture_attendance for select
  to authenticated
  using (
    exists (
      select 1
      from public.student_parent_relations spr
      where spr.parent_id = auth.uid()
        and spr.student_id = lecture_attendance.student_id
    )
  );

create policy "Teachers read attendance for assigned courses"
  on public.lecture_attendance for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role in ('teacher', 'admin')
    )
  );
