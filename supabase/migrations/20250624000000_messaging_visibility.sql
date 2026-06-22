-- Allow students and parents to discover assigned teachers for messaging and portals.
-- Previously only teachers (own rows) and admins could read teacher_course_assignments,
-- and only teachers could read other users' profiles — so student /parent/messages stayed empty.

create policy "Students view teachers for enrolled courses"
  on public.teacher_course_assignments for select
  using (
    exists (
      select 1
      from public.enrollments e
      where e.student_id = auth.uid()
        and e.course_id = teacher_course_assignments.course_id
        and e.status = 'active'
    )
  );

create policy "Parents view teachers for children courses"
  on public.teacher_course_assignments for select
  using (
    exists (
      select 1
      from public.enrollments e
      join public.student_parent_relations spr on spr.student_id = e.student_id
      where spr.parent_id = auth.uid()
        and e.course_id = teacher_course_assignments.course_id
        and e.status = 'active'
    )
  );

create policy "Students view assigned teacher profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.teacher_course_assignments tca
      join public.enrollments e on e.course_id = tca.course_id
      where e.student_id = auth.uid()
        and e.status = 'active'
        and tca.teacher_id = profiles.id
    )
  );

create policy "Parents view children teacher profiles"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.teacher_course_assignments tca
      join public.enrollments e on e.course_id = tca.course_id
      join public.student_parent_relations spr on spr.student_id = e.student_id
      where spr.parent_id = auth.uid()
        and e.status = 'active'
        and tca.teacher_id = profiles.id
    )
  );
