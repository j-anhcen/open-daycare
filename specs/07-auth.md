# SPEC 07 — Autenticación real con Supabase y protección de rutas

> **Estado:** Implemented  
> **Depende de:** SPEC 03, SPEC 08 (database)  
> **Fecha:** 2026-11-19  
> **Objetivo:** Conectar el login de la app contra Supabase Auth (email + password), proteger todas las rutas excepto `/login` y `/activar-cuenta` con un proxy de Next.js 16, y agregar logout real desde el sidebar.

## Alcance

**Incluye:**

- **Supabase clients** (`lib/supabase/`): servidor (`server.ts`) con `createServerClient` + cookies de `next/headers` (getAll/setAll), navegador (`browser.ts`) con `createBrowserClient`, y helper de proxy (`middleware.ts`) que crea el client desde el request y buffer de cookies. Variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (ya en `.env`).
- **Data Access Layer** (`lib/dal.ts`): función `verifySession()` envuelta en `React.cache()` que crea el server client, llama `getUser()`, y devuelve `{ isAuth: true, user }` o redirige a `/login`. Marcada con `'server-only'`.
- **Proxy** (`proxy.ts` en la raíz, convención Next.js 16 — no `middleware.ts`): crea un server client con las cookies del request, refresca la sesión con `getUser()`, y hace redirect de rutas protegidas sin sesión → `/login`, y de `/login` con sesión → `/`. Usa `serializeCookieHeader` para escribir las cookies actualizadas en la respuesta. `matcher` excluye `_next/static`, `_next/image`, `favicon.ico` y archivos estáticos.
- **Server Actions** (`app/actions/auth.ts`): `loginAction(prevState, formData)` que valida, llama `supabase.auth.signInWithPassword()`, y en éxito hace `revalidatePath('/', 'layout')` + `redirect('/')`; en error devuelve `{ error: string }` con el mensaje. `logoutAction()` que llama `signOut()` y `redirect('/login')`.
- **Login real**: `components/auth/LoginForm.tsx` (`"use client"`) envuelve los inputs con `<form action={loginAction}>` + `useActionState` para mostrar errores inline. `LoginPanel` delega el form a `LoginForm` manteniendo la composición visual.
- **Logout real**: `components/layout/Sidebar.tsx` reemplaza `<Link href="/login">` por un `<form>` con `<button type="submit">` que invoca `logoutAction` (server action). Mismo cambio en `MobileMenu.tsx` si tiene link de logout.
- **Rutas públicas**: `/login` y `/activar-cuenta` siguen accesibles sin sesión.
- **Redirección post-login**: siempre a `/` (feed), sin distinción de rol.
- **Manejo de errores**: mensaje inline en español debajo del botón de submit, usando los tokens `--color-input-error-text` existentes (patrón consistente con SPEC 06). Ejemplo: "Email o contraseña incorrectos."
- **Datos del usuario**: por ahora el feed y sidebar siguen usando datos mock (`currentUser` de `feedPageData`). El spec no cambia eso; solo garantiza que las pantallas están detrás de auth.
- **Sin cambios en `/activar-cuenta`**: sigue como mockup estático (SPEC 03).

**Fuera de alcance (para futuras specs):**

- Sign up real (activar cuenta contra Supabase Auth).
- Recuperación de contraseña.
- Separación de rutas por rol (staff vs parent).
- Mostrar datos reales del usuario autenticado en el sidebar/feed (nombre, avatar).
- RLS policies para proteger datos por usuario.
- Refresh tokens explícitos (Supabase SSR los maneja automáticamente vía cookies).
- Confirmación de email.

## Modelo de datos

No se crean tablas ni columnas nuevas. Este spec usa la infraestructura de Supabase Auth (`auth.users`) y la tabla `public.users` creada en SPEC 08.

```ts
// lib/supabase/server.ts
import 'server-only'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(cookieStore.toString())
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```ts
// lib/supabase/browser.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

```ts
// lib/dal.ts
import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const verifySession = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return { isAuth: true, userId: user.id, email: user.email }
})
```

```ts
// app/actions/auth.ts
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(
  prevState: { error?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const email = String(formData.get('email') ?? '')
  const password = String(formData.get('password') ?? '')

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
```

Convenciones:

- Código (archivos, funciones, variables) en inglés; mensajes de error visibles en español.
- Los clients de Supabase siempre usan la publishable key (nunca `service_role`).
- Los server actions no exponen detalles internos de Supabase en los mensajes de error.

## Plan de implementación

1. **Supabase clients.** Crear `lib/supabase/server.ts`, `lib/supabase/browser.ts` y `lib/supabase/middleware.ts` (helper que crea client desde un `NextRequest` y buffer cookies/headers). Verificación: `npx tsc --noEmit`.
2. **Data Access Layer.** Crear `lib/dal.ts` con `verifySession()` usando `React.cache()`. Verificación: `npx tsc --noEmit`.
3. **Proxy.** Crear `proxy.ts` en la raíz: importa el helper de middleware, crea el client, refresca sesión, define rutas públicas (`/login`, `/activar-cuenta`), redirige desautenticados a `/login` y autenticados en `/login` a `/`. `matcher` excluye estáticos. Verificación: navegar a `/` sin sesión → redirect a `/login`.
4. **Server Actions.** Crear `app/actions/auth.ts` con `loginAction` (prevState pattern para errores) y `logoutAction`. Verificación: `npx tsc --noEmit`.
5. **Login real.** Crear `components/auth/LoginForm.tsx` (`"use client"`) con `<form>`, `useActionState(loginAction)`, inputs con `name="email"` y `name="password"`, mensaje de error inline. Modificar `LoginPanel` para que renderice `LoginForm` en lugar de los inputs/links placeholder. Modificar `app/login/page.tsx` si es necesario. Verificación: login con `john@gmail.com` / `Abc123456` → redirect a `/`. Credenciales inválidas → mensaje inline.
6. **Logout real.** En `Sidebar.tsx`, reemplazar `<Link href="/login">` por `<form action={logoutAction}>` con `<button>` (mismo estilo visual). Verificar si `MobileMenu.tsx` tiene link de logout y aplicar el mismo cambio. Verificación: click en logout → redirect a `/login`; intentar volver a `/` → redirect a `/login`.
7. **Pulido y verificación final.** Flujo completo: (a) sin sesión, `/` redirige a `/login`; (b) login válido → `/`; (c) logout → `/login`; (d) credenciales inválidas → error inline; (e) `/activar-cuenta` accesible sin sesión; (f) `npx tsc --noEmit` sin errores; (g) capturas en `.playwright-mcp/`.

## Criterios de aceptación

- [x] `/` sin sesión activa redirige a `/login`. Evidencia: sin cookies de Supabase, en dev y en producción el request a `/` devuelve 307 → `/login`.
- [x] `/kids`, `/avisos`, `/mi-cuenta` sin sesión redirigen a `/login`. Evidencia: en dev y producción, cada ruta devuelve 307 → `/login`.
- [x] `/login` con credenciales válidas (`john@gmail.com` / `Abc123456`) redirige a `/`. Evidencia: Playwright completó el form y la URL final fue `/` con el feed visible (`spec07-login-success.png`).
- [x] `/login` con credenciales inválidas muestra el mensaje "Email o contraseña incorrectos." debajo del botón, sin navegar. Evidencia: Playwright con password inválido mostró el mensaje y permaneció en `/login` (`spec07-login-error.png`).
- [x] El mensaje de error usa los tokens `--color-input-error-text` y se limpia al reintentar con credenciales válidas. Evidencia: color computado `rgb(197, 65, 58)` (= `--color-input-error-text`); al reintentar con credenciales válidas se navegó a `/` y el mensaje desapareció.
- [x] `/login` con sesión activa redirige a `/`. Evidencia: Playwright navegó a `/login` estando logueado y la URL final fue `/`.
- [x] `/activar-cuenta` sigue accesible sin sesión (no se redirige). Evidencia: en dev y producción responde 200.
- [x] El botón de logout en el sidebar cierra la sesión y redirige a `/login`. Evidencia: Playwright hizo click en «Cerrar sesión» → URL `/login`; navegar a `/` después → redirect a `/login` (`spec07-logout.png`).
- [x] El proxy refresca las cookies de sesión correctamente (no hay "random logouts"). Evidencia: tras login exitoso, 3 recargas de `/` seguidas mantuvieron la URL `/` y el feed visible.
- [x] Los server actions están marcados con `'use server'` y el DAL con `'server-only'`. Evidencia: `grep "'use server'" app/actions/auth.ts` y `grep "'server-only'" lib/dal.ts lib/supabase/server.ts` con matches.
- [x] El proxy.ts usa `createServerClient` con `getAll`/`setAll` de cookies y la publishable key (no `service_role`). Evidencia: `grep` de `service_role` o `SUPABASE_SERVICE_ROLE` en `proxy.ts lib/ app/actions/` → sin matches.
- [x] `npx tsc --noEmit` sin errores. Evidencia: salida limpia del typecheck (también pasó durante `npm run build`).
- [x] Capturas en `.playwright-mcp/`: `spec07-login-success.png`, `spec07-login-error.png` y `spec07-logout.png`.

## Decisiones

- **Sí:** `proxy.ts` (no `middleware.ts`) — Next.js 16 renombró middleware a proxy; el archivo debe llamarse `proxy.ts` en la raíz.
- **Sí:** `@supabase/ssr` con cookies `getAll`/`setAll` — es el patrón oficial de Supabase para SSR; maneja refresh tokens automáticamente.
- **Sí:** solo la publishable key (no `service_role`) — la service role bypassea RLS y nunca debe exponerse; el login usa la anon key con las credenciales del usuario.
- **Sí:** `React.cache()` en `verifySession` — deduplica la lectura de sesión dentro de un render pass, consistente con el patrón DAL de Next.js.
- **Sí:** `useActionState` en el login form (`"use client"`) — necesario para mostrar errores de credenciales sin recargar; el patrón recomendado por React 19 + Next.js.
- **Sí:** `<form action={logoutAction}>` en el sidebar — forms con server actions funcionan en server components; no requiere `"use client"`.
- **Sí:** mensaje de error genérico "Email o contraseña incorrectos." — no exponer si el email no existe o si la contraseña es incorrecta (seguridad).
- **Sí:** redirigir a `/` sin distinción de rol — las rutas separadas por rol no existen; se puede agregar en otra spec.
- **No:** sign up real — depende del flujo de invitaciones (SPEC 05 link-parent), fuera de scope.
- **No:** mostrar datos reales del usuario en el sidebar — el feed y sidebar siguen con datos mock; se cambia en otra spec.
- **No:** modificar `/activar-cuenta` — sigue como mockup estático hasta que se implemente el sign up.
- **No:** instalar `server-only` como dependencia — verificar si ya está disponible como transitive dependency de Next.js; si no, instalarlo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `cacheComponents: true` puede causar que la sesión se lea incorrectamente en server components. | El proxy refresca la sesión antes del render; la DAL usa `React.cache()` para deduplicar. Verificar con `npm run build` que no haya errores de prerender. |
| La confirmación de email de Supabase puede bloquear el login del usuario staff de prueba. | El usuario staff se creó con `email_confirmed_at = now()` (SPEC 08 database), así que no requiere confirmación. Verificar que Auth → Email Auth tenga `enable_confirmations = false` o que el usuario ya esté confirmado. |
| El `matcher` del proxy puede bloquear assets estáticos. | Excluir `_next/static`, `_next/image`, `favicon.ico` y archivos con extensión (`.png`, `.jpg`, etc.) en el matcher. |
| `setAll` del server client necesita escribir cookies en la respuesta del proxy. | En proxy.ts, usar `NextResponse.next()` y aplicar cookies con `response.cookies.set()` dentro de `setAll`. |

## Lo que **no** está en esta spec

- Sign up real (activar cuenta contra Supabase Auth).
- Recuperación de contraseña.
- Separación de rutas por rol (staff vs parent).
- Datos reales del usuario autenticado en la UI.
- RLS policies para protección de datos.
- Confirmación de email.
- Cambios en `/activar-cuenta`.

Cada uno de esos puntos, si se aborda, irá en su propia spec.
