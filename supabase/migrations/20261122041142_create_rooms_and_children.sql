create type public.child_status as enum ('active', 'archived');

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  daycare_id uuid not null references public.daycares(id),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete restrict,
  full_name text not null,
  birth_date date not null,
  enrolled_at date not null default current_date,
  medical_notes text,
  allergy_tags text[] not null default '{}',
  photo_consent boolean not null default true,
  status public.child_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rooms enable row level security;

revoke all on table public.rooms from anon, authenticated;
grant select on table public.rooms to anon, authenticated;
grant select, insert, update, delete on table public.rooms to service_role;

create policy "rooms_read"   on public.rooms for select using (true);
create policy "rooms_insert" on public.rooms for insert with check (false);
create policy "rooms_update" on public.rooms for update using (false);
create policy "rooms_delete" on public.rooms for delete using (false);

alter table public.children enable row level security;

revoke all on table public.children from anon, authenticated;
grant select on table public.children to anon, authenticated;
grant select, insert, update, delete on table public.children to service_role;

create policy "children_read"   on public.children for select using (true);
create policy "children_insert" on public.children for insert with check (false);
create policy "children_update" on public.children for update using (false);
create policy "children_delete" on public.children for delete using (false);
