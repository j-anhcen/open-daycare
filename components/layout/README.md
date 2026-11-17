# components/layout

Layout and navigation building blocks for the app shell:

- `Sidebar.tsx` — the staff sidebar (brand, compose CTA, main navigation, current user block). It receives its width and positioning through `className` so the same content is reused on desktop and inside the mobile drawer. All links use `next/link`: brand and “Feed” to `/`, “Niños” to `/kids`, “Avisos” to `/avisos`, “Mi cuenta” to `/mi-cuenta`, the compose CTA to `/crear-publicacion` and “Cerrar sesión” to `/login` (destination screens not implemented yet render Next's 404 until their specs land). The `activeItem` prop (`NavItemId`) marks the current section, and the optional `onNavigate` callback is forwarded to every `Link` so hosts can react to navigation.
- `MobileMenu.tsx` — client component with the mobile top bar (hamburger button) and the left-side drawer with overlay/backdrop. It renders the shared `Sidebar` inside the drawer and forwards `activeItem` to it, passing `onNavigate` so the drawer closes as soon as any of its links navigates.
