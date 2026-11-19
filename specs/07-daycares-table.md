# SPEC 07 — Tabla `daycares` y primeras migraciones

> **Estado:** Implemented  
> **Depende de:** —  
> **Fecha:** 2026-11-19  
> **Objetivo:** Crear la tabla `public.daycares` con RLS y seguridad por roles, versionarla como dos migraciones y aplicarlas al proyecto Supabase junto con 4 filas semilla.

## Alcance

**Incluye:**

- **Tabla `public.daycares`:** `id uuid PK default gen_random_uuid()`, `name text not null`, `address text` (nullable), `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()`. Sin FK: es la entidad raíz.
- **RLS + seguridad por roles:** `alter table public.daycares enable row level security` y cuatro policies: `daycares_read` (`SELECT ... USING (true)`), `daycares_insert` (`INSERT ... WITH CHECK (false)`), `daycares_update` (`UPDATE ... USING (false)`) y `daycares_delete` (`DELETE ... USING (false)`). Se revocan los grants por defecto de `anon` y `authenticated`, se les otorga `select` y se otorga `select, insert, update, delete` a `service_role`. Este proyecto da CRUD por defecto a `anon`/`authenticated` en tablas nuevas de `public`, por eso el `revoke` va en la misma migración: las policies no otorgan privilegios de tabla y `service_role` bypassea RLS.
- **Migración 1 — DDL:** `supabase/migrations/<timestamp>_create_daycares.sql`, aplicada en remoto con MCP `apply_migration`. El archivo local usa exactamente el timestamp devuelto por MCP para que el repo y `supabase_migrations.schema_migrations` no diverjan.
- **Migración 2 — DML:** `supabase/migrations/<timestamp>_seed_daycares.sql`, aplicada también con MCP `apply_migration`. Cuatro `INSERT` con columnas explícitas e IDs generados por `gen_random_uuid()`; DDL y datos quedan en archivos separados.
- **Filas semilla:** Guardería Sala Soles — Av. Libertador 1234; Guardería Sala Luna — Calle Mayor 456; Guardería Sala Estrellas — Av. Rivadavia 7890; Guardería Sala Arcoíris — Av. Corrientes 3210. `address` cargado en las 4 filas.
- **Sin CLI local:** el CLI de Supabase no está instalado y el proyecto remoto arranca con 0 tablas y 0 migraciones. La fuente de verdad es el historial remoto más los dos archivos versionados en git. No se instala CLI ni se levanta Docker.

**Fuera de alcance (para futuras specs):**

- Tablas `users`, `rooms` ni cualquier FK hacia `daycares`.
- Policies RLS de pertenencia por `daycare_id` o por rol de dominio (`staff`/`parent`/`admin`): requieren la tabla `users`. Las 4 policies de acceso básico de esta spec no las reemplazan.
- Trigger para mantener `updated_at` automáticamente.
- Integración con Next.js, instalación de `@supabase/ssr` / `supabase-js`, variables de entorno ni lectura de datos desde la UI.
- Esquema declarativo (`supabase/schemas/`), `supabase/config.toml`, `supabase/seed.sql` ni stack local.
- Cambios en `app/`, `components/`, mocks ni en las specs 01–06.

## Modelo de datos

```sql
-- supabase/migrations/<timestamp>_create_daycares.sql
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
```

```sql
-- supabase/migrations/<timestamp>_seed_daycares.sql
insert into public.daycares (name, address)
values
  ('Guardería Sala Soles', 'Av. Libertador 1234, CABA'),
  ('Guardería Sala Luna', 'Calle Mayor 456, CABA'),
  ('Guardería Sala Estrellas', 'Av. Rivadavia 7890, CABA'),
  ('Guardería Sala Arcoíris', 'Av. Corrientes 3210, CABA');
```

Convenciones: identificadores y valores persisting en inglés para columnas/códigos; los nombres propios de las filas semilla van en español porque son datos visibles. `pgcrypto` 1.3 ya está habilitado, así que `gen_random_uuid()` no requiere crear extensiones.

## Plan de implementación

1. **Migración DDL:** aplicar el SQL de creación con MCP `apply_migration`; copiar el timestamp devuelto al nombre del archivo local `supabase/migrations/<timestamp>_create_daycares.sql` con el mismo contenido. Verificación: `list_migrations` muestra 1 entrada.
2. **Migración de datos:** aplicar los 4 `INSERT` con MCP `apply_migration`; crear `supabase/migrations/<timestamp>_seed_daycares.sql` con el mismo timestamp devuelto. Verificación: `list_migrations` muestra 2 entradas.
3. **Verificación de esquema y seguridad:** consultar `information_schema.columns`, `pg_class.relrowsecurity`, `pg_policies` (`select policyname, cmd, qual, with_check from pg_policies where schemaname = 'public' and tablename = 'daycares' order by policyname`) y `has_table_privilege` para `anon`, `authenticated` y `service_role`. Verificación: 5 columnas, RLS activo, 4 policies con los nombres/comandos/expresiones indicados, `select` para `anon`/`authenticated` sin `insert`/`update`/`delete`, y CRUD para `service_role`.
4. **Verificación de datos:** `select name, address from public.daycares order by name`. Verificación: 4 filas con los valores acordados y `address` no nulo.
5. **Advisors y cierre:** ejecutar MCP `get_advisors` de seguridad y performance; corregir cualquier hallazgo relacionado con esta tabla antes de dar la spec por terminada. Sin pruebas de UI: no hay cambios en la app.

## Criterios de aceptación

- [ ] `public.daycares` existe con exactamente las columnas `id`, `name`, `address`, `created_at` y `updated_at`, con los tipos y defaults indicados.
- [ ] `id` es PK con default `gen_random_uuid()`; `name` es `NOT NULL`; `address` es nullable; `created_at` y `updated_at` son `NOT NULL` con default `now()`.
- [ ] `pg_class.relrowsecurity` es `true` para `public.daycares` y `pg_policies` devuelve exactamente 4 filas: `daycares_read` (SELECT, `qual = true`), `daycares_insert` (INSERT, `with_check = false`), `daycares_update` (UPDATE, `qual = false`) y `daycares_delete` (DELETE, `qual = false`).
- [ ] `anon` y `authenticated` tienen `SELECT` sobre `public.daycares` pero no `INSERT`, `UPDATE` ni `DELETE`; `service_role` tiene los cuatro privilegios.
- [ ] La tabla tiene exactamente 4 filas con los nombres Soles, Luna, Estrellas y Arcoíris y sus direcciones de CABA.
- [ ] `list_migrations` remoto devuelve 2 entradas y los dos archivos locales usan esos mismos timestamps.
- [ ] `get_advisors` no reporta hallazgos nuevos de seguridad o performance para esta tabla.
- [ ] No hay cambios en `app/`, `components/`, `package.json` ni en los mocks; la UI sigue usando datos mock.

## Decisiones

- **Sí:** MCP `apply_migration` + archivo local con el mismo timestamp. El CLI no está instalado, el remoto está vacío y no hay stack local que sincronizar.
- **Sí:** `updated_at` (convención general del documento) y `address text` nullable (pedido explícito), aunque la referencia no los listaba para `daycares`.
- **Sí:** RLS habilitado con 4 policies explícitas y grants por rol: `revoke all` + `grant select` a `anon`/`authenticated`, CRUD a `service_role`. Las policies se crean sin cláusula `TO` (aplican a `PUBLIC`, en la práctica solo a quienes tienen grants) y no sustituyen a los grants; `service_role` bypassea RLS. Como `users` no existe, todavía no hay predicado de pertenencia posible y la lectura con `USING (true)` expone todas las filas.
- **No:** policies por rol de dominio (`staff`/`parent`/`admin`): se trasladan a una spec posterior cuando exista `users.role`.
- **No:** trigger de `updated_at`: la columna se crea con default y la actualización automática se decide cuando haya escrituras reales.
- **Sí:** semilla en migración separada aplicada vía MCP, para que remoto y repo tengan las mismas 4 filas y el DDL quede limpio.
- **Sí:** nombres Soles/Luna/Estrellas/Arcoíris con direcciones de CABA (decisión del usuario).
- **No:** `unique` en `name`, `on conflict` ni IDs fijos: no fueron pedidos y limitarían migraciones futuras.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Los permisos por defecto del proyecto conceden CRUD a `anon` y `authenticated` en tablas nuevas. | `revoke all` explícito en la migración, `grant select` posterior y verificación con `has_table_privilege`. |
| El archivo local puede divergir del historial remoto si no se copia el timestamp de `apply_migration`. | Usar el timestamp devuelto por MCP y contrastar con `list_migrations`. |
| `apply_migration` muta el remoto directamente; un fallo parcial puede dejar historial sin DDL o viceversa. | No reintentar a ciegas: consultar `list_migrations` y el estado de la tabla antes de cada reintento. |
| `USING (true)` en `daycares_read` expone todas las filas a `anon` y `authenticated`, y `service_role` bypassea RLS (las policies `false` no lo limitan). | Aceptado mientras no exista `users`: la app sigue con mocks; las policies de pertenencia por `daycare_id`/rol se definen en una spec posterior. |

## Lo que **no** está en esta spec

- Tablas `users`, `rooms` ni foreign keys hacia `daycares`.
- Políticas RLS de pertenencia por guardería o por roles de dominio (más allá de las 4 policies de acceso básico), ni trigger de `updated_at`.
- Integración con Next.js, clientes Supabase ni variables de entorno.
- CLI local, Docker, esquema declarativo ni `supabase/seed.sql`.
- Cambios en la UI, los mocks ni las specs 01–06.

Cada uno de esos puntos, si se aborda, va en su propia spec.
