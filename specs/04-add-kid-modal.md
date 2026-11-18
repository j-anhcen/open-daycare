# SPEC 04 — Modal "Agregar niño" en `/kids`

> **Estado:** Implemented  
> **Depende de:** SPEC 02  
> **Fecha:** 2026-11-17  
> **Objetivo:** Implementar la plantilla `references/pantallas/agregar-nino.dc.html` como modal sobre `/kids` (abierto por el botón «Agregar niño») con formulario validado (nombre, fecha con máscara, sala, alergias, notas) que agrega el niño en memoria al listado agrupado por sala.

## Alcance

**Incluye:**

- **Modal sin ruta nueva**: componente cliente nuevo `components/kids/AddKidModal.tsx` montado sobre `/kids` (`fixed inset-0 z-50`, card centrada), abierto por el botón "Agregar niño" de `components/kids/KidsHeader.tsx`, que pasa de `<a href="#">` a `<button type="button">` con el mismo aspecto, comandado por una prop callback nueva `onAddKid`.
- **Fidelidad visual a `agregar-nino.dc.html`**: card `max-w-[520px] w-full` fondo `#FBF4EC` (token nuevo `--color-modal-surface`), borde `#ECE0D0` (`--color-line`), radio 24px, sombra `0 20px 50px -24px rgba(63,54,46,.35)`; header con padding `20px 26px` y "Cancelar" (muted 700 15px) / "Agregar niño" (Fredoka 600 18px) / "Guardar" (`--color-accent-label` 800 15px) sobre borde inferior; cuerpo con padding `24px 26px` y los 5 campos con labels 12px/800/tracking .7px/muted, inputs `13px 16px`, radio 14px, borde 1.5px `#EADFD0` (token nuevo `--color-input-border`), fondo blanco, placeholders `#B6A99B` (token nuevo `--color-input-placeholder`) y textos exactos ("Ej. Martina López", "dd/mm/aaaa", "Ej. Maní, Lactosa", "Indicaciones, medicación, contactos…"); textarea min-height 90px con resize vertical.
- **FECHA DE NACIMIENTO + SALA** compartiendo fila (`flex` gap 14px, cada uno `flex:1`) en `>= sm` y apilando en `< sm`; padding del overlay 40px 24px (16px en `< sm`).
- **SALA**: `<select>` nativo estilizado como la caja del mockup (valor en bold + `ChevronDownIcon` nuevo de 16px en `--color-muted-faint`), con placeholder inicial deshabilitado "Seleccioná una sala" y opciones `Soles`, `Mar`, `Jardín`.
- **Máscara de fecha**: input de texto que solo acepta dígitos, auto-inserta `/` tras el 2.º y 5.º dígito, máximo 10 caracteres, sanea contenido pegado.
- **Validación inline** (no existe mockup; diseño mínimo aprobado en preguntas): obligatorios nombre, fecha (calendario válida — p. ej. 31/02 rechazada — y no futura) y sala. Al presionar "Guardar" con errores el modal permanece abierto; cada campo inválido muestra borde 1.5px `#D9684A` (token `--color-input-error-border`) + mensaje en `#C5413A` (token `--color-input-error-text`) 12.5px bajo el campo, y el foco va al primero inválido. Los errores se limpian al corregir el campo (revalidación on change). Alergias y notas médicas opcionales.
- **"Guardar" válido = cerrar + agregar en memoria**: el modal se cierra con animación y el niño aparece como primera card de su sección. El `Kid` se deriva por completo en `buildKidFromForm(values, existingKids, addedCount)` (`app/_data/kids.ts`): `id` slug del nombre sin acentos (NFD, "Martina López" → `martina-lopez`; colisión → sufijo `-2`), `initial` primera letra, `ageLabel` años cumplidos desde la fecha (`<1` año → "N meses"), `avatarColor` ciclo fijo `blue → pink → green → yellow → purple` por orden de alta, `allergyLabels` parseadas por coma (trim, sin vacías, uppercase), `allergyNote` = notas médicas si las hay, `birthDateLabel` "12 mar 2022" (meses abreviados en español), `enrollmentLabel` mes y año actuales ("nov 2026"), `roomLabel` sala elegida, `parents: []`.
- **Listado agrupado por sala**: componente cliente nuevo `components/kids/KidsBoard.tsx` con el estado (`addedKids`, `isAddKidModalOpen`) que compone `KidsHeader`, `KidsSearch`, una sección por sala con niños (orden fijo Soles → Mar → Jardín; encabezado "SALA X" + contador derivado con plural correcto "1 niño"/"N niños" + línea) y el modal. `app/kids/page.tsx` queda server component y pasa los datos de `kidsPageData` a `KidsBoard`; los campos `roomLabel` y `kidsCountLabel` se eliminan de `KidsPageData` (pasan a derivarse). Estado inicial = idéntico al mockup actual (solo existe "SALA SOLES · 8 niños").
- **Chips múltiples de alergia**: `Kid.allergyLabel?: string` → `allergyLabels: string[]`; `KidCard` renderiza un chip por etiqueta y, cuando no hay padres, muestra el chip VINCULAR **junto con** los de alergia (los 8 iniciales nunca combinan ambos; hoy VINCULAR ocultaría las alergias del niño nuevo). Chevron como hoy cuando hay padres y no hay alergias.
- **Card del niño nuevo enlaza a `/kids/[id]` y muestra 404** (comportamiento aceptado explícitamente: el perfil requiere persistencia).
- **Animaciones**: modal siempre montado + clases de transición (patrón del drawer de `MobileMenu`, SPEC 01): apertura y cierre con fade + scale sutil (~200ms) en overlay (`bg-ink/35`) y card; Escape y click en overlay cierran; `overflow: hidden` en body mientras esté abierto; `inert` cerrado; `role="dialog"`, `aria-modal="true"`, `aria-labelledby` al título.
- Datos mock tipados en `app/_data/kids.ts` (`addKidModalData`: labels, placeholders, `roomOptions`, mensajes de error); `ChevronDownIcon` nuevo; 5 tokens `@theme` nuevos; actualizar el README de `components/kids`.

**Fuera de alcance (para futuras specs):**

- Persistencia real y perfil navegable del niño agregado (navegar o recargar pierde las altas).
- Botón "Editar" de `/kids/[id]` (misma plantilla, sigue placeholder).
- Vincular padres, resumen del día, foto/avatar propio, filtrado del buscador.
- Edición/eliminación de niños existentes, ruta `/agregar-nino`.
- Cambios en otras pantallas ya implementadas (feed, login, perfil estático).

## Modelo de datos

```ts
// app/_data/kids.ts — cambios (nombres/tipos en inglés, copy en español)
export type Kid = {
  id: string;
  name: string;
  initial: string;
  ageLabel: string;
  avatarColor: AvatarColorKey;
  allergyLabels: string[]; // era allergyLabel?: string — Mateo ["MANÍ"], Tomás ["LACTOSA"], resto []
  allergyNote?: string;
  birthDateLabel: string;  // "12 mar 2022"
  roomLabel: string;       // "Soles" | "Mar" | "Jardín"
  enrollmentLabel: string;
  parents: LinkedParent[];
};

export type KidsPageData = { eyebrowLabel: string; searchPlaceholder: string; kids: Kid[] };

export type AddKidModalData = {
  title: string;                    // "Agregar niño"
  cancelLabel: string;              // "Cancelar"
  saveLabel: string;                // "Guardar"
  nameLabel: string;                // "NOMBRE COMPLETO"
  namePlaceholder: string;          // "Ej. Martina López"
  birthDateLabel: string;           // "FECHA DE NACIMIENTO"
  birthDatePlaceholder: string;     // "dd/mm/aaaa"
  roomFieldLabel: string;           // "SALA"
  roomPlaceholder: string;          // "Seleccioná una sala"
  roomOptions: string[];            // ["Soles", "Mar", "Jardín"] — también define el orden de secciones
  allergiesLabel: string;           // "ALERGIAS (ETIQUETAS)"
  allergiesPlaceholder: string;     // "Ej. Maní, Lactosa"
  medicalNotesLabel: string;        // "NOTAS MÉDICAS"
  medicalNotesPlaceholder: string;  // "Indicaciones, medicación, contactos…"
  errorMessages: {
    nameRequired: string;       // "Ingresá el nombre completo."
    birthDateInvalid: string;   // "Ingresá una fecha válida en formato dd/mm/aaaa."
    birthDateFuture: string;    // "La fecha no puede ser futura."
    roomRequired: string;       // "Seleccioná una sala."
  };
};

// Estado del formulario (client, AddKidModal)
export type AddKidFormValues = {
  name: string;
  birthDate: string;  // "dd/mm/aaaa"
  room: string;       // "" | "Soles" | "Mar" | "Jardín"
  allergies: string;
  medicalNotes: string;
};

// Derivación pura, reutilizable y testeable
export function buildKidFromForm(values: AddKidFormValues, existingKids: Kid[], addedCount: number): Kid;
```

Convenciones:

- Solo se renderizan secciones con ≥1 niño, en el orden de `roomOptions`; el niño nuevo va primero en su sección.
- Slug: NFD lowercase sin acentos, espacios → `-`; colisión contra ids existentes → sufijo numérico.
- Meses abreviados: `ene feb mar abr may jun jul ago sep oct nov dic` (tanto `birthDateLabel` como `enrollmentLabel`).
- Edad: años cumplidos entre la fecha y hoy; `<1` año → "N meses".

## Plan de implementación

1. **Modelo y datos.** En `app/_data/kids.ts`: migrar `allergyLabel` → `allergyLabels` (los 8 iniciales con 1 etiqueta cada uno), quitar `roomLabel`/`kidsCountLabel` de `KidsPageData` (ajuste de compilación en `app/kids/page.tsx`), añadir tipos + `addKidModalData` + `buildKidFromForm`. Verificación: `npx tsc --noEmit`.
2. **KidCard multi-chip.** Renderizar todos los chips de `allergyLabels`; VINCULAR coexistiendo con alergias cuando `parents` esté vacío; chevron en el resto. Verificación: `/kids` visualmente idéntico a `ninos.dc.html`.
3. **Tokens e icono.** En `app/globals.css`: `--color-modal-surface: #fbf4ec`, `--color-input-border: #eadfd0`, `--color-input-placeholder: #b6a99b`, `--color-input-error-border: #d9684a`, `--color-input-error-text: #c5413a`; `ChevronDownIcon` en `components/shared/icons.tsx`. Verificación: `npm run dev` compila.
4. **Modal — estructura y animación.** `AddKidModal.tsx` (client): siempre montado + `inert`, overlay y card con transición de apertura/cierre (~200ms), efectos de Escape/overlay/scroll-lock (patrón MobileMenu), aria, header y los 5 campos con los estilos del mockup, select nativo con placeholder y 3 salas. Verificación: `npx tsc --noEmit` (la integración llega en 6).
5. **Modal — máscara y validación.** Fecha con máscara dd/mm/aaaa (dígitos, `/` automáticos, máx 10, pegado saneado); validación contra `errorMessages` al "Guardar", limpieza por campo on change, foco al primer inválido. Verificación: `npx tsc --noEmit`.
6. **Integración KidsBoard.** `KidsBoard.tsx` (client): estado `addedKids` + `isAddKidModalOpen`, `onAddKid` en `KidsHeader` (button), secciones agrupadas por sala con contadores derivados, `buildKidFromForm` al guardar y card primera en su sección; `app/kids/page.tsx` server pasando los datos. Verificación: flujo manual completo (guardar vacío → errores, guardar válido → alta, sala nueva → sección).
7. **Pulido y verificación final.** Comparación visual contra `agregar-nino.dc.html` (desktop y `< sm`), flujo completo con Playwright, `npx tsc --noEmit`, capturas en `.playwright-mcp/`.

## Criterios de aceptación

- [x] El botón "Agregar niño" abre el modal en la misma página (URL sin cambios); el resto de `/kids` queda visible detrás del overlay. Verificado con Playwright: URL permanece `/kids`, overlay `bg-ink/35` sobre el listado (capturas `spec04-modal-open.png`, `spec04-modal-1280.png`).
- [x] El modal reproduce `agregar-nino.dc.html`: card centrada `max-w-[520px]` con fondo `#FBF4EC`, borde `#ECE0D0`, radio 24px y sombra del mockup; header "Cancelar / Agregar niño / Guardar"; 5 campos con labels, estilos y placeholders exactos; FECHA + SALA en fila en `>= sm` y apilados en `< sm`. Verificado por estilos computados: card 520px/`rgb(251,244,236)`/`rgb(236,224,208)`/24px/sombra exacta; header `20px 26px` + borde inferior; cuerpo `24px 26px`; labels 12px/800/tracking .7px/muted; inputs `13px 16px`/15px/radio 14px/borde `#EADFD0`/placeholders `#B6A99B`; fila flex gap 14px con `flex:1` en ≥sm y columna en `<sm` (overlay 16px en móvil). Referencia capturada en `spec04-mockup-reference.png`.
- [x] SALA es un select nativo con la caja del mockup + chevron: inicial "Seleccioná una sala" y opciones Soles, Mar y Jardín. Verificado: `HTMLSelectElement` con `appearance:none`, valor en bold (700) color ink, chevron 16px `rgb(176,162,144)` posicionado; placeholder `<option value="" disabled>` seleccionado.
- [x] La máscara de fecha funciona: tipear "12032022" produce "12/03/2022"; ignora no dígitos; máximo 10 caracteres. Verificado: tipeo secuencial → "12/03/2022"; pegado "1a2/b-34c5678xyz" → "12/34/5678" (10 caracteres, letras y excedente descartados).
- [x] "Guardar" con el form vacío no cierra el modal: nombre, fecha y sala con borde `#D9684A` + su mensaje bajo el campo y foco en el primero inválido. Verificado: modal permanece abierto, bordes `rgb(217,104,74)` en los 3 campos, mensajes "Ingresá el nombre completo." / "Ingresá una fecha válida en formato dd/mm/aaaa." / "Seleccioná una sala." (color `rgb(197,65,58)`), foco en el nombre.
- [x] "31/02/2026" y una fecha incompleta se rechazan como inválidas; una fecha futura se rechaza con su mensaje; corregir un campo limpia su error. Verificado: "31022026" y "120320" → mensaje de formato; "01012030" → "La fecha no puede ser futura."; re-tipear "12032022" limpia el error (revalidación on change).
- [x] "Guardar" válido cierra el modal y agrega al niño como primera card de su sección: avatar con inicial y color del ciclo, "N años" calculado, "sin padres vinculados", chips de alergia en uppercase y VINCULAR. Verificado: "Martina López" 12/03/2022 Soles → primera card de SALA SOLES con avatar M azul (inicio del ciclo), "4 años", "sin padres vinculados", chips MANÍ + LACTOSA (uppercase) y VINCULAR; nacida 20/06/2025 → "1 año"; 20/06/2026 → "4 meses".
- [x] Agregar a Mar/Jardín crea su sección ("SALA MAR · 1 niño") debajo de Soles; agregar a Soles pone la card primera en la sección existente; contadores derivados con plural correcto. Verificado: tras altas → SALA SOLES "9 niños", SALA MAR "1 niño", SALA JARDÍN "1 niño" (orden Soles → Mar → Jardín); segunda "Martina López" → `/kids/martina-lopez-2` primera de su sección con "10 niños".
- [x] Sin altas, `/kids` se renderiza idéntico al mockup actual: única sección "SALA SOLES · 8 niños". Verificado en carga limpia y tras reload (capturas `spec04-kids-initial.png`, `spec04-final-static-kids.png`); chips de los 8 iniciales intactos (Mateo MANÍ, Tomás LACTOSA, Valentina VINCULAR).
- [x] La card del niño agregado enlaza a su `/kids/[id]` y muestra la página 404; navegar o recargar vuelve al listado estático de 8. Verificado: `/kids/julia-rios` → "404 This page could not be found."; volver a `/kids` → única sección "SALA SOLES · 8 niños".
- [x] "Cancelar", click en overlay y Escape cierran con animación de salida; el body no scrollea con el modal abierto; apertura y cierre animan overlay y card (~200ms, fade + scale sutil). Verificado: los 3 cierres dejan overlay `opacity-0` + `inert` (modal siempre montado); `body.style.overflow` "hidden" abierto y restaurado al cerrar; transiciones 0.2s `opacity` (overlay) y 0.2s `opacity, scale` (card, `scale-[0.98]` cerrado).
- [x] El modal expone `role="dialog"`, `aria-modal`, `aria-labelledby` y cierra con Escape. Verificado por atributos en el DOM (`aria-labelledby="add-kid-modal-title"` apunta al título) y cierre por Escape.
- [x] `npx tsc --noEmit` sin errores; 0 errores de consola en los flujos; capturas en `.playwright-mcp/`. Verificado: `npx tsc --noEmit` OK; 8 mensajes de consola en la sesión, 0 errores/0 warnings; capturas `spec04-*.png` en `.playwright-mcp/`.

## Decisiones

- **Sí:** modal con estado de cliente en `/kids` (sin ruta ni intercepting routes) — consistente con el enfoque mock del proyecto.
- **Sí:** "Guardar" agrega en memoria (decisión del usuario) con el `Kid` derivado por completo en `buildKidFromForm` — función pura, testeable, con acceso a los ids para colisiones.
- **Sí:** secciones por sala dinámicas (decisión del usuario); hoy idéntico al mockup porque solo existe Soles.
- **Sí:** la card del niño nuevo enlaza y da 404 (decisión explícita del usuario; el perfil navegable requiere persistencia).
- **Sí:** `allergyLabels: string[]` y VINCULAR coexistiendo con las alergias (las alergias de un niño nuevo no pueden quedar ocultas por el chip de vinculación).
- **Sí:** select con placeholder vacío (decisión del usuario) — desviación consciente del mockup (muestra "Soles" preseleccionado) para que el obligatorio de sala tenga efecto real.
- **Sí:** validación inline por campo (borde `#D9684A` + mensaje `#C5413A`) — no existe mockup de errores; diseño mínimo aprobado en preguntas.
- **Sí:** máscara + regla "fecha no futura" incluidas dentro de "que valide correctamente".
- **Sí:** modal montado permanentemente + clases de transición (patrón MobileMenu) — resuelve de paso la animación de salida.
- **No:** persistencia, "Editar" del perfil, focus trap completo, edición/eliminación de niños, ruta `/agregar-nino`.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Refactor `allergyLabel` → `allergyLabels` y baja de labels estáticas tocan SPEC 02. | Contenido de los 8 niños intacto; verificación visual contra `ninos.dc.html`; grep contenido (solo `KidCard` + `kids/page.tsx`). |
| Estados de error y máscara no existen en los mockups. | Mensajes centralizados en `addKidModalData.errors`; diseño mínimo aprobado en la fase de preguntas. |
| La pérdida al recargar/navegar puede sorprender. | Aceptado explícitamente; fijado como criterio de aceptación. |
| Animación de salida con unmount inmediato. | Modal siempre montado + `inert` (patrón MobileMenu existente). |
| `cacheComponents` con server page + árbol cliente con estado. | Patrón usado desde SPEC 01 (`MobileMenu`); `page.tsx` queda server con props serializables. |
| Dos niños con el mismo nombre colisionan el slug. | Sufijo incremental `-2`, `-3`… en `buildKidFromForm`. |

## Lo que **no** está en esta spec

- Persistencia real y perfil navegable del niño agregado.
- Botón "Editar" de `/kids/[id]`.
- Vincular padres, resumen del día, foto, filtrado del buscador, edición/eliminación de niños.

Cada uno de esos puntos, si se aborda, irá en su propia spec.
