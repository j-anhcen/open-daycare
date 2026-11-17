# SPEC 03 — Login (`/login`) y activación de cuenta (`/activar-cuenta`)

> **Estado:** Implemented  
> **Depende de:** SPEC 01  
> **Fecha:** 2026-11-17  
> **Objetivo:** Implementar las plantillas `references/pantallas/login.dc.html` y `references/pantallas/activar-cuenta.dc.html` como las rutas standalone `/login` y `/activar-cuenta` con Tailwind y datos mock estáticos, descartando el selector de rol Personal/Familia y sin autenticación real.

## Alcance

**Incluye:**

- Crear `app/login/page.tsx` (composición standalone, sin sidebar) que reproduce `login.dc.html` en desktop: panel izquierdo de marca con gradiente `#F6A98E → #F2937A → #EC7E62` (155deg), dos círculos decorativos, logo (tile + `SunIcon` existente), titular "El día de cada niño, compartido con su familia.", bajada y footer "🌿 Guardería Sala Soles"; columna derecha con "Iniciar sesión", "Ingresá para ver el día de hoy." y el formulario.
- **Sin** el bloque "INGRESO COMO" ni los botones Personal/Familia (descartados).
- Campos prellenados según el mockup: EMAIL `caro@opendaycare.com`; CONTRASEÑA vacía con placeholder "••••••••".
- "¿Olvidaste tu contraseña?" y el botón "Iniciar sesión" como placeholders `href="#"` (sin sesión ni pantalla destino).
- Link real "Activá tu cuenta" → `/activar-cuenta` vía `next/link`.
- Responsive `< md`: ocultar el panel de marca y centrar el formulario.
- Crear `app/activar-cuenta/page.tsx` (standalone, centrada, `max-w-[440px]`) que reproduce `activar-cuenta.dc.html`: tile con gradiente `#F8C3A8 → #F2937A`, "Bienvenida a OpenDayCare" + bajada, card de invitación (avatar "M" con par azul existente, "Te invitaron a seguir a" / "Mateo · Sala Soles"), CÓDIGO DE INVITACIÓN "7K4P9" (Fredoka, tracking amplio), EMAIL `lucia.fernandez@gmail.com`, CREAR CONTRASEÑA (borde acento `#F2A78E` como en el mockup), consentimiento con caja `#FBF1D6` y check `#5FB97E`, y botón "Activar mi cuenta".
- Consentimiento: checkbox nativo togglable, chequeado por defecto (única interacción funcional junto con la navegación).
- "Activar mi cuenta" placeholder `href="#"`; link real "Iniciar sesión" → `/login`.
- Datos mock tipados en módulo nuevo `app/_data/auth.ts` (nombres/tipos en inglés, contenido en español) con `loginPageData` y `activationPageData`.
- Componentes bajo `components/auth/` + `README.md` de propósito (p. ej. `BrandPanel.tsx`, `LoginPanel.tsx`, `ActivationPanel.tsx`).
- `CheckIcon` nuevo en `components/shared/icons.tsx`; reutilizar `SunIcon` existente.
- Tokens nuevos `@theme` en `app/globals.css` (fondo auth `#FBF4EC`, borde de inputs `#EADFD0`, caja de consentimiento) reutilizando los existentes (`muted`, `accent-strong`, par azul de avatar).
- Metadatos propios por ruta (`title`/`description`).

**Fuera de alcance (para futuras specs):**

- Autenticación real: sesiones, cookies, roles, protección de rutas y redirección post-login.
- Pantalla "¿Olvidaste tu contraseña?" y flujo de recuperación.
- familia-feed, destino real del botón "Activar mi cuenta".
- Validación de formularios y estados de error (no existen en los mockups).
- Cambios en pantallas ya implementadas (`/`, `/kids`): el link "Cerrar sesión" del sidebar ya apunta a `/login` y no se modifica.
- Selector de rol Personal/Familia y cualquier lógica asociada.

## Modelo de datos

Sin persistencia. Módulo de datos mock estáticos en `app/_data/auth.ts`.

```ts
// app/_data/auth.ts (forma ilustrativa; nombres/tipos en inglés)

export type LoginPageData = {
  brandName: string;            // "OpenDayCare"
  roomFooterLabel: string;      // "🌿 Guardería Sala Soles"
  headline: string;             // "El día de cada niño, compartido con su familia."
  tagline: string;              // "Publicá momentos, gestioná las salas…"
  title: string;               // "Iniciar sesión"
  subtitle: string;            // "Ingresá para ver el día de hoy."
  emailLabel: string;          // "EMAIL"
  passwordLabel: string;       // "CONTRASEÑA"
  forgotPasswordLabel: string; // "¿Olvidaste tu contraseña?"
  submitLabel: string;          // "Iniciar sesión"
  signupQuestion: string;       // "¿Te invitó la guardería?"
  signupLinkLabel: string;      // "Activá tu cuenta"
  prefillEmail: string;         // "caro@opendaycare.com"
  passwordPlaceholder: string;  // "••••••••"
};

export type ActivationPageData = {
  title: string;              // "Bienvenida a OpenDayCare"
  intro: string;              // "Te invitaron a seguir el día de tu hijo…"
  invitedToLabel: string;     // "Te invitaron a seguir a"
  childLabel: string;         // "Mateo · Sala Soles"
  childInitial: string;       // "M"
  codeLabel: string;          // "CÓDIGO DE INVITACIÓN"
  emailLabel: string;         // "EMAIL"
  passwordLabel: string;      // "CREAR CONTRASEÑA"
  consentLabel: string;       // "Autorizo a la guardería…"
  submitLabel: string;         // "Activar mi cuenta"
  loginQuestion: string;       // "¿Ya tenés cuenta?"
  loginLinkLabel: string;      // "Iniciar sesión"
  prefillCode: string;         // "7K4P9"
  prefillEmail: string;       // "lucia.fernandez@gmail.com"
  prefillPassword: string;     // valor demo del mockup (input type="password")
};

export const loginPageData: LoginPageData = { /* contenido exacto del mockup */ };
export const activationPageData: ActivationPageData = { /* contenido exacto del mockup */ };
```

Convenciones:

- Código (archivos, componentes, variables, tipos) en inglés; copy visible en español tal cual los mockups.
- Los valores del mock replican el contenido visible de `login.dc.html` y `activar-cuenta.dc.html`.

## Plan de implementación

1. **Datos mock.** Crear `app/_data/auth.ts` con tipos y `loginPageData`/`activationPageData` (contenido exacto de los mockups, sin rol). Verificación: `npx tsc --noEmit`.
2. **Tokens e icono.** Ampliar `@theme` en `app/globals.css` (fondo auth `#FBF4EC`, borde de inputs `#EADFD0`, caja de consentimiento `#FBF1D6`/texto `#8A7234`, check `#5FB97E`) y agregar `CheckIcon` en `components/shared/icons.tsx`. Verificación: `npm run dev` compila.
3. **Componentes auth.** Crear `components/auth/` + `README.md`: `BrandPanel` (panel izquierdo del login, gradiente + círculos + marca, `hidden md:flex`), `LoginPanel` (encabezado, labels/inputs prellenados, "¿Olvidaste tu contraseña?" y submit como placeholders, link real a `/activar-cuenta`), `ActivationPanel` (tile, título, card de invitación, campos, consentimiento togglable, submit placeholder, link real a `/login`). Verificación: `npx tsc --noEmit` sin errores.
4. **Página `/login`.** `app/login/page.tsx`: composición standalone sobre fondo `#FBF4EC` con grid `md:grid-cols-[1.05fr_1fr]` y alto completo (`min-h-dvh`); en `< md` solo el form centrado. Metadata propia ("Iniciar sesión · OpenDayCare"). Verificación manual contra `login.dc.html` en desktop y mobile.
5. **Página `/activar-cuenta`.** `app/activar-cuenta/page.tsx`: card centrada `max-w-[440px]` componiendo `ActivationPanel`, con metadata propia. Verificación manual contra `activar-cuenta.dc.html`.
6. **Pulido y verificación final.** Navegación cruzada `/login` ↔ `/activar-cuenta`, toggle del consentimiento, comparación visual contra ambos mockups (desktop y `< md`), `npx tsc --noEmit` sin errores y capturas en `.playwright-mcp/`.

## Criterios de aceptación

- [x] `/login` renderiza sin errores de consola/compilación y reproduce en desktop el layout y contenido de `login.dc.html`: panel de marca con gradiente, círculos decorativos, titular, bajada y footer "🌿 Guardería Sala Soles"; formulario con "Iniciar sesión", "Ingresá para ver el día de hoy.", EMAIL y CONTRASEÑA. Evidencia: GET /login → 200, 0 errores/0 warnings de consola; auditoría de estilos computados idéntica al mockup (grid `1.05fr/1fr` sobre `#FBF4EC`, gradiente 155deg `#F6A98E→#F2937A→#EC7E62`, círculos 420px/300px, Fredoka 42px/21px, footer "🌿 Guardería Sala Soles"). Capturas `.playwright-mcp/spec03-login-desktop.png` y `.playwright-mcp/spec03-mockup-login-desktop.png` (mockup renderizado en igualdad de condiciones).
- [x] `/login` no contiene el bloque "INGRESO COMO" ni los botones Personal/Familia. Evidencia: `browser_find` sin matches para "INGRESO COMO" y "Personal" en `/login` (el mockup sí los contiene, confirmado al renderizar el `.dc.html`); decisión de SPEC 03 respetada.
- [x] El email de `/login` está prellenado con `caro@opendaycare.com`; la contraseña está vacía con placeholder "••••••••". Evidencia: `input.value === "caro@opendaycare.com"` (type email) y `passInput.value === ""` con `placeholder === "••••••••"` verificados en el DOM (`components/auth/LoginPanel.tsx:21-31`).
- [x] En `/login`, "¿Olvidaste tu contraseña?" y el botón "Iniciar sesión" son placeholders `href="#"` sin navegación; "Activá tu cuenta" navega a `/activar-cuenta`. Evidencia: `href="#"` en ambos placeholders (`LoginPanel.tsx:34,42`); click real en "Activá tu cuenta" → URL `/activar-cuenta` vía `next/link` (Playwright).
- [x] En `< md`, `/login` oculta el panel de marca y muestra el formulario centrado. Evidencia: viewport 390x844 → `display:none` en el panel de marca, único hijo visible del grid, form centrado (padding simétrico 40px, panel de 310px). Captura `.playwright-mcp/spec03-login-mobile.png`.
- [x] `/activar-cuenta` renderiza sin errores y reproduce `activar-cuenta.dc.html`: tile con gradiente, "Bienvenida a OpenDayCare", card de invitación (avatar "M" azul, "Te invitaron a seguir a" / "Mateo · Sala Soles"), CÓDIGO DE INVITACIÓN "7K4P9", EMAIL `lucia.fernandez@gmail.com`, CREAR CONTRASEÑA, consentimiento con copy y estilo del mockup y botón "Activar mi cuenta". Evidencia: 0 errores de consola; auditoría de estilos idéntica al mockup (tile 58px con gradiente `#F8C3A8→#F2937A` y su sombra, avatar 44px `#A9D9E8`/`#1F7A93`, código Fredoka 18px/700 con tracking 3px, input contraseña con borde `#F2A78E`, consentimiento `#FBF1D6`/texto `#8A7234`/check `#5FB97E`); prefills del DOM iguales a los del mockup renderizado. Capturas `.playwright-mcp/spec03-activar-desktop.png` / `-mobile.png` y `.playwright-mcp/spec03-mockup-activar-desktop.png`.
- [x] El consentimiento está chequeado por defecto y se puede toglear; "Activar mi cuenta" es placeholder `href="#"`; "Iniciar sesión" (footer) navega a `/login`. Evidencia: `defaultChecked` + estado inicial `checked` (caja `#5FB97E`, check visible); dos clicks alternan checked → unchecked (caja blanca, check oculto; `.playwright-mcp/spec03-consent-unchecked.png`) → checked; `href="#"` en el submit; click en "Iniciar sesión" → URL `/login`.
- [x] La navegación cruzada `/login` → `/activar-cuenta` → `/login` funciona vía `next/link`. Evidencia: clicks reales con cambio de URL/título en ambos sentidos (`LoginPanel.tsx:50-55`, `ActivationPanel.tsx:74-79`), sin recarga completa.
- [x] No hay fetch, rutas de API, sesión ni datos reales; el contenido proviene de `app/_data/auth.ts`; código en inglés y copy en español. Evidencia: grep sin matches de `fetch(|axios|credentials|cookies(|session|api/` en `app/`+`components/`; sin carpeta `app/api/`; tipos/exports en inglés (`loginPageData`, `activationPageData`) con copy en español.
- [x] `npx tsc --noEmit` termina sin errores; capturas de verificación (desktop y mobile) en `.playwright-mcp/`. Evidencia: `npx tsc --noEmit` → salida limpia; capturas `spec03-login-desktop.png`, `spec03-login-mobile.png`, `spec03-activar-desktop.png`, `spec03-activar-mobile.png` (+ mockups y estado intermedio del consentimiento) en `.playwright-mcp/`.

## Decisiones

- **Sí:** descartar el selector "INGRESO COMO" (Personal/Familia) — decisión del usuario; el login es único para cualquier cuenta.
- **Sí:** "Iniciar sesión" y "Activar mi cuenta" como placeholders `href="#"` — sus destinos reales dependen de sesión/rol que no existen; consistente con la convención de navegar solo entre pantallas implementadas.
- **Sí:** links cruzados reales entre las dos pantallas nuevas (Activá tu cuenta ↔ Iniciar sesión).
- **Sí:** campos prellenados con los valores del mockup, servidos desde `app/_data/auth.ts` (paridad visual con los mockups, como SPEC 01/02).
- **Sí:** interactividad mínima — checkbox nativo togglable (chequeado por defecto), sin validación ni estados de error.
- **Sí:** `< md` oculta el panel de marca y centra el form (interpretación necesaria: el mockup solo define desktop).
- **Sí:** tokens nuevos para la paleta auth (fondo `#FBF4EC`, distinto al del feed) sin tocar los de las pantallas existentes; reutilizar `SunIcon` y agregar solo `CheckIcon`.
- **No:** mock auth con credenciales/roles, pantalla de forgot-password, stub de familia-feed, validación con mensajes de error (no hay mockup de esos estados), cambios en pantallas ya implementadas.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Mobile no está definido en los mockups (solo desktop). | `< md`: ocultar el panel de marca y centrar el form; validar con capturas en viewport < 768px. |
| Fidelidad visual con Tailwind vs CSS inline de los mockups (mismo caso que SPEC 01/02). | Tokens + valores arbitrarios de Tailwind; comparación visual contra los `.dc.html`. |
| El consentimiento requiere interactividad en un contexto de Server Components/`cacheComponents`. | Checkbox nativo (`defaultChecked`) sin estado de React; aislar en cliente solo si aparece una restricción (patrón drawer de SPEC 01). |
| Fondo distinto (`#FBF4EC`) al global (`#F6ECDF`) podría filtrarse a otras pantallas. | Token dedicado aplicado solo en los contenedores de las páginas auth. |

## Lo que **no** está en esta spec

- Autenticación real (sesión, roles, protección de rutas, redirección post-login).
- Pantalla "¿Olvidaste tu contraseña?" y flujo de recuperación.
- familia-feed (destino real de "Activar mi cuenta").
- Validación de formularios y estados de error.
- Selector Personal/Familia y cualquier lógica de roles.

Cada uno de esos puntos, si se aborda, irá en su propia spec.
