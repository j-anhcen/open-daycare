# SPEC 08 — Tabla `users`, enums de usuario y usuario staff de prueba

> **Estado:** Implemented  
> **Depende de:** SPEC 07  
> **Fecha:** 2026-11-19  
> **Objetivo:** Crear los enums `user_role` y `user_status`, la tabla `public.users` vinculada a `auth.users` y `daycares` con RLS y un trigger de alta, y sembrar un usuario staff para probar la app.

## Alcance

**Incluye:**

- **Enums:** `user_role` (`staff`, `parent`, `admin`) y `user_status` (`pending`, `active`). Solo estos dos; los otros cuatro del reference se crean con sus tablas.
- **Tabla `public.users`:** `id uuid PK` con FK `auth.users(id) ON DELETE CASCADE` y default `gen_random_uuid()`; `daycare_id uuid NOT NULL` con FK a `public.daycares(id)`; `role user_role NOT NULL DEFAULT 'parent'`; `status user_status NOT NULL DEFAULT 'active'`; `full_name text NOT NULL`; `avatar_url text` nullable; `notify_on_post boolean NOT NULL DEFAULT true`; `daily_summary_enabled boolean NOT NULL DEFAULT true`; `created_at` / `updated_at timestamptz NOT NULL DEFAULT now()`.
- **Cardinalidad confirmada:** un usuario pertenece a **un** daycare; un daycare tiene **muchos** usuarios. Se resuelve con el FK simple `users.daycare_id`, sin tabla intermedia.
- **Trigger de alta:** función `public.handle_new_user()` `AFTER INSERT ON auth.users`, `SECURITY DEFINER` con `SET search_path = ''` y nombres fully-qualified. Lee `daycare_id`, `role` y `full_name` de `NEW.raw_user_meta_data` según el reference; valida `role` contra un whitelist (`staff`/`parent`; `admin` no se autoasigna), usa `'parent'` si falta o no es válido, y `NEW.email` como fallback de `full_name`.
- **RLS baseline:** idéntico a SPEC 07: `enable row level security`, `revoke all` + `grant select` a `anon`/`authenticated`, CRUD a `service_role`, y cuatro policies `users_read` (SELECT `using (true)`), `users_insert` (INSERT `with check (false)`), `users_update` (UPDATE `using (false)`), `users_delete` (DELETE `using (false)`).
- **Migraciones:** tres pares migración-MCP/archivo local, con el timestamp devuelto por MCP copiado al nombre del archivo: DDL de enums+tabla, trigger, y semilla del staff.
- **Usuario staff de prueba:** `john@gmail.com`, password `Abc123456` (credencial **solo de demo**), `role='staff'`, `status='active'`, `full_name='John'`, vinculado a la fila existente `Guardería Sala Soles` (la semilla de SPEC 07, con tilde). Se crea insertando en `auth.users` con `email_confirmed_at = now()` y password hasheado con `crypt(..., gen_salt('bf'))` de pgcrypto.

**Fuera de alcance (para futuras specs):**

- `daycares.owner_id`, tabla `user_daycares` ni cualquier otra cardinalidad distinta de la confirmada.
- Enums `relationship_type`, `invitation_status`, `post_type` y `child_status`.
- Policies RLS de propiedad/pertenencia por `daycare_id` o rol de dominio; lectura `using (true)` sigue exponiendo filas mientras no haya app integrada.
- Trigger para mantener `updated_at` automáticamente.
- Flujo de invitaciones (`invitations`) ni estados `pending` reales.
- Integración con Next.js, `@supabase/ssr`, `supabase-js`, variables de entorno ni lectura desde la UI.
- CLI local, Docker, esquema declarativo, `supabase/seed.sql` ni cambios en `app/`, `components/`, mocks o specs 01–07.

## Modelo de datos

```sql
-- Migración 1: enums + tabla + RLS
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
```

```sql
-- Migración 2: trigger de alta (SECURITY DEFINER con search_path fijo)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_role text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.users (id, daycare_id, role, full_name)
  values (
    new.id,
    (new.raw_user_meta_data ->> 'daycare_id')::uuid,
    case when v_role in ('staff', 'parent')
      then v_role::public.user_role else 'parent'::public.user_role end,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

```sql
-- Migración 3: semilla del staff (el password se hashea con pgcrypto)
insert into auth.users (
  instance_id, id, aud, role, email, email_confirmed_at,
  encrypted_password, raw_user_meta_data, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'john@gmail.com',
  now(),
  crypt('Abc123456', gen_salt('bf')),
  jsonb_build_object(
    'daycare_id', (select id from public.daycares where name = 'Guardería Sala Soles'),
    'role', 'staff',
    'full_name', 'John'
  ),
  now(), now()
);
```

Convenciones: identificadores y valores persistidos en inglés; `full_name` y el nombre de la guardería son datos visibles y van en español/según la fila ya sembrada. `pgcrypto` 1.3 ya está habilitado (SPEC 07), así que no se crea la extensión.

## Plan de implementación

1. **Migración DDL:** aplicar enums, tabla y RLS con MCP `apply_migration`; crear `supabase/migrations/<timestamp>_create_users.sql` con el mismo contenido y timestamp. Verificación: `list_migrations` pasa de 2 a 3 entradas.
2. **Migración del trigger:** aplicar la función y el trigger sobre `auth.users` con MCP `apply_migration`; crear `supabase/migrations/<timestamp>_create_handle_new_user.sql`. Verificación: `list_migrations` = 4 entradas y `pg_trigger` contiene `on_auth_user_created`.
3. **Migración de la semilla:** aplicar el `INSERT` en `auth.users` con MCP `apply_migration`; crear `supabase/migrations/<timestamp>_seed_staff_user.sql`. Verificación: `list_migrations` = 5 entradas; disparar el trigger crea la fila en `public.users` sin inserción manual.
4. **Verificación de esquema y seguridad:** `pg_enum` para los dos enums con sus valores; `information_schema.columns` para las 11 columnas, tipos, defaults y nulabilidad; FK a `auth.users` y `daycares`; `pg_class.relrowsecurity`, `pg_policies` (4 filas) y `has_table_privilege` para `anon`, `authenticated` y `service_role`.
5. **Verificación de la semilla y del login:** consultar `auth.users` por email y hacer join con `public.users` y `public.daycares` para confirmar `role='staff'`, `status='active'` y `daycare_id` de Sala Soles. Probar `POST /auth/v1/token?grant_type=password` con la credencial acordada y la publishable key del proyecto; si el hash bcrypt no es aceptado por GoTrue, regenerarlo con la Admin API antes de cerrar la spec. No imprimir claves en los logs.
6. **Advisors y cierre:** ejecutar MCP `get_advisors` de seguridad y performance y corregir hallazgos relacionados con estas tablas o la función. Sin cambios de UI: no hay verificación Playwright.

## Criterios de aceptación

- [ ] Existen `public.user_role` ('staff','parent','admin') y `public.user_status` ('pending','active'), y no se crearon los otros cuatro enums.
- [ ] `public.users` tiene exactamente las 11 columnas indicadas, con `id` PK + FK a `auth.users(id) ON DELETE CASCADE`, `daycare_id` FK NOT NULL a `daycares`, defaults y nulabilidad indicados.
- [ ] Existe `public.handle_new_user()` como `SECURITY DEFINER` con `search_path = ''` y el trigger `on_auth_user_created` `AFTER INSERT ON auth.users`.
- [ ] Un `INSERT` de prueba en `auth.users` con metadata válida crea automáticamente su fila en `public.users` con el mismo `id`; con `role` inválido o ausente cae en `parent`.
- [ ] `relrowsecurity` es `true` y `pg_policies` devuelve exactamente `users_read`, `users_insert`, `users_update` y `users_delete` con los comandos y expresiones indicados.
- [ ] `anon` y `authenticated` tienen `SELECT` pero no `INSERT`/`UPDATE`/`DELETE`; `service_role` tiene los cuatro privilegios.
- [ ] Existe exactamente un `auth.users` con `john@gmail.com`, email confirmado y su fila en `public.users` con `role='staff'`, `status='active'`, `full_name='John'` y `daycare_id` = Sala Soles.
- [ ] El login con `john@gmail.com` / `Abc123456` contra el endpoint de token de Supabase devuelve un access token.
- [ ] `list_migrations` devuelve 5 entradas y los tres archivos locales nuevos usan esos mismos timestamps.
- [ ] `get_advisors` no reporta hallazgos nuevos de seguridad o performance; no hay cambios en `app/`, `components/`, `package.json` ni mocks.

## Decisiones

- **Sí:** FK simple `users.daycare_id → daycares`, confirmado por el usuario; un daycare tiene varios usuarios y un usuario pertenece a uno solo.
- **Sí:** solo `user_role` y `user_status` ahora; los otros enums se crean con sus tablas para no dejar tipos huérfanos.
- **Sí:** trigger `SECURITY DEFINER` con `search_path = ''` y objetos fully-qualified, según el reference; `status` no se toca desde el trigger porque el estado previo al signup vive en `invitations`.
- **Sí:** `role` leído de `raw_user_meta_data` pero validado: solo `staff`/`parent`; `admin` requiere promoción directa con `service_role`. Mitiga la regla del repo de no usar `user_metadata` para autorización, con el riesgo residual documentado.
- **Sí:** RLS baseline copiado de SPEC 07 para mantener coherencia; las policies de pertenencia se hacen cuando exista consumo real desde la app.
- **Sí:** tres migraciones separadas aplicadas con MCP y archivadas con el mismo timestamp, separando DDL, trigger y datos.
- **Sí:** credencial `john@gmail.com` / `Abc123456` en Sala Soles, pedida explícitamente para probar; queda marcada como demo en la spec.
- **No:** `owner_id`, tabla intermedia, otros enums, policies de propiedad, trigger de `updated_at`, integración con Next.js, CLI local ni cambios de UI.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| GoTrue puede no aceptar un bcrypt generado con `crypt()` para el login. | Verificar el login real en el paso 5; si falla, recrear la contraseña con Supabase Admin API sin exponer la service key. |
| `raw_user_meta_data` lo puede enviar el cliente en un signup público y autoasignarse `staff`. | Whitelist en el trigger y `admin` bloqueado; mover `role` a `app_metadata` antes de exponer signup público. |
| La función `SECURITY DEFINER` podría resolver objetos de otro schema. | `SET search_path = ''` y todos los objetos fully-qualified; el owner debe ser `postgres` para bypassar RLS. |
| Un signup sin `daycare_id` hace fallar el trigger por el `NOT NULL`. | Comportamiento intencionado; el flujo de invitaciones (fuera de alcance) será quien provea el `daycare_id`. |
| La password de demo queda versionada en git. | Uso exclusivo de prueba; rotar o borrar la cuenta antes de cualquier despliegue. |
| `apply_migration` muta el remoto directamente; un fallo parcial puede dejar historial sin DDL. | Consultar `list_migrations` y el estado del objeto antes de reintentar. |

## Lo que **no** está en esta spec

- Otra cardinalidad usuario ↔ daycare, `daycares.owner_id` ni tablas intermedias.
- Los enums `relationship_type`, `invitation_status`, `post_type` y `child_status`.
- Policies RLS por propiedad/rol, trigger de `updated_at` ni flujo de invitaciones.
- Clientes Supabase, variables de entorno, UI ni migraciones distintas a las tres descriptas.

Cada uno de esos puntos, si se aborda, va en su propia spec.
