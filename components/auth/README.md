# components/auth

Standalone auth screen components (no sidebar, no session logic), all fed by
the mock static data in `app/_data/auth.ts`:

- `BrandPanel.tsx` — login left brand panel: `#F6A98E → #F2937A → #EC7E62` gradient with two decorative circles, logo tile (`SunIcon`) + brand name, headline, tagline and room footer. Hidden below `md` (`hidden md:flex`).
- `LoginPanel.tsx` — login form column: title/subtitle, prefilled EMAIL and empty CONTRASEÑA fields, forgot-password link and submit button as `href="#"` placeholders, and a real `Link` to `/activar-cuenta`.
- `ActivationPanel.tsx` — account activation card: brand tile (`#F8C3A8 → #F2937A` gradient), invitation card with the blue child avatar, prefilled code/email/password fields (password with accent border `#F2A78E`), photo-consent checkbox (native, checked by default, toggleable without client JS), submit as `href="#"` placeholder and a real `Link` to `/login`.

The role picker (INGRESO COMO Personal/Familia) from the login mockup was
intentionally dropped (specs/03 decision): the login form is shared by any
account.
