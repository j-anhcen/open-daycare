# components/kids

Kids screen presentation components (`/kids` and `/kids/[id]`), fed by
`app/_data/kids.ts`:

- `KidsBoard.tsx` — client board for `/kids`: owns the “Agregar niño” modal open state and the in-memory `addedKids` list (lost on reload), and composes header, search and one section per room in `addKidModalData.roomOptions` order (only rooms with kids; added kids go first in their section; “N niño(s)” counters are derived).
- `KidsHeader.tsx` — “GESTIÓN / Niños” heading with the “Agregar niño” CTA button (`onAddKid` prop opens the modal).
- `KidsSearch.tsx` — visual-only search box (“Buscar niño…”): renders an input but performs no filtering.
- `KidCard.tsx` — list card linking to the kid's profile: avatar, name, age + linked-parents meta line, and a trailing chip group — one chip per allergy label plus “VINCULAR” when the kid has no linked parents, or a chevron when there are parents and no allergies. Includes the mockup hover (border `#F2A78E`, 2px lift).
- `AddKidModal.tsx` — always-mounted “Agregar niño” dialog over `/kids` (fade + subtle scale ~200ms, `inert` when closed, Escape/overlay/“Cancelar” close, body scroll lock, `role="dialog"` + `aria-modal` + `aria-labelledby`): five fields styled after `agregar-nino.dc.html` (FECHA + SALA share a row on `>= sm` and stack below), native SALA select with disabled placeholder, masked “dd/mm/aaaa” birth date (digits only, auto slashes, pasted content sanitized) and inline validation against `addKidModalData.errorMessages` (calendar-invalid and future dates rejected; errors clear on edit; focus moves to the first invalid field). A valid “Guardar” passes the values to `onSave` and resets the form.
- `ProfileHeader.tsx` — profile identity block (84px avatar, name, “edad · Sala X”, placeholder “Editar” button). The “Volver a Niños” link is rendered by the page above the two-column layout so the identity block stays inside the left column exactly as the mockup lays it out.
- `AllergyNoteCard.tsx` — “Alergias y notas” warning box; the page renders it only when the kid has an allergy note.
- `ProfileDetailsCard.tsx` — “Fecha de nacimiento / Sala / Ingreso” detail rows.
- `LinkedParentsCard.tsx` — “PADRES VINCULADOS”: solid parent avatars, “rol · estado” line, ACTIVA/PENDIENTE status badges and the “Vincular otro padre” button (`onLinkParent`, rendered even for kids without linked parents).
- `KidProfileAside.tsx` — client wrapper for the profile's right column: owns the “Vincular padre” modal open state and the in-memory `linkedParents` list, composes the “Resumen del día” placeholder, `LinkedParentsCard` and `LinkParentModal`. The page stays a server component and only passes `kid`.
- `LinkParentModal.tsx` — always-mounted “Vincular padre” dialog over `/kids/[id]` (no route change; fade + subtle scale ~200ms, `inert` when closed, Escape/overlay/X close, body scroll lock, `role="dialog"` + `aria-modal` + `aria-labelledby`): header subtitle derived from `kid.name`, info box using the first name, NOMBRE/EMAIL fields, unique PARENTESCO radio group with “Mamá” preselected, fixed `7K4P9` invitation code box and “Enviar invitación” CTA. Inline validation against `linkParentModalData.errorMessages` (required name/email, invalid email rejected; errors clear on edit; focus moves to the first invalid field). A valid submit derives a pending parent, closes and resets the form.

Kids added through the modal are derived by `buildKidFromForm` (`app/_data/kids.ts`)
and live in memory only: their `/kids/[id]` profile links resolve to the 404 page,
and navigating or reloading brings back the eight mock kids. Parents added through
the “Vincular padre” modal are derived by `buildLinkedParentFromForm` and also live
in memory only: reloading or navigating restores the kid's mock parents.
