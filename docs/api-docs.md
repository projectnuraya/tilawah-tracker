# Tilawah Tracker API

Machine-readable counterpart: [`openapi.yaml`](./openapi.yaml) — import it into Postman,
Bruno or Insomnia. Both files are maintained by hand; change them together with the routes.

## Scope

`/api/v1` is an **internal** surface: the only callers are this app's own client components. It is
not a product, has no external consumers, and carries no compatibility guarantee — change it freely
alongside the components that call it.

Server-rendered pages do **not** go through it. They query Prisma directly (coordinator pages) or
through `src/components/lib/public-utils.ts` (the `/view/[token]` pages). A route exists only where
a `'use client'` component needs to mutate something or fetch on demand.

Endpoints that duplicated a page's own query, and the public read endpoints the pages never called,
were removed. If you need a new one, add it because a client component needs it — not for symmetry.

## Authentication

Every endpoint below runs behind `requireAuth()` (`src/components/lib/auth-utils.ts`), which reads
the NextAuth session cookie and throws `UnauthorizedError` without one. Sign-in is allowlist-only:
a `User` row must already exist for the Google account.

Group- and period-scoped routes additionally call `requireGroupAccess(coordinatorId, groupId)`, or
the equivalent inline check through `period.group.coordinatorGroups`.

There is no token or API-key auth. To exercise a route by hand, sign in through the browser and
reuse the `next-auth.session-token` cookie.

## Response format

Every handler returns through `apiSuccess(data, status?)` or `apiError(error)`.

```jsonc
// success
{ "success": true, "data": { } }

// failure — `details` appears only on validation errors
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "Nama grup minimal 3 karakter", "details": { } } }
```

`message` is written for the coordinator and rendered verbatim by the UI, so it is always in
Indonesian.

| Code | Status | Raised by |
| --- | --- | --- |
| `UNAUTHORIZED` | 401 | `UnauthorizedError` — no valid session |
| `FORBIDDEN` | 403 | `ForbiddenError` — session is fine, group is not theirs |
| `NOT_FOUND` | 404 | `NotFoundError` |
| `VALIDATION_ERROR` | 400 | `ValidationError`, including every Zod failure |
| `RATE_LIMIT_EXCEEDED` | 429 | the per-policy limiter |
| `INTERNAL_ERROR` | 500 | anything else, logged server-side |

## Endpoints

| Method | Path | Rate limit | Called from |
| --- | --- | --- | --- |
| `POST` | `/api/v1/groups` | `write` | `groups/new/page.tsx` |
| `GET` | `/api/v1/groups/[id]` | `read` | `use-group-name.ts`, `groups/[id]/edit/page.tsx` |
| `PATCH` | `/api/v1/groups/[id]` | `write` | `groups/[id]/edit/page.tsx` |
| `DELETE` | `/api/v1/groups/[id]` | `write` | `delete-group-button.tsx` |
| `POST` | `/api/v1/groups/[id]/participants/bulk` | `bulkParticipant` | `participants/new/page.tsx` |
| `POST` | `/api/v1/groups/[id]/periods` | `write` | `periods/new/page.tsx` |
| `PATCH` | `/api/v1/participants/[id]` | `singleParticipant` | `edit-form.tsx`, `reactivate-button.tsx` |
| `DELETE` | `/api/v1/participants/[id]` | `singleParticipant` | `deactivate-button.tsx` |
| `POST` | `/api/v1/periods/[id]/lock` | `write` | `lock-period-button.tsx` |
| `PATCH` | `/api/v1/progress/[id]` | `progress` | `progress-dropdown.tsx` |
| `PATCH` | `/api/v1/progress/[id]/juz` | `progress` | `juz-dropdown.tsx` |

The participant form always posts to `/bulk`, even for a single person, so there is no single-create
route.

### Behaviour worth knowing

- **`POST /groups/[id]/periods`** rejects a start date that is not a Monday, refuses to run while
  another period is still active, and refuses a group with no active participants. Juz rotation for
  the new period happens inside one transaction — see `docs/product-concept.md`.
- **`POST /periods/[id]/lock`** is one-way. It flips every `not_finished` row to `missed`, then
  marks the period locked. Locked periods reject progress and juz updates.
- **`PATCH /participants/[id]`** with `isActive: true` also assigns a juz in the running period, so
  a reactivated participant reappears in the current week.

## Rate limiting

`src/components/lib/rate-limit.ts` — in-memory, per-coordinator, **not safe across instances**.
Each policy owns its own bucket: `bulkParticipant` 5/5min, `singleParticipant` 60/min,
`progress` 100/min, `write` 30/min, `read` 100/min.

The public `/view/[token]` pages have no rate limit, because they are pages rather than routes.

## Validation

Schemas live in `src/components/lib/validators.ts` and run through `validateInput(schema, data)`.
Add new schemas there rather than inlining `z.object` in a route. The first Zod issue's message
becomes the user-facing `message`; the flattened error rides along in `details`.
