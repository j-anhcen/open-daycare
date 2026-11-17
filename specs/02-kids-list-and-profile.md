# SPEC 02 — Niños: listado (`/kids`) y perfil (`/kids/[id]`)

> **Estado:** Approved  
> **Depende de:** SPEC 01  
> **Fecha:** 2026-11-16  
> **Objetivo:** Implementar las plantillas `references/pantallas/ninos.dc.html` y `references/pantallas/perfil-nino.dc.html` como las rutas `/kids` (listado de niños con búsqueda visual) y `/kids/[id]` (perfil con datos y padres vinculados), reutilizando el layout responsive de SPEC 01, con datos mock estáticos y navegación real solo entre las pantallas ya implementadas.

## Alcance

**Incluye:**

- Crear `app/kids/page.tsx` (listado): encabezado “GESTIÓN / Niños” + CTA “Agregar niño” (placeholder), input “Buscar niño…” (solo visual), separador “SALA SOLES · 8 niños”, grid de 2 columnas (`1` en `< md`) con las 8 cards del mockup en el mismo orden (Mateo MANÍ, Sofía, Benjamín, Valentina VINCULAR, Tomás LACTOSA, Emma, Lucas, Olivia), con hover del mockup (borde `#F2A78E` + `translateY(-2px)`).
- Crear `app/kids/[id]/page.tsx` (perfil): link “Volver a Niños” → `/kids`, bloque de identidad (avatar 84px, nombre, “3 años · Sala Soles”, botón “Editar” placeholder), caja “Alergias y notas”, detalles (Fecha de nacimiento / Sala / Ingreso), columna derecha con botón oscuro “Resumen del día” (placeholder) y card “PADRES VINCULADOS” con badges ACTIVA/PENDIENTE y link “Vincular otro padre” (placeholder).
- Datos mock en módulo nuevo `app/_data/kids.ts`: tipos y contenido para los 8 niños con ids slug (p. ej. `mateo-fernandez`); Mateo con el contenido exacto del mockup de perfil; los otros 7 con datos inventados coherentes con la lista (edad, conteo de padres, alergías).
- `notFound()` (404) para ids desconocidos; `generateStaticParams` con los 8 slugs; `generateMetadata` con el nombre del niño.
- Refactor de `Sidebar`/`MobileMenu` (`components/layout/`): nueva prop `activeItem` (`"feed" | "kids" | …`); item “Niños” con `href` real a `/kids` y activo en ambas rutas; `app/page.tsx` pasa `activeItem="feed"` (comportamiento de `/` sin cambios).
- Extraer `currentUser` como export nombrado (tipo `StaffUser`) de `app/_data/mock.ts` para reutilizarlo en las páginas de niños.
- Componentes bajo `components/kids/` (+ `README.md` de propósito): `KidsHeader`, `KidsSearch`, `KidCard`, `ProfileHeader`, `AllergyNoteCard`, `ProfileDetailsCard`, `LinkedParentsCard`. Avatar compartido en `components/shared/Avatar.tsx` (5 pares de color, prop de tamaño: 40/48/84px).
- Nuevos tokens `@theme` en `app/globals.css` (pares de avatar azul/rosa/verde/amarillo/violeta, chips alergia/vincular/estado de padres, caja de alergias) e iconos en `components/shared/icons.tsx` (`SearchIcon`, `ChevronRightIcon`, `ArrowLeftIcon`, `WarningIcon`).
- Links internos reales vía `next/link`; el resto de enlaces/botones permanecen placeholders (`href="#"`).
- Patrón responsive de SPEC 01 en ambas rutas (sidebar sticky desktop, drawer hamburguesa mobile).

**Fuera de alcance (para futuras specs):**

- Pantallas destino no implementadas: `/agregar-nino` (Agregar niño, Editar), `/vincular-padre`, `/resumen-dia`, `/avisos`, `/mi-cuenta`, `/crear-publicacion`, `/login` — sus enlaces siguen como placeholders.
- Filtrado real del buscador.
- Autenticación, base de datos, mutaciones (crear/editar niño, vincular padre).
- Los demás items del sidebar (incluido “Feed”) mantienen `href="#"` como en SPEC 01.
- Contenido dinámico distinto de los mockups.

## Modelo de datos

Nuevo módulo `app/_data/kids.ts` (nombres/tipos en inglés, contenido en español). Sin persistencia.

```ts
export type AvatarColorKey = "blue" | "pink" | "green" | "yellow" | "purple";
export type ParentStatus = "active" | "pending";

export type LinkedParent = {
  name: string;        // "Lucía Fernández"
  initial: string;     // "L"
  roleLabel: string;   // "Mamá" | "Papá"
  statusLabel: string; // "activa" | "invitación enviada"
  status: ParentStatus;
  avatarColor: AvatarColorKey;
};

export type Kid = {
  id: string;              // slug: "mateo-fernandez"
  name: string;
  initial: string;         // "M"
  ageLabel: string;        // "3 años"
  avatarColor: AvatarColorKey;
  allergyLabel?: string;   // "MANÍ" | "LACTOSA" → chip en la lista
  allergyNote?: string;    // texto de la caja "Alergias y notas"
  birthDateLabel: string;  // "12 mar 2022"
  roomLabel: string;       // "Soles"
  enrollmentLabel: string; // "feb 2025"
  parents: LinkedParent[]; // conteo coherente con la lista
};

export type KidsPageData = {
  eyebrowLabel: string;      // "GESTIÓN"
  searchPlaceholder: string; // "Buscar niño…"
  roomLabel: string;         // "SALA SOLES"
  kidsCountLabel: string;    // "8 niños"
  kids: Kid[];               // 8 items, mismo orden que el mockup
};
```

Convenciones:

- La caja “Alergias y notas” solo se renderiza si el niño tiene `allergyNote`.
- Para Valentina (`parents: []`) la card de padres muestra únicamente “Vincular otro padre”.
- Se conserva la inconsistencia intencional entre mockups (feed “12 niños” vs listado “8 niños”).

## Plan de implementación

1. **Datos mock.** Crear `app/_data/kids.ts` con tipos y `kidsPageData` (8 niños, ids slug, Mateo exacto al mockup). Extraer `currentUser`/`StaffUser` en `app/_data/mock.ts`. Verificación: `npx tsc --noEmit`.
2. **Tokens e iconos.** Ampliar `@theme` en `app/globals.css` (pares de avatar, chips, alergias) y añadir los 4 iconos nuevos en `components/shared/icons.tsx`. Verificación: `npm run dev` compila.
3. **Sidebar activo.** Añadir prop `activeItem` a `Sidebar` y `MobileMenu`; “Niños” → `href="/kids"`; `app/page.tsx` pasa `"feed"`. Verificación: `/` se ve igual y marca “Feed”.
4. **Componentes del listado.** `components/kids/` + `README.md`: `KidsHeader`, `KidsSearch`, `KidCard`, y `Avatar` en `components/shared/`. Grid responsive 2/1 columnas con hover del mockup.
5. **Página `/kids`.** `app/kids/page.tsx` componiendo la vista con `activeItem="kids"` y metadata propia. Verificación manual contra `ninos.dc.html`.
6. **Componentes del perfil.** `ProfileHeader` (con “Volver a Niños”), `AllergyNoteCard`, `ProfileDetailsCard`, `LinkedParentsCard` (incluye “Vincular otro padre”).
7. **Página `/kids/[id]`.** `PageProps<"/kids/[id]">`, `await params`, `notFound()` para ids desconocidos, `generateStaticParams` (8 slugs) y `generateMetadata`. Verificación: los 8 ids responden 200; id inexistente → 404.
8. **Pulido y verificación final.** Comparación visual contra ambos mockups (desktop y mobile), navegación cruzada (`/` ↔ `/kids` ↔ perfil), `npx tsc --noEmit` sin errores, capturas en `.playwright-mcp/`.

## Criterios de aceptación

- [ ] `/kids` renderiza sin errores de consola/compilación, con el mismo contenido, orden y chips del mockup (`ninos.dc.html`): 8 cards, MANÍ/LACTOSA (`#FBD8CC`/`#D9684A`), VINCULAR (`#F9D2DE`/`#C56486`) solo en Valentina, chevron en el resto.
- [ ] Grid de 2 columnas en `>= md` y 1 en `< md`, con hover del mockup en las cards.
- [ ] Cada card navega a su `/kids/[id]` (ids slug) y “Volver a Niños” regresa a `/kids`.
- [ ] `/kids/mateo-fernandez` reproduce exactamente el mockup de perfil (avatar, “3 años · Sala Soles”, Editar, caja de alergias con su texto, 12 mar 2022 / Soles / feb 2025, Resumen del día, Lucía ACTIVA, Diego PENDIENTE, “Vincular otro padre”).
- [ ] Los 8 ids devuelven 200 con perfil completo coherente con la lista; un id inexistente devuelve 404.
- [ ] Sidebar marca “Niños” activo (`#FBE3D8`/`#D9583C`) en ambas rutas y enlaza a `/kids`; en `/` sigue marcando “Feed” con idéntico aspecto al actual.
- [ ] El buscador está presente (“Buscar niño…”) y no filtra; sin `fetch`, rutas de API ni datos reales.
- [ ] Patrón responsive de SPEC 01 operativo en ambas rutas (drawer mobile incluido).
- [ ] `npx tsc --noEmit` pasa sin errores; capturas de verificación en `.playwright-mcp/`.

## Decisiones

- **Sí:** navegación real solo entre pantallas implementadas (item “Niños”, cards, “Volver a Niños”) vía `next/link`; el resto queda placeholder.
- **Sí:** prop `activeItem` en Sidebar/MobileMenu — explícito, sin estado, mantiene server components.
- **Sí:** buscador solo visual (consistente con SPEC 01); el filtrado va en una spec futura.
- **Sí:** módulo `app/_data/kids.ts` separado del feed; `currentUser` extraído de `mock.ts` para no duplicarlo.
- **Sí:** 8 perfiles completos con ids slug + `notFound()` + `generateStaticParams`.
- **Sí:** `Avatar` compartido con 5 pares de color por token `@theme` (se acepta duplicar el par azul ya usado por el feed para no refactorar SPEC 01).
- **Sí:** la caja de alergias solo se renderiza cuando existe `allergyNote` (no se inventa UI nueva).
- **No:** filtrado real, pantallas destino, autenticación/DB, o cambiar los `href="#"` del resto del sidebar.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `cacheComponents` + `params` dinámico puede exigir prerender o límites de cache. | `generateStaticParams` + `await params` según doc local de Next 16; consultar `08-caching.md` si aparece una restricción. |
| Fidelidad visual con Tailwind vs CSS inline del mockup (mismo caso que SPEC 01). | Tokens + valores arbitrarios de Tailwind; validar con capturas comparativas. |
| Datos inventados para 7 niños podrían entrar en conflicto con specs futuras (resumen, vincular). | Única fuente de verdad en `kids.ts`, coherente con la lista. |

## Lo que **no** está en esta spec

- Pantallas destino enlazadas no implementadas (agregar/editar niño, vincular padre, resumen del día, avisos, mi cuenta, crear publicación, login).
- Filtrado del buscador, autenticación, base de datos o mutaciones.
- Cambios de navegación en items del sidebar no implementados.

Cada uno de esos puntos, si se aborda, irá en su propia spec.
