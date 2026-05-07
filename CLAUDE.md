# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Eagle Eyes** is a full-stack golf stat tracker. Users log rounds shot-by-shot; the app computes strokes gained (SG) per shot against a PGA Tour baseline and visualises trends over time. It also calculates a WHS Handicap Index from published rounds.

## Commands

### Development

```bash
# Install all deps (run once from repo root)
npm install && cd client && npm install && cd .. && cd server && npm install && cd ..

# Run client + server concurrently
npm run dev          # client → :5173, server → :3000

# Individual services
npm run dev:client
npm run dev:server
```

### Build

```bash
npm run build        # tsc + vite build for both client and server
```

### Database

```bash
npm run db:migrate   # run pending Prisma migrations
npm run db:studio    # open Prisma Studio GUI
```

### Server environment

Copy `server/.env.example` to `server/.env` and set:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — long random string
- `GOLF_COURSE_API_KEY` — from golfcourseapi.com (course search is silently disabled if blank)
- `CLIENT_URL` — CORS origin (default `http://localhost:5173`)

## Architecture

The repo is a TypeScript monorepo with three packages:

```
client/   Vite + React 18 SPA
server/   Express API + Prisma ORM
shared/   Types shared by both (imported as relative paths with .js extensions)
```

### Shared types (`shared/types/index.ts`)

The single source of truth for all domain types: `Lie`, `EndLie`, `Category`, `Shot`, `HoleInput`, `HoleResult`, `RoundInput`, `RoundDetail`, `RoundSummary`, `DraftSummary`, `RoundEditData`, `AuthUser`, `HandicapData`, `CourseSearchResult`. Both client and server import from here — never define these locally.

### Server

- **Entry**: `server/src/index.ts` — Express app with CORS (credentials), cookie-parser, and 5 routers.
- **Auth**: JWT stored in an httpOnly cookie (`token`). `requireAuth` middleware (`server/src/middleware/auth.ts`) verifies the cookie and attaches `req.user` (`{ userId }`). All `/api/rounds`, `/api/trends`, `/api/courses`, `/api/handicap` routes apply this middleware.
- **Database**: PostgreSQL via Prisma. Schema: `User → Round → Hole → Shot` (cascading deletes). Rounds have a `status` field: `"DRAFT"` or `"PUBLISHED"`. Only published rounds appear in stats/trends/handicap.
- **Strokes gained**: Computed on the fly (never stored). `server/src/lib/baselines.ts` holds PGA Tour expected-strokes lookup tables per lie type; `server/src/lib/strokes-gained.ts` interpolates them and categorises each shot.
- **Handicap**: `server/src/lib/handicap.ts` implements WHS — score differential per round `(113 / slope) × (AGS − rating)`, then averages the lowest N per the WHS lookup table. Requires ≥ 3 eligible rounds (18-hole, API-matched course with rating + slope).
- **Course search**: Proxied to `https://api.golfcourseapi.com/v1/search` in `server/src/lib/golfCourseApi.ts`. Returns empty array if no API key.

### Client

- **API layer**: All server calls go through `client/src/api.ts` — a thin typed wrapper around `fetch` with `credentials: "include"`. Add new endpoints here.
- **Auth state**: `AuthContext` (`client/src/context/AuthContext.tsx`) holds the current `AuthUser` and exposes `login`, `register`, `logout`, `updateProfile`, `updateGender`. It bootstraps by calling `GET /api/auth/me` on mount. `ProtectedRoute` redirects unauthenticated users to `/login`.
- **Routing**: `App.tsx` — public routes (`/`, `/login`, `/register`) and protected routes under `AppShell` (navbar + `<Outlet>`): `/profile`, `/rounds`, `/rounds/:id`, `/new`, `/trends`, `/help`.
- **UI**: HeroUI v2 components + Tailwind CSS. Brand colours: dark green `#003D2B`, gold `#F5D130`.
- **NewRound page** (`client/src/pages/NewRound.tsx`): the most complex page — handles course search (debounced), tee selection, round type (Front 9 / Back 9 / 18 holes), shot-by-shot entry with chaining, draft save/resume, and publish confirmation modal.

### Data flow for a round

1. User enters shots in `NewRound`. Client sends `RoundInput` (holes + shots with lies and distances).
2. Server `POST /api/rounds` or `POST /api/rounds/draft` validates and persists raw shots.
3. `GET /api/rounds/:id` calls `buildDetail()` → `annotateHole()` → computes SG per shot and aggregates by category. SG is never stored, always recomputed.
4. Trends (`GET /api/trends`) recomputes SG for all published rounds and returns a `TrendPoint[]`.

### Strokes gained categories

| Category | Rule |
|---|---|
| TEE | Tee shot on par 4 or par 5 |
| APPROACH | Tee shot on par 3, or any shot > 30 yd from a non-green lie |
| SHORT_GAME | ≤ 30 yd from a non-green lie |
| PUTTING | Any shot from the green (distance in feet, not yards) |

### TypeScript notes

- Both packages use `"type": "module"` with ESM. Server imports use `.js` extensions even for `.ts` source files.
- `strict: true` throughout. The `server/src/types/express.d.ts` extends `Express.Request` with `user: { userId: number }`.
- `tsconfig.base.json` at root holds shared compiler options; both `client/tsconfig.json` and `server/tsconfig.json` extend it.
