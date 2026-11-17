# components/shared

Reusable UI pieces extracted from the feed screen that are not tied to a single
feature area. They render no business data and can be imported from any
component folder.

- `Avatar.tsx` — circular avatar with the person's initial: five pastel color pairs (`soft`, default, used for kids) and the saturated blue/purple pair with white letter for linked parents (`solid`). Sizes: 40 (parents), 48 (list) and 84 (profile).
- `icons.tsx` — inline SVG icon set (brand sun, navigation, actions, post types, mobile menu, kids screens) used by `components/layout`, `components/feed` and `components/kids`.
