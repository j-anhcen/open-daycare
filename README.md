# Open Daycare

App web para la gestión de una guardería: pantallas para el personal (feed, niños, avisos, cuenta) y para las familias (feed, perfil del niño, resumen del día, login).

Construida con **Next.js 16** (App Router) + **React 19** + **Tailwind CSS v4**, con persistencia en **Supabase** (Postgres).

## Requisitos previos

- **Node.js 22+** y npm (las librerías cliente de Supabase ya no soportan Node 20).
- **Supabase CLI v3+** — ver [Base de datos con Supabase](#base-de-datos-con-supabase).
- Un **runtime de contenedores** para el stack local de Supabase: [OrbStack](https://orbstack.dev/) (recomendado en macOS) o Docker Desktop. Con al menos 7 GB de RAM asignados.

## Instalación

```bash
npm install
```

## Variables de entorno

El proyecto lee su configuración de `.env` (está gitignorado; solo se commitea `.env.template`):

```bash
cp .env.template .env
```

| Variable                                    | Uso                                                                   | De dónde se obtiene                                                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`                  | URL del proyecto Supabase (cliente y server)                          | Dashboard → Project Settings → API Keys, o la salida de `supabase start` si apuntás al stack local (`http://127.0.0.1:54321`)              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`      | Publishable key (`sb_publishable_...`)                                | Mismo lugar que la URL                                                                                                                     |
| `SUPABASE_SERVICE_ROLE_KEY`                 | Secret key (`sb_secret_...`) para operaciones server-side              | Dashboard → Project Settings → API Keys. **Nunca exponerla al cliente** (ningún componente la debe importar)                                |
| `SUPABASE_DB_PASSWORD`                      | Password de la base de datos, para los comandos remotos del CLI        | La definida al crear el proyecto en Supabase                                                                                                |
| `RESEND_API_KEY`                            | Envío de correos (invitaciones a familias) vía [Resend](https://resend.com) | Dashboard de Resend                                                                                                                    |
| `INVITATION_URL`                            | URL base de los links de invitación (solo server, sin `NEXT_PUBLIC_`) | p. ej. `http://localhost:3000/accept-invitation`                                                                                            |

## Levantar el proyecto

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

| Comando             | Qué hace                                        |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo (Turbopack)              |
| `npm run build`     | Build de producción                             |
| `npm start`         | Sirve el build de producción                    |
| `npm run lint`      | ESLint                                          |
| `npx tsc --noEmit`  | Typecheck (no hay script dedicado para esto)    |

## Base de datos con Supabase

El esquema vive en `supabase/migrations/` como migraciones SQL con timestamp, aplicadas en orden.

### Instalar el CLI

macOS (Homebrew, comando global):

```bash
brew install supabase/tap/supabase
```

O como dependencia del proyecto (se corre vía `npx`):

```bash
npm install supabase --save-dev
npx supabase <comando>
```

Para Windows y Linux, ver [instalación del CLI](https://supabase.com/docs/guides/local-development/cli/getting-started). Todos los ejemplos de abajo asumen el comando global `supabase <comando>`.

### Autenticar tu equipo con el CLI: `supabase login`

`supabase login` abre el navegador para generar un access token. El token queda **guardado localmente en tu máquina** y todos los comandos posteriores del CLI lo usan automáticamente — esto es lo que deja tu equipo autenticado.

> ⚠️ El flujo por navegador crea un token con **acceso total a tu cuenta** (aparece como _Legacy_ en el dashboard). Lo recomendado es usar un **token scoped**, con permisos mínimos:

1. Creá el token en [Account → Access tokens](https://supabase.com/dashboard/account/tokens), limitado a la organización/proyecto y a los permisos necesarios (los tokens scoped empiezan con `sbp_fc...`).
2. Autenticá el equipo con él:

```bash
supabase login --token sbp_fc...
```

O por variable de entorno — tiene precedencia sobre cualquier login guardado, por lo que es la forma correcta para CI:

```bash
export SUPABASE_ACCESS_TOKEN="sbp_fc..."
```

Verificá que el equipo quedó autenticado:

```bash
supabase projects list
```

> Para `supabase link`, el token necesita los permisos **Project Settings**, **API Keys** y **API Key Secrets**, todos con acceso _Read_.

### Vincular el proyecto hosted

```bash
supabase link --project-ref <project-id>
```

El `<project-id>` es el que aparece en la URL del dashboard: `https://supabase.com/dashboard/project/<project-id>`. El comando pide el password de la base de datos y le dice al CLI a qué proyecto apunta el flag `--remote` de `db push`, `db pull`, etc.

### Stack local

El repo ya incluye `supabase/migrations/`, pero no `config.toml`. Antes de levantar el stack por primera vez:

```bash
supabase init   # crea supabase/config.toml; no toca las migraciones existentes
supabase start  # baja las imágenes de Docker la primera vez
```

`supabase start` imprime las URLs y keys locales: Studio en `http://localhost:54323`, API en `http://127.0.0.1:54321`, Postgres en `127.0.0.1:54322`, más la publishable y la secret key. Si querés apuntar la app al stack local, usá esos valores en `.env`.

| Comando                        | Qué hace                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `supabase db reset`            | Recrea la DB local desde cero: aplica todas las migraciones en orden              |
| `supabase stop`                | Detiene el stack (los datos persisten hasta un `db reset`)                        |
| `supabase migration list --remote` | Compara las migraciones locales contra el historial del proyecto hosted        |

### Aplicar migraciones al proyecto hosted

Desde la **CLI v3**, los comandos de base de datos apuntan al stack local por defecto: pasá `--remote` para tocar el proyecto hosted, que además pide confirmación (respuesta por defecto: No). En CI o sin interacción, agregá `--yes`.

```bash
supabase db push --dry-run --remote  # preview de lo que se va a aplicar
supabase db push --remote            # aplica las migraciones pendientes
```

Estos comandos usan el password de `.env` (`SUPABASE_DB_PASSWORD`), que no está limitado por los permisos del access token.

### MCP de Supabase (agentes de código)

Además del CLI, el proyecto se trabaja con el MCP remoto de Supabase (`https://mcp.supabase.com/mcp`), que autentica con **OAuth 2.1**: al configurarlo en tu cliente/agente, se abre el navegador para autorizar. En entornos sin navegador (CI), se pasa un scoped PAT en el header `Authorization: Bearer`.

Si el MCP no responde, verificá que el server esté arriba:

```bash
curl -so /dev/null -w "%{http_code}" https://mcp.supabase.com/mcp
# 401 = server arriba (sin token es lo esperado)
```

## Estructura del repo

- `app/` — rutas del App Router (pantallas de staff y familias)
- `components/` — componentes compartidos
- `lib/`, `utils/` — capa de acceso a datos y clientes de Supabase (server/browser)
- `supabase/migrations/` — esquema SQL versionado
- `references/pantallas/` — mockups de referencia (no editar)
- `specs/` — specs de features (`specs/database/` para lo que toca la base)
