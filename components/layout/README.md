# components/layout

Layout and navigation building blocks for the app shell:

- `Sidebar.tsx` — the staff sidebar (brand, compose CTA, main navigation, current user block). It receives its width and positioning through `className` so the same content is reused on desktop and inside the mobile drawer.
- `MobileMenu.tsx` — client component with the mobile top bar (hamburger button) and the left-side drawer with overlay/backdrop. It renders the shared `Sidebar` inside the drawer.
