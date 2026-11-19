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

## Deploy (Vercel)

The site is hosted on Vercel. `vercel.json` runs the server functions in
Frankfurt (`fra1`), close to the visitors and inside the EU.

1. Import the GitHub repository in Vercel (framework: Next.js, no build
   settings needed).
2. Set these environment variables for Production (see `.env.example`):
   - `APP_URL`: the public address, for example `https://www.sign-up.nl`
     (used for canonical URLs, the sitemap and robots);
   - `SANITY_PROJECT_ID` and `SANITY_DATASET`;
   - `SANITY_WEBHOOK_SECRET`: a random secret of at least 16 characters;
   - `RESEND_API_KEY` and `MAIL_FROM`. Without both, quote requests are only
     written to the log and no mail is sent.
3. Add the domain in Vercel and set the DNS records Vercel shows. Change only
   the website records; leave the mail (MX) records as they are.
4. In Sanity, add a webhook to `https://<domain>/api/revalidate` with the same
   secret, so changes show up right away.

Limits on Vercel:

- A request may be at most 4.5 MB, so the quote form accepts at most 4 MiB of
  files in total (`src/lib/offerte/uploads.ts`). Visitors are told to e-mail
  larger files.
- The rate limit of the quote form (5 per hour per IP address) is kept in
  memory per server instance, so on Vercel it is a soft limit. The honeypot
  still stops simple bots.
