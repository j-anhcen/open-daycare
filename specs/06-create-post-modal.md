# SPEC 06 — Modal «Nueva publicación» desde el sidebar

> **Estado:** Implemented
> **Depende de:** SPEC 01  
> **Fecha:** 2026-11-18  
> **Objetivo:** Implementar la plantilla `references/pantallas/crear-publicacion.dc.html` como modal sin ruta nueva, abierto desde el botón «Nueva publicación» del sidebar en `/`, `/kids` y `/kids/[id]`, con selección de destinatarios y tipo, fotos simuladas por drag & drop, y publicación que agrega el post en memoria al feed de `/`.

## Alcance

**Incluye:**

- **Modal sin ruta nueva**: componente cliente `components/feed/CreatePostModal.tsx` (`fixed inset-0 z-50`), montado una sola vez desde un provider global. La URL no cambia; el contenido debajo sigue visible tras el overlay `bg-ink/35`.
- **Trigger compartido**: `components/layout/Sidebar.tsx` reemplaza el `<Link href="/crear-publicacion">` por un cliente pequeño `components/feed/ComposeButton.tsx` con el mismo aspecto (gradiente `#F4977E → #EE8164`, `PlusIcon`, texto «Nueva publicación»). El botón usa el contexto para abrir el modal y llama a `onNavigate` (ya existente) después, de modo que en el drawer mobile `MobileMenu` se cierre antes de mostrar el modal. Sin cambios en la firma de `Sidebar` ni en `MobileMenu`.
- **Provider global**: `components/feed/CreatePostContext.tsx` (`"use client"`) en `app/layout.tsx`, dueño de `isOpen` y `addedPosts`; renderiza el modal una vez para toda la app. Expone `openModal`, `closeModal`, `publishPost` y `addedPosts`. Envuelve `{children}` sin convertir las páginas en cliente.
- **Feed con altas en memoria**: `components/feed/FeedPosts.tsx` (`"use client"`) consume `addedPosts` y renderiza `[...addedPosts, ...posts]`; `app/page.tsx` solo cambia el `map` inline por este componente. El resto del home (header, composer, separador) sigue siendo server component.
- **Fidelidad visual a `crear-publicacion.dc.html`**: overlay con padding `40px 24px` (`16px` en `< sm`) y scroll vertical; card `w-full max-w-[580px]`, fondo `--color-modal-surface`, borde `--color-line`, radio 24px, sombra `0 20px 50px -24px rgba(63,54,46,.35)`, `overflow-hidden`. Header `px-[26px] py-5` con borde inferior: «Cancelar» (`--color-muted`, 700, 15px), título Fredoka 600 18px `--color-ink`, «Publicar» (`--color-accent-label`, 800, 15px). Cuerpo `px-[26px] py-6`.
- **Secciones del mockup**: labels de 12px / 800 / tracking .7px / `--color-muted` con `mb-[10px]`. PARA: chips `flex-wrap gap-[9px] mb-[22px]`, avatar 26px Fredoka 600 13px y pill `rounded-full border-[1.5px] py-[6px] pl-[6px] pr-[14px]`; seleccionado con borde+fondo `--color-ink` y texto blanco, no seleccionado con borde `--color-line`, fondo `--color-surface` y texto `--color-nav-muted`; «Toda la sala» sin avatar, `px-4`. TIPO: 7 pills `rounded-full px-4 py-2 text-[13.5px] font-extrabold` con los colores exactos del mockup (Comida `#9A7B1E`, Siesta `#E7DCF6/#7B5FC0`, Actividad `#2E89A6`, Logro `#CFEBD8/#3E9B6C`, Ánimo `#F9D2DE/#C56486`, Foto `#FBD8CC/#D9684A`, Anuncio `#CCD8F4/#4E72C8`), selección única con `ring-2 ring-ink ring-offset-2 ring-offset-modal-surface` en el activo. DESCRIPCIÓN: textarea `w-full min-h-[120px] resize-y rounded-[14px] border-[1.5px] border-input-border bg-white p-[14px_16px] text-[15px] leading-[1.5] mb-[22px]`, pre-rellena con el texto del mockup. FOTOS: `flex gap-3`, tiles de 96×96 `rounded-[14px] bg-photo-bg`, el inicial con `ImageIcon` 26px `--color-muted-faint` y borde `--color-line`, y el bloque «Agregar» con borde dashed `--color-photo-border`, `PlusIcon` 22px `--color-accent-strong` y label 12px.
- **Selección PARA**: múltiple sobre Mateo / Sofía / Benjamín, con Mateo preseleccionado; elegir «Toda la sala» desmarca los niños y viceversa. TIPO arranca en Actividad.
- **FOTOS simuladas**: «Agregar» y el drag & drop de archivos sobre el bloque FOTOS insertan tiles en el formulario (uno por archivo, con su nombre como caption y botón X para quitarlos usando `CloseIcon`). No hay `FileReader`, `URL.createObjectURL` ni subida: sólo se guarda metadato en el estado del form. El container reacciona a `onDragOver`/`onDrop` con `preventDefault()`.
- **Validación**: «Publicar» con la descripción vacía no cierra; el textarea toma borde `--color-input-error-border` y muestra mensaje `--color-input-error-text` de 12.5px debajo, con foco en el textarea. El error se limpia al editar. PARA y TIPO siempre son válidos por la preselección.
- **Publicar válido**: `buildFeedPostFromForm(values)` deriva un `FeedPost` con `timeLabel: "ahora · publicado por vos"`, `likesCount: 0`, `commentsCount: 0`, `photoPlaceholderLabel` cuando hay tiles, `audienceLabel` según destinatarios («Para: familia de Mateo, Sofía» / «Para: toda la sala») y `authorName` del primer niño o «Anuncio general». El post se prependé al feed de `/`, el modal cierra con animación y el form se resetea a los valores iniciales del mockup.
- **Extensión tipos**: `PostType` pasa a incluir `meal`, `nap`, `photo` y `encouragement`; se completan los `Record<PostType, …>` de `PostCard` (`badgeStyles`, `avatarStyles`) con tokens nuevos. Los 3 posts mock conservan su apariencia actual.
- **Cierre, animación y a11y idénticos a specs 04/05**: siempre montado + `inert` cerrado, fade + scale ~200ms, cierre por Cancelar / Escape / click en overlay, scroll lock en `body`, `role="dialog"`, `aria-modal="true"` y `aria-labelledby="create-post-modal-title"`.
- Datos mock tipados en `app/_data/mock.ts` (`createPostModalData`), tokens nuevos en `app/globals.css` y actualización de los README de `components/feed/` y `components/layout/`.

**Fuera de alcance (para futuras specs):**

- Subida real de imágenes, previsualización con object URLs, compresión o almacenamiento.
- Persistencia (localStorage/base de datos) del post publicado; se pierde al recargar o navegar.
- Ruta `/crear-publicacion` o intercepting routes: el modal no cambia la URL.
- Edición/eliminación de posts, likes, comentarios ni acciones de los cards del feed.
- Cambios en `/avisos`, `/mi-cuenta`, login, activar-cuenta ni otras pantallas ya implementadas.

## Modelo de datos

```ts
// app/_data/mock.ts — altas (nombres/tipos en inglés, copy en español)

export type PostType =
  | "achievement" | "activity" | "announcement"
  | "meal" | "nap" | "photo" | "encouragement";

export type PostAudience = {
  id: string;              // "mateo" | "sofia" | "benjamin" | "all"
  label: string;           // "Mateo", "Sofía", "Benjamín", "Toda la sala"
  initial?: string;        // "M", "S", "B" — ausente en "all"
};

export type PostTypeOption = { value: PostType; label: string }; // 7 opciones del mockup

export type FormPhoto = { id: string; name: string };

export type CreatePostFormValues = {
  recipients: string[];     // ids; "all" es excluyente
  postType: PostType;       // arranca en "activity"
  description: string;      // arranca con el texto del mockup
  photos: FormPhoto[];      // 1 tile inicial sin nombre + los agregados
};

export type CreatePostModalData = {
  title: string;                    // "Nueva publicación"
  cancelLabel: string;              // "Cancelar"
  publishLabel: string;             // "Publicar"
  recipientsLabel: string;          // "PARA"
  recipients: PostAudience[];
  typeLabel: string;                // "TIPO"
  postTypes: PostTypeOption[];
  descriptionLabel: string;         // "DESCRIPCIÓN"
  descriptionPlaceholder: string;   // "Contá cómo le fue hoy…"
  initialDescription: string;       // texto exacto del mockup
  photosLabel: string;              // "FOTOS"
  addPhotoLabel: string;            // "Agregar"
  newPostPhotoLabel: string;        // "Foto · nueva publicación"
  allAudienceName: string;          // "Anuncio general"
  errorMessage: { descriptionRequired: string };
};

// Derivación pura
export function buildFeedPostFromForm(values: CreatePostFormValues): FeedPost;
```

Convenciones:

- `initialDescription` = «Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón.»
- `recipients` con `"all"` → `audienceLabel: "Para: toda la sala"` y `authorName: "Anuncio general"`; sin `"all"` → `authorName` = primer niño e `initial` del `PostAudience`.
- Varios niños → `audienceLabel: "Para: familia de Mateo, Sofía"` (nombres en el orden del mockup).
- `photoPlaceholderLabel` presente sólo si `photos.length > 0`.
- Todo el código en inglés; el copy visible en español tal como en el mockup.

## Plan de implementación

1. **Datos y tipos.** En `app/_data/mock.ts`: ampliar `PostType`, agregar los tipos, `createPostModalData` y `buildFeedPostFromForm`. Verificación: `npx tsc --noEmit` (fallará hasta el paso 2 por los `Record` de `PostCard`).
2. **PostCard multi-tipo.** Completar `badgeStyles` y `avatarStyles` con los 4 tipos nuevos. Verificación: `npx tsc --noEmit` sin errores; los 3 posts del mockup se ven igual.
3. **Tokens e integración del feed.** Tokens `@theme` nuevos para los pills de tipo. Crear `CreatePostContext.tsx`, `FeedPosts.tsx`; montar el provider en `app/layout.tsx` y cambiar el `map` de `app/page.tsx`. Verificación: `/` sigue idéntico y compila.
4. **Trigger.** Crear `ComposeButton.tsx`; `Sidebar.tsx` lo usa en lugar del `<Link>` y le pasa `onNavigate`. Verificación: el CTA abre el modal en `/`, `/kids` y `/kids/[id]`; en mobile el drawer se cierra primero.
5. **Modal — estructura y animación.** `CreatePostModal.tsx`: overlay/card, transición ~200ms, Escape/overlay/Cancelar, scroll lock, `inert`, aria, header, PARA, TIPO, textarea y FOTOS con el estilo del mockup. Verificación: `npx tsc --noEmit`.
6. **Modal — interacción.** Selección PARA excluyente, TIPO único, validación de descripción, tiles por «Agregar» y drag & drop sin subida, reset al cerrar, `publishPost` vía contexto. Verificación: flujo manual completo.
7. **Pulido y verificación final.** Comparación visual contra `crear-publicacion.dc.html` (desktop y `< sm`), flujo con Playwright, `npx tsc --noEmit`, capturas en `.playwright-mcp/` y READMEs actualizados.

## Criterios de aceptación

- [x] El botón «Nueva publicación» abre el modal sin cambiar la URL en `/`, `/kids` y `/kids/[id]`; si el drawer mobile está abierto, se cierra antes de mostrar el modal. Verificado con Playwright: CTA presente en las 3 rutas (`/kids/mateo-fernandez` como perfil válido), URL sin cambios; en 390px el drawer queda `inert` y el modal visible (captura `spec06-final-modal-mobile.png`).
- [x] El modal reproduce el mockup: card centrada `max-w-[580px]`, fondo `#FBF4EC`, borde `#ECE0D0`, radio 24px, sombra exacta; header «Cancelar / Nueva publicación / Publicar» y los 4 bloques con labels, paddings y textos del mockup. Verificado por estilos computados: 580px, `rgb(251,244,236)`, `rgb(236,224,208)`, 24px, `rgba(63,54,46,0.35) 0px 20px 50px -24px`, overlay `40px 24px` (`16px` en móvil), header `20px 26px`, cuerpo `24px 26px`, card a 40px/16px del top (captura `spec06-final-modal-desktop.png`).
- [x] PARA muestra Mateo preseleccionado con avatar azul, Sofía rosa y Benjamín verde; permite varios niños y «Toda la sala» desmarca a los niños (y viceversa). Verificado: estado inicial `[Mateo, Actividad]`; al sumar Sofía quedan Mateo+Sofía; «Toda la sala» deja solo esa opción; al elegir Mateo se desmarca la sala. Avatares con los tokens azul/rosa/verde del mockup.
- [x] TIPO muestra los 7 pills con sus colores exactos, arranca en «Actividad» y marca el activo con un anillo; al elegir otro, el anterior se desmarca. Verificado: `aria-pressed` inicial en Actividad, estilos computados `rgb(46,137,166)` + ring `rgb(251,244,236)` 2px / `rgb(63,54,46)` 4px; al elegir Comida queda solo Comida presionada.
- [x] La textarea arranca con el texto del mockup; vaciarla y presionar «Publicar» mantiene el modal abierto, muestra borde/mensaje de error y enfoca el textarea; al editar, el error desaparece. Verificado: texto inicial exacto, borde `rgb(217,104,74)`, mensaje «Escribí una descripción para publicar.», foco en `#create-post-description`, modal abierto; al tipear se limpia el error.
- [x] «Agregar» y arrastrar archivos al bloque FOTOS agregan tiles al formulario con el nombre del archivo y un botón X para quitarlos; no se crean object URLs ni peticiones de red. Verificado: 1 tile inicial + Agregar + 2 archivos dropeados (`spec06-photo-a.png`, `spec06-photo-b.jpg`), 3 botones X; quitar uno lo elimina; 0 peticiones POST/upload en la sesión; el código solo guarda `{ id, name }` con `preventDefault()` en dragover/drop.
- [x] Publicar válido agrega el post como primero del feed con badge del tipo elegido, destinatario correcto, «ahora · publicado por vos», contadores en 0 y placeholder de foto cuando hay tiles; el modal cierra y el form vuelve a los valores iniciales. Verificado: Mateo+Sofía/Comida → «COMIDA · Para: familia de Mateo, Sofía»; toda la sala/Siesta → «SIESTA · Anuncio general · Para: toda la sala»; ambos con `ahora · publicado por vos`, `0/0`, `Foto · nueva publicación`; al reabrir vuelven Mateo, Actividad, la descripción del mockup y el tile inicial.
- [x] El post agregado se pierde al recargar o navegar; sin altas, `/` muestra los 3 posts del mockup en el mismo orden. Verificado: 3 posts iniciales; tras publicar 4, al navegar por `Link` a `/kids` y volver quedan 3, y lo mismo tras reload. El provider limpia `addedPosts` al cambiar de ruta.
- [x] Cancelar, Escape y click en overlay cierran con animación; el `body` no scrollea con el modal abierto; cerrado queda `inert` y `pointer-events-none`. Verificado: las 3 vías dejan el contenedor `inert`; `body.style.overflow` `hidden` abierto y restaurado al cerrar; transiciones `0.2s opacity` y `0.2s opacity, scale` (`scale-[0.98]` cerrado).
- [x] El modal expone `role="dialog"`, `aria-modal="true"` y `aria-labelledby` apuntando al título. Verificado por atributos del DOM: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="create-post-modal-title"` sobre el `id` del título.
- [x] `npx tsc --noEmit` sin errores, 0 errores de consola y capturas guardadas en `.playwright-mcp/`. Verificado: `npx tsc --noEmit` y `npm run build` limpios; 0 errores/warnings de consola en los flujos finales; capturas `spec06-step5-modal-desktop.png`, `spec06-final-modal-desktop.png` y `spec06-final-modal-mobile.png`.

## Decisiones

- **Sí:** modal global vía contexto en `app/layout.tsx` — el botón vive en un sidebar compartido por 3 rutas y así no hay que tocarlas.
- **Sí:** `Sidebar` sigue siendo server component; sólo el CTA es cliente y reutiliza `onNavigate` para cerrar el drawer (decisión derivada de las respuestas).
- **Sí:** publicar agrega el post en memoria (decisión del usuario), con derivación pura en `buildFeedPostFromForm`, igual que specs 04/05.
- **Sí:** PARA múltiple con «Toda la sala» excluyente y TIPO único con anillo visible (decisión del usuario).
- **Sí:** estado inicial calcado del mockup: «Actividad» preseleccionado y descripción pre-rellena (decisión del usuario).
- **Sí:** «Agregar» y drag & drop sólo insertan tiles en el form; sin subida real (decisión del usuario).
- **Sí:** validación inline de descripción, reutilizando los tokens de error de specs 04/05.
- **No:** ruta `/crear-publicacion`, persistencia, subida real de imágenes ni interacción con posts existentes.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Ampliar `PostType` rompe los `Record` exhaustivos de `PostCard`. | Completar `badgeStyles` y `avatarStyles` en el mismo cambio; el tipado falla rápido y se detecta con `tsc`. |
| Provider cliente en `app/layout.tsx` con `cacheComponents` habilitado. | El provider no hace fetch ni cache; verificar `npm run dev` y `npm run build` antes de cerrar la spec. |
| El modal queda montado en rutas sin sidebar (login/activar-cuenta). | Está `inert` y no es alcanzable; aceptado para evitar tocar esas páginas. |
| Drag & drop puede interpretar el archivo como contenido a subir. | `preventDefault()` en `dragover`/`drop`; guardar sólo `{ id, name }` y nunca el `File`. |
| El post publicado desaparece al navegar. | Decisión explícita, alineada con specs 04/05 y documentada como criterio de aceptación. |

## Lo que **no** está en esta spec

- Subida real de fotos, previsualizaciones ni almacenamiento de archivos.
- Persistencia de publicaciones ni edición de posts existentes.
- Ruta `/crear-publicacion`, intercepting routes ni navegación desde el modal.
- Cambios en avisos, mi cuenta, login, activar-cuenta ni en el comportamiento de likes/comentarios.

Cada uno de esos puntos, si se aborda, va en su propia spec.
