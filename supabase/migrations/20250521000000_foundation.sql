-- =============================================================================
-- Aalgorix World Academy — Foundation Schema + RLS
-- Run in Supabase SQL Editor or via: supabase db push
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

create type public.user_role as enum (
  'student',
  'parent',
  'teacher',
  'admin'
);

create type public.enrollment_status as enum (
  'pending',
  'active',
  'paused',
  'cancelled',
  'completed'
);

create type public.unlock_strategy as enum (
  'all_at_once',      -- entire course available on enrollment
  'sequential',       -- next lesson unlocks after previous completed
  'drip',             -- unlock on schedule (available_at)
  'manual'            -- admin/teacher explicit unlock
);

create type public.submission_status as enum (
  'draft',
  'submitted',
  'graded',
  'returned'
);

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'student',
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  date_of_birth date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_email_idx on public.profiles (email);

-- -----------------------------------------------------------------------------
-- Parent ↔ Student
-- -----------------------------------------------------------------------------

create table public.student_parent_relations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  relationship_label text default 'parent',
  is_primary_contact boolean not null default false,
  created_at timestamptz not null default now(),
  unique (parent_id, student_id),
  check (parent_id <> student_id)
);

create index spr_parent_idx on public.student_parent_relations (parent_id);
create index spr_student_idx on public.student_parent_relations (student_id);

-- -----------------------------------------------------------------------------
-- Curriculum: courses → modules → lessons
-- -----------------------------------------------------------------------------

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  grade_level text,                   -- e.g. 'Grade 10', 'IGCSE Year 11'
  curriculum_tag text,                -- e.g. 'CAPS', 'Cambridge'
  thumbnail_url text,
  is_published boolean not null default false,
  unlock_strategy public.unlock_strategy not null default 'sequential',
  drip_interval_days int,             -- used when unlock_strategy = 'drip'
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create index course_modules_course_idx on public.course_modules (course_id);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules (id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  video_storage_path text,            -- Supabase Storage path
  video_duration_seconds int,
  resource_paths jsonb not null default '[]'::jsonb,
  is_preview boolean not null default false,  -- free preview without enrollment
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, sort_order)
);

create index lessons_module_idx on public.lessons (module_id);

-- -----------------------------------------------------------------------------
-- Enrollments (student access to a course)
-- -----------------------------------------------------------------------------

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  status public.enrollment_status not null default 'pending',
  enrolled_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create index enrollments_student_idx on public.enrollments (student_id);
create index enrollments_course_idx on public.enrollments (course_id);

-- -----------------------------------------------------------------------------
-- Content unlocks (per enrollment + lesson)
-- -----------------------------------------------------------------------------

create table public.content_unlocks (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  available_at timestamptz not null default now(),  -- for drip: future timestamp
  unlocked_by uuid references public.profiles (id) on delete set null,
  unlock_reason text,
  unique (enrollment_id, lesson_id)
);

create index content_unlocks_enrollment_idx on public.content_unlocks (enrollment_id);

-- -----------------------------------------------------------------------------
-- Lesson progress (completion → drives sequential unlocks)
-- -----------------------------------------------------------------------------

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  progress_percent smallint not null default 0 check (progress_percent between 0 and 100),
  last_position_seconds int default 0,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (enrollment_id, lesson_id)
);

-- -----------------------------------------------------------------------------
-- Assignments & submissions
-- -----------------------------------------------------------------------------

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid references public.course_modules (id) on delete set null,
  lesson_id uuid references public.lessons (id) on delete set null,
  title text not null,
  description text,
  instructions_storage_path text,
  max_points smallint not null default 100 check (max_points > 0),
  due_at timestamptz,
  is_published boolean not null default false,
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assignments_course_idx on public.assignments (course_id);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  status public.submission_status not null default 'draft',
  storage_paths jsonb not null default '[]'::jsonb,
  submitted_at timestamptz,
  grade smallint check (grade is null or (grade >= 0 and grade <= 100)),
  feedback text,
  graded_by uuid references public.profiles (id) on delete set null,
  graded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index submissions_student_idx on public.submissions (student_id);
create index submissions_assignment_idx on public.submissions (assignment_id);
create index submissions_status_idx on public.submissions (status);

-- -----------------------------------------------------------------------------
-- Teacher ↔ course assignment (optional oversight scope)
-- -----------------------------------------------------------------------------

create table public.teacher_course_assignments (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (teacher_id, course_id)
);

-- -----------------------------------------------------------------------------
-- Timestamps trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

create trigger course_modules_updated_at
  before update on public.course_modules
  for each row execute function public.set_updated_at();

create trigger lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

create trigger enrollments_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

create trigger assignments_updated_at
  before update on public.assignments
  for each row execute function public.set_updated_at();

create trigger submissions_updated_at
  before update on public.submissions
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Auto-create profile on signup
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _role public.user_role;
  _full_name text;
begin
  _role := coalesce(
    (new.raw_user_meta_data ->> 'role')::public.user_role,
    'student'::public.user_role
  );
  _full_name := new.raw_user_meta_data ->> 'full_name';

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, _full_name, _role);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- RLS helper functions (security definer)
-- -----------------------------------------------------------------------------

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('teacher', 'admin')
  );
$$;

create or replace function public.parent_has_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.student_parent_relations
    where parent_id = auth.uid() and student_id = p_student_id
  );
$$;

create or replace function public.student_is_enrolled_in_course(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.enrollments
    where student_id = auth.uid()
      and course_id = p_course_id
      and status = 'active'
  );
$$;

create or replace function public.student_is_enrolled_in_lesson(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    join public.course_modules cm on cm.course_id = e.course_id
    join public.lessons l on l.module_id = cm.id
    where e.student_id = auth.uid()
      and e.status = 'active'
      and l.id = p_lesson_id
  );
$$;

create or replace function public.lesson_is_unlocked_for_student(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.content_unlocks cu
    join public.enrollments e on e.id = cu.enrollment_id
    where e.student_id = auth.uid()
      and e.status = 'active'
      and cu.lesson_id = p_lesson_id
      and cu.available_at <= now()
  )
  or exists (
    select 1 from public.lessons l
    where l.id = p_lesson_id and l.is_preview = true
  );
$$;

-- -----------------------------------------------------------------------------
-- Enable RLS
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.student_parent_relations enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.content_unlocks enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.teacher_course_assignments enable row level security;

-- -----------------------------------------------------------------------------
-- RLS: profiles
-- -----------------------------------------------------------------------------

create policy "Users can view own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Parents can view linked student profiles"
  on public.profiles for select
  using (
    public.parent_has_student(id)
    or public.is_admin()
  );

create policy "Teachers and admins can view all profiles"
  on public.profiles for select
  using (public.is_teacher());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Admins can manage all profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- RLS: student_parent_relations
-- -----------------------------------------------------------------------------

create policy "Parents view own relations"
  on public.student_parent_relations for select
  using (parent_id = auth.uid() or public.is_admin());

create policy "Students view relations where they are the child"
  on public.student_parent_relations for select
  using (student_id = auth.uid());

create policy "Parents insert relations for their account"
  on public.student_parent_relations for insert
  with check (parent_id = auth.uid());

create policy "Admins manage relations"
  on public.student_parent_relations for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- RLS: courses, modules, lessons
-- -----------------------------------------------------------------------------

create policy "Authenticated users read published courses"
  on public.courses for select
  using (
    is_published = true
    or public.is_teacher()
  );

create policy "Admins and teachers manage courses"
  on public.courses for all
  using (public.is_teacher())
  with check (public.is_teacher());

create policy "Read modules of visible courses"
  on public.course_modules for select
  using (
    exists (
      select 1 from public.courses c
      where c.id = course_id
        and (c.is_published = true or public.is_teacher())
    )
  );

create policy "Teachers manage modules"
  on public.course_modules for all
  using (public.is_teacher())
  with check (public.is_teacher());

create policy "Read lessons for published courses or preview"
  on public.lessons for select
  using (
    is_preview = true
    or exists (
      select 1
      from public.course_modules cm
      join public.courses c on c.id = cm.course_id
      where cm.id = module_id
        and (c.is_published = true or public.is_teacher())
    )
  );

create policy "Enrolled students read unlocked lessons"
  on public.lessons for select
  using (
    public.student_is_enrolled_in_lesson(id)
    and public.lesson_is_unlocked_for_student(id)
  );

create policy "Teachers manage lessons"
  on public.lessons for all
  using (public.is_teacher())
  with check (public.is_teacher());

-- -----------------------------------------------------------------------------
-- RLS: enrollments
-- -----------------------------------------------------------------------------

create policy "Students view own enrollments"
  on public.enrollments for select
  using (student_id = auth.uid());

create policy "Parents view children enrollments"
  on public.enrollments for select
  using (public.parent_has_student(student_id));

create policy "Teachers view enrollments for assigned courses"
  on public.enrollments for select
  using (
    public.is_teacher()
    and exists (
      select 1 from public.teacher_course_assignments tca
      where tca.course_id = enrollments.course_id
        and tca.teacher_id = auth.uid()
    )
  );

create policy "Admins manage enrollments"
  on public.enrollments for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- RLS: content_unlocks
-- -----------------------------------------------------------------------------

create policy "Students view own content unlocks"
  on public.content_unlocks for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id and e.student_id = auth.uid()
    )
  );

create policy "Parents view children content unlocks"
  on public.content_unlocks for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id
        and public.parent_has_student(e.student_id)
    )
  );

create policy "Teachers and admins manage unlocks"
  on public.content_unlocks for all
  using (public.is_teacher())
  with check (public.is_teacher());

-- -----------------------------------------------------------------------------
-- RLS: lesson_progress
-- -----------------------------------------------------------------------------

create policy "Students manage own lesson progress"
  on public.lesson_progress for all
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id and e.student_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id and e.student_id = auth.uid()
    )
  );

create policy "Parents read children lesson progress"
  on public.lesson_progress for select
  using (
    exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id
        and public.parent_has_student(e.student_id)
    )
  );

create policy "Teachers read progress for assigned courses"
  on public.lesson_progress for select
  using (public.is_teacher());

-- -----------------------------------------------------------------------------
-- RLS: assignments
-- -----------------------------------------------------------------------------

create policy "Students read published assignments for enrolled courses"
  on public.assignments for select
  using (
    is_published = true
    and public.student_is_enrolled_in_course(course_id)
  );

create policy "Parents read assignments for children courses"
  on public.assignments for select
  using (
    is_published = true
    and exists (
      select 1 from public.enrollments e
      where e.course_id = assignments.course_id
        and e.status = 'active'
        and public.parent_has_student(e.student_id)
    )
  );

create policy "Teachers manage assignments"
  on public.assignments for all
  using (public.is_teacher())
  with check (public.is_teacher());

-- -----------------------------------------------------------------------------
-- RLS: submissions
-- -----------------------------------------------------------------------------

create policy "Students view own submissions"
  on public.submissions for select
  using (student_id = auth.uid());

create policy "Students insert and update own draft submissions"
  on public.submissions for insert
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.enrollments e
      where e.id = enrollment_id and e.student_id = auth.uid() and e.status = 'active'
    )
  );

create policy "Students update own unsubmitted work"
  on public.submissions for update
  using (
    student_id = auth.uid()
    and status in ('draft', 'returned')
  )
  with check (student_id = auth.uid());

create policy "Parents view children submissions and grades"
  on public.submissions for select
  using (public.parent_has_student(student_id));

create policy "Teachers grade submissions for their courses"
  on public.submissions for select
  using (public.is_teacher());

create policy "Teachers update grades and feedback"
  on public.submissions for update
  using (
    public.is_teacher()
    and exists (
      select 1
      from public.assignments a
      join public.teacher_course_assignments tca on tca.course_id = a.course_id
      where a.id = assignment_id and tca.teacher_id = auth.uid()
    )
  )
  with check (public.is_teacher());

create policy "Admins full access submissions"
  on public.submissions for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- RLS: teacher_course_assignments
-- -----------------------------------------------------------------------------

create policy "Teachers view own assignments"
  on public.teacher_course_assignments for select
  using (teacher_id = auth.uid() or public.is_admin());

create policy "Admins manage teacher assignments"
  on public.teacher_course_assignments for all
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- Storage buckets (run separately in Dashboard or CLI)
-- -----------------------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values
--   ('avatars', 'avatars', true),
--   ('lesson-videos', 'lesson-videos', false),
--   ('assignment-files', 'assignment-files', false),
--   ('submissions', 'submissions', false);
