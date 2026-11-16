<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

# open-daycare

Daycare staff/family app scaffolded with `create-next-app`. `app/` is still the default starter — the actual UI to build is defined by the mockups in `references/pantallas/` (Spanish copy) and `references/screenshots/`. Ignore the generic `README.md`; treat the mockups as the design source.

## Commands

- `npm run dev` — dev server (Turbopack, the default bundler in Next 16)
- `npm run lint` — ESLint flat config over the repo (plain `eslint`, not `next lint`). It currently fails on `references/pantallas/support.js`, a generated mockup runtime; those errors are pre-existing, so don't chase them unless the task is about lint config.
- `npx tsc --noEmit` — typecheck; there is no `typecheck` script
- `npm run build` / `npm start`
- No test runner is installed. Do not run `npm test`; verify UI changes with Playwright.

## Stack quirks

- Next.js 16.4.6 + React 19.3. Consult `node_modules/next/dist/docs/` before using framework APIs. `app/layout.tsx` already uses the generated `LayoutProps<"/">` type.
- `next.config.ts` enables `cacheComponents` and `partialPrefetching`. Read `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` and `01-app/02-guides/adopting-partial-prefetching.md` before adding data fetching or caching.
- Tailwind v4 is wired as a Turbopack CSS loader through `@tailwindcss/turbopack`; there is no PostCSS or `tailwind.config` file. Add theme tokens in `app/globals.css` using `@theme`.
- Import alias `@/*` maps to the repo root (`./*`), not `src/`.

## Reference mockups

- Each `references/pantallas/*.dc.html` is a standalone screen mockup with inline CSS and a React runtime. `support.js` is generated — never edit it.
- `references/pantallas/index.dc.html` is the screen index. It covers staff screens (feed, compose, children, notices, account) and family screens (feed, child profile, day summary, login).
- Port the mockups into App Router routes/components; do not edit the reference files as part of implementation work.
- Save Playwright screenshots and other artifacts under `.playwright-mcp/` (gitignored).

## Spec workflow

- Feature work uses the `spec` and `spec-impl` skills in `.agents/skills/`; specs are written to `specs/NN-slug.md`.
- `specs/` does not exist yet. The `spec` skill creates it and `specs/.spec-config.yml` on first use.
- `spec-impl` only proceeds when the spec's status means "Approved"; never implement a Draft spec.

## MCP servers

- Playwright is configured in `opencode.json`; keep all screenshots/artifacts in `.playwright-mcp/`.
- Context7 is available for current framework/library documentation — prefer it over memory for library APIs.


## Spec Driven Development - Skills

- /spec utilizaremos esta habilidad para crear especificaciones. 
- /spec-impl utilizaremos esta habilidad para implementar las especificaciones.

## Reglas de código

- Usar código limpio: nombres, variables, funciones, etc. en inglés.