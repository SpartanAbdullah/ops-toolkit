# Ops Toolkit

Focused operations app for UAE SME teams. Two core features, mobile-first PWA, workspace-scoped SaaS-ready deploy.

- **Overtime** — UAE MOHRE-compliant calculator (Federal Decree-Law 33/2021): daytime 1.25×, night 1.5×, weekend/holiday 1.5×, Ramadan 6h cap. Plus a Simple Mode with a fixed hourly rate. Pending → approved/auto-approved → paid lifecycle with audit trail.
- **Petty Cash** — single-operator ledger with running balance, card-outstanding tracking, reimbursement workflow, and soft-delete (void) for entries that need correction.
- **Team & Profile** — invite codes, member roles, time zone preference, account email + display name.

Auth is Supabase email/password + Google OAuth. Currency is always AED. Default time zone is `Asia/Dubai`. Public sign-up is available by default, but users must create or join a workspace before accessing petty cash or overtime records.

## Tech stack

- Next.js 15 (App Router, React 19, server actions)
- TypeScript (strict)
- Tailwind CSS 3
- Supabase Auth (`@supabase/ssr`) + Postgres
- Prisma 6 (migrations workflow)
- react-hook-form + zod
- Radix UI primitives (Dialog, Accordion)
- Vitest for unit tests

## Quick start

```powershell
# 1. Install
npm install

# 2. Set up env
cp .env.example .env
# Fill DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, and a Supabase key.

# 3. Generate Prisma client + apply schema
npm run db:generate
npm run db:migrate:deploy   # applies prisma/migrations/* to the DB

# 4. Run
npm run dev                  # http://localhost:3000
```

For a brand-new Supabase project the migrations create everything. For a project that already has the schema (created via earlier `db:push` runs), baseline it instead:

```powershell
npx prisma migrate resolve --applied 0_init
npm run db:migrate:deploy
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run typecheck` | `tsc --noEmit`, strict mode |
| `npm test` | Run vitest suites once |
| `npm run test:watch` | Vitest watch mode |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Create a new migration locally (`prisma migrate dev`) |
| `npm run db:migrate:deploy` | Apply pending migrations to a target DB (CI / prod) |
| `npm run db:migrate:resolve` | Mark a migration as applied without running it (baselining) |
| `npm run db:push` | Push schema without a migration — avoid in production |

## Environment variables

See `.env.example`. In short:

- `DATABASE_URL` — pooled Supabase connection used by the running app
- `DIRECT_URL` — direct connection used by `prisma migrate` (required for migrations)
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` *(or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)* — public client key
- `NEXT_PUBLIC_SITE_URL` — public origin of the deployed app, used by metadata
- `NEXT_PUBLIC_ENABLE_PUBLIC_SIGNUP` — SaaS default is `true`; set to `false` only for private deployments

Never commit `.env`. If a credential lands on disk in cleartext, rotate it in the Supabase dashboard.

## Project layout

```
app/
  (root layout, manifest, icons)
  app/                      authenticated app, mobile-first PWA shell
    overtime/               entries, approvals, payments, settings tabs
    petty-cash/             ledger + edit/void + reimbursement flow
    profile/
    team/
  login/  signup/  auth/    Supabase auth flow + callback
  privacy/  terms/          UAE PDPL-aware legal pages (public)
components/
  app/                      feature components (sheets, lists, filters)
  auth/                     login/signup forms + Google button
  brand/  layout/  ui/      design-system primitives
lib/
  overtime.ts               MOHRE calculator + ledger row builder
  petty-cash.ts             ledger + summary + CSV
  tz.ts                     timezone helpers (Asia/Dubai default)
  validation/               zod schemas
  app/                      server-side context + role helpers
  supabase/                 SSR + browser clients
middleware.ts               auth gate for /app/*
prisma/
  schema.prisma
  migrations/               versioned migrations (0_init, 1_add_petty_cash_void)
```

## Testing

Vitest covers the pure-logic libraries (`lib/`). Sixty-plus tests verify:

- MOHRE overtime calculation across mode × weekend × holiday × Ramadan × overnight matrices
- Night-window splits and the 22:00–04:00 boundary
- Petty cash running-balance with voided rows excluded
- Summary aggregates respecting voided exclusion and the user's time zone
- CSV export shape

Run `npm test` before pushing. Server actions are not unit-tested — verify those flows in the dev server.

## Security headers and CSP

`next.config.ts` sets a strict header set on every response:

- `Content-Security-Policy` — `default-src 'self'`, scoped `script-src`, Supabase + Google Fonts allow-list, `frame-ancestors 'none'`, `form-action 'self'`
- `Strict-Transport-Security` — 2 years, includeSubDomains, preload-eligible
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera/mic/geo/FLoC denied
- `X-Powered-By` removed

The CSP keeps `'unsafe-inline'` and `'unsafe-eval'` on `script-src` to stay compatible with Next.js App Router hydration. For a public-facing deploy, swap to nonce-based CSP.

## Audit trail

Every mutating server action writes an `AuditLog` row inside the same transaction: actor, team, action key (`petty_cash.transaction.voided` etc.), entity reference, human summary, and a JSON `details` payload (including before/after on edits). Voided petty cash transactions stay in the ledger with a reason and are excluded from balance — never hard-deleted.

## Production safety model

Operational records are workspace-scoped. Public signup does not grant access to any company data: petty cash and overtime screens require an active workspace, and privileged actions use explicit server-side capabilities for owner, admin, supervisor, finance, and worker roles. The Prisma runtime remains the trusted data-access layer; optional Supabase RLS policy templates live in `prisma/rls_strategy.sql` for any future direct client-side table access.

New users land on the mobile Home screen, where they can create a company/workspace or join an existing workspace by invite code. Email verification should be required in the Supabase Auth project settings for production.

Phase 0 database guardrails are versioned in `prisma/migrations/2_phase0_production_safety`:

- one active opening balance per petty cash ledger
- amount checks for petty cash transactions
- overtime minute and approved-state checks
- payment marking blocked unless approved overtime exists
- period lock table and triggers for normal edits after lock

## Deployment notes

- Deploy target: any Node 20+ host that runs Next.js (Vercel, self-hosted, Docker). No deploy config is checked in.
- Set the env vars above in the host. Run `npm run db:migrate:deploy` against `DIRECT_URL` before promoting a build.
- Static prerendered routes: `/login`, `/signup`, `/privacy`, `/terms`, `/manifest.webmanifest`.

## License

Proprietary. © Ops Toolkit.
