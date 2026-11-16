# SPEC 01 — Home con feed de la guardería (staff)

> **Estado:** Approved  
> **Depende de:** —  
> **Fecha:** 2026-11-16  
> **Objetivo:** Implementar la plantilla `references/pantallas/feed.dc.html` como la pantalla home (`/`) responsive, descompuesta en componentes y con menú hamburguesa en mobile, usando Tailwind CSS y datos mock estáticos sin autenticación ni base de datos.

## Alcance

**Incluye:**

- Reemplazar el contenido de `app/page.tsx` para que actúe como composición de la pantalla home (`/`) del feed staff “Sala Soles”, inspirado en `references/pantallas/feed.dc.html`, delegando la UI en componentes (sin concentrar toda la vista en un solo archivo).
- Descomponer la UI en componentes bajo la carpeta raíz `components/`, organizada en subcarpetas cuyo nombre/propósito indique el contenido:
  - `components/layout/`: componentes de layout y navegación de la pantalla (p. ej. `Sidebar.tsx`, `MobileMenu.tsx` o equivalente para header/barra superior con botón hamburguesa y drawer).
  - `components/feed/`: componentes específicos del feed (p. ej. `FeedHeader.tsx`, `Composer.tsx`, `PostCard.tsx`).
  - `components/shared/`: componentes compartidos/reutilizables extraídos de esta pantalla (crear la carpeta solo si se extrae al menos un componente compartido; su propósito es contener piezas UI reutilizables).
  - Cada subcarpeta debe dejar explícito su propósito (por estructura/nombres y, si se considera útil, un `README.md` breve dentro de la subcarpeta indicando qué tipo de componentes contiene).
- Comportamiento responsive con breakpoint `md` de Tailwind (`>= 768px` / `< 768px`):
  - **Desktop (`>= md`):** sidebar fijo/sticky de `248px` de alto completo y área principal con scroll/contenido centrado (`max-width: 760px`), equivalente al mockup.
  - **Mobile (`< md`):** el sidebar no se muestra fijo; se presenta una barra superior con botón hamburguesa. Al activarlo, el sidebar se abre como *drawer* lateral izquierdo sobre el contenido con overlay/backdrop, mostrando el mismo contenido que en desktop (marca OpenDayCare/Sala Soles, CTA “Nueva publicación”, navegación, bloque de perfil/salida). Se cierra al tocar el overlay/backdrop o un control de cerrar dentro del drawer. No se requiere persistencia del estado del menú.
- Configurar tipografías **Fredoka** y **Nunito** en `app/layout.tsx` mediante `next/font/google` y exponerlas para uso con Tailwind/clases.
- Ajustar `app/globals.css` (y tokens de tema con `@theme` de Tailwind v4 según sea necesario) para definir la base visual: fondo `#F6ECDF`, color de texto base `#3F362E`, tipografía base Nunito y neutralización del cambio automático a dark mode por `prefers-color-scheme` que impide igualar el mockup.
- Actualizar metadatos básicos en `app/layout.tsx` (`title`/`description`/`lang`) para que sean coherentes con la pantalla.
- Definir y usar datos mock estáticos en `app/_data/mock.ts` (nombres, variables, funciones, tipos y componentes en inglés) con el mismo contenido visible que el mockup: encabezado (“GUARDERÍA · SALA SOLES”, “Buenas, Caro”, “12 niños · martes 17 jun”), usuario “Caro Giménez / Maestra · Soles”, y los 3 posts en el mismo orden (LOGRO Mateo 14:20, ACTIVIDAD Mateo 09:40 con placeholder “Foto · pintando con témperas”, ANUNCIO general 07:50) incluyendo destinatarios, textos, likes y comentarios.
- Sidebar, header, composer, separador “PUBLICADO HOY” y cards de publicación con la jerarquía y elementos del mockup (iconos SVG, badges de tipo, avatares/iniciales, contadores, acciones visibles).
- Todos los enlaces y botones presentes visualmente pero **sin funcionalidad real** de negocio/navegación a pantallas del producto (placeholders, p. ej. `href="#"`). La única interacción funcional permitida es abrir/cerrar el menú hamburguesa en mobile para cumplir el comportamiento responsive requerido.
- Copy/UI visible en español tal como en el mockup; código (archivos, componentes, variables, funciones, tipos) en inglés.

**Fuera de alcance (para futuras specs):**

- Autenticación, sesiones, roles o protección de rutas.
- Base de datos, fetch de datos reales, persistencia o mutaciones (crear/editar publicación, likes, comentarios).
- Implementación de las pantallas destino enlazadas en el mockup (`/crear-publicacion`, `/ninos`, `/avisos`, `/mi-cuenta`, `/login`, detalle, foto, etc.).
- Navegación real desde los enlaces/botones del contenido (salvo abrir/cerrar el menú mobile).
- Animaciones avanzadas del drawer más allá de una transición básica razonable (opcional, no requerida para aceptación si el comportamiento es correcto).
- Contenido dinámico o distinto al del mockup.

## Modelo de datos

No se introducen estructuras de persistencia ni base de datos. Se define un módulo de datos mock estáticos para la UI en `app/_data/mock.ts`.

```ts
// app/_data/mock.ts (illustrative shape; names/types in English)

export type PostType = "achievement" | "activity" | "announcement";

export type FeedPost = {
  id: string;
  type: PostType;
  authorName: string;      // e.g. "Mateo" or "Anuncio general"
  authorInitial: string;   // e.g. "M"
  timeLabel: string;       // e.g. "14:20 · publicado por vos"
  audienceLabel: string;   // e.g. "Para: familia de Mateo"
  body: string;
  likesCount: number;
  commentsCount: number;
  photoPlaceholderLabel?: string; // e.g. "Foto · pintando con témperas"
};

export type FeedPageData = {
  roomLabel: string;       // "GUARDERÍA · SALA SOLES"
  greeting: string;        // "Buenas, Caro"
  subtitle: string;        // "12 niños · martes 17 jun"
  currentUser: { name: string; roleLabel: string; initial: string };
  posts: FeedPost[];       // 3 items, same order/content as mockup
};

export const feedPageData: FeedPageData = { /* exact mockup content */ };
```

Convenciones:
- Todo el código (nombres de archivos, carpetas, variables, funciones, tipos, componentes) en inglés; el contenido/copy visible al usuario permanece en español tal como aparece en `references/pantallas/feed.dc.html`.
- Los valores del mock deben coincidir con el contenido visible del mockup (textos, conteos, fecha y etiquetas).

## Plan de implementación

1. **Configurar base tipográfica y tema global.** En `app/layout.tsx` cargar Fredoka y Nunito con `next/font/google`, exponer sus variables CSS en el `<html>`/`body`, cambiar `lang` a `"es"` y actualizar `metadata` (por ejemplo `title: "OpenDayCare"` y `description` acorde al feed). En `app/globals.css` definir tokens/variables necesarios con `@theme` y estilos base para fondo `#F6ECDF`, texto `#3F362E`, familia Nunito por defecto y eliminar o neutralizar el override de dark mode por media query. Verificación manual: la app carga sin errores y el fondo/base tipográfica reflejan el tema del mockup.
2. **Crear datos mock del feed.** Agregar `app/_data/mock.ts` exportando la estructura tipada y `feedPageData` con el contenido exacto del mockup (3 posts: LOGRO, ACTIVIDAD con `photoPlaceholderLabel`, ANUNCIO). Verificación manual: `npx tsc --noEmit` pasa para el nuevo módulo.
3. **Crear estructura de componentes.** Crear la carpeta raíz `components/` con subcarpetas por propósito: `components/layout/` (navegación/layout: sidebar y control de menú mobile), `components/feed/` (componentes del feed: encabezado, composer, card de post) y `components/shared/` solo si se extrae alguna pieza reutilizable. Dejar el propósito de cada subcarpeta explícito (y, si aporta claridad, incluir un `README.md` breve en la subcarpeta describiendo su contenido). Definir los componentes base necesarios (p. ej. `Sidebar.tsx`, `MobileMenu.tsx`, `FeedHeader.tsx`, `Composer.tsx`, `PostCard.tsx`) con props tipadas en inglés. Verificación manual: `npx tsc --noEmit` sin errores de tipos.
4. **Implementar la UI responsive y composición en `app/page.tsx`.** Reemplazar el starter para componer la pantalla usando los componentes y `feedPageData`: en `>= md` renderizar sidebar sticky de `248px` y contenido principal centrado (`max-width: 760px`); en `< md` ocultar sidebar fijo y mostrar barra superior con hamburguesa que abre/cierra un drawer lateral izquierdo con overlay/backdrop y el mismo contenido del sidebar. Implementar la interacción de abrir/cerrar del menú (estado local en cliente donde corresponda) sin añadir navegación/acciones de negocio. Replicar la jerarquía visual del mockup con Tailwind y tokens. Verificación manual: `npm run dev` muestra el home correcto en desktop y el menú hamburguesa funcional en viewport mobile.
5. **Pulido visual y verificación de fidelidad.** Ajustar clases/tokens para acercar al máximo el resultado visual al mockup en desktop (sidebar, cards, badges LOGRO/ACTIVIDAD/ANUNCIO, placeholder de foto) y asegurar que el contenido sea equivalente en mobile con el menú hamburguesa operativo. Verificación manual: comparación visual contra `references/pantallas/feed.dc.html` en desktop y prueba en viewport `< 768px` (idealmente con Playwright guardando capturas en `.playwright-mcp/`), y ejecutar `npx tsc --noEmit` sin errores introducidos por esta implementación.

## Criterios de aceptación

- [ ] Al abrir `/` en `npm run dev` se renderiza el feed staff sin errores en la consola del navegador ni errores de compilación.
- [ ] La pantalla muestra el mismo contenido textual y orden que `references/pantallas/feed.dc.html`: sala/fecha, usuario “Caro Giménez”, composer, separador “PUBLICADO HOY” y los 3 posts (LOGRO, ACTIVIDAD con placeholder de foto, ANUNCIO) con sus contadores y destinatarios.
- [ ] `app/page.tsx` compone la vista mediante componentes; existen componentes separados al menos para sidebar/layout mobile, encabezado del feed, composer y card de post, organizados bajo `components/` en subcarpetas con propósito explícito (`layout/`, `feed/`, y `shared/` si aplica).
- [ ] En viewport `>= md` el layout muestra sidebar sticky de `248px` y contenido principal centrado como en el mockup; en viewport `< md` el sidebar fijo se oculta y aparece un control de hamburguesa que abre un drawer lateral izquierdo con overlay y el mismo contenido del sidebar, pudiendo cerrarse al tocar el overlay o un control de cerrar.
- [ ] El estilo visual en desktop es cercano al mockup (fondo `#F6ECDF`, tipografías Fredoka/Nunito, paleta, tarjetas, badges de tipo, sidebar activo en “Feed”) implementado con Tailwind CSS/tokens.
- [ ] No hay autenticación, base de datos ni llamadas de red/datos reales; el contenido proviene de `app/_data/mock.ts`.
- [ ] Salvo la apertura/cierre del menú hamburguesa, ningún enlace ni botón ejecuta navegación funcional a pantallas del producto ni acciones reales (placeholders no funcionales).
- [ ] `npx tsc --noEmit` finaliza sin errores atribuibles a los cambios de esta spec.

## Decisiones

- **Sí:** descomponer la pantalla en componentes y mantener `app/page.tsx` como composición, con estructura en `components/layout/`, `components/feed/` y `components/shared/` (si aplica) para que la organización de subcarpetas indique el tipo de contenido.
- **Sí:** UI responsive con breakpoint `md` de Tailwind: sidebar fijo en desktop y menú hamburguesa con drawer lateral izquierdo + overlay/backdrop en mobile, reutilizando el contenido del sidebar.
- **Sí:** usar `app/_data/mock.ts` para los datos del feed, con contenido exacto del mockup y nombres/tipos en inglés.
- **Sí:** cargar Fredoka y Nunito con `next/font/google` y ajustar `app/layout.tsx`/`app/globals.css` como base visual (neutralizando dark mode automático).
- **Sí:** implementar estilos con Tailwind CSS y tokens de tema (Tailwind v4 vía `@theme` en `app/globals.css`) en lugar de copiar CSS inline del HTML. Se aceptan desviaciones visuales menores frente al mockup a cambio de cumplir esta restricción técnica.
- **Sí:** enlaces/botones de contenido no funcionales (placeholders); la única interacción real es abrir/cerrar el menú mobile.
- **No:** crear rutas/stubs para las pantallas enlazadas. Queda fuera de alcance.
- **No:** autenticación, base de datos o interactividad real de negocio. Explícitamente excluidos.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| La exigencia de “idéntico” en desktop y el uso obligatorio de Tailwind pueden generar diferencias menores (sombras, espaciados, render de fuentes/SVG). | Priorizar fidelidad visual con utilidades/tokens y valores arbitrarios de Tailwind cuando sea necesario; validar comparando contra `references/pantallas/feed.dc.html`. |
| El estado del drawer/hamburguesa requiere interactividad en cliente y puede chocar con patrones de Server Components/`cacheComponents` si se ubica mal. | Aislar la interactividad del menú en un componente de cliente pequeño (solo donde se maneje el estado abrir/cerrar) manteniendo el resto estático cuando sea posible; consultar docs de Next 16 si aparece una restricción. |
| El dark mode global por `prefers-color-scheme` en `app/globals.css` altera los colores del mockup. | Neutralizar/eliminar ese override y fijar la paleta clara del mockup como base. |
| En mobile el contenido del sidebar dentro de un drawer puede diferir sutilmente del layout desktop. | Reutilizar el mismo componente/contenido de sidebar en ambos contextos y ajustar solo el contenedor (fijo vs drawer con overlay). |

## Lo que **no** está en esta spec

- Autenticación, manejo de sesión o roles (staff/familia).
- Base de datos, API o persistencia de publicaciones/datos.
- Rutas funcionales y pantallas destino del resto del producto.
- Interacciones reales de negocio (publicar, editar, dar like, comentar, ver foto, cerrar sesión) más allá de abrir/cerrar el menú mobile.
- Contenido distinto o dinámico respecto al mockup `feed.dc.html`.

Cada uno de esos puntos, si se aborda, irá en su propia spec.
