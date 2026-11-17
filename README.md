# Next.js Foundation

A minimal, production-ready starting point: Next.js 16 (App Router), React 19,
strict TypeScript, Tailwind CSS 4, zod-validated environment variables, ESLint,
Prettier and Vitest.

## Requirements

- Node.js 22 or newer
- npm

## Install

```bash
npm ci
cp .env.example .env.local   # optional; every variable has a default
```

## Run

```bash
npm run dev     # development server on http://localhost:3000
```

Health check: `GET /api/health` returns `200` with `{ "status": "ok" }`.

## Test and check

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format:check  # Prettier (npm run format to fix)
npm test              # Vitest
```

## Build

```bash
npm run build   # next build
npm start       # serve the production build
```

## Structure

- `src/app/` - routes: `layout.tsx`, `page.tsx`, `not-found.tsx`, `error.tsx`,
  `loading.tsx`, `api/health/route.ts`
- `src/components/` - shared UI
- `src/lib/` - helpers
- `src/env.ts` - validates environment variables with zod at startup and exports
  a typed `env`. Read configuration only through `env`.
- `tests/` - Vitest tests
- `next.config.ts` - security headers (`X-Content-Type-Options`,
  `Referrer-Policy`, `X-Frame-Options`)

## Environment variables

See `.env.example`. Add new variables to the schema in `src/env.ts` and to
`.env.example`.
