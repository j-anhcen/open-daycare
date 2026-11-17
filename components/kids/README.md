# components/kids

Kids screen presentation components (`/kids` and `/kids/[id]`), fed by
`app/_data/kids.ts`:

- `KidsHeader.tsx` — “GESTIÓN / Niños” heading with the “Agregar niño” CTA (placeholder link).
- `KidsSearch.tsx` — visual-only search box (“Buscar niño…”): renders an input but performs no filtering.
- `KidCard.tsx` — list card linking to the kid's profile: avatar, name, age + linked-parents meta line, and a trailing allergy chip, “VINCULAR” chip (kids without linked parents) or chevron. Includes the mockup hover (border `#F2A78E`, 2px lift).
- `ProfileHeader.tsx` — profile identity block (84px avatar, name, “edad · Sala X”, placeholder “Editar” button). The “Volver a Niños” link is rendered by the page above the two-column layout so the identity block stays inside the left column exactly as the mockup lays it out.
- `AllergyNoteCard.tsx` — “Alergias y notas” warning box; the page renders it only when the kid has an allergy note.
- `ProfileDetailsCard.tsx` — “Fecha de nacimiento / Sala / Ingreso” detail rows.
- `LinkedParentsCard.tsx` — “PADRES VINCULADOS”: solid parent avatars, “rol · estado” line, ACTIVA/PENDIENTE status badges and the “Vincular otro padre” placeholder link (rendered even for kids without linked parents).
