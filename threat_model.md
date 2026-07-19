# Threat Model

## Project Overview

HANNKEY16 is a marketing/landing site for a digital agency, built as a pnpm-workspace monorepo (Node.js 24, TypeScript). It has three deployable artifacts: a static React/Vite marketing site (`artifacts/hannkey16`), an Express 5 API server (`artifacts/api-server`) that backs a floating AI chat widget and an order/payment flow, and a dev-only Canvas/mockup component-preview sandbox (`artifacts/mockup-sandbox`, not part of the production deployment — no `[services.production]` section in its `artifact.toml`). Deployment status at scan time: not yet deployed (`isDeployed: false`). There is a Postgres + Drizzle ORM package (`lib/db`) with a single `orders` table backing the payment flow.

## Assets

- **OpenAI/OpenRouter API key** (`OPENAI_API_KEY` secret, server-side only, read in `artifacts/api-server/src/lib/openaiClient.ts`) — a metered/billed credential. Compromise or abuse enables unbounded billing.
- **DOKU payment gateway credentials** (`DOKU_CLIENT_ID` / `DOKU_SECRET_KEY`, server-side only, read in `artifacts/api-server/src/lib/dokuClient.ts`) — used to create payment sessions and to HMAC-sign/verify DOKU's webhook notifications. Compromise of `DOKU_SECRET_KEY` would let an attacker forge webhook notifications and mark arbitrary orders as `paid`.
- **Orders data** (`orders` table, `lib/db/src/schema/orders.ts`) — customer name/email/phone, package/amount, payment status, DOKU token/session IDs. Contains PII and payment-adjacent metadata (no raw card data — DOKU hosts the actual payment page).
- **Marketing content and system prompt** — the AI assistant's instructions (`SYSTEM_PROMPT` in `artifacts/api-server/src/routes/ai.ts`) contain business logic (pricing ranges, contact info) that is not secret but should not be spoofed/misrepresented.
- **Visitor chat messages** — transient, not persisted, passed through to the LLM provider per-request.
- No user accounts or admin authentication currently exist in this codebase — all endpoints are effectively public/unauthenticated by design at this stage.

## Trust Boundaries

- **Browser → API server** (`/api/ai/chat`, `/api/healthz`, `/api/orders`, `/api/orders/:id`): the main network-facing dynamic boundary. The client is fully untrusted; the server must validate/limit everything it accepts. CORS is restricted via `getAllowedOrigins()` in `artifacts/api-server/src/app.ts` to the app's own Replit domain(s) (`REPLIT_DOMAINS`/`REPLIT_DEV_DOMAIN`), and `app.set("trust proxy", 1)` is configured so `express-rate-limit` keys correctly on the real client IP behind Replit's one-hop reverse proxy.
- **DOKU → API server webhook** (`POST /api/orders/webhook`, mounted with `express.raw()` before the JSON body parser): an external-service-to-server boundary authenticated via a DOKU-specific HMAC-SHA256 signature over `Client-Id`/`Request-Id`/`Request-Timestamp`/`Request-Target`/`Digest`, verified with `crypto.timingSafeEqual`. The handler additionally re-validates the notified amount against the stored order amount and refuses to downgrade an already-terminal order status, mitigating tampering/replay of stale notifications.
- **API server → DOKU payment API**: outbound call using `DOKU_CLIENT_ID`/`DOKU_SECRET_KEY`; the server computes the charge amount itself from `lib/packages.ts` (never trusts a client-supplied price).
- **API server → OpenAI/OpenRouter**: outbound call using a secret key; the server-side code decides the model/base URL based on key prefix (`sk-or-` → OpenRouter). No user input reaches this boundary except as chat message content (prompt injection surface, not code injection).
- **API server → PostgreSQL**: all queries go through Drizzle ORM with parameterized queries; no raw SQL string concatenation observed in `orders.ts`/`orders-webhook.ts`.
- **Static site → CDN/browser**: `artifacts/hannkey16` is a static SPA; no server-side rendering of user input.
- **Dev-only mockup sandbox** (`artifacts/mockup-sandbox`, `/__mockup`): not deployed to production; treat as unreachable in prod unless proven otherwise.

## Scan Anchors

- Production entry points: `artifacts/api-server/src/routes/ai.ts` (`POST /api/ai/chat`), `artifacts/api-server/src/routes/orders.ts` (`POST /api/orders`, `GET /api/orders/:id`), `artifacts/api-server/src/routes/orders-webhook.ts` (`POST /api/orders/webhook`, mounted separately in `app.ts` with a raw body parser), and `artifacts/api-server/src/routes/health.ts` (`GET /api/healthz`). All are unauthenticated by design; `/api/orders` and `/api/ai/chat` are rate-limited per-IP.
- Highest-risk code area: `artifacts/api-server/src` (the only dynamic backend code), especially `lib/dokuClient.ts` (webhook signature/HMAC logic) and `routes/orders*.ts` (money-moving flow). `artifacts/hannkey16` is a static marketing SPA — its forms (contact, order) call the API server directly; no server-side rendering of user input.
- Order IDs are DB-generated `uuid` v4 (`defaultRandom()`), not sequential — `GET /api/orders/:id` is intentionally unauthenticated (used for post-checkout status polling) but relies on UUID unguessability rather than an access-control check; it returns only `id`/`packageName`/`amount`/`status` (no PII).
- Public surface: everything is public — there is no authentication, session, or admin boundary anywhere in the current codebase. There is also no admin/back-office view of the `orders` table yet.
- Dev-only: `artifacts/mockup-sandbox` (Canvas preview) — not part of the production deployment.
- Deployment status at scan time: not deployed (`isDeployed: false`); re-verify CORS allowlist and rate-limit behavior once actually deployed and `REPLIT_DOMAINS` is populated.

## Threat Categories

### Denial of Service / Resource Exhaustion

The unauthenticated, metered/paid endpoints (`/api/ai/chat`, `/api/orders`) are rate-limited via `express-rate-limit`, and `app.set("trust proxy", 1)` is correctly configured for Replit's single-hop reverse proxy so the limiter keys on real client IPs. CORS is scoped to the app's own origin(s) via `getAllowedOrigins()`, preventing third-party sites from triggering billed calls from a visitor's browser. The DOKU webhook endpoint (`POST /api/orders/webhook`) has no rate limit, but unsigned requests are cheaply rejected before any DB write, bounding impact to signature-check CPU cost. Required guarantee: rate limiters must key on real client IPs in the deployed (proxied) environment, and CORS must remain scoped to the site's own origin(s).

### Information Disclosure

The system prompt instructs the model to always reveal a fixed WhatsApp number and pricing ranges — this is intentional, not sensitive data. Logging (`artifacts/api-server/src/lib/logger.ts`) redacts `authorization`/`cookie`/`set-cookie` headers and only logs method/URL (not bodies), so chat message content and order PII (name/email/phone) are not logged. `GET /api/orders/:id` returns only non-PII fields. No secrets are logged.

### Tampering / Injection

All database access goes through Drizzle ORM with parameterized queries; no raw SQL string concatenation. The order flow resolves price/amount server-side from `lib/packages.ts` — the client only ever sends a `packageId`, never a price — preventing price tampering. The DOKU webhook validates the HMAC signature (constant-time comparison) before trusting any payload, cross-checks the notified amount against the stored order amount, and refuses to overwrite a terminal order status, mitigating forged/replayed payment notifications. The chat endpoint only forwards sanitized (role/length-capped) message content to the LLM provider; prompt injection against the assistant's own instructions is a low-severity, low-impact risk given the assistant has no tool access, no DB access, and no ability to take actions on the user's behalf.

### Elevation of Privilege / Broken Access Control

Not currently applicable: there is no authentication, no roles, and no admin surface in this codebase. Revisit this section once an admin/back-office view of orders is introduced — at that point, order data and status-mutation actions must be gated behind real authentication/authorization rather than relying on UUID unguessability.
