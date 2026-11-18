# SPEC 05 — Modal "Vincular padre" en `/kids/[id]`

> **Estado:** Implemented  
> **Depende de:** SPEC 02, SPEC 04  
> **Fecha:** 2026-11-18  
> **Objetivo:** Implementar la plantilla `references/pantallas/vincular-padre.dc.html` como modal sobre `/kids/[id]`, abierto por «Vincular otro padre», con formulario validado que agrega un padre PENDIENTE en memoria al card «PADRES VINCULADOS».

## Alcance

**Incluye:**

- **Modal sin ruta nueva**: componente cliente nuevo `components/kids/LinkParentModal.tsx` (`fixed inset-0 z-50`) montado sobre `/kids/[id]`, abierto por el trigger «Vincular otro padre» de `components/kids/LinkedParentsCard.tsx`. La URL no cambia.
- **Estado en un wrapper cliente nuevo** `components/kids/KidProfileAside.tsx`: dueño de `isOpen` y de la lista local de padres vinculados; compone el botón «Resumen del día» (sigue placeholder), `LinkedParentsCard` y el modal. `app/kids/[id]/page.tsx` sigue siendo server component y solo pasa `kid`. Patrón idéntico al de `KidsBoard` (SPEC 04).
- **Fidelidad visual a `vincular-padre.dc.html`**: card `max-w-[480px] w-full`, fondo `#FBF4EC` (token existente `--color-modal-surface`), borde `#ECE0D0` (`--color-line`), radio 24px, sombra `0 20px 50px -24px rgba(63,54,46,.35)`; overlay `bg-ink/35` con padding `40px 24px` (`16px` en `< sm`); header `20px 26px` con borde inferior, título Fredoka 600 18px, subtítulo 13px `--color-muted-light` y botón X de 34×34px / radio 10px / fondo `#F0E6D8` / color `--color-muted` con `CloseIcon` de 18px; cuerpo `22px 26px`.
- **Caja informativa**: flex gap 11px, fondo `#E3ECFB`, radio 14px, padding `13px 16px`, margin-bottom 20px; `InfoIcon` 20px en `#4E72C8`; texto 13.5px / line-height 1.45 en `#3F5694`: «Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {primerNombre}.»
- **Campos NOMBRE DEL PADRE/MADRE y EMAIL**: labels 12px / 800 / tracking .7px en `--color-muted` con margin-bottom 8px; placeholders «Ej. Diego Fernández» y «correo@ejemplo.com»; inputs `13px 16px`, radio 14px, borde 1.5px `--color-input-border`, fondo blanco, 15px `--color-ink`, placeholders `--color-input-placeholder`, margin-bottom 18px. EMAIL usa `type="email"`.
- **PARENTESCO**: tres pills `flex:1` gap 9px, padding 11px, radio 999px, borde 1.5px, 14px / 800, margin-bottom 20px. Preseleccionada «Mamá» con borde `#9FB8EC`, fondo `#CCD8F4` y texto `#4E72C8`; «Papá» y «Tutor/a» con borde `--color-line`, fondo `--color-surface` y texto `--color-nav-muted`. Selección única (radio group accesible).
- **Código de invitación**: caja fondo `#FBF1D6`, borde 1.5px dashed `#E6D08A`, radio 16px, padding 18px, centrada, margin-bottom 20px; label 12px / 800 / tracking .7px `#A88526`, código Fredoka 600 34px / tracking 7px `#8A7234` con el valor fijo `7K4P9`, y «Vence en 7 días» 13px `#A88526`.
- **CTA «Enviar invitación»**: ancho completo, flex centrado gap 9px, padding 14px, radio 14px, gradiente `#F4977E → #EE8164`, blanco 800 15.5px, sombra `0 10px 22px -8px rgba(238,129,100,.7)` e icono `SendIcon` nuevo de 19px.
- **Trigger convertido en botón**: `LinkedParentsCard` recibe la prop `onLinkParent: () => void`; el `<a href="#">` pasa a `<button type="button">` conservando el className y el aspecto exacto.
- **Validación inline**: nombre y email obligatorios; email con formato válido. Borde `--color-input-error-border` + mensaje 12.5px `--color-input-error-text` bajo el campo, foco al primero inválido y limpieza del error al editar (mismo patrón y estilos que SPEC 04). Parentesco siempre válido por la preselección. El email se valida pero no se guarda en el modelo `LinkedParent`.
- **Envío válido = cerrar + agregar en memoria**: `buildLinkedParentFromForm(values, kid)` deriva un `LinkedParent` con `status: "pending"`, `statusLabel: "invitación enviada"`, `roleLabel` según parentesco, `initial` del nombre e `avatarColor` `purple` para Mamá y `blue` para Papá/Tutor/a. La fila aparece nueva en el card; se pierde al recargar o navegar.
- **Cierre, animación y a11y idénticos a SPEC 04**: modal siempre montado + `inert` cuando está cerrado, fade + scale sutil ~200ms, cierre por X / Escape / click en overlay, scroll lock en `body`, `role="dialog"`, `aria-modal="true"` y `aria-labelledby` al título. El formulario se resetea al cerrar.
- **Datos mock tipados** en `app/_data/kids.ts` (`linkParentModalData`: copy, placeholders, opciones, código, vencimiento y mensajes de error); 8 tokens `@theme` nuevos; iconos `InfoIcon` y `SendIcon`; actualización del README de `components/kids`.

**Fuera de alcance (para futuras specs):**

- Envío real de correo, generación/expiración real del código y persistencia (localStorage o base de datos).
- Ruta `/vincular-padre` o navegación a `perfil-nino`: el modal no cambia la URL.
- Aceptar/activar invitaciones, editar o quitar padres ya vinculados, modificar badges ACTIVA/PENDIENTE existentes.
- Botón «Resumen del día», «Editar», feed familiar, login, filtrado del buscador ni otras pantallas ya implementadas.

## Modelo de datos

```ts
// app/_data/kids.ts — altas (nombres en inglés, copy en español)
export type ParentRelationship = "mom" | "dad" | "tutor";

export type LinkParentFormValues = {
  name: string;
  email: string;
  relationship: ParentRelationship;
};

export type LinkParentModalData = {
  title: string;                 // "Vincular padre"
  subtitlePrefix: string;        // "a " + kid.name
  infoText: string;              // "... Solo verá el feed de {firstName}."
  nameLabel: string;             // "NOMBRE DEL PADRE/MADRE"
  namePlaceholder: string;       // "Ej. Diego Fernández"
  emailLabel: string;            // "EMAIL"
  emailPlaceholder: string;      // "correo@ejemplo.com"
  relationshipLabel: string;     // "PARENTESCO"
  relationshipOptions: { value: ParentRelationship; label: string }[]; // Mamá, Papá, Tutor/a
  codeLabel: string;             // "CÓDIGO DE INVITACIÓN"
  invitationCode: string;        // "7K4P9"
  expiryLabel: string;           // "Vence en 7 días"
  submitLabel: string;           // "Enviar invitación"
  errorMessages: {
    nameRequired: string;        // p. ej. "Ingresá el nombre del padre o madre."
    emailRequired: string;       // p. ej. "Ingresá el correo electrónico."
    emailInvalid: string;        // p. ej. "Ingresá un correo válido."
  };
};

// Derivación pura y reutilizable
export function buildLinkedParentFromForm(
  values: LinkParentFormValues,
  kid: Kid,
): LinkedParent;
```

Convenciones:

- Subtítulo del header = `a ${kid.name}`; texto informativo usa `kid.name.split(" ")[0]` (primer nombre).
- `buildLinkedParentFromForm`: `initial` = primera letra de `values.name.trim()`, `roleLabel` = label de la opción elegida, `statusLabel` = «invitación enviada», `status` = `"pending"`, `avatarColor` = `"purple"` si `mom`, `"blue"` si `dad` o `tutor`.
- `LinkParentFormValues.relationship` arranca en `"mom"`; no existe estado «sin selección».

## Plan de implementación

1. **Datos y tipos.** En `app/_data/kids.ts`: `ParentRelationship`, `LinkParentFormValues`, `LinkParentModalData`, `linkParentModalData` y `buildLinkedParentFromForm`. Verificación: `npx tsc --noEmit`.
2. **Tokens e iconos.** En `app/globals.css`: `--color-close-button-bg: #f0e6d8`, `--color-info-box-bg: #e3ecfb`, `--color-info-text: #3f5694`, `--color-info-icon: #4e72c8`, `--color-relationship-selected-border: #9fb8ec`, `--color-relationship-selected-bg: #ccd8f4`, `--color-code-box-border: #e6d08a`, `--color-code-label: #a88526`. `InfoIcon` y `SendIcon` en `components/shared/icons.tsx`. Verificación: `npm run dev` compila.
3. **Modal — estructura y animación.** `LinkParentModal.tsx` (client, siempre montado + `inert`): overlay y card con transición ~200ms, Escape/overlay/X, scroll lock, aria, header dinámico, caja informativa, dos inputs, pills, caja de código y CTA con `SendIcon`. Verificación: `npx tsc --noEmit`.
4. **Modal — validación y reset.** Validación de nombre/email contra `errorMessages`, foco al primer inválido, limpieza por campo on change y reset del form al cerrar. Verificación: `npx tsc --noEmit`.
5. **Integración completa.** `LinkedParentsCard` con `onLinkParent` (button en lugar de anchor); `KidProfileAside.tsx` (client) con `isOpen` + `linkedParents`, compose del botón «Resumen del día», el card y el modal; `app/kids/[id]/page.tsx` pasa `kid`. El submit válido deriva el padre, agrega la fila PENDIENTE, cierra y resetea. Verificación: flujo manual en `/kids/mateo-fernandez` (abrir, vacío → errores, válido → nueva fila).
6. **Pulido y verificación final.** Comparación visual contra `vincular-padre.dc.html` en desktop y `< sm`, flujo completo con Playwright, `npx tsc --noEmit`, capturas en `.playwright-mcp/` y actualización del README de `components/kids`.

## Criterios de aceptación

- [ ] El link «Vincular otro padre» abre el modal en `/kids/[id]` sin cambiar la URL; el perfil queda visible detrás del overlay.
- [ ] El modal reproduce `vincular-padre.dc.html`: card centrada `max-w-[480px]`, fondo `#FBF4EC`, borde `#ECE0D0`, radio 24px y sombra exacta; header con título/subtítulo/X; cuerpo con los cinco bloques y el CTA; paddings del mockup en desktop y `< sm`.
- [ ] El subtítulo muestra el nombre completo del niño y el aviso usa su primer nombre; en `/kids/sofia-mendez` dice «a Sofía Méndez» y «feed de Sofía».
- [ ] PARENTESCO preselecciona «Mamá», es de selección única y aplica los colores del mockup a la opción activa y a las inactivas.
- [ ] La caja muestra exactamente «CÓDIGO DE INVITACIÓN», `7K4P9` y «Vence en 7 días», con fondo/borde dashed del mockup.
- [ ] «Enviar invitación» con campos vacíos no cierra: nombre y email con borde `#D9684A` + mensaje y foco en el nombre; un email sin `@` se rechaza; corregir un campo limpia su error.
- [ ] Enviar válido cierra el modal y agrega al card una fila con el nombre, «{parentesco} · invitación enviada» y badge PENDIENTE, con avatar de la inicial y color `purple`/`blue` según parentesco.
- [ ] La fila agregada se pierde al recargar o navegar; el perfil vuelve a mostrar sus padres mock.
- [ ] X, Escape y click en overlay cierran con animación; el `body` no scrollea con el modal abierto; cerrado queda `inert` y `pointer-events-none`.
- [ ] El modal expone `role="dialog"`, `aria-modal="true"` y `aria-labelledby` apuntando al título; al reabrir no aparecen valores del envío anterior.
- [ ] `npx tsc --noEmit` sin errores, 0 errores de consola y capturas en `.playwright-mcp/`.

## Decisiones

- **Sí:** modal sin ruta, con el estado en un wrapper cliente de la columna derecha (patrón SPEC 04); `page.tsx` permanece server.
- **Sí:** el trigger pasa de `<a href="#">` a `<button type="button">` con el mismo aspecto y un callback.
- **Sí:** el envío agrega un padre PENDIENTE en memoria (decisión del usuario), derivado por la función pura `buildLinkedParentFromForm`.
- **Sí:** validación inline estilo SPEC 04 (decisión del usuario); el mockup no contemplaba estados de error.
- **Sí:** código fijo `7K4P9` y vencimiento estático (decisión del usuario): determinístico y verificable.
- **Sí:** copia derivada de `kid.name` (decisión del usuario), válida en los 8 perfiles.
- **Sí:** «Mamá» preseleccionada, igual que en el mockup.
- **Sí:** el email se valida pero no se persiste: `LinkedParent` no tiene ese campo y ampliarlo sería tocar SPEC 02.
- **No:** envío de correo, generación/expiración real del código, persistencia, ruta `/vincular-padre`, aceptar invitaciones, editar/quitar padres ni cambios en `Resumen del día` u otras pantallas.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `page.tsx` es server con `instant = false` y `generateStaticParams`. | El wrapper cliente recibe solo `kid` (serializable); se conservan `await params` y los 8 slugs sin cambios. |
| Fidelidad visual: Tailwind vs CSS inline del mockup. | Tokens `@theme` + valores arbitrarios; comparación con capturas desktop y `< sm`. |
| Estados de error y de alta no existen en los mockups. | Diseño aprobado en la fase de preguntas; mensajes centralizados en `linkParentModalData.errorMessages`. |
| La fila agregada se pierde al navegar/recargar. | Aceptado explícitamente (igual SPEC 04) y fijado como criterio de aceptación. |
| `LinkedParentsCard` viene de SPEC 02 y ahora recibe una prop. | Sigue siendo presentacional; solo cambia el trigger a button; verificar el perfil sin altas idéntico al mockup. |
| `ParentAvatarColorKey` solo admite `blue`/`purple`. | Tutor/a usa `blue`; no se amplía la unión para no modificar SPEC 02. |

## Lo que **no** está en esta spec

- Envío real de correo, código con expiración real ni persistencia.
- Ruta `/vincular-padre`, aceptación de invitaciones ni gestión de padres existentes.
- Cambios en `Resumen del día`, `Editar`, feed, login o cualquier pantalla ya implementada.

Cada uno de esos puntos, si se aborda, irá en su propia spec.
