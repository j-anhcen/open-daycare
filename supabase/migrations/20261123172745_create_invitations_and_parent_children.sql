create type public.relationship_type as enum ('father', 'mother', 'tutor');
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'cancelled');

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  invited_by uuid references public.users(id) on delete set null,
  full_name text not null,
  email text not null,
  relationship public.relationship_type not null,
  code text not null unique,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint invitations_child_email_unique unique (child_id, email)
);

create table public.parent_children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.users(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  relationship public.relationship_type not null,
  created_at timestamptz not null default now(),
  constraint parent_children_parent_child_unique unique (parent_id, child_id)
);

alter table public.invitations enable row level security;

revoke all on table public.invitations from anon, authenticated;
grant select on table public.invitations to anon, authenticated;
grant select, insert, update, delete on table public.invitations to service_role;

create policy "invitations_read"   on public.invitations for select using (true);
create policy "invitations_insert" on public.invitations for insert with check (false);
create policy "invitations_update" on public.invitations for update using (false);
create policy "invitations_delete" on public.invitations for delete using (false);

alter table public.parent_children enable row level security;

revoke all on table public.parent_children from anon, authenticated;
grant select on table public.parent_children to anon, authenticated;
grant select, insert, update, delete on table public.parent_children to service_role;

create policy "parent_children_read"   on public.parent_children for select using (true);
create policy "parent_children_insert" on public.parent_children for insert with check (false);
create policy "parent_children_update" on public.parent_children for update using (false);
create policy "parent_children_delete" on public.parent_children for delete using (false);
