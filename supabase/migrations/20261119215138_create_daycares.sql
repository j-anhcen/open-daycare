create table public.daycares (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daycares enable row level security;

revoke all on table public.daycares from anon, authenticated;
grant select on table public.daycares to anon, authenticated;
grant select, insert, update, delete on table public.daycares to service_role;

create policy "daycares_read" on public.daycares for select using (true);
create policy "daycares_insert" on public.daycares for insert with check (false);
create policy "daycares_update" on public.daycares for update using (false);
create policy "daycares_delete" on public.daycares for delete using (false);
