# components/feed

Feed components fed by `app/_data/mock.ts`:

- `FeedHeader.tsx` — room label, greeting and room subtitle.
- `Composer.tsx` — “Compartí un momento…” entry point with the current user avatar.
- `PostCard.tsx` — post card with a type badge (COMIDA / SIESTA / ACTIVIDAD / LOGRO / ÁNIMO / FOTO / ANUNCIO), audience, body, optional photo placeholder and like/comment counters.
- `FeedPosts.tsx` — client component that prepends posts created in this session (`addedPosts` from `CreatePostContext`) to the mock posts before rendering `PostCard`s.
- `ComposeButton.tsx` — client “Nueva publicación” button used by the shared sidebar. It opens the global modal through context and then forwards `onNavigate` so the mobile drawer closes.
- `CreatePostContext.tsx` — client provider mounted once in `app/layout.tsx`. Owns modal visibility and in-memory posts, exposes `openModal`, `closeModal`, `publishPost` and `addedPosts`, and renders the modal once for the whole app.
- `CreatePostModal.tsx` — always-mounted dialog for new posts: recipient and type selection, description validation, simulated photo tiles (button and drag & drop, no uploads) and publish/reset flow. Closed state is `inert` with fade + scale transitions.

Created posts live only in memory: the provider clears them on reload and on route changes.
