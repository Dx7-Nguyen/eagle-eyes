# Eagle Eyes

A golf stat tracker that logs rounds shot-by-shot, computes strokes gained by category against a PGA Tour baseline, and visualises trends over time.

## Features

- **Account registration & login** — register with your full name, email, and an alphanumeric password. Sessions last 7 days via a secure httpOnly cookie. All data is scoped to your account.
- **Profile management** — update your full name and gender (Male / Female) from the Profile page at any time.
- **Course search** — powered by the GolfCourseAPI: start typing a course name when logging a round and pick from live suggestions. Selecting a course stores the official name and its external ID for future enrichment. Free-text entry still works for unlisted courses.
- **Round logging** — enter every shot with starting lie, distance to hole, and result. Shots chain automatically (next shot's start pre-fills from the previous end).
- **Save progress & resume** — save a round as a draft at any point and pick up where you left off. Drafts appear in an "In Progress" section on the Rounds and Profile pages with Continue and Delete links. Only published rounds affect stats and trends.
- **Publish confirmation** — finishing a round opens a confirmation prompt before committing it to your history, so accidental saves don't pollute your data.
- **Strokes gained** — each shot is benchmarked against a PGA Tour expected-strokes baseline and categorised into Tee, Approach, Short Game, and Putting.
- **Trends** — line chart showing SG per category across all published rounds so you can see which part of your game is improving.
- **Round management** — view shot-level detail for any round, delete published rounds from the history table or detail page, and delete in-progress drafts directly from the "In Progress" section before they are published.
- **Marketing landing page** — full-screen landing page at `/` with scroll-reveal animations, parallax, and a marquee strip.

## Tech stack

| Layer    | Tech                                                              |
| -------- | ----------------------------------------------------------------- |
| Frontend | React 18, Vite, HeroUI v2, Tailwind CSS v3, Recharts              |
| Backend  | Node.js, Express, Prisma ORM                                      |
| Database | SQLite                                                            |
| Auth     | bcryptjs (password hashing), jsonwebtoken (JWT), httpOnly cookies |
| Language | TypeScript (strict) throughout                                    |

## Project structure

```
eagle-eyes/
├── client/          # Vite + React frontend
│   ├── public/      # Static assets (azalea SVGs)
│   └── src/
│       ├── context/ # AuthContext (user state, login/register/logout)
│       ├── components/ # ProtectedRoute
│       ├── pages/   # Landing, Login, Register, Home, NewRound, RoundDetail, Trends, Help
│       ├── lib/     # Format helpers
│       └── api.ts   # Typed fetch wrapper
├── server/          # Express API
│   ├── prisma/      # Schema + migrations
│   └── src/
│       ├── lib/     # Prisma client, bcrypt/JWT utils, baselines, SG calculator
│       ├── middleware/ # requireAuth JWT middleware
│       └── routes/  # /api/auth, /api/rounds, /api/trends, /api/courses
└── shared/
    └── types/       # Shared TypeScript types (Round, Shot, SG, AuthUser, etc.)
```

## Getting started

### Prerequisites

- Node.js 20+
- npm 9+

### Setup

```bash
# Install all dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Configure environment
cd server
cp .env.example .env
# Edit .env — set a strong JWT_SECRET and add your GOLF_COURSE_API_KEY

# Run the database migration
npx prisma migrate dev --name init
cd ..
```

### Run

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3000

### Other scripts

```bash
npm run build          # Build client + server
npm run db:migrate     # Run pending Prisma migrations
npm run db:studio      # Open Prisma Studio (DB browser)
```

## Authentication

Eagle Eyes uses email + password authentication with JWT sessions stored in httpOnly cookies.

### Registering

Navigate to `/register`. Enter your full name, email, and create a password that meets these requirements:

- 8 to 128 characters
- Letters (A–Z, a–z) and numbers (0–9) only — no special characters

### Signing in

Navigate to `/login` and enter your credentials. Your session persists for 7 days.

### API endpoints

| Method    | Path                    | Description                        |
| --------- | ----------------------- | ---------------------------------- |
| `POST`    | `/api/auth/register`    | Create a new account               |
| `POST`    | `/api/auth/login`       | Sign in                            |
| `POST`    | `/api/auth/logout`      | Sign out (clears cookie)           |
| `GET`     | `/api/auth/me`          | Get current user                   |
| `PATCH`   | `/api/auth/profile`     | Update full name and/or gender     |
| `GET`     | `/api/courses/search`   | Search courses via GolfCourseAPI   |

All `/api/rounds`, `/api/trends`, and `/api/courses` endpoints require a valid session cookie and return only the authenticated user's data.

## Strokes gained categories

| Category       | When assigned                                                        |
| -------------- | -------------------------------------------------------------------- |
| **Tee**        | Tee shots on par 4s and par 5s                                       |
| **Approach**   | Tee shots on par 3s + any shot > 30 yards from a non-green lie       |
| **Short Game** | Shots ≤ 30 yards from a non-green lie (chips, pitches, bunker shots) |
| **Putting**    | Any shot starting on the green (distance in feet)                    |

SG for each shot = `expected_strokes(start) − expected_strokes(end) − 1`

Expected strokes values are interpolated from a simplified PGA Tour baseline table covering Tee, Fairway, Rough, Sand, Recovery, and Green lies.

## Distance units

- **Yards** — all lies except green
- **Feet** — green (putting distances)
