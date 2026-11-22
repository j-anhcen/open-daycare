# components/kids

Presentation components for `/kids`, `/kids/new` and `/kids/[id]`. All screens
read real Supabase data through the DAL (`lib/dal/rooms.ts`,
`lib/dal/children.ts`); the old mock module `app/_data/kids.ts` was removed.

- `KidsBoard.tsx` — client board for `/kids`: one section per room (including empty rooms), per-room counters, empty states, a live name filter (accent-insensitive) and the state that opens the add-child modal over the list.
- `KidsHeader.tsx` — "GESTIÓN / Niños" heading with the "Agregar niño" button that opens the modal without changing the URL.
- `KidsSearch.tsx` — controlled search input ("Buscar niño…") wired to `KidsBoard`.
- `KidCard.tsx` — list card linking to the child's UUID profile: avatar, name, calculated age and allergy chips (translated to Spanish).
- `AddKidModal.tsx` — accessible overlay (`role="dialog"`, Escape/overlay close, scroll lock) that hosts `AddChildForm`; opening it a second time starts with a fresh form.
- `AddChildForm.tsx` — client form with five fields and inline errors via `useActionState`; submits to `createChildAction`. Inside the modal it reports success through `onCreated`; on `/kids/new` it navigates back to `/kids`.
- `ProfileHeader.tsx` — profile identity block (avatar, name, "age · Sala X", non-functional "Editar" placeholder).
- `AllergyNoteCard.tsx` — "Alergias y notas" warning box; rendered only when the child has allergy tags or medical notes.
- `ProfileDetailsCard.tsx` — "Fecha de nacimiento / Sala / Ingreso" detail rows from real dates.
- `LinkedParentsCard.tsx` — "PADRES VINCULADOS" panel with the pending parents added in the current session and the "Vincular otro padre" button that opens the modal.
- `KidProfileAside.tsx` — client right column: non-functional "Resumen del día" placeholder, `LinkedParentsCard` and `LinkParentModal`; owns the modal state and the in-memory parent list.
- `LinkParentModal.tsx` — "Vincular padre" modal over the profile (no URL change): accessible overlay, inline validation, invitation code and a pending parent on submit. Copy/types live in `lib/link-parent.ts`.

Editing, day summaries and photo uploads are placeholders for future specs.
Shared presentation helpers live in `lib/age.ts`, `lib/allergies.ts`,
`lib/avatar.ts` and `lib/link-parent.ts`.
