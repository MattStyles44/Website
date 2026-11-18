<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Website SignUp Reclame

De nieuwe website van SignUp Reclame (signing en visuele communicatie, Groningen). Doel: meer gekwalificeerde B2B-offerteaanvragen.

## Lees eerst

Lees vóór elke taak de documenten in `docs/`. Ze zijn leidend voor inhoud, vormgeving en functies:

- `docs/brief.md`: bedrijf, doelen, KPI's, doelgroep, onderscheidend vermogen, drempels
- `docs/merk.md`: merkgevoel, tone of voice, kleuren, lettertypen, beeld
- `docs/processen.md`: offerteproces, formuliervelden, afspraken, prijzen, garantie, domein en e-mail

Botst een taak met deze documenten, of ontbreekt er informatie? Vraag het, in plaats van zelf iets te verzinnen. Wijzig de documenten in `docs/` alleen als daarom gevraagd wordt.

## Stack

Next.js 16 (App Router, Cache Components), React 19, TypeScript strict, Tailwind CSS 4, zod, Vitest. Node 22 of nieuwer, npm.

## Commando's

| Commando               | Wat                                           |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | Ontwikkelserver                               |
| `npm run lint`         | ESLint                                        |
| `npm run typecheck`    | `tsc --noEmit`                                |
| `npm run format:check` | Prettier-controle (`npm run format` herstelt) |
| `npm test`             | Vitest                                        |
| `npm run build`        | Productiebuild                                |

Een taak is pas af als deze vijf checks slagen: `lint`, `typecheck`, `format:check`, `test` en `build`. GitHub Actions draait dezelfde checks bij elke push en pull request (`.github/workflows/ci.yml`).

## Regels voor code

- **Next.js 16:** lees de relevante gids in `node_modules/next/dist/docs/` voordat je een API gebruikt (zie het blok bovenaan). Middleware heet in deze versie `proxy.ts`.
- **Server Components** zijn de standaard. Gebruik `"use client"` alleen voor interactie, en houd die componenten klein.
- **Omgevingsvariabelen** alleen via `src/env.ts`. Nergens anders `process.env` lezen. Nieuwe variabelen ook toevoegen aan `.env.example`.
- **Invoer valideren** met zod, zowel in het formulier als op de server (Server Actions en route handlers).
- **TypeScript:** geen `any`, geen `@ts-ignore`.
- **Kleuren en lettertypen** alleen via de merk-tokens uit `docs/merk.md` (Tailwind `@theme`). Geen losse hex-codes in componenten.
- **Afbeeldingen** via `next/image`, met een beschrijvende `alt`. Geen stockfoto's.
- **Lettertypen** via `next/font`, zelf gehost.
- **Toegankelijkheid:** elk formulierveld heeft een label, alles is met het toetsenbord te bedienen, en het kleurcontrast voldoet minimaal aan WCAG AA.
- **Tests:** elke nieuwe functie krijgt tests in `tests/`, in elk geval voor validatie en server-logica.
- **Geheimen:** nooit API-sleutels, wachtwoorden of `.env`-bestanden committen.

## Teksten op de site

- Nederlands, de klant aanspreken met **je/jij**.
- Vakkundig, nuchter en toegankelijk: korte zinnen, concreet, geen marketingpraat (zie `docs/merk.md`).
- Geen prijzen op de site: alles is maatwerk (zie `docs/processen.md`).

## Structuur

```
docs/             bedrijfsbrief, merk en processen (leidend)
src/app/          routes, layouts en API (route handlers)
src/components/   gedeelde UI-componenten
src/lib/          hulpfuncties
src/env.ts        gevalideerde omgevingsvariabelen
tests/            Vitest-tests
```

## Werkwijze

1. Begin bij werk dat meer dan één bestand raakt met een kort plan, en laat dat goedkeuren.
2. Bouw in kleine stappen. Eén onderwerp per commit, met een duidelijke commitboodschap.
3. Draai de vijf checks voordat je zegt dat iets af is, en meld eerlijk wat niet is gelukt of niet is getest.
