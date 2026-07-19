# HANNKEY16

A marketing/landing site for HANNKEY16, a digital agency, with an AI chat widget backed by an Express API.

## Run & Operate

Each artifact has its own workflow that starts automatically in the Replit preview:
- **HANNKEY16 web** (`artifacts/hannkey16`) — `pnpm --filter @workspace/hannkey16 run dev`, served at `/`
- **API Server** (`artifacts/api-server`) — `pnpm --filter @workspace/api-server run dev`, served at `/api` (health check at `/api/healthz`, AI chat at `/api/ai/chat`)
- **Canvas / mockup sandbox** (`artifacts/mockup-sandbox`) — component preview server at `/__mockup`

Other useful commands:
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` (Postgres, auto-provided), `OPENAI_API_KEY` (or an OpenRouter key — see Gotchas)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind, Radix UI, wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (no tables defined yet — schema is currently empty)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- AI: OpenAI SDK, used for the chat widget

## Where things live

- `artifacts/hannkey16` — the marketing site (React/Vite)
- `artifacts/api-server` — Express API, routes in `src/routes` (`ai.ts` for chat, `health.ts` for healthz)
- `artifacts/mockup-sandbox` — Canvas component preview sandbox
- `lib/db` — Drizzle schema and DB client (`lib/db/src/schema/index.ts` is currently empty — no tables defined yet)
- `lib/api-spec`, `lib/api-zod`, `lib/api-client-react` — OpenAPI-based API contract and generated client/schemas

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

HANNKEY16 is a digital agency landing page (hero, services, portfolio, process, testimonials, FAQ, contact) with a floating AI chat widget that talks to the API server's `/api/ai/chat` streaming endpoint.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API server's `OPENAI_API_KEY` secret may actually hold an OpenRouter key. `openaiClient.ts` detects `sk-or-` prefixed keys and routes them to OpenRouter's OpenAI-compatible endpoint with a different default model — don't "fix" this by assuming it must be a real OpenAI key.
- The project was set up from a zip import; workflows and artifacts were reconfigured during setup — `node_modules` needed a fresh `pnpm install` before anything would run.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
