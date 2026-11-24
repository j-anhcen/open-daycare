# SPEC 10 — Flujo real de "Vincular padre": tablas `invitations` + `parent_children`, email con Resend y lista desde Supabase

> **Estado:** Implemented  
> **Depende de:** SPEC 05 (modal), SPEC 07 (auth), SPEC 08 (database — users), SPEC 09 (database — children)  
> **Fecha:** 2026-11-23  
> **Objetivo:** Crear los enums `relationship_type` e `invitation_status`, las tablas `invitations` y `parent_children` con RLS, reemplazar el envío mock del modal "Vincular padre" por un server action que genera un código de 5 caracteres, persiste la invitación y envía un correo de confirmación con Resend (sandbox), y reemplazar la lista local de padres por una consulta real a Supabase.

## Alcance

**Incluye:**

- **Enums nuevos en la DB:** `public.relationship_type` (`father`, `mother`, `tutor`) y `public.invitation_status` (`pending`, `accepted`, `expired`, `cancelled`). Los valores persistidos coinciden con los del tipo UI (`mother`/`father`/`tutor`), así que no hace falta mapeo de conversión. La UI mapea a español (`father` → `Padre`, `mother` → `Madre`, `tutor` → `Tutor/a`).
- **Tabla `public.invitations`:** según el reference schema (`07-DB-Schema`) con el ajuste de `tutor`: `id uuid PK default gen_random_uuid()`, `child_id uuid NOT NULL` FK a `public.children(id) ON DELETE CASCADE`, `invited_by uuid` nullable FK a `public.users(id) ON DELETE SET NULL`, `full_name text NOT NULL`, `email text NOT NULL`, `relationship public.relationship_type NOT NULL`, `code text NOT NULL UNIQUE`, `status public.invitation_status NOT NULL DEFAULT 'pending'`, `expires_at timestamptz NOT NULL`, `accepted_at timestamptz` nullable, `created_at timestamptz NOT NULL DEFAULT now()`. Índice único compuesto `(child_id, email)` para evitar invitar dos veces al mismo email por niño.
- **Tabla `public.parent_children`:** tabla intermedia padre ↔ niño: `id uuid PK default gen_random_uuid()`, `parent_id uuid NOT NULL` FK a `public.users(id) ON DELETE CASCADE`, `child_id uuid NOT NULL` FK a `public.children(id) ON DELETE CASCADE`, `relationship public.relationship_type NOT NULL`, `created_at timestamptz NOT NULL DEFAULT now()`. Constraint `UNIQUE (parent_id, child_id)`. **Queda vacía en este spec** — las filas se crean cuando un padre acepta una invitación (futuro spec).
- **RLS baseline** para ambas tablas, idéntico a SPEC 07/08/09: `enable row level security`, `revoke all` + `grant select` a `anon`/`authenticated`, CRUD a `service_role`, y cuatro policies por tabla (`invitations_read` / `invitations_insert` / `invitations_update` / `invitations_delete`, y lo mismo para `parent_children`). Lectura con `USING (true)`, escritura `WITH CHECK (false)` / `USING (false)` — la escritura real va por `service_role` desde Server Actions.
- **Migraciones:** un archivo de migración aplicado con MCP `apply_migration` y replicado localmente con el mismo timestamp: DDL de enums + tablas + RLS. Sin DML (queda vacío).
- **Paquete `resend`:** `npm install resend`. Versión reciente fijada en el lockfile.
- **Client de Resend:** `lib/resend.ts` (`'server-only'`) que instancia `new Resend(process.env.RESEND_API_KEY)`. La API key ya existe en `.env`.
- **Variables de entorno nuevas:** `INVITATION_URL` (sin prefijo `NEXT_PUBLIC_`, solo server) en `.env.local`.
- **Parentesco unificado:** el tipo `ParentRelationship` en `lib/link-parent.ts` cambia de `"mom" | "dad" | "tutor"` a `"mother" | "father" | "tutor"`. Las opciones de la UI muestran `Mamá` / `Papá` / `Tutor/a`. Los valores coinciden con el enum de la DB, así que no se necesita mapeo de conversión. El helper `relationshipLabel(rel: ParentRelationship): string` devuelve el label en español (`Madre`/`Padre`/`Tutor`).
- **Server Action de envío:** `app/actions/invitations.ts` con `sendInvitationAction(childId, childName, prevState, formData)` (patrón `useActionState`, como `acceptInvitationAction`):
  1. Verifica sesión con `verifySession()` (DAL de SPEC 07) para obtener `userId` del staff.
  2. Valida nombre y email con `isValidEmail` de `lib/link-parent.ts` (fuente única compartida con el modal).
  3. Genera código de 5 caracteres alfanuméricos en mayúsculas con alfabeto sin ambiguos (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`).
  4. Inserta en `invitations` con `expires_at = now() + 7 days`, `invited_by = userId`, vía `createServiceClient()`.
  5. Envía correo con Resend desde `onboarding@resend.dev` (sandbox) con el link `${INVITATION_URL}?code=<code>` y el código en el cuerpo.
  6. Si Resend falla, borra la fila insertada y devuelve error (todo o nada).
  7. Devuelve `{ success: true }` o `{ error: string }`.
- **Lectura de invitaciones:** `lib/dal/invitations.ts` con `getInvitationsByChildId(childId)` envuelta en `React.cache()`, usando el server client, que devuelve las invitaciones del niño ordenadas por `created_at DESC`.
- **Reescritura de `KidProfileAside.tsx`:** deja de tener estado local `linkedParents`. Ahora recibe `invitations: InvitationDto[]` como prop desde el server component, y deriva la lista de filas a renderizar (con `status`, `statusLabel`, `roleLabel`, `initial`, `avatarColor`) a partir de ese array. El `onSubmit` del modal llama al server action y, al éxito, la lista se refresca vía `revalidatePath`.
- **Reescritura de `/kids/[id]/page.tsx`:** consulta `getChildById(childId)` (SPEC 09) + `getInvitationsByChildId(childId)` y se las pasa a `KidProfileAside` como prop. El panel "PADRES VINCULADOS" muestra las invitaciones reales (con estado PENDIENTE o ACTIVA según `status` de la DB).
- **Reescritura de `LinkParentModal.tsx`:**
  - Se elimina la caja amarilla del código de invitación (el código ya no se muestra en la UI — solo viaja por email).
  - El `onSubmit` dispara el server action en lugar de la derivación local.
  - El form usa `<form action={formAction}>` + `useActionState`; `onSubmit` solo actúa como guard de validación client con foco al campo con error (patrón de `ActivationForm`).
  - `isPending` de `useActionState` deshabilita el CTA, muestra el spinner y bloquea el cierre del modal mientras envía; `error` del server state muestra mensaje inline debajo del CTA con los tokens `--color-input-error-text` existentes; `success` cierra el modal vía efecto (patrón de `AddChildForm`). El form se remonta en cada cierre (`key`), así cada apertura arranca limpia (patrón de `AddKidModal`).
  - La validación client se mantiene (nombre/email obligatorios, formato email) como feedback rápido; la validación server es la fuente de verdad.
  - Se eliminan las props `onSubmit` del padre; el modal ahora invoca el server action internamente.
- **Email de invitación (Resend sandbox):**
  - `from`: `"OpenDaycare <onboarding@resend.dev>"` (dominio sandbox de Resend, no requiere verificación).
  - `to`: el email ingresado en el form.
  - `subject`: `"Invitación a OpenDaycare"`.
  - `html`: plantilla simple con saludo por nombre, texto explicando que fue invitado a vincularse con `{childName}`, link `${INVITATION_URL}?code=<code>` como botón, código en texto plano como fallback, aviso de vencimiento a 7 días.
- **Helper de generación de código:** `lib/invitation-code.ts` con `generateInvitationCode(): string`. Usa `crypto.getRandomValues` con el alfabeto acordado.
- **Tipos DTO:** `lib/invitations.ts` exporta `InvitationDto = { id, fullName, email, relationship, code, status, expiresAt, createdAt }`. El helper `invitationsToParentRows(invitations)` deriva los datos de fila para `LinkedParentsCard` (initial, roleLabel en español, statusLabel, avatarColor, status).

**Fuera de alcance (para futuras specs):**

- Ruta `/accept-invitation` que valida el código y registra al padre (solo se define la URL como variable; la ruta irá en su propio spec).
- Flujo de aceptación: cambio de status `pending` → `accepted`, creación de fila en `parent_children`, alta en Supabase Auth.
- Reenvío de invitación, cancelación, expiración automática (cron o job).
- Policies RLS de pertenencia por `daycare_id` o por rol de dominio.
- Trigger automático de `updated_at`.
- Edición/eliminación de invitaciones desde la UI.
- Email de bienvenida tras aceptación, notificaciones push, feed familiar.
- CLI local, Docker, esquema declarativo.

## Modelo de datos

```sql
-- supabase/migrations/<timestamp>_create_invitations_and_parent_children.sql
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

-- RLS invitations (baseline SPEC 07/08/09)
alter table public.invitations enable row level security;

revoke all on table public.invitations from anon, authenticated;
grant select on table public.invitations to anon, authenticated;
grant select, insert, update, delete on table public.invitations to service_role;

create policy "invitations_read"   on public.invitations for select using (true);
create policy "invitations_insert" on public.invitations for insert with check (false);
create policy "invitations_update" on public.invitations for update using (false);
create policy "invitations_delete" on public.invitations for delete using (false);

-- RLS parent_children (baseline)
alter table public.parent_children enable row level security;

revoke all on table public.parent_children from anon, authenticated;
grant select on table public.parent_children to anon, authenticated;
grant select, insert, update, delete on table public.parent_children to service_role;

create policy "parent_children_read"   on public.parent_children for select using (true);
create policy "parent_children_insert" on public.parent_children for insert with check (false);
create policy "parent_children_update" on public.parent_children for update using (false);
create policy "parent_children_delete" on public.parent_children for delete using (false);
```

Convenciones: identificadores en inglés; enums `relationship_type` (`father`/`mother`/`tutor`) coinciden con el tipo UI, sin mapeo de conversión; `gen_random_uuid()` usa pgcrypto (habilitado en SPEC 07); `invited_by` nullable con `ON DELETE SET NULL` para conservar la fila de invitación si el staff se borra.

### Parentesco (UI ↔ DB sin mapeo)

```ts
// lib/link-parent.ts
export type ParentRelationship = 'mother' | 'father' | 'tutor';

export const RELATIONSHIP_UI_OPTIONS: { value: ParentRelationship; label: string }[] = [
  { value: 'mother', label: 'Mamá' },
  { value: 'father', label: 'Papá' },
  { value: 'tutor',  label: 'Tutor/a' },
];

export function relationshipLabel(rel: ParentRelationship): string {
  return rel === 'mother' ? 'Madre' : rel === 'father' ? 'Padre' : 'Tutor';
}
```

### Server Action

```ts
// app/actions/invitations.ts
'use server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { verifySession } from '@/lib/dal'
import { createServiceClient } from '@/lib/supabase/service'
import { generateInvitationCode } from '@/lib/invitation-code'
import type { LinkParentFormValues } from '@/lib/link-parent'

export type SendInvitationResult = { error?: string; success?: boolean }

export async function sendInvitationAction(
  childId: string,
  childName: string,
  values: LinkParentFormValues,
): Promise<SendInvitationResult> {
  const session = await verifySession()
  const name = values.name.trim()
  const email = values.email.trim()
  if (!name || !email) return { error: 'Completá nombre y correo.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Correo inválido.' }

  const code = generateInvitationCode()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const supabase = createServiceClient()

  const { error: insertError } = await supabase.from('invitations').insert({
    child_id: childId,
    invited_by: session.userId,
    full_name: name,
    email,
    relationship: values.relationship, // mother/father/tutor — mismo valor que el enum
    code,
    expires_at: expiresAt,
  })
  if (insertError) return { error: 'No se pudo crear la invitación.' }

  const invitationUrl = process.env.INVITATION_URL
  if (!invitationUrl) {
    await supabase.from('invitations').delete().eq('code', code)
    return { error: 'Configuración faltante.' }
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const link = `${invitationUrl}?code=${code}`
  const { error: emailError } = await resend.emails.send({
    from: 'OpenDaycare <onboarding@resend.dev>',
    to: email,
    subject: 'Invitación a OpenDaycare',
    html: `
      <p>Hola ${name},</p>
      <p>Te invitaron a vincularte con ${childName} en OpenDaycare.</p>
      <p><a href="${link}">Activar cuenta</a></p>
      <p>Tu código: <strong>${code}</strong></p>
      <p>Este enlace vence en 7 días.</p>
    `,
  })

  if (emailError) {
    await supabase.from('invitations').delete().eq('code', code)
    return { error: 'No se pudo enviar el correo. Intentá de nuevo.' }
  }

  revalidatePath(`/kids/${childId}`)
  return { success: true }
}
```

### DAL de invitaciones

```ts
// lib/dal/invitations.ts
import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { InvitationDto } from '@/lib/invitations'

export const getInvitationsByChildId = cache(async (childId: string): Promise<InvitationDto[]> => {
  const supabase = await createClient()
  const { data } = await supabase
    .from('invitations')
    .select('id, full_name, email, relationship, code, status, expires_at, created_at')
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
  return (data ?? []) as InvitationDto[]
})
```

### Generación de código

```ts
// lib/invitation-code.ts
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin I, O, 0, 1
const CODE_LENGTH = 5

export function generateInvitationCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}
```

### Reescritura de `page.tsx`

```ts
// app/kids/[id]/page.tsx (extracto)
import { getChildById } from '@/lib/dal/children'
import { getInvitationsByChildId } from '@/lib/dal/invitations'

export default async function KidProfilePage({ params }) {
  const { id } = await params
  const child = await getChildById(id)
  if (!child) notFound()
  const invitations = await getInvitationsByChildId(id)
  return (
    <>
      {/* ... header, profile ... */}
      <KidProfileAside childName={child.full_name} childId={child.id} invitations={invitations} />
    </>
  )
}
```

### Reescritura de `KidProfileAside`

```ts
// components/kids/KidProfileAside.tsx
'use client'
import { useState } from 'react'
import { LinkParentModal } from '@/components/kids/LinkParentModal'
import { LinkedParentsCard } from '@/components/kids/LinkedParentsCard'
import { invitationsToParentRows, type InvitationDto } from '@/lib/invitations'

export function KidProfileAside({ childName, childId, invitations }: {
  childName: string
  childId: string
  invitations: InvitationDto[]
}) {
  const [isLinkParentOpen, setIsLinkParentOpen] = useState(false)
  const parents = invitationsToParentRows(invitations)

  return (
    <>
      {/* ... resumen del día, etc. */}
      <LinkedParentsCard
        parents={parents}
        onLinkParent={() => setIsLinkParentOpen(true)}
      />
      <LinkParentModal
        isOpen={isLinkParentOpen}
        childName={childName}
        childId={childId}
        onClose={() => setIsLinkParentOpen(false)}
      />
    </>
  )
}
```

## Plan de implementación

1. **Migración DDL.** Aplicar enums + tablas + RLS con MCP `apply_migration`; replicar en `supabase/migrations/<timestamp>_create_invitations_and_parent_children.sql` con el mismo timestamp. Verificación: `list_migrations` suma 1 entrada; `information_schema.columns` muestra 11 columnas en `invitations` y 5 en `parent_children`; `pg_policies` reporta 8 policies nuevas.
2. **Verificación de esquema y seguridad.** `pg_enum` para los dos enums nuevos; FKs; `pg_class.relrowsecurity`; `has_table_privilege` para `anon`, `authenticated` y `service_role` sobre ambas tablas. Verificación: RLS activo, 4 policies por tabla con las expresiones correctas, grants alineados con SPEC 07/08/09.
3. **Paquete Resend + variables.** `npm install resend`. Agregar `INVITATION_URL=http://localhost:3000/accept-invitation` en `.env.local`. Verificación: `npm run dev` compila, `resend` aparece en `package.json`.
4. **Helpers puros.** Crear `lib/invitation-code.ts` (generador). Actualizar `lib/link-parent.ts`: `ParentRelationship` cambia a `'mother' | 'father' | 'tutor'`; `linkParentModalData.relationshipOptions` usa los nuevos valores y labels. Crear `lib/invitations.ts` con `InvitationDto`, `relationshipLabel`, `invitationsToParentRows` (derivación a las filas de `LinkedParentsCard`). Verificación: `npx tsc --noEmit`.
5. **Client de Resend + DAL.** Crear `lib/resend.ts` (`'server-only'`, instancia de `Resend`). Crear `lib/dal/invitations.ts` con `getInvitationsByChildId`. Verificación: `npx tsc --noEmit`.
6. **Server Action.** Crear `app/actions/invitations.ts` con `sendInvitationAction`. Verificación: `npx tsc --noEmit`.
7. **Reescritura de `LinkParentModal`.** Eliminar la caja amarilla del código; el componente ahora invoca `sendInvitationAction` internamente en lugar de recibir `onSubmit` del padre; nuevos estados `submitting`/`error`; mensaje de error inline debajo del CTA si falla; CTA deshabilitado mientras envía. Verificación: `npx tsc --noEmit`.
8. **Reescritura de `KidProfileAside` y `/kids/[id]/page.tsx`.** Server component consulta invitaciones; client component recibe el array como prop y renderiza las filas; `onSubmit` exitoso del modal dispara `revalidatePath`. Verificación: navegación manual — abrir perfil, abrir modal, enviar válido, ver la nueva fila con estado PENDIENTE proviniente de la DB; recargar, la fila persiste.
9. **Verificación de envío de email.** Desde el modal, enviar una invitación a un email propio del sandbox de Resend. Confirmar recepción del correo con el link y el código. Verificación: correo recibido con `?code=XXXXX`, código coincide con el de la fila en `invitations`.
10. **Advisors y cierre.** Ejecutar MCP `get_advisors` de seguridad y performance; corregir hallazgos relacionados con las tablas nuevas. `npx tsc --noEmit` sin errores.

## Criterios de aceptación

- [ ] Existe `public.relationship_type` con valores `father`, `mother`, `tutor`.
- [ ] Existe `public.invitation_status` con valores `pending`, `accepted`, `expired`, `cancelled`.
- [ ] `public.invitations` tiene las 11 columnas indicadas, con FK a `children` (`ON DELETE CASCADE`), FK a `users` (`invited_by` nullable, `ON DELETE SET NULL`), unique en `code` y unique compuesto en `(child_id, email)`.
- [ ] `public.parent_children` tiene las 5 columnas indicadas, con FK a `users` y `children` (`ON DELETE CASCADE`), unique compuesto `(parent_id, child_id)`.
- [ ] `relrowsecurity` es `true` para ambas tablas; `pg_policies` devuelve 8 filas nuevas con los nombres y expresiones indicados.
- [ ] `anon` y `authenticated` tienen `SELECT` pero no `INSERT`/`UPDATE`/`DELETE` en ambas tablas; `service_role` tiene los cuatro privilegios.
- [ ] `invitations` y `parent_children` están vacías tras la migración.
- [ ] `list_migrations` remoto refleja el archivo nuevo y el local comparte timestamp.
- [ ] `resend` está instalado y listado en `package.json` con versión fija en el lockfile.
- [ ] `INVITATION_URL` existe en `.env.local` sin prefijo `NEXT_PUBLIC_`.
- [ ] `lib/invitation-code.ts` genera códigos de 5 caracteres usando solo el alfabeto acordado (`ABCDEFGHJKLMNPQRSTUVWXYZ23456789`); 100 ejecuciones consecutivas producen 100 códigos válidos.
- [ ] El modal ya no muestra la caja amarilla del código.
- [ ] Al abrir el modal y enviar con campos vacíos, se muestran los errores inline (igual que SPEC 05) y no se dispara el server action.
- [ ] Al enviar válido: el form pasa a estado `submitting` (CTA deshabilitado), el server action inserta en `invitations`, envía el correo y hace `revalidatePath`.
- [ ] Al cerrar el modal tras envío exitoso, la lista "PADRES VINCULADOS" muestra la nueva fila con estado PENDIENTE, nombre, parentesco en español (`Mamá`/`Papá`/`Tutor/a`) y el label "invitación enviada", proveniente de la DB.
- [ ] Recargar la página mantiene la fila visible (viene de Supabase, no de memoria).
- [ ] Si Resend falla, el server action elimina la fila insertada y devuelve error; el modal muestra el mensaje inline y no aparece la fila en la lista.
- [ ] El correo recibido desde el sandbox tiene `from: "OpenDaycare <onboarding@resend.dev>"`, asunto `"Invitación a OpenDaycare"`, contiene el link `${INVITATION_URL}?code=<code>` y el código en el cuerpo.
- [ ] El código del correo coincide con el valor de `invitations.code` para esa fila.
- [ ] `expires_at` de la fila es exactamente `now() + 7 días` (tolerancia de segundos).
- [ ] `invited_by` guarda el UUID del usuario staff autenticado.
- [ ] Intentar enviar dos invitaciones con el mismo email para el mismo niño devuelve error del server action (violación de unique `(child_id, email)`).
- [ ] El mismo email para niños distintos produce dos invitaciones independientes.
- [ ] Los valores de parentesco se persisten directamente (`mother`/`father`/`tutor`) sin conversión intermedia.
- [ ] `npx tsc --noEmit` pasa sin errores.
- [ ] `get_advisors` no reporta hallazgos nuevos para estas tablas.

## Decisiones

- **Sí:** tabla `invitations` y `parent_children` en este spec, aunque `parent_children` quede vacía. Evita un spec intermedio solo de DDL y deja el modelo completo para el spec de aceptación.
- **Sí:** enum `relationship_type` con `father`/`mother`/`tutor` (no `guardian`), decisión del usuario. Los valores coinciden con el tipo UI, lo que elimina la necesidad de función de mapeo.
- **Sí:** código generado solo al submit, nunca mostrado en la UI. La caja amarilla del mockup se elimina — el código viaja solo por email.
- **Sí:** Resend con dominio sandbox `onboarding@resend.dev`. No requiere verificación de dominio para pruebas.
- **Sí:** `INVITATION_URL` sin prefijo `NEXT_PUBLIC_` porque solo el server la usa para construir el link.
- **Sí:** `invited_by` nullable con `ON DELETE SET NULL` para conservar la fila si el staff se borra.
- **Sí:** unique compuesto `(child_id, email)` para evitar invitar dos veces al mismo email por niño.
- **Sí:** server action con todo-o-nada — si Resend falla, se borra la fila antes de devolver error. Simple, sin estados inconsistentes.
- **Sí:** ruta futura de aceptación en inglés (`/accept-invitation`). El spec solo define la variable; la ruta va en otro spec.
- **Sí:** lista de padres ahora proviene de Supabase (patrón server component → props → client component). `KidProfileAside` pierde su estado local `linkedParents`.
- **Sí:** alfabeto de código sin `I`, `O`, `0`, `1` para evitar ambigüedad visual en el correo.
- **Sí:** server action usa `createServiceClient()` (no el client con cookies), consistente con `createChildAction` de SPEC 09.
- **No:** aceptar invitaciones, crear fila en `parent_children`, ni alta en Supabase Auth. Se traslada a un spec futuro.
- **No:** policies RLS de pertenencia por `daycare_id`/rol. Se mantiene el baseline `USING (true)` como en SPEC 07/08/09.
- **No:** trigger automático de `updated_at` ni expiración automática de invitaciones (cron/pg_cron). Se traslada a un spec futuro.
- **No:** reenvío ni cancelación de invitaciones desde la UI.
- **No:** CLI local, Docker, esquema declarativo ni `supabase/seed.sql`.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El sandbox de Resend limita destinatarios y volumen. | Para pruebas basta con enviar a uno o dos emails propios. Si se necesita producción, se requerirá dominio verificado en otro spec. |
| El código aleatorio podría colisionar con uno existente. | El constraint `UNIQUE` en `code` hace fallar el insert; el server action devuelve error genérico y el usuario puede reintentar. Con 60M de combinaciones (33⁵), la colisión es estadísticamente irrelevante. |
| La reescritura del modal cambia la UX respecto al SPEC 05 (ya no hay caja amarilla). | Aceptado explícitamente; los criterios de aceptación reflejan la nueva UX. |
| El server action hace dos llamadas externas (Supabase + Resend) y un rollback manual si Resend falla. | Si el `delete` de rollback falla, queda una fila huérfana sin email enviado; se acepta como riesgo bajo y se monitorea. Un spec futuro puede mover el envío a un Edge Function o job para mayor robustez. |

## Lo que **no** está en esta spec

- Ruta `/accept-invitation` ni validación del código.
- Aceptación real: cambio de status, alta en Supabase Auth, creación de fila en `parent_children`.
- Expiración automática (cron / pg_cron) ni job de limpieza de invitaciones vencidas.
- Reenvío ni cancelación de invitaciones desde la UI.
- Policies RLS de pertenencia por `daycare_id` ni por rol.
- Trigger automático de `updated_at`.
- Feed familiar, login del padre, datos reales del usuario autenticado.
- CLI local, Docker, esquema declarativo ni `supabase/seed.sql`.

Cada uno de esos puntos, si se aborda, va en su propia spec.
