<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# open-daycare

Daycare staff/family app scaffolded with `create-next-app`. `app/` is still the default starter — the actual UI to build is defined by the mockups in `references/pantallas/` (Spanish copy) and `references/screenshots/`. Ignore the generic `README.md`; treat the mockups as the design source. Persistence is planned in Supabase (Postgres); the target schema is the `docs` reference (`../07-DB-Schema`), not yet implemented in any database.

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

## Database integration (Next.js native patterns)

Next.js recommends using a **Data Access Layer (DAL)** for database access in new projects. This is an internal library that centralizes how and when data is fetched, with proper authorization checks.

### Recommended packages and patterns

- **Data Access Layer (DAL):** Create a dedicated module (e.g., `lib/db/` or `data/`) that:
  - Only runs on the server
  - Performs authentication and authorization checks
  - Returns safe, minimal Data Transfer Objects (DTOs)
  - Centralizes all database logic

- **`server-only` package:** Mark database modules with `import 'server-only'` to prevent accidental client-side execution. This causes a build error if the module is imported in client code.
  ```bash
  npm install server-only
  ```

- **Database client:** Since Server Components run on the server, you can safely use any database client or ORM (e.g., Supabase client, Drizzle, Prisma, or raw SQL). Place the client configuration in your DAL:
  ```ts filename="lib/db/index.ts"
  import 'server-only'
  import { createClient } from '@supabase/supabase-js'
  
  export const db = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  ```

- **Query memoization:** Wrap database query functions with `React.cache()` to share results across multiple components within the same request:
  ```ts filename="lib/db/users.ts"
  import 'server-only'
  import { cache } from 'react'
  import { db } from './index'
  
  export const getUser = cache(async (id: string) => {
    const { data } = await db.from('users').select().eq('id', id).single()
    return data
  })
  ```

- **Environment variables:** Only the DAL should access `process.env` for database credentials. Never expose database secrets to the client. Use `SUPABASE_SERVICE_ROLE_KEY` (server-only) for server-side operations, not `NEXT_PUBLIC_` prefixed variables.

### Security best practices

- **Authorization in DAL:** Always check authentication and authorization inside DAL functions, not just in pages or actions:
  ```ts filename="lib/db/posts.ts"
  import 'server-only'
  import { auth } from '@/lib/auth'
  import { db } from './index'
  
  export async function deletePost(postId: string) {
    const session = await auth()
    if (!session?.user) throw new Error('Unauthorized')
    
    const post = await db.from('posts').select().eq('id', postId).single()
    if (post.data?.author_id !== session.user.id) {
      throw new Error('Forbidden')
    }
    
    await db.from('posts').delete().eq('id', postId)
  }
  ```

- **Return minimal data:** Only return what the client needs, not full database records. Filter sensitive fields before returning DTOs.

- **Server Actions delegation:** Keep `"use server"` actions thin—delegate database logic to the DAL:
  ```ts filename="app/actions.ts"
  'use server'
  import { deletePost } from '@/lib/db/posts'
  import { revalidatePath } from 'next/cache'
  
  export async function deletePostAction(postId: string) {
    await deletePost(postId) // Auth + authz happen inside DAL
    revalidatePath('/posts')
  }
  ```

- **Supabase-specific:** Follow the Supabase section below for RLS policies, security, and migration patterns. The DAL should wrap Supabase calls with proper authorization checks.

### Documentation references

- Data fetching: `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md`
- Data security: `node_modules/next/dist/docs/01-app/02-guides/data-security.md`
- Server Components: `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`

## Supabase

Persistence layer is Supabase. No client packages are installed yet (`@supabase/ssr`, `supabase-js`); when wiring them, pin versions and commit the lockfile.

- **Skills (in `.agents/skills/`) — load them before acting:**
  - `supabase` — ANY Supabase task: Database/Auth/Edge Functions/Realtime/Storage/Vectors/Cron/Queues, client + SSR integrations, auth/sessions/JWT/cookies/RLS, CLI or MCP, schema changes/migrations, security audits, and debugging errors or logs.
  - `supabase-postgres-best-practices` — BEFORE writing or changing anything in Postgres: tables/columns/types, schema design, migrations, RLS policies and their tests, indexes, triggers, functions, queues/scheduled jobs, pgvector, or diagnosing slow queries, locks, timeouts and bloat. Even a one-column change counts.
- **Schema reference:** `../07-DB-Schema/opendaycare-database-schema.md` (tables, columns, relations to create). Reference only — do not assume it exists in the remote DB.
- **Docs over memory:** Supabase changes often. Scan `https://supabase.com/changelog.md` for relevant breaking changes and fetch current docs before implementing (MCP `search_docs` first, or append `.md` to any docs URL). For any Supabase error, read `https://supabase.com/docs/guides/monitoring-and-debugging.md` before diagnosing.
- **Security:** enable RLS on every table in exposed schemas (`public` included); never use `user_metadata` for authorization (use `app_metadata`); never expose `service_role`/secret keys — every `NEXT_PUBLIC_` var ships to the browser; prefer `TO authenticated` + an ownership predicate over deprecated `auth.role()`; UPDATE policies need both `USING` and `WITH CHECK`; views need `security_invoker = true` (PG15+) or revoked `anon`/`authenticated` access; avoid `SECURITY DEFINER`; Storage upsert needs INSERT + SELECT + UPDATE.
- **Migrations:** decide declarative (`supabase/schemas/` or `schema_paths`) vs imperative first. Iterate with MCP `execute_sql` or `supabase db query` (CLI v2.79+); do NOT use `apply_migration` for local iteration. To commit: run advisors (`supabase db advisors` v2.81.3+ or MCP `get_advisors`), then `supabase db pull <descriptive-name> --local --yes` and verify with `supabase migration list --local`.
- **CLI:** discover commands via `supabase --help` / `supabase <group> --help`; never guess flags. Check `supabase --version` first.
- **Verify and recover:** confirm every fix with a test query; after 2-3 failed attempts, stop and re-check docs/logs instead of retrying.

## Reference mockups

- Each `references/pantallas/*.dc.html` is a standalone screen mockup with inline CSS and a React runtime. `support.js` is generated — never edit it.
- `references/pantallas/index.dc.html` is the screen index. It covers staff screens (feed, compose, children, notices, account) and family screens (feed, child profile, day summary, login).
- Port the mockups into App Router routes/components; do not edit the reference files as part of implementation work.
- Save Playwright screenshots and other artifacts under `.playwright-mcp/` (gitignored).

## Spec workflow

- Feature work uses the `spec` and `spec-impl` skills in `.agents/skills/`; specs are written to `specs/NN-slug.md`.
- `specs/` does not exist yet. The `spec` skill creates it and `specs/.spec-config.yml` on first use.
- **Database specs:** any spec that references the database (schema, tables, columns, migrations, RLS, indexes, triggers, functions, Supabase config, or data access/persistence) must be saved under `specs/database/` instead of `specs/` root, using the same `NN-slug.md` naming (e.g. `specs/database/01-users-table.md`). Create the `specs/database/` folder if it does not exist.
- `spec-impl` only proceeds when the spec's status means "Approved"; never implement a Draft spec.

## MCP servers

- Playwright is configured in `opencode.json`; keep all screenshots/artifacts in `.playwright-mcp/`.
- Context7 is available for current framework/library documentation — prefer it over memory for library APIs.
- Supabase MCP is available in the harness (OAuth 2.1; tools such as `search_docs`, `execute_sql`, `get_advisors`). It is not declared in `opencode.json` — if the tools are missing, check reachability (`curl -so /dev/null -w "%{http_code}" https://mcp.supabase.com/mcp`, expect `401`), trigger the OAuth flow, or use a scoped personal access token for CI/headless environments.

## Reglas de código

- Usar código limpio: nombres, variables, funciones, etc. en inglés.

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
