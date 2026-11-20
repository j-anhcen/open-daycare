create type public.user_role as enum ('staff', 'parent', 'admin');
create type public.user_status as enum ('pending', 'active');

create table public.users (
  id uuid primary key default gen_random_uuid()
    references auth.users(id) on delete cascade,
  daycare_id uuid not null references public.daycares(id),
  role public.user_role not null default 'parent',
  status public.user_status not null default 'active',
  full_name text not null,
  avatar_url text,
  notify_on_post boolean not null default true,
  daily_summary_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

revoke all on table public.users from anon, authenticated;
grant select on table public.users to anon, authenticated;
grant select, insert, update, delete on table public.users to service_role;

create policy "users_read"   on public.users for select using (true);
create policy "users_insert" on public.users for insert with check (false);
create policy "users_update" on public.users for update using (false);
create policy "users_delete" on public.users for delete using (false);
