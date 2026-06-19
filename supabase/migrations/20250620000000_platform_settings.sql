-- Platform-wide settings singleton (admin-managed)

create table if not exists public.platform_settings (
  id int primary key default 1 check (id = 1),
  allow_registration boolean not null default true,
  maintenance_mode boolean not null default false,
  public_course_catalog boolean not null default true,
  admin_notification_prefs jsonb not null default '{
    "new_user_registration": true,
    "enrollment_created": true,
    "pending_submissions": false,
    "system_alerts": true
  }'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

insert into public.platform_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.platform_settings enable row level security;

create policy "Admins read platform settings"
  on public.platform_settings for select
  using (public.is_admin());

create policy "Admins manage platform settings"
  on public.platform_settings for all
  using (public.is_admin())
  with check (public.is_admin());

create trigger platform_settings_updated_at
  before update on public.platform_settings
  for each row execute function public.set_updated_at();
