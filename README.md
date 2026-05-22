# Court Zone

Basketball matchmaking web app — find games, manage teams, discover courts, and schedule matches. Built with Next.js, TypeScript, and a basketball-themed UI.

## Quick start

```bash
git clone https://github.com/EjLaquiorez/CourtZone.git
cd CourtZone
npm install
# create .env.local (see below)
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Prerequisites

| Tool | Version | Notes |
|------|---------|--------|
| **Node.js** | 18+ | LTS recommended |
| **npm** | 9+ | Ships with Node |
| **PostgreSQL** | 14+ | Required for auth, teams, games, courts |
| **Git** | any | Clone and contribute |

Optional (feature-specific):

- **Mapbox** — court map tiles (`NEXT_PUBLIC_MAPBOX_TOKEN`)
- **Stripe** — payments (`src/lib/payment/stripe.ts`)

## First-time setup

### 1. Clone and install

```bash
git clone https://github.com/EjLaquiorez/CourtZone.git
cd CourtZone
npm install
```

Files in `.gitignore` (including `node_modules/` and `.env*`) are not on GitHub. You recreate them locally after cloning.

### 2. PostgreSQL

Create a database, for example:

```sql
CREATE DATABASE courtzone;
```

Local connection string format:

```text
postgresql://USER:PASSWORD@localhost:5432/courtzone
```

### 3. Environment variables

Create `.env.local` in the project root:

```env
# Required — database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/courtzone"

# Required — auth (use a long random string in production)
JWT_SECRET="replace-with-a-strong-secret"
JWT_EXPIRES_IN="7d"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="/api"

# Optional — court maps (Mapbox)
NEXT_PUBLIC_MAPBOX_TOKEN=""

# Optional — push notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""

# Optional — real-time (off by default in local dev)
NEXT_PUBLIC_ENABLE_WEBSOCKET="false"
NEXT_PUBLIC_SOCKET_URL="http://localhost:3003"
NEXT_PUBLIC_WEBSOCKET_URL="http://localhost:3003"

# Optional — use mock API responses without hitting the DB for some flows
NEXT_PUBLIC_USE_MOCK_DATA="false"
```

Verify the database connection:

```bash
node test-db-connection.js
```

### 4. Database setup

```bash
npm run db:generate   # Prisma client
npm run db:migrate    # apply migrations
npm run db:seed       # optional sample users, teams, courts, games
```

Browse data in Prisma Studio:

```bash
npm run db:studio
```

### 5. Run the dev server

```bash
npm run dev
```

For WebSocket / Socket.IO features, run the custom server in a **second terminal**:

```bash
npm run dev:socket
```

Set `NEXT_PUBLIC_ENABLE_WEBSOCKET=true` in `.env.local` when testing real-time chat or live updates.

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev server (port 3000) |
| `npm run dev:socket` | Custom server with Socket.IO (port 3003) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Prisma Studio UI |
| `npm run db:reset` | Reset DB and re-run migrations (destructive) |

## Project structure

```text
CourtZone/
├── prisma/
│   ├── schema.prisma      # DB models (User, Team, Game, Court, …)
│   ├── migrations/        # SQL migrations
│   └── seed.ts            # Dev seed data
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # login, register
│   │   ├── (dashboard)/   # dashboard, teams, games, courts, profile
│   │   └── api/           # REST route handlers
│   ├── components/        # UI, forms, layout, maps
│   └── lib/               # API client, auth, stores, hooks, socket
├── lib/                   # Shared auth + Prisma (used by seed/middleware)
├── middleware.ts          # JWT route protection
├── server.js              # Socket.IO dev server
└── public/                # Static assets
```

### Main routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login`, `/register` | Auth (redirects to dashboard when logged in) |
| `/dashboard` | Main hub after login |
| `/teams`, `/games`, `/courts` | Core features |
| `/profile`, `/profile/setup` | Player profile |
| `/api/*` | Backend API (protected routes need `auth-token` cookie) |

Protected paths are enforced in `middleware.ts` using the `auth-token` JWT cookie.

## Tech stack

**Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Radix UI, Lucide icons, TanStack Query, Zustand

**Backend:** Next.js Route Handlers, Prisma 6, PostgreSQL, JWT auth (`lib/auth.ts`), Socket.IO (optional)

**Maps / realtime:** Mapbox GL, react-map-gl, Socket.IO client

## Design system

Basketball orange primary (`#FF6B35`, `#E55A2B`), deep navy dark (`#1A1D29`, `#0F1419`), court green accents (`#228B22`, `#32CD32`). Fonts: Orbitron (display), Inter (body), Rajdhani (stats). See `tailwind.config.ts` and `src/app/globals.css`.

## Current development focus

Court Zone is organized around a single real-data MVP flow:

`register/login -> complete profile -> discover scheduled games -> create or join a game`

Current build priority:

1. Finish auth and profile completeness.
2. Ship `games` as the first complete Prisma-backed flow.
3. Expand the same pattern to `teams` and `courts`.
4. Add automated verification and deployment checks.

Mock mode is opt-in only — set `NEXT_PUBLIC_USE_MOCK_DATA=true` when needed.

Supporting notes: [`DEVELOPMENT_CHECKLIST.md`](DEVELOPMENT_CHECKLIST.md).

## Development tips

**Auth flow** — Register or log in via `/register` or `/login`. API sets an `auth-token` httpOnly cookie. Test protected APIs with the cookie or `Authorization: Bearer <token>`.

**Mock data** — Some dashboard pages still use inline mock data; the API client can fall back to mocks when `NEXT_PUBLIC_USE_MOCK_DATA=true`. Prefer real DB data after `db:seed` for integration work.

**Adding a DB field** — Edit `prisma/schema.prisma`, then `npm run db:migrate` and update types/services under `src/lib/api/`.

**Types** — Shared types live under `src/types` (imported across components and API).

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| `ECONNREFUSED` on DB | Start PostgreSQL; check `DATABASE_URL` host/port |
| Prisma client errors | `npm run db:generate` |
| Empty tables | `npm run db:migrate` then `npm run db:seed` |
| 401 on dashboard/API | Log in again; check `JWT_SECRET` matches the token issuer |
| Maps not loading | Set `NEXT_PUBLIC_MAPBOX_TOKEN` |
| WebSockets not connecting | Run `npm run dev:socket` and set `NEXT_PUBLIC_ENABLE_WEBSOCKET=true` |

## Production deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for Vercel, Docker, env vars, and security notes.

## Feature status

- [x] Landing, auth, dashboard shell
- [x] Teams, games, courts (UI + API routes)
- [x] Prisma schema, migrations, seed
- [ ] Full production realtime (WebSocket server optional locally)
- [ ] Replace remaining page-level mock data with live API data

---

Made with care for hoopers and developers alike.
