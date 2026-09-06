# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tilawah Tracker is a Next.js monolith (App Router) for tracking Qur'an reading progress ("One Week One Juz") in groups. Coordinators (authenticated via Google OAuth) manage participants, weekly periods, and juz assignments. Public viewers get read-only access via unlisted per-group tokens, replacing manual WhatsApp tracking while preserving the copy-paste WhatsApp sharing format.

Refer to `docs/` for full context: `docs/technical-requirements.md`, `docs/product-concept.md`, `docs/database-schema.md`, `docs/srs-docs.md`, `docs/ui-theme.md`, `docs/user-journeys.md`, `docs/api-docs.md` (+ `docs/openapi.yaml`).

## Commands

```bash
npm install                              # install deps
npx prisma generate                      # regenerate Prisma client after schema.prisma changes
npx prisma db push                       # sync schema to DB (dev, no migration)
npx prisma migrate dev --name <name>     # create a migration (never `migrate reset` in prod)
npm run dev                              # start dev server
npm run build                            # production build (Next.js) - only when the user explicitly asks
npm run lint                             # eslint
```

**Verifying changes: run `npm run lint` only — never `npm run build`.** The build is slow and is not part of the normal
edit loop; run it (or `make build-all`) only when the user explicitly asks for a build. If a change needs type checking
beyond eslint, say so and let the user decide rather than kicking off a build.

There is no test suite yet (`tests/` is empty and no test script exists in `package.json`).

Docker: `make build-all` (install + prisma generate + build) then `make deploy` (`docker compose up -d`), or see `Makefile`/`docker-compose.yml`/`Dockerfile` directly.

## Architecture

- **Framework**: Next.js App Router + TypeScript, React 19 with the React Compiler babel plugin enabled.
- **Database**: PostgreSQL via Prisma ORM. Single schema file: `prisma/schema.prisma`. DB tables/columns are `snake_case` (mapped via `@map`/`@@map`); application code uses `camelCase` — always add `@map` when adding fields.
- **Auth**: NextAuth.js (`src/components/lib/auth.ts`), JWT session strategy, Google OAuth as the primary provider. Sign-in is **allowlist-only**: a `User` row (mapped to table `coordinators`) must already exist for the email or sign-in is rejected — there is no self-service signup. A `Credentials` demo provider is conditionally included when `isDemoMode()` (`NEXT_PUBLIC_IS_DEMO=true`) is true, gated by `DEMO_USERNAME`/`DEMO_PASSWORD` env vars (`src/components/lib/demo-auth.ts`).
- **Route groups** under `src/app/`:
    - `(auth)/` — coordinator dashboard, groups, participants, periods (requires session)
    - `(public)/view/[token]/` — public read-only group/period views (no login)
    - `(legal)/` — About, Privacy Policy, Terms of Service
    - `api/v1/` — internal REST routes for client components only (groups, participants, periods, progress). Server-rendered pages query Prisma directly instead; see `docs/api-docs.md`.
    - `api/auth/[...nextauth]/` — NextAuth handler
- **Path alias**: `@/*` → `src/*`. Note the somewhat unusual layout: most non-UI code (`lib`, `types`) lives under `src/components/lib` and `src/components/types`, not a top-level `src/lib`.

### API route conventions (`src/app/api/v1/**/route.ts`)

Every handler follows the same shape — read these helpers before writing a new route:

- `requireAuth()` (`src/components/lib/auth-utils.ts`) — gets the session or throws `UnauthorizedError`.
- `requireGroupAccess(coordinatorId, groupId)` — verifies the `CoordinatorGroup` join row exists or throws `ForbiddenError`. Group-scoped and period-scoped routes must call this (or the equivalent inline check via `period.group.coordinatorGroups`) before mutating anything.
- Input validation: Zod schemas in `src/components/lib/validators.ts`, run through `validateInput(schema, data)`, which returns `{ success, data }` or `{ success: false, error }`. Routes turn a failure into `throw new ValidationError(error.message, error.details)`; `error.message` is the first Zod issue and is rendered verbatim to the coordinator, so keep schema messages in Indonesian. Add new schemas there rather than inlining `z.object` in route files.
- Responses: always return via `apiSuccess(data, status?)` or `apiError(error)` (both in `auth-utils.ts`). `apiError` maps `UnauthorizedError`/`ForbiddenError`/`NotFoundError`/`ValidationError` to 401/403/404/400 and everything else to a logged 500. Every route body is wrapped in try/catch that funnels into `apiError`.
- Rate limiting: `src/components/lib/rate-limit.ts` (in-memory, one bucket per policy, per coordinator — not multi-instance safe) with `createRateLimitResponse()` from `src/components/lib/rate-limit-middleware.ts`. Every handler applies its guard inline. Pick the limiter matching the endpoint's cost (`bulkParticipant`, `singleParticipant`, `progress`, `write`, `read`).
- Logging: `src/components/lib/logger.ts` (Pino; pretty-printed in dev, JSON in prod). Use structured fields keyed on `err` (`logger.error({ err }, 'message')`) — Pino's error serializer only fires for that key — not string interpolation. **Server-only**: never import it from a `'use client'` file, which bundles Pino into the browser. Client components use `console.error`.

### Domain logic to know before touching periods/participants

- **Periods run Monday–Sunday.** `createPeriodSchema` rejects any `startDate` that isn't a Monday; end date is always start + 6 days.
- **Only one active period per group at a time** — creating a new period requires the previous one to be locked first (`src/app/api/v1/groups/[id]/periods/route.ts`).
- **Juz rotation on period creation**: returning participants auto-advance to next juz (30 → wraps to 1); new participants are assigned the least-used juz for load balancing; the very first period for a group distributes participants round-robin across 1–30. This all happens inside one `prisma.$transaction` — keep it that way if you modify it.
- **Missed streaks**: when a participant's previous-period status was `missed`, `missedStreak` increments on rotation; otherwise it resets to 0.
- **Locking a period** (`src/app/api/v1/periods/[id]/lock/route.ts`) is one-way: it bulk-flips all `not_finished` → `missed`, then sets `status: 'locked'` + `lockedAt`, inside a transaction. Locked periods must stay immutable — don't add code paths that mutate progress/juz after lock.
- **Public tokens**: 32-char tokens generated by `generatePublicToken()` (`src/components/lib/tokens.ts`) as `<quran-word>-<quran-word>-<random-suffix>`, using `crypto.randomBytes`. Public read paths go through `src/components/lib/public-utils.ts` (`validatePublicToken`, `getPublicGroupWithActivePeriod`, `getPublicGroupPeriods`, `getPublicPeriodDetails`) — WhatsApp numbers are never selected/returned on these paths.
- **Period dates are UTC**: `startDate`/`endDate` are `@db.Date`, so Prisma returns them at midnight UTC. Render them through `formatPeriodDate`/`formatPeriodRange` (`src/components/lib/period-status.ts`), never a bare `toLocaleDateString` — the viewer's timezone otherwise shifts the whole week. Date arithmetic on them must use the UTC setters; `date-fns` `addDays` is local-field arithmetic and gets it wrong in half-hour DST zones. Real timestamps (`createdAt`, `lockedAt`) are instants and render locally as usual.
- **WhatsApp**: numbers validated with `/^\+\d{10,15}$/` (E.164-ish, required `+`). Share-message formatting (👑 finished / 💔 missed) and copy-to-clipboard live in `src/components/periods/share-button.tsx`.

## Conventions

- Formatting is enforced by Prettier (`.prettierrc`): tabs (width 4), no semicolons, single quotes, `printWidth` 130, trailing commas, import order `@/*` → `../` → `./`. Don't hand-format against this.
- IDs are UUIDs (`@default(uuid())`) except NextAuth's own `Account`/`Session` models, which use `cuid()`.
- Dates: use `date-fns` for period/date arithmetic rather than hand-rolled `Date` math where reasonable.
- UI: Tailwind CSS v4 + shadcn/ui (`components.json`, base color `slate`, aliases `@/components/ui`). Use `cn()` from `src/components/lib/utils.ts` for conditional Tailwind class merging. Mobile-first layout is a hard requirement — coordinators primarily use this on phones.
