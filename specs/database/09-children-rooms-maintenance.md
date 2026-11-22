# SPEC 09 — Tablas `rooms` y `children`, seed de salas y mantenimiento real en `/kids`

> **Estado:** Implemented  
> **Depende de:** SPEC 07 (database), SPEC 08 (database), SPEC 02  
> **Fecha:** 2026-11-21  
> **Objetivo:** Crear el enum `child_status` y las tablas `rooms` y `children` con RLS baseline, sembrar 3 rooms vinculadas a "Guardería Sala Soles" y reemplazar los datos mock de `/kids` (SPEC 02) por consultas reales a Supabase, agregando la ruta `/kids/new` para crear niños.

## Alcance

**Incluye:**

- **Enum `child_status`:** `active`, `archived`. Se crea junto con la tabla `children`.
- **Tabla `public.rooms`:** `id uuid PK default gen_random_uuid()`, `daycare_id uuid NOT NULL` con FK a `public.daycares(id)`, `name text NOT NULL`, `created_at timestamptz NOT NULL DEFAULT now()`.
- **Tabla `public.children`:** `id uuid PK default gen_random_uuid()`, `room_id uuid NOT NULL` con FK a `public.rooms(id) ON DELETE RESTRICT`, `full_name text NOT NULL`, `birth_date date NOT NULL`, `enrolled_at date NOT NULL DEFAULT CURRENT_DATE`, `medical_notes text` (nullable), `allergy_tags text[] NOT NULL DEFAULT '{}'` (valores en inglés), `photo_consent boolean NOT NULL DEFAULT true`, `status public.child_status NOT NULL DEFAULT 'active'`, `created_at timestamptz NOT NULL DEFAULT now()`, `updated_at timestamptz NOT NULL DEFAULT now()`.
- **RLS baseline** (idéntico a SPEC 07 y 08): `enable row level security`, `revoke all` + `grant select` a `anon`/`authenticated`, CRUD a `service_role`, y cuatro policies `rooms_read`/`rooms_insert`/`rooms_update`/`rooms_delete` y `children_read`/`children_insert`/`children_update`/`children_delete` con los mismos permisos restrictivos (`using (true)` para lectura, `with check (false)` / `using (false)` para escritura via `anon`/`authenticated`; la escritura real va por `service_role` desde Server Actions).
- **Migraciones:** tres pares migración-MCP/archivo local, con el timestamp devuelto por MCP copiado al nombre del archivo: (1) DDL de enum + tablas + RLS, (2) DML de seed de las 3 rooms, (3) sin seed de children (queda vacía).
- **Filas semilla de rooms:** tres `INSERT` en `public.rooms` vinculados a `daycare_id = (select id from public.daycares where name = 'Guardería Sala Soles')` — la misma guardería donde está el staff user de SPEC 08. Nombres: `Soles`, `Lunas`, `Estrellas`. `children` queda vacía.
- **Data Access Layer:** nuevos módulos `lib/dal/rooms.ts` y `lib/dal/children.ts` (junto al `lib/dal.ts` existente de SPEC 07 auth), envueltos en `React.cache()` donde corresponda. Funciones: `getRooms()`, `getChildren()`, `getChildrenByRoom(roomId)`, `getChildById(id)`. Todas usan el `createClient` server de `lib/supabase/server.ts`.
- **Server Action de creación:** `app/actions/children.ts` con `createChildAction(prevState, formData)` que valida los campos, traduce las alergias de español a inglés, inserta via Supabase (usando el client de `service_role` o el server client según el patrón existente), y hace `revalidatePath('/kids')` + `redirect('/kids')`. En error devuelve `{ error: string }` con el mensaje.
- **Helper de alergias:** `lib/allergies.ts` con el mapa de traducción español → inglés (`maní`/`mani` → `peanut`, `lactosa` → `lactose`, `gluten` → `gluten`, `huevo` → `egg`, `pescado` → `fish`, `soja` → `soy`, `frutos secos` → `tree_nuts`) y función `parseAllergyInput(input: string): string[]`. También exporta `reverseAllergyLabel(tag: string): string` para mostrar en UI.
- **Reescritura de `/kids` (SPEC 02):** `app/kids/page.tsx` pasa de usar `kidsPageData` mock a consultar `getRooms()` + `getChildren()` desde Supabase. Agrupa niños por sala y muestra una sección por sala con el nombre y la cantidad. Empty state por sala cuando no hay niños. El buscador pasa a ser client-side funcional filtrando por nombre. Se conserva la composición visual de SPEC 02 (header, grid de cards, sidebar `activeItem="kids"`).
- **Nueva ruta `/kids/new`:** `app/kids/new/page.tsx` con el formulario del mockup `agregar-nino.dc.html` — campos: nombre completo, fecha de nacimiento, sala (select poblado desde `getRooms()`), alergias (input texto libre), notas médicas (textarea). Server Component que envuelve un `components/kids/AddChildForm.tsx` (`"use client"`) con `useActionState` para errores inline. Enlace "Cancelar" → `/kids`. Botón "Guardar" → invoca `createChildAction`.
- **Reescritura de `/kids/[id]` (SPEC 02):** `app/kids/[id]/page.tsx` pasa de usar `kidsPageData` mock a consultar `getChildById(id)` desde Supabase. `notFound()` para IDs inexistentes. Se elimina `generateStaticParams` (ahora los IDs son UUIDs dinámicos). Mismo layout visual de SPEC 02 (avatar, datos, alergias, detalles). El panel "PADRES VINCULADOS" muestra el mensaje "La vinculación de padres estará próximamente" y el botón "Vincular otro padre" permanece como placeholder visible pero no navega. El botón "Editar" permanece como placeholder visible pero no funcional. El botón "Resumen del día" permanece como placeholder.
- **Mapeo de IDs:** los IDs de niños pasan de ser slugs (`mateo-fernandez`) a UUIDs. La ruta `/kids/[id]` usa el UUID directamente. Se eliminan los datos mock de `app/_data/kids.ts` (o se marcan como obsoletos).
- **Etiquetado de edad:** se calcula en el momento del render a partir de `birth_date` (helper `calculateAge(birthDate: string): number` en `lib/allergies.ts` o nuevo `lib/age.ts`). No se persiste.

**Fuera de alcance (para futuras specs):**

- Edición de niños (el botón "Editar" queda placeholder como en SPEC 02).
- Eliminación / archivado de niños (el status `archived` existe en el enum pero no se usa en la UI).
- policies RLS de pertenencia por `daycare_id` o rol de dominio (`staff`/`parent`/`admin`): se trasladan a una spec posterior.
- Vinculación de padres (tabla `parent_children`, invitaciones, flujo de onboarding de familias).
- Resumen del día, publicaciones, feed real con datos de Supabase.
- CRUD de salas (las 3 rooms están fijas en el seed).
- Carga de fotos de perfil de niño.
- Trigger automático de `updated_at`.
- CLI local, Docker, esquema declarativo ni `supabase/seed.sql`.

## Modelo de datos

```sql
-- Migración 1: enum + tablas + RLS
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

-- RLS rooms (baseline SPEC 07/08)
alter table public.rooms enable row level security;

revoke all on table public.rooms from anon, authenticated;
grant select on table public.rooms to anon, authenticated;
grant select, insert, update, delete on table public.rooms to service_role;

create policy "rooms_read"   on public.rooms for select using (true);
create policy "rooms_insert" on public.rooms for insert with check (false);
create policy "rooms_update" on public.rooms for update using (false);
create policy "rooms_delete" on public.rooms for delete using (false);

-- RLS children (baseline SPEC 07/08)
alter table public.children enable row level security;

revoke all on table public.children from anon, authenticated;
grant select on table public.children to anon, authenticated;
grant select, insert, update, delete on table public.children to service_role;

create policy "children_read"   on public.children for select using (true);
create policy "children_insert" on public.children for insert with check (false);
create policy "children_update" on public.children for update using (false);
create policy "children_delete" on public.children for delete using (false);
```

```sql
-- Migración 2: seed de 3 rooms vinculadas a "Guardería Sala Soles"
insert into public.rooms (daycare_id, name)
values
  ((select id from public.daycares where name = 'Guardería Sala Soles'), 'Soles'),
  ((select id from public.daycares where name = 'Guardería Sala Soles'), 'Lunas'),
  ((select id from public.daycares where name = 'Guardería Sala Soles'), 'Estrellas');
```

Convenciones: identificadores y valores persistidos en inglés (`peanut`, `lactose`, etc. en `allergy_tags`); etiquetas visibles traducidas en la UI (español). `pgcrypto` 1.3 ya está habilitado (SPEC 07), así que `gen_random_uuid()` no requiere crear extensiones.

### Data Access Layer

```ts
// lib/dal/rooms.ts
import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getRooms = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('rooms')
    .select('id, name, created_at')
    .order('name')
  return data ?? []
})
```

```ts
// lib/dal/children.ts
import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getChildren = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('children')
    .select('id, full_name, birth_date, enrolled_at, allergy_tags, medical_notes, room_id, status')
    .eq('status', 'active')
    .order('full_name')
  return data ?? []
})

export const getChildById = cache(async (id: string) => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('children')
    .select('id, full_name, birth_date, enrolled_at, allergy_tags, medical_notes, room_id, status, rooms(name)')
    .eq('id', id)
    .single()
  return data
})
```

```ts
// lib/allergies.ts
const ALLERGY_ES_TO_EN: Record<string, string> = {
  'maní': 'peanut',
  'mani': 'peanut',
  'lactosa': 'lactose',
  'gluten': 'gluten',
  'huevo': 'egg',
  'pescado': 'fish',
  'soja': 'soy',
  'frutos secos': 'tree_nuts',
}

const ALLERGY_EN_TO_ES: Record<string, string> = {
  peanut: 'Maní',
  lactose: 'Lactosa',
  gluten: 'Gluten',
  egg: 'Huevo',
  fish: 'Pescado',
  soy: 'Soja',
  tree_nuts: 'Frutos secos',
}

export function parseAllergyInput(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .map((s) => ALLERGY_ES_TO_EN[s])
    .filter((tag): tag is string => Boolean(tag))
}

export function reverseAllergyLabel(tag: string): string {
  return ALLERGY_EN_TO_ES[tag] ?? tag
}
```

```ts
// lib/age.ts
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function ageLabel(birthDate: string): string {
  const age = calculateAge(birthDate)
  return `${age} ${age === 1 ? 'año' : 'años'}`
}
```

### Server Action

```ts
// app/actions/children.ts
'use server'
import { createClient } from '@/lib/supabase/server'
import { parseAllergyInput } from '@/lib/allergies'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createChildAction(
  prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const fullName = String(formData.get('full_name') ?? '').trim()
  const birthDate = String(formData.get('birth_date') ?? '').trim()
  const roomId = String(formData.get('room_id') ?? '').trim()
  const allergiesRaw = String(formData.get('allergies') ?? '').trim()
  const medicalNotes = String(formData.get('medical_notes') ?? '').trim()

  if (!fullName || !birthDate || !roomId) {
    return { error: 'Completá nombre, fecha de nacimiento y sala.' }
  }

  const allergyTags = parseAllergyInput(allergiesRaw)

  const supabase = await createClient()
  const { error } = await supabase.from('children').insert({
    full_name: fullName,
    birth_date: birthDate,
    room_id: roomId,
    allergy_tags: allergyTags,
    medical_notes: medicalNotes || null,
  })

  if (error) {
    return { error: 'No se pudo crear el niño. Intentá de nuevo.' }
  }

  revalidatePath('/kids')
  redirect('/kids')
}
```

## Plan de implementación

1. **Migración DDL:** aplicar enum `child_status` + tablas `rooms`/`children` + RLS con MCP `apply_migration`; crear `supabase/migrations/<timestamp>_create_rooms_and_children.sql` con el mismo contenido y timestamp. Verificación: `list_migrations` suma 2 entradas (pasa de 5 a 7).
2. **Migración de seed:** aplicar los 3 `INSERT` en `rooms` con MCP `apply_migration`; crear `supabase/migrations/<timestamp>_seed_rooms.sql`. Verificación: `list_migrations` = 8 entradas; `select name from rooms order by name` devuelve `Estrellas`, `Lunas`, `Soles`; `select count(*) from children` devuelve 0.
3. **Verificación de esquema y seguridad:** `pg_enum` para `child_status`; `information_schema.columns` para las columnas de `rooms` (4) y `children` (11); FKs; `pg_class.relrowsecurity`; `pg_policies` (8 policies en total: 4 rooms + 4 children); `has_table_privilege` para `anon`, `authenticated` y `service_role` sobre ambas tablas.
4. **DAL de rooms y children:** crear `lib/dal/rooms.ts` y `lib/dal/children.ts` con las funciones cacheadas. Crear `lib/allergies.ts` y `lib/age.ts`. Verificación: `npx tsc --noEmit` sin errores.
5. **Server Action de creación:** crear `app/actions/children.ts` con `createChildAction`. Verificación: `npx tsc --noEmit` sin errores.
6. **Reescritura de `/kids`:** reemplazar `app/kids/page.tsx` para consultar `getRooms()` + `getChildren()` y agrupar por sala. Cada sala se muestra como sección con nombre + contador. Se conservan `KidsHeader`, `KidsSearch` (ahora con filtrado funcional client-side), `KidCard` (adaptado para UUIDs y datos reales), y el sidebar con `activeItem="kids"`. Empty state cuando no hay niños en una sala.
7. **Nueva ruta `/kids/new`:** crear `app/kids/new/page.tsx` (Server Component) que carga las rooms y renderiza el formulario. Crear `components/kids/AddChildForm.tsx` (`"use client"`) con `useActionState`. Campos: nombre completo, fecha de nacimiento, sala (select), alergias (input texto), notas médicas (textarea). Enlace "Cancelar" → `/kids`. Verificación: navegar a `/kids/new`, crear un niño, verificar que redirige a `/kids` y el niño aparece bajo la sala correcta.
8. **Reescritura de `/kids/[id]`:** reemplazar `app/kids/[id]/page.tsx` para consultar `getChildById(id)`. Eliminar `generateStaticParams` (UUIDs dinámicos). Mismo layout visual de SPEC 02. Panel "PADRES VINCULADOS" con el mensaje "La vinculación de padres estará próximamente" y botón "Vincular otro padre" como placeholder visible. Botones "Editar" y "Resumen del día" permanecen como placeholders. Verificación: navegar a un perfil, verificar datos reales.
9. **Limpieza de mocks:** eliminar o vaciar `app/_data/kids.ts` (los 8 niños mock ya no se usan). Si otros componentes lo referencian, migrarlos también. Verificación: `grep -r "kidsPageData" app/ components/` no devuelve resultados.
10. **Verificación final y advisors:** `npx tsc --noEmit` sin errores; `npm run dev` + navegación `/kids` → `/kids/new` → crear niño → `/kids` (aparece) → `/kids/[uuid]` (perfil). Ejecutar MCP `get_advisors` de seguridad y performance; corregir hallazgos relacionados con las tablas nuevas. Capturas en `.playwright-mcp/`.

## Criterios de aceptación

- [ ] Existe `public.child_status` con valores `active` y `archived`.
- [ ] `public.rooms` tiene exactamente las columnas `id`, `daycare_id`, `name`, `created_at`, con FK a `daycares`, tipos y defaults indicados.
- [ ] `public.children` tiene exactamente las 11 columnas indicadas, con FK a `rooms` (`ON DELETE RESTRICT`), defaults y nulabilidad indicados.
- [ ] `relrowsecurity` es `true` para ambas tablas; `pg_policies` devuelve 8 filas (4 rooms + 4 children) con los nombres y expresiones indicados.
- [ ] `anon` y `authenticated` tienen `SELECT` pero no `INSERT`/`UPDATE`/`DELETE` en ambas tablas; `service_role` tiene los cuatro privilegios.
- [ ] `rooms` tiene exactamente 3 filas (`Soles`, `Lunas`, `Estrellas`) vinculadas a "Guardería Sala Soles".
- [ ] `children` está vacía tras el seed.
- [ ] `list_migrations` devuelve 8 entradas y los dos archivos locales nuevos usan esos mismos timestamps.
- [ ] `/kids` carga sin errores y muestra las 3 salas como encabezados con contador (0 cuando no hay niños).
- [ ] El buscador en `/kids` filtra niños por nombre en tiempo real.
- [ ] El botón "Agregar niño" en `/kids` navega a `/kids/new`.
- [ ] `/kids/new` muestra el formulario con campos: nombre, fecha de nacimiento, sala (select con las 3 rooms), alergias, notas médicas.
- [ ] Al enviar el formulario con datos válidos, el niño se crea en Supabase y redirige a `/kids`.
- [ ] Las alergias ingresadas en español se persisten en inglés en `allergy_tags`.
- [ ] `enrolled_at` se setea automáticamente a la fecha actual sin intervención del usuario.
- [ ] El niño creado aparece en `/kids` bajo la sala correcta, con avatar (inicial), nombre y edad calculada.
- [ ] `/kids/[uuid]` muestra el perfil del niño con datos reales: nombre, edad, sala, fecha de nacimiento, fecha de ingreso.
- [ ] El perfil muestra el bloque de alergias/notas médicas solo si el niño tiene esos datos.
- [ ] El perfil muestra el panel "PADRES VINCULADOS" con el mensaje "La vinculación de padres estará próximamente".
- [ ] Los botones "Editar", "Resumen del día" y "Vincular otro padre" permanecen como placeholders visibles.
- [ ] `generateStaticParams` fue eliminado de `/kids/[id]` (los IDs ahora son UUIDs dinámicos).
- [ ] Los datos mock de `app/_data/kids.ts` fueron eliminados o reemplazados.
- [ ] `npx tsc --noEmit` pasa sin errores.
- [ ] `get_advisors` no reporta hallazgos nuevos de seguridad o performance para estas tablas.

## Decisiones

- **Sí:** MCP `apply_migration` + archivo local con el mismo timestamp, consistente con SPEC 07 y 08.
- **Sí:** RLS baseline copiado de SPEC 07/08 para mantener coherencia; las policies de pertenencia se hacen cuando exista consumo real diferenciado por rol.
- **Sí:** las 3 rooms se vinculan a "Guardería Sala Soles" (`select id from daycares where name = ...`), que es donde ya está el staff user de SPEC 08.
- **Sí:** las migraciones se separan en DDL y DML, igual que SPEC 07.
- **Sí:** `allergy_tags` en inglés persistido; la UI traduce con `reverseAllergyLabel()`. El helper descarta alergias no reconocidas.
- **Sí:** `enrolled_at` con default `CURRENT_DATE` en la BD; el Server Action no lo envía.
- **Sí:** los IDs pasan de slugs a UUIDs; `generateStaticParams` se elimina.
- **Sí:** reescritura completa de `/kids` y `/kids/[id]` para usar datos reales; los mocks de `app/_data/kids.ts` se eliminan.
- **Sí:** servidor escribe niños via Supabase server client (que usa la publishable key + cookies de sesión). Si el patrón requiere `service_role` para escrituras, se ajusta en la implementación; la decisión se toma al conectar con el patrón existente de SPEC 07.
- **No:** edición de niños (button placeholder). Se traslada a una spec posterior.
- **No:** eliminación / archivado. El enum `child_status` existe pero no se usa en la UI.
- **No:** policies por `daycare_id` o rol de dominio; se trasladan a una spec posterior.
- **No:** CRUD de salas; las 3 rooms están fijas en el seed.
- **No:** trigger automático de `updated_at`; se traslada a una spec posterior.
- **No:** CLI local, Docker, esquema declarativo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El server client de Supabase usa la publishable key y podría no tener permisos de escritura. | Verificar el patrón de SPEC 07; si es necesario, usar un client con `service_role` en el Server Action (sin exponerlo al browser). |
| `apply_migration` muta el remoto directamente; un fallo parcial puede dejar historial sin DDL. | Consultar `list_migrations` y el estado del objeto antes de reintentar, igual que SPEC 07/08. |
| Los UUIDs como IDs rompen links existentes a `/kids/mateo-fernandez` y otros slugs de SPEC 02. | Intencional: los mocks se eliminan. Los links nuevos usan UUIDs. No hay bookmarks que preservar en esta etapa. |
| El cálculo de edad puede mostrar valores incorrectos según zona horaria. | Usar `new Date(birthDate)` que parsea como UTC a medianoche; el cálculo de años es robusto para el uso previsto. |
| `USING (true)` en lectura expone todas las filas a `anon`/`authenticated`. | Aceptado mientras no haya diferenciación por `daycare_id`; las policies de pertenencia se definen en una spec posterior. |
| La tabla `children` no tiene índice por `room_id`; las consultas agrupadas por sala pueden ser lentas con muchos datos. | Aceptado para el volumen esperado (< 100 niños). Si crece, agregar índice en una spec posterior. |

## Lo que **no** está en esta spec

- Edición de niños (el botón "Editar" es placeholder).
- Eliminación / archivado de niños.
- Policies RLS por propiedad/`daycare_id`/rol ni trigger de `updated_at`.
- Vinculación de padres (tabla `parent_children`, invitaciones).
- Resumen del día, publicaciones ni feed real con Supabase.
- CRUD de salas (las 3 rooms están fijas en el seed).
- Carga de fotos de perfil.
- CLI local, Docker, esquema declarativo ni `supabase/seed.sql`.

Cada uno de esos puntos, si se aborda, va en su propia spec.
