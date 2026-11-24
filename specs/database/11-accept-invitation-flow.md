# SPEC 11 — Aceptación de invitación: ruta `/accept-invitation`, alta del padre y login

> **Estado:** Implemented  
> **Depende de:** SPEC 03, SPEC 07, SPEC 08 (database), SPEC 10 (database)  
> **Fecha:** 2026-11-23  
> **Objetivo:** Renombrar `/activar-cuenta` a `/accept-invitation`, validar el código `?code=` del email de invitación, y que «Activar mi cuenta» cree la cuenta del padre en Supabase Auth (fila en `users` vía trigger), la vincule con el niño y habilite su login.

## Alcance

**Incluye:**

- **Renombrado de ruta:** `app/activar-cuenta/page.tsx` → `app/accept-invitation/page.tsx` (borrar la ruta vieja, sin redirect de compatibilidad: los emails ya apuntan a `INVITATION_URL=http://localhost:3000/accept-invitation`). Actualizar `components/auth/LoginPanel.tsx` («Activá tu cuenta» → `/accept-invitation`), `proxy.ts` (`publicRoutes = ["/login", "/accept-invitation"]`) y `components/auth/README.md`.
- **GET dinámico:** `app/accept-invitation/page.tsx` (server component) lee `await searchParams` → `code`. Nueva DAL `getInvitationByCode(code)` en `lib/dal/invitations.ts` (`React.cache`, server client anon — RLS `invitations_read` permite el SELECT) con join `children → rooms`, devolviendo `InvitationWithChildDto | null`. Validación on-the-fly **sin mutar la DB en el GET**:
  - code ausente / no encontrado / `cancelled` → error "no válida";
  - `expired` o `expires_at` pasado (aunque el status siga `pending`) → error "venció";
  - `accepted` → error "ya fue utilizada".
- **Card de error:** componente nuevo `components/auth/InvalidInvitationCard.tsx` (tile + título "Enlace inválido" + mensaje contextual + link "Iniciar sesión" → `/login`), reutilizando los tokens auth existentes (`bg-auth-background`, tile con gradiente `#F8C3A8 → #F2937A`).
- **Pantalla dinámica:** `ActivationPanel` se refactoriza manteniendo la composición visual de SPEC 03 (tile, título, intro, card de invitación, campos, consentimiento, CTA, footer), pero con datos reales: `childLabel = "${childName} · Sala ${roomName}"` (convención `Sala ${room.name}` de `ProfileHeader.tsx`), avatar con la inicial del niño, CÓDIGO y EMAIL `readOnly` con los valores de la invitación, CREAR CONTRASEÑA editable (placeholder "••••••••"), consentimiento obligatorio.
- **Form cliente:** componente nuevo `components/auth/ActivationForm.tsx` (`"use client"` + `useActionState`, patrón de `LoginForm`): hidden input `code`, validación client (contraseña ≥ 6 caracteres, consentimiento checked) con errores inline (`--color-input-error-text`, estilo SPEC 05/07) y estado `pending` que deshabilita el CTA.
- **Server action `acceptInvitationAction(prevState, formData)`** en `app/actions/invitations.ts` (junto a `sendInvitationAction`):
  1. Lee el code del `formData`, busca la invitación (service client) con el join child/room y valida `pending` + vigente (`expires_at` futuro). Código inválido/ya usado/vencido → error en español.
  2. Revalida consentimiento (`consent=on`) y contraseña ≥ 6 server-side (fuente de verdad).
  3. `auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { daycare_id, role: "parent", full_name } })` con el service client → el trigger `handle_new_user` de SPEC 08 crea la fila en `public.users`. `daycare_id` se deriva de `invitations.child_id → children.room_id → rooms.daycare_id`; `role` es fijo `'parent'` (nunca viene del cliente); `full_name` es el de la invitación.
  4. Insert en `parent_children` (`parent_id` = id del usuario nuevo, `child_id`, `relationship` de la invitación) vía service client.
  5. Update de la invitación → `status='accepted'` + `accepted_at=now()` vía service client.
  6. **Todo-o-nada:** si 4 o 5 fallan después de crear el usuario → `auth.admin.deleteUser(userId)` (el FK `ON DELETE CASCADE` borra también la fila de `public.users`) y devuelve error genérico.
  7. `revalidatePath("/kids/${childId}")` + `redirect("/login")` **sin establecer sesión**.
  - Email ya registrado (error 422 de createUser) → error inline "Ya existe una cuenta con este correo…" sin rollback (nada se creó).
- **`app/_data/auth.ts`:** `ActivationPageData` pierde los campos prefill (`childLabel`, `childInitial`, `prefillCode`, `prefillEmail`, `prefillPassword`) — esos valores ahora son dinámicos desde la invitación; gana `passwordPlaceholder`, `errorMessages` (`passwordRequired`, `passwordTooShort`, `consentRequired`, `emailAlreadyRegistered`, `generic`) y `invalidInvitationData` (título + mensajes `invalid`, `expired`, `alreadyUsed`). `loginPageData` no cambia (el link "Activá tu cuenta" es un `href`, no un dato).
- **DTO:** `InvitationWithChildDto` en `lib/invitations.ts` junto al `InvitationDto` existente.

**Fuera de alcance (para futuras specs):**

- Migraciones/DDL/RLS nuevas — tablas (`invitations`, `parent_children`) y trigger (`handle_new_user`) ya existen de SPEC 08/10.
- Auto-login tras activar (decisión: redirect a `/login`); cambios en `/login` (su prefill mock de SPEC 03 se mantiene).
- Feed familiar, separación de rutas por rol, datos reales del usuario autenticado en la UI.
- Expiración automática (cron/pg_cron) ni limpieza de invitaciones vencidas.
- Reenvío/cancelación de invitaciones desde la UI; edición del email invitado.
- Correo de bienvenida post-aceptación; pantalla "¿Olvidaste tu contraseña?".
- Rate limiting del action público.

## Modelo de datos

Sin cambios de esquema (sin migraciones). Estructuras de app:

```ts
// lib/invitations.ts — DTO nuevo junto a InvitationDto
export type InvitationWithChildDto = {
  code: string;
  fullName: string;
  email: string;
  relationship: ParentRelationship;
  childId: string;
  childName: string;
  roomName: string;
  daycareId: string;
  status: InvitationStatus;
  expiresAt: string;
};
```

```ts
// lib/dal/invitations.ts — join invitations → children → rooms (patrón de getChildById)
export const getInvitationByCode = cache(
  async (code: string): Promise<InvitationWithChildDto | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("invitations")
      .select(
        "id, full_name, email, relationship, code, status, expires_at, " +
          "child:children(id, full_name, room:rooms(name, daycare_id))",
      )
      .eq("code", code)
      .maybeSingle();
    return data ? mapToInvitationWithChild(data) : null;
  },
);
```

```ts
// app/actions/invitations.ts — extracto del núcleo de acceptInvitationAction
const supabase = createServiceClient();
const { data: { user } , error } = await supabase.auth.admin.createUser({
  email: invitation.email,
  password,
  email_confirm: true,
  user_metadata: {
    daycare_id: invitation.daycareId, // child → room → daycare
    role: "parent",                  // fijo, nunca del cliente
    full_name: invitation.fullName,  // nombre de la invitación
  },
});
// createUser dispara handle_new_user → fila en public.users
// luego: insert parent_children + update invitations (accepted)
// con rollback admin.deleteUser(user.id) si cualquiera de los dos falla
```

Convenciones: código en inglés, copy visible en español; el service client solo se usa en server actions/módulos `'server-only'`; mensajes de error sin exponer detalles internos de Supabase (patrón SPEC 07/10).

## Plan de implementación

1. **Renombrar ruta + links + proxy + README.** `app/activar-cuenta/page.tsx` → `app/accept-invitation/page.tsx`; `LoginPanel.tsx` href; `proxy.ts` publicRoutes; `components/auth/README.md`. Verificación: `/accept-invitation` renderiza el contenido mock, `/activar-cuenta` devuelve 404, el link de `/login` navega a la ruta nueva.
2. **DTO + DAL.** `InvitationWithChildDto` en `lib/invitations.ts`; `getInvitationByCode` en `lib/dal/invitations.ts` con el join child/room. Verificación: `npx tsc --noEmit`.
3. **Copy/types + UI.** Refactor de `app/_data/auth.ts` (sin prefills, con `errorMessages` e `invalidInvitationData`); componente `InvalidInvitationCard`; refactor de `ActivationPanel` (props dinámicas, campos CÓDIGO/EMAIL `readOnly`); componente cliente `ActivationForm` (hidden `code`, validación, errores inline, `pending`). Verificación: `npx tsc --noEmit` + paridad visual contra `activar-cuenta.dc.html` con datos de una invitación real.
4. **Server action.** `acceptInvitationAction` en `app/actions/invitations.ts` con validación server, `admin.createUser`, `parent_children`, update de la invitación, rollback y redirect. Verificación: `npx tsc --noEmit`.
5. **Wiring de la página.** `searchParams` → `getInvitationByCode` → `ActivationPanel` (válido) o `InvalidInvitationCard` (ausente/inexistente/vencido/ya usado). Verificación: navegación manual de los 4 estados del GET.
6. **E2E completo.** Staff logueado (`john@gmail.com` / `Abc123456`) → perfil del niño → «Vincular padre» (Resend sandbox) → tomar el código de la DB (MCP `execute_sql`) → abrir `/accept-invitation?code=…` → contraseña → submit → redirect a `/login` → login con el email nuevo → llega al feed. Verificar con queries: `auth.users` (email confirmado), `public.users` (`role='parent'`, `full_name` de la invitación, `daycare_id` correcto), `parent_children` (relationship), invitación `accepted` con `accepted_at`. El perfil del niño muestra la fila del padre como ACTIVA (`invitationsToParentRows`). Casos de error: código inexistente, código reutilizado (segundo submit), vencido (`execute_sql` seteando `expires_at` en el pasado para una invitación de prueba), consentimiento desmarcado, contraseña corta, email ya registrado. Capturas en `.playwright-mcp/`.
7. **Advisors y cierre.** MCP `get_advisors` de seguridad y performance (sin cambios de DB esperados) y `npx tsc --noEmit` limpio.

## Criterios de aceptación

- [ ] `/accept-invitation` sin sesión responde 200; `/activar-cuenta` devuelve 404; `proxy.ts` lista `/accept-invitation` en `publicRoutes`.
- [ ] «Activá tu cuenta» en `/login` navega a `/accept-invitation`.
- [ ] Sin `?code`, código inexistente o `cancelled` → card de error con el mensaje "no válida" y link a `/login`, sin mutación en la DB durante el GET.
- [ ] Código vencido (`expired` o `expires_at` pasado con status `pending`) → card con mensaje "venció"; código `accepted` → card con mensaje "ya fue utilizada".
- [ ] Código `pending` vigente → la pantalla muestra "Te invitaron a seguir a" / "{childName} · Sala {roomName}" con la inicial real del niño, y CÓDIGO/EMAIL `readOnly` con los valores de la invitación (sin datos mock de SPEC 03).
- [ ] Submit con contraseña vacía o < 6 caracteres → error inline bajo el campo, sin ejecutar el action.
- [ ] Submit con consentimiento desmarcado → error inline, sin ejecutar el action.
- [ ] Submit válido crea `auth.users` (email confirmado) y `public.users` con `role='parent'`, `full_name` de la invitación y `daycare_id` del niño (vía trigger `handle_new_user`).
- [ ] Crea la fila en `parent_children` con el parentesco de la invitación y marca la invitación `accepted` + `accepted_at`.
- [ ] Tras el submit redirige a `/login` SIN sesión activa; el login con el email y la contraseña nuevas funciona y llega al feed.
- [ ] Reutilizar el mismo código después de aceptar → card "ya fue utilizada" (idempotencia).
- [ ] Email ya registrado → error inline "Ya existe una cuenta con este correo…" y ninguna fila nueva en `auth.users`/`public.users`/`parent_children`.
- [ ] El perfil del niño muestra la fila del padre como ACTIVA ("{Madre/Padre/Tutor/a} · activa").
- [ ] `npx tsc --noEmit` sin errores; capturas en `.playwright-mcp/`; grep de `service_role|SUPABASE_SERVICE_ROLE` en `components/` y en client bundles → sin matches.
- [ ] `get_advisors` sin hallazgos nuevos relacionados.

## Decisiones

- **Sí:** redirect a `/login` tras activar (decisión del usuario) ⇒ el action NO establece sesión ni llama `signInWithPassword` — si lo hiciera, el proxy de SPEC 07 rebotaría `/login` → `/` al detectar la sesión (regla `user && pathname === "/login"`).
- **Sí:** alta con `auth.admin.createUser` (service role) + `email_confirm: true` y metadata 100% server-side (decisión del usuario, empaquetada como "admin.createUser + signIn") — determinista (no depende del setting de confirmación de email de GoTrue) y sin el riesgo de autoasignación de rol desde el cliente que tiene el signUp público (documentado en SPEC 08).
- **Sí:** flujo completo de aceptación (decisión del usuario): `parent_children` + invitación `accepted`, no solo `users` + login. La lista "PADRES VINCULADOS" pasa de PENDIENTE a ACTIVA sin cambios extra (`invitationsToParentRows` ya lo soporta).
- **Sí:** card de error en la misma ruta (decisión del usuario); validación on-the-fly sin mutar la DB en el GET. La limpieza de vencidas sigue fuera de scope, como en SPEC 10.
- **Sí:** consentimiento obligatorio client + server (decisión del usuario).
- **Sí:** CÓDIGO y EMAIL `readOnly` — la cuenta debe coincidir con el email invitado (constraint unique `(child_id, email)`), y el código se revalida server-side en el action de todos modos.
- **Sí:** contraseña mínima 6 caracteres (default de GoTrue); ajustable a 8 en revisión si se prefiere.
- **Sí:** rollback todo-o-nada con `admin.deleteUser` si falla el vínculo o el update — espejo del patrón de SPEC 10 (delete de la fila si el paso posterior falla).
- **Sí:** renombrar sin redirect de compatibilidad — no existen links legados; los emails siempre usaron `INVITATION_URL=/accept-invitation` (SPEC 10).
- **Sí:** este spec vive en `specs/database/` por la regla del repo (persistencia + Supabase Auth config), numeración continua con SPEC 10.
- **No:** auto-login, cambios en `/login`, feed familiar, rutas por rol, cron de expiración, reenvío/cancelación de invitaciones, welcome email, forgot-password, rate limiting.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Fallo entre `createUser` y `parent_children`/update deja usuario huérfano. | Rollback `admin.deleteUser(userId)` (el cascade borra `public.users`); si el propio rollback falla, queda huérfano documentado (mismo espíritu que SPEC 10). |
| Código de 5 caracteres fuerza-bruteeable contra un action público. | Validación server + expiración de 7 días; rate limiting fuera de scope, anotado para un spec futuro. |
| `redirect()` dentro de un form con `useActionState` puede sorprender. | Mismo patrón ya verificado de `loginAction` (SPEC 07). |
| `cacheComponents` + página que lee `searchParams`. | `searchParams` hace la ruta dinámica por definición; sin prerender estático del código. |
| `revalidatePath("/kids/${childId}")` desde un action ejecutado por usuario anónimo. | La revalidación es del cache del server; sin efecto de permisos. |
| El padre aterrizado en `/login` ve el prefill mock `caro@opendaycare.com` (SPEC 03). | Aceptado explícitamente: `/login` no se toca en este spec; el login funciona con cualquier email. |

## Lo que **no** está en esta spec

- Migraciones, DDL, RLS ni enums nuevos (todo existe de SPEC 08/10).
- Auto-login tras la activación y cambios en la pantalla `/login`.
- Feed familiar, rutas por rol y datos reales del usuario autenticado en la UI.
- Expiración automática (cron), reenvío/cancelación de invitaciones.
- Correo de bienvenida y recuperación de contraseña.

Cada uno de esos puntos, si se aborda, irá en su propia spec.
