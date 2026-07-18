# CS2Squad

CS2Squad is a competitive teammate-discovery and team-recruitment platform for Counter-Strike players. Verified Steam users publish a useful player brief, search by compatibility signals, create or discover team rooms, and control roster changes through explicit invitations.

The interface is an original dark tactical design built from CSS and inline SVG geometry. It does not include Valve artwork, map imagery, weapon renders, or copied product branding.

## Key features

- Steam OpenID sign-in with seven-day JWT sessions
- Staged player onboarding for rank, region, roles, language, availability, play style, goals, privacy, and recruitment state
- Personal dashboard backed by live profile, player, team, and invitation data
- Player search by callsign, region, rank window, role, language, availability, and recruitment status
- Team search by name, region, rank window, open role, roster size, and recruitment status
- Detailed player dossiers and team rooms
- Captain-only team editing, invitation, member removal, ownership transfer, and deletion
- Received and sent invitation history with pending, accepted, declined, and cancelled states
- Transactional invitation acceptance and duplicate-pending-invitation protection
- Responsive layouts from 320px mobile to large desktop, visible keyboard focus, and reduced-motion support

## Screenshots

Current screenshots should be captured from a local environment connected to a populated development database. Suggested captures:

1. Landing page at 1440 × 900
2. Authenticated dashboard at 1440 × 900
3. Player discovery at 390 × 844
4. Team room and captain controls at 1440 × 900

The older screenshots under `client/public/screenshots` document the previous interface and are not representative of this rebuild.

## Technology stack

| Layer | Technology |
| --- | --- |
| Client | React 19, TypeScript, React Router, Vite, CSS design tokens |
| API | Node.js 20, Express 5, Passport Steam, JSON Web Tokens |
| Data | PostgreSQL through `pg`, versioned SQL migrations |
| Tests | Jest, Supertest, Vitest, Testing Library |
| Runtime | Docker, Caddy, GitHub Actions |

This repository uses raw, parameterised PostgreSQL queries. It does **not** currently use Prisma; the schema and migrations are maintained as SQL so the existing deployed data layer remains intact.

## Architecture

```text
Steam OpenID
    │
    ▼
Express API ── JWT bearer session ── React client
    │                                  │
    ├── profile and discovery          ├── auth/session context
    ├── team permissions               ├── typed API client
    ├── invitation transactions        └── lazy route experiences
    │
    ▼
PostgreSQL
```

### Frontend structure

```text
client/src/
├── components/    reusable navigation, cards, dialogs, forms, and icons
├── context/       authentication/session and toast feedback
├── lib/           typed API client, constants, and presentation utilities
├── pages/         lazy-loaded route experiences
├── test/          shared test setup
├── types.ts       API/domain models
└── styles.css     design tokens, layout, animation, and responsive system
```

### Backend structure

```text
server/
├── db/            bootstrap schema, seed data, and forward migrations
├── middleware/    shared JWT authentication
├── routes/        Steam auth, players, teams, and invitations
├── utils/         input validation and response mappers
├── __tests__/     Supertest behavior and authorization coverage
├── app.js         Passport Steam strategy
├── appInstance.js Express application without a listening socket
└── index.js       production entry point
```

## Authentication flow

1. The client opens `GET /auth/steam`.
2. Passport redirects to Steam OpenID.
3. Steam returns to `GET /auth/steam/return`.
4. The API creates or refreshes the local public Steam identity.
5. A seven-day JWT is placed in the redirect URL **fragment**, which is not sent in HTTP referrers or server access logs.
6. The client stores the token locally and sends it as `Authorization: Bearer <token>`.
7. Invalid or expired sessions clear local auth state and show a session-expired sign-in state.

CS2Squad never receives a Steam password. Production secrets belong in environment variables only.

## Environment variables

Copy `server/.env.example` to `server/.env` for direct local API development. Copy the root `.env.example` to `.env` for Docker Compose.

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `5000` |
| `NODE_ENV` | Yes in production | Enables verified PostgreSQL TLS |
| `FRONTEND_URL` | Yes | Post-auth redirect destination |
| `CORS_ORIGINS` | Recommended | Comma-separated allowed browser origins |
| `STEAM_API_KEY` | Yes | Steam Web API key |
| `STEAM_REALM` | Yes | Public API origin with trailing slash |
| `STEAM_RETURN_URL` | Yes | Exact Steam callback URL |
| `JWT_SECRET` | Yes | Long random JWT signing secret |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PG_SSL_CA_PATH` | Production | CA bundle mounted into the API container |
| `VITE_API_BASE_URL` | Client | Browser-visible API origin |
| `API_DOMAIN` | Docker | Hostname served by Caddy |

Never commit `.env` files or real credentials.

## Local development

- **Frontend:** React + TailwindCSS + React Router
- **Backend:** Node.js + Express + Passport-Steam (OpenID) + JWT Auth + Steam OpenID (Passport)
- **Database & Cloud:** PostgreSQL (AWS RDS) + AWS EC2 + AWS Security Groups + Docker & Docker Compose + Caddy (HTTPS reverse proxy)
- **Styling:** TailwindCSS with animations and responsive design

---
## 🏗️ Architecture Overview

- **Frontend:** Deployed on Vercel
- **Backend:** Dockerised Node.js API running on AWS EC2
- **Database & Cloud:** PostgreSQL on AWS RDS :
  - Private access via Security Groups (EC2 -> RDS)
  - Encrypted connections using TLS + AWS RDS CA Bundle
- **Styling:** TailwindCSS with animations and responsive design

```bash
psql "$DATABASE_URL" -f server/db/schema.sql
psql "$DATABASE_URL" -f server/db/seed.sql
```

Run the API and client in separate terminals:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

The default client is `http://localhost:5173`; the default API is `http://localhost:5000`.

## Database migration

Existing installations should run the additive product-rebuild migration once:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f server/db/migrations/002_product_rebuild.sql
```

The migration adds player-profile metadata, team-recruitment metadata, the invitation table, validation constraints, and discovery indexes. It does not drop existing users or teams. Back up production data before every schema migration.

## API overview

All routes except `/`, `/health`, `/stats`, and the Steam handshake require a bearer token.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/profile` | Current player, teams, and pending invitation count |
| `PATCH` | `/users/me/profile` | Update the authenticated player only |
| `GET` | `/users` | Filtered and paginated player discovery |
| `GET` | `/users/:steamId` | Player dossier with privacy enforcement |
| `GET` | `/team` | Filtered and paginated team discovery |
| `POST` | `/team` | Create a team for the authenticated player |
| `GET/PATCH/DELETE` | `/team/:teamId` | View or owner-manage a team |
| `POST` | `/team/:teamId/invitations` | Send a pending invitation as owner |
| `DELETE` | `/team/:teamId/members/:steamId` | Remove a member as owner |
| `PATCH` | `/team/:teamId/owner` | Transfer ownership to a current member |
| `POST` | `/team/:teamId/leave` | Leave a team as a non-owner member |
| `GET` | `/invitations` | Received/sent invitation history |
| `POST` | `/invitations/:id/accept` | Transactionally accept an addressed invite |
| `POST` | `/invitations/:id/decline` | Decline an addressed pending invite |
| `POST` | `/invitations/:id/cancel` | Cancel a sent pending invite |

Legacy team creation and member URLs remain as authenticated compatibility aliases. The old “add teammate” URL now creates a pending invitation instead of silently changing membership.

## Testing and builds

```bash
npm test --prefix server -- --runInBand
npm run typecheck --prefix client
npm test --prefix client
npm run build --prefix client
```

The API tests mock PostgreSQL at the query boundary and cover authentication, profile ownership, discovery filters, validation, team permissions, team creation, duplicate invitations, acceptance transactions, declines, and string identifier handling.

## Docker

The compose stack runs the API behind Caddy and expects an external PostgreSQL connection in `DATABASE_URL`.

```bash
cp .env.example .env
docker compose config
docker compose up --build
```

Caddy terminates TLS for `API_DOMAIN`, adds basic response hardening headers, and proxies to the health-checked API container. The static client can be deployed independently after `client/dist` is built; set `VITE_API_BASE_URL` at build time and keep it aligned with CORS and Steam callback configuration.

## Deployment overview

1. Provision PostgreSQL and run the bootstrap schema or forward migration.
2. Configure the API secrets and verified CA bundle.
3. Deploy the API container behind HTTPS.
4. Register matching Steam realm and callback URLs.
5. Build the client with the public API origin.
6. Configure the exact frontend origin in `FRONTEND_URL` and `CORS_ORIGINS`.
7. Run health checks and a real Steam sign-in before sending traffic.

## Security notes

- ✅ Steam authentication + JWT
- ✅ Profile and team management
- ✅ Full deployment (Vercel + AWS)
- 🔜 Matchmaking filters (rank, region)
- 🔜 Team invites & recommendations
- 🔜 Leaderboards & player statistics
- 🔜 Admin dashboard

## Known limitations

- Counter-Strike Premier rating is entered manually because Steam does not expose a reliable current Premier rating through this authentication flow.
- Team recruitment is captain-initiated; inbound team applications are not part of the current API contract.
- The repository does not bundle a PostgreSQL service in Compose and expects a managed or separately run database.
- Full Steam callback and database-backed browser automation require external credentials and services; automated repository tests mock the database boundary.

## Future improvements

- Optional inbound team applications with captain review
- Availability overlap scoring and ranked recommendations
- Audit history for ownership and member changes
- Database-backed Playwright fixtures for the complete authenticated journey
- Current production screenshots and performance budgets in CI

## License and attribution

CS2Squad is licensed under the MIT License. Counter-Strike and Steam are trademarks of Valve Corporation. CS2Squad is an independent project and is not affiliated with or endorsed by Valve.
