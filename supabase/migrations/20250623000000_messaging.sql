-- Direct messaging between students and teachers (scoped per course).

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, student_id, teacher_id)
);

create index conversations_student_idx on public.conversations (student_id);
create index conversations_teacher_idx on public.conversations (teacher_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- Bump conversation.updated_at when a message is sent
create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();

-- -----------------------------------------------------------------------------
-- RLS helpers
-- -----------------------------------------------------------------------------

create or replace function public.user_in_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = p_conversation_id
      and (c.student_id = auth.uid() or c.teacher_id = auth.uid())
  );
$$;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- conversations
create policy "Participants read conversations"
  on public.conversations for select
  using (
    student_id = auth.uid()
    or teacher_id = auth.uid()
    or public.is_admin()
  );

create policy "Students start conversations in enrolled courses"
  on public.conversations for insert
  with check (
    student_id = auth.uid()
    and exists (
      select 1 from public.enrollments e
      where e.student_id = auth.uid()
        and e.course_id = conversations.course_id
        and e.status = 'active'
    )
    and exists (
      select 1 from public.teacher_course_assignments tca
      where tca.course_id = conversations.course_id
        and tca.teacher_id = conversations.teacher_id
    )
  );

create policy "Teachers start conversations for assigned courses"
  on public.conversations for insert
  with check (
    teacher_id = auth.uid()
    and public.is_teacher()
    and exists (
      select 1 from public.teacher_course_assignments tca
      where tca.course_id = conversations.course_id
        and tca.teacher_id = auth.uid()
    )
    and exists (
      select 1 from public.enrollments e
      where e.student_id = conversations.student_id
        and e.course_id = conversations.course_id
        and e.status = 'active'
    )
  );

create policy "Admins manage conversations"
  on public.conversations for all
  using (public.is_admin())
  with check (public.is_admin());

-- messages
create policy "Participants read messages"
  on public.messages for select
  using (public.user_in_conversation(conversation_id) or public.is_admin());

create policy "Participants send messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and public.user_in_conversation(conversation_id)
  );

create policy "Admins manage messages"
  on public.messages for all
  using (public.is_admin())
  with check (public.is_admin());
