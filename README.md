# DockerOps

A scenario-driven Docker learning game. Players get production-style incidents
and resolve them by running **real Docker commands** in a **real, isolated
Docker-in-Docker sandbox** — not a simulator. The backend validates progress
by inspecting the sandbox's actual `docker inspect`/`ps`/`network`/`volume`
state, never by string-matching commands.

See [`DockerOps_Game_Feature_Specification`](./) and
[`DockerOps_Tech_Stack_Document_Updated`](./) (originals in `Downloads/`) for
the product spec this implements.

## Architecture

```
apps/web        Next.js game UI — environment tree, xterm.js terminal,
                 React Flow topology, incident/hint panel (brutalist theme)
apps/api         NestJS control plane — REST + WebSocket gateway, sandbox
                 lifecycle, objective validation, progress/XP/achievements
packages/shared  Shared TS types + the Zod scenario schema (content contract)
packages/scenarios  Level content: one YAML file per level, validated
                 against packages/shared's ScenarioSchema at load time
docker/sandbox   The player sandbox image: docker:*-dind + a small toolset.
                 One privileged container per game session, running its own
                 inner Docker Engine. Players never see the host socket.
```

Request flow for a mission:

1. `POST /sessions {levelId}` → NestJS provisions a fresh sandbox container
   (`docker/sandbox`) on the **host** engine, waits for its **inner** engine
   to come up, then realizes the level's `environment:` block as real
   containers/networks/volumes/images inside that inner engine (including
   the deliberate fault the incident is built around).
2. The browser opens a WebSocket, joins the session, and xterm.js is wired to
   a **Docker-exec-allocated PTY** (`docker exec -it <sandbox> sh`) — a real
   shell with a real `docker` CLI talking only to that session's own inner
   engine.
3. After each command the player runs, the backend re-inspects the sandbox's
   real Docker state, recomputes the environment tree / topology, and checks
   the current mission part's completion conditions (also real Docker
   state, plus a command-history check for read-only "investigate" steps).
4. Progress, XP, hints used and achievements are recorded in PostgreSQL via
   Prisma; Redis/`ioredis` is wired for session/runtime coordination.

## Prerequisites

- Node.js 20+, pnpm 9+ (`corepack enable` gives you both)
- Docker Desktop, **running**, with the daemon reachable (`docker info`)
- ~2GB free for the sandbox image + level images (nginx, redis, postgres, …)

## First-time setup

```bash
pnpm install

# 1. Build the player sandbox image (the game builds/destroys real
#    containers FROM this image, one per session)
docker build -t dockerops/sandbox:latest ./docker/sandbox

# 2. Start Postgres + Redis for the control plane
docker compose up -d

# 3. Copy env files (already done if apps/api/.env and apps/web/.env.local
#    exist — see .env.example for what each var does)

# 4. Create the database schema
pnpm db:migrate

# 5. Seed achievements + the default local player profile
pnpm db:seed
```

## Running it

```bash
pnpm dev
```

This runs, in parallel via Turborepo: the shared/scenarios packages in watch
mode, the NestJS API on `:4000`, and the Next.js game on `:3000`. Open
`http://localhost:3000`.

There is no login flow in this pass — every request acts as a single local
"Player One" profile, created automatically on first API boot.

## Content model

A level is **data**, not code: `packages/scenarios/levels/*.yaml`, validated
against `packages/shared/src/scenario.ts`'s `ScenarioSchema` on load (bad
files are logged and skipped, not fatal). Adding level 11 means writing a
new YAML file — the engine, UI, hint system and field manual are generic.

Validate all level files without starting anything:

```bash
pnpm --filter @dockerops/scenarios validate
```

### Win/part conditions

Every condition in a scenario's `winCondition` / `parts[].completionConditions`
is checked against **real** Docker state (see
`apps/api/src/sandbox/objective-validator.service.ts`):

- `container_state`, `container_health`, `container_exit_code`,
  `container_image`, `port_published`, `network_exists`,
  `network_connected`, `volume_exists`, `volume_mounted`, `image_exists` —
  all read from `docker inspect` output captured after each command.
- `exec_output_contains` — runs an arbitrary read-only command *inside the
  sandbox's own shell*. To check something inside a specific game container,
  route through the real CLI, e.g.
  `command: ["docker", "exec", "web", "cat", "/data/upload.txt"]` — this is
  also the correct way to test cross-container reachability
  (`docker exec api wget -qO- http://db:6379`), since the sandbox shell
  itself is not on the inner user-defined bridge network and can't resolve
  container names by DNS.
- `http_status` — curls `http://localhost:<hostPort>` from the sandbox
  shell; only valid for a port actually published to the sandbox's own
  network namespace via `environment.containers[].ports[].hostPort`.
- `command_used` — regex match against the player's raw command history;
  reserved for read-only "investigate" objectives that don't mutate state
  (e.g. requiring `docker ps -a` was actually run).

## What's deliberately simplified in this pass

- **No auth** — single local dev profile (see "Running it" above). Real
  accounts are explicitly a later phase in the product spec.
- **No node-pty** — the terminal PTY is allocated by the Docker Engine
  itself (`exec.start({Tty:true})` over the Docker API), not a native
  addon. This sidesteps native compilation entirely (this repo has no C++
  build toolchain configured) while still giving a real remote shell.
- **Idle sandbox reaping** is a simple in-process interval
  (`SANDBOX_IDLE_TIMEOUT_MINUTES`, default 45), not a durable queue — fine
  for a single control-plane instance, would need to move to
  Redis/BullMQ before running more than one API instance.
- **No automated test suite / CI** yet (Vitest/Playwright are wired as
  devDependencies per the tech stack doc, but no specs were authored in
  this pass).
- Compose- and Dockerfile-based levels write their `docker-compose.yml` /
  `Dockerfile` into the sandbox via `environment.setupScript` (there's no
  build-context upload mechanism) — the player edits/rebuilds them with
  real shell commands (`nano`, `docker build`, `docker compose up`) inside
  their sandbox.

## Directory map

- `apps/web` — Next.js 14 app router, Tailwind, Zustand, `@xterm/xterm`,
  `@xyflow/react` (React Flow).
- `apps/api` — NestJS 10, Prisma + PostgreSQL, `dockerode`, Socket.IO.
- `packages/shared` — `docker-state.ts` (live sandbox projection types),
  `scenario.ts` (content schema), `websocket-events.ts`, `progress.ts`.
- `packages/scenarios` — YAML loader + the 10 level files.
- `docker/sandbox` — the per-session sandbox image.
