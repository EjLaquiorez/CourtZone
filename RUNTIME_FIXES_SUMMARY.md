# Court Zone — Runtime Fixes & Verification

Log of resolved runtime issues, what is stable today, and how to re-verify locally. For active work and MVP scope, see [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) and [README.md](./README.md).

**Last updated:** May 2026

---

## Status at a glance

| Area | Status | Notes |
|------|--------|--------|
| Auth (register / login / JWT) | Stable | Cookie-based `auth-token`, middleware on protected routes |
| Database (PostgreSQL + Prisma) | Stable | Requires `DATABASE_URL` and `npm run db:migrate` |
| Core API routes | Stable | Auth, games, teams, courts handlers in `src/app/api/` |
| Dashboard shell | Stable | Compiles; auth guard and lazy routes work |
| WebSockets (Socket.IO) | Optional | Off in dev unless `NEXT_PUBLIC_ENABLE_WEBSOCKET=true` + `npm run dev:socket` |
| Some UI pages | Partial | Several screens still use inline mock data (see below) |

The app runs end-to-end for the MVP path (auth → profile → games). It is **not** fully production-hardened until mock-only pages are replaced and automated checks are in CI.

---

## Fixes applied

### Frontend

| Issue | Fix | Location |
|-------|-----|----------|
| Missing `useToastHelpers` export | Added hook (`success`, `error`, `info`, `warning`) | `src/components/ui/toast.tsx` |
| Unused imports in auth layer | Cleaned up provider imports | `src/components/auth/auth-provider.tsx` |
| Middleware could not resolve `@/lib/auth` in some setups | Auth helpers live under `src/lib/auth.ts`; middleware imports `@/lib/auth` | `middleware.ts`, `src/lib/auth.ts` |

`useToastHelpers` is used across dashboard, profile setup, game forms, and mock login.

### Backend & data

| Issue | Fix | Location |
|-------|-----|----------|
| DB connection failures on fresh clone | Documented `DATABASE_URL`, migrations, seed | `README.md`, `scripts/tests/test-db-connection.js` |
| Registration / login errors | Validation + bcrypt hashing (12 rounds) + JWT in httpOnly cookie | `src/app/api/auth/register`, `login`, `src/lib/auth.ts` |
| Protected API access | JWT verified in middleware; cookie or `Authorization` header | `middleware.ts` |

Duplicate auth modules exist at `lib/auth.ts` (seed/scripts) and `src/lib/auth.ts` (app). Keep changes in sync or consolidate when touching auth.

### Integration

| Issue | Fix | Location |
|-------|-----|----------|
| Port conflict with Next dev server | Socket server defaults to **3003** | `server.js`, `package.json` (`dev:socket`) |
| Socket connecting on every dev page load | Connect only when `NODE_ENV=production` or `NEXT_PUBLIC_ENABLE_WEBSOCKET=true` | `src/lib/realtime/socket.ts` |
| Mock API masking real bugs | Mock mode opt-in via `NEXT_PUBLIC_USE_MOCK_DATA=true` | `src/lib/api/client.ts` |

---

## Known gaps (not runtime blockers)

These do not usually crash the app but block “real data only” MVP completion:

- **Games list page** — `src/app/(dashboard)/games/page.tsx` uses inline `mockGames`
- **Team detail** — `src/app/(dashboard)/teams/[id]/page.tsx` uses mock team/members
- **Profile achievements / recent games** — mock sections on profile page
- **Courts / overview** — partial mock fallbacks when API empty or mock flag set

Track progress in [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md).

---

## Verification

### Prerequisites

```bash
npm install
# .env.local with DATABASE_URL, JWT_SECRET, etc. (see README)
npm run db:migrate
npm run dev
```

### Manual smoke (MVP)

1. Register at `/register` (position + skill level).
2. Complete profile at `/profile/setup`.
3. Create a game from `/games/create`.
4. Open game detail and confirm participants load from API.
5. Browse `/teams` and `/courts` with mock mode **off**.

### Scripted checks

From project root (dev server running on port 3000 unless noted):

```bash
node scripts/tests/test-db-connection.js
node scripts/tests/test-auth-flow.js
node scripts/tests/test-mvp-smoke.js
```

WebSockets (second terminal):

```bash
# .env.local: NEXT_PUBLIC_ENABLE_WEBSOCKET=true
npm run dev:socket
node scripts/tests/test-socket.js
```

Override base URL if needed:

```bash
$env:COURTZONE_BASE_URL="http://localhost:3000"; node scripts/tests/test-mvp-smoke.js
```

### Routes & APIs to spot-check

| Check | Method / path |
|-------|----------------|
| Register | `POST /api/auth/register` |
| Login | `POST /api/auth/login` |
| Session | `GET /api/auth/me` |
| Games | `GET/POST /api/games`, join/leave on `[id]` |
| Teams | `GET/POST /api/teams`, join on `[id]/join` |
| Courts | `GET /api/courts`, availability/reviews on `[id]` |
| Pages | `/`, `/login`, `/register`, `/dashboard` |

---

## Security (verified in code)

- Password hashing: bcrypt, 12 salt rounds (`src/lib/auth.ts`)
- JWT validation on protected routes (`middleware.ts`, `verifyToken`)
- Input validation on auth routes (Zod / route handlers)
- SQL injection mitigated via Prisma parameterized queries
- CORS on Socket.IO server tied to `NEXT_PUBLIC_APP_URL` (`server.js`)

Use a strong `JWT_SECRET` in production; the dev fallback must not ship to prod.

---

## Performance (dev benchmarks)

Figures vary by machine and cache state; treat as rough local dev numbers:

| Metric | Typical range |
|--------|----------------|
| First dashboard compile | ~3–6s |
| Warm page navigation | ~100–300ms |
| API (auth / simple CRUD) | ~15–500ms |
| DB query (local Postgres) | ~15–50ms |
| Socket connect (when enabled) | &lt;1s |

Run `npm run build` before release to catch compile-time issues not visible in `npm run dev`.

---

## Related docs

- [README.md](./README.md) — setup, env vars, npm scripts
- [DEVELOPMENT_CHECKLIST.md](./DEVELOPMENT_CHECKLIST.md) — MVP definition of done
- [DEPLOYMENT.md](./DEPLOYMENT.md) — production deployment
