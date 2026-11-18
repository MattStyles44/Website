import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  contrastParen,
  Bijschrift,
  Kleurstaal,
  kleurUitleg,
  OnderdeelKop,
} from "@/app/styleguide/onderdelen";
import {
  Invoer,
  Kaart,
  Keuzegroep,
  Keuzelijst,
  Knop,
  Logo,
  Sectie,
  Sticker,
  Tekstvak,
  type KnopGrootte,
  type KnopVariant,
} from "@/components/ui";
import { categorieen, getCategorie } from "@/content/diensten";
import { merkKleuren, type MerkKleur } from "@/content/merk";
import { offerteKnop } from "@/content/navigatie";
import { categoriePad, paginas } from "@/content/paginas";
import { site } from "@/content/site";
import { contrast, contrastLabel } from "@/lib/kleuren";

// Alleen voor intern gebruik: niet in zoekmachines, de sitemap of het menu.
export const metadata: Metadata = {
  title: "Stijlgids",
  description:
    "De bouwstenen van de huisstijl van SignUp Reclame: kleuren, lettertypen, knoppen, formuliervelden en vlakken.",
  robots: { index: false, follow: false },
};

const onderdelen = [
  { id: "kleuren", label: "Kleuren" },
  { id: "typografie", label: "Lettertypen" },
  { id: "knoppen", label: "Knoppen" },
  { id: "formulieren", label: "Formuliervelden" },
  { id: "kaarten", label: "Kaarten" },
  { id: "vlakken", label: "Vlakken en sticker" },
  { id: "logo", label: "Logo" },
] as const;

const knopVarianten: ReadonlyArray<{
  variant: Exclude<KnopVariant, "licht">;
  uitleg: string;
}> = [
  { variant: "primair", uitleg: "De belangrijkste actie, één per vlak." },
  { variant: "secundair", uitleg: "Een tweede actie naast de primaire." },
  { variant: "tekst", uitleg: "Een rustige actie, zoals een link in een rij." },
];

const groottes: readonly KnopGrootte[] = ["normaal", "groot"];

const categorieOpties = categorieen.map((categorie) => ({
  waarde: categorie.slug,
  label: categorie.naam,
}));

const voertuigDiensten = getCategorie("voertuigreclame")?.diensten ?? [];

export default function Styleguide() {
  const kleuren = Object.keys(merkKleuren) as MerkKleur[];
  const voorbeeldKaarten = categorieen.slice(0, 3);

  return (
    <>
      <Sectie aria-labelledby="stijlgids-kop">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <header className="flex max-w-[65ch] flex-col gap-6">
            <Bijschrift>Intern · niet in zoekmachines</Bijschrift>
            <h1
              id="stijlgids-kop"
              className="text-5xl leading-display tracking-tight sm:text-6xl lg:text-display"
            >
              Stijlgids
            </h1>
            <p className="text-intro">
              Alle bouwstenen van de huisstijl op één pagina: kleuren,
              lettertypen, knoppen, formuliervelden, kaarten en vlakken. Zo
              beoordeel je ze in één keer, voordat we de pagina&apos;s ermee
              opbouwen.
            </p>
          </header>
          <Sticker>25 jaar vakmanschap</Sticker>
        </div>
        <nav aria-label="Onderdelen van de stijlgids">
          <ul className="flex flex-wrap gap-x-2 gap-y-1">
            {onderdelen.map((onderdeel) => (
              <li key={onderdeel.id}>
                <Knop href={`/styleguide#${onderdeel.id}`} variant="tekst">
                  {onderdeel.label}
                </Knop>
              </li>
            ))}
          </ul>
        </nav>
      </Sectie>

      <Sectie toon="vlak" id="kleuren" aria-labelledby="kleuren-kop">
        <OnderdeelKop id="kleuren-kop" titel="Kleuren">
          <p>
            Navy voor tekst en donkere vlakken, merkblauw voor knoppen, links en
            accenten. Pagina&apos;s bestaan uit vlakke velden in wit, licht vlak
            en navy. Geen verlopen en geen zware schaduwen.
          </p>
        </OnderdeelKop>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kleuren.map((kleur) => (
            <Kleurstaal key={kleur} kleur={kleur} />
          ))}
        </ul>

        <div className="flex flex-col gap-4">
          <h3 className="text-2xl">Contrast</h3>
          <p className="max-w-[65ch]">
            Tekst haalt minstens 4,5:1 (WCAG AA). De rand van een formulierveld
            haalt minstens 3:1.
          </p>
          <div className="max-w-2xl overflow-hidden rounded-kaart border-2 border-vlak bg-wit">
            <table className="w-full text-left text-sm sm:text-base">
              <caption className="sr-only">
                Contrast van de kleurparen in de huisstijl
              </caption>
              <thead>
                <tr className="border-b-2 border-vlak">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Kleur op achtergrond
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Contrast
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Minimaal
                  </th>
                </tr>
              </thead>
              <tbody>
                {contrastParen.map(({ voorgrond, achtergrond, minimum }) => (
                  <tr
                    key={`${voorgrond}-${achtergrond}`}
                    className="border-b-2 border-vlak last:border-b-0"
                  >
                    <th scope="row" className="px-4 py-3 font-normal">
                      {kleurUitleg[voorgrond].naam} op{" "}
                      {kleurUitleg[achtergrond].naam.toLowerCase()}
                    </th>
                    <td className="px-4 py-3 font-semibold">
                      {contrastLabel(
                        contrast(
                          merkKleuren[voorgrond],
                          merkKleuren[achtergrond],
                        ),
                      )}
                    </td>
                    <td className="px-4 py-3">{contrastLabel(minimum)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Sectie>

      <Sectie id="typografie" aria-labelledby="typografie-kop">
        <OnderdeelKop id="typografie-kop" titel="Lettertypen">
          <p>
            Koppen in Barlow Semi Condensed, vet en strak op elkaar. Lopende
            tekst in Barlow, rustig en goed leesbaar. Barlow is gebaseerd op
            verkeersborden: dat past bij signing.
          </p>
        </OnderdeelKop>

        <div className="flex flex-col divide-y-2 divide-vlak">
          <TypeVoorbeeld bijschrift="Display · Barlow Semi Condensed Bold · tot 4,5rem">
            <p className="font-display text-5xl leading-display font-bold tracking-tight sm:text-6xl lg:text-display">
              Je bus beletterd in één dag
            </p>
          </TypeVoorbeeld>
          <TypeVoorbeeld bijschrift="Kop 1 · Barlow Semi Condensed Bold · 3rem">
            <p className="font-display text-4xl leading-kop font-bold sm:text-5xl">
              Gevelreclame die opvalt
            </p>
          </TypeVoorbeeld>
          <TypeVoorbeeld bijschrift="Kop 2 · Barlow Semi Condensed Bold · 2,25rem">
            <p className="font-display text-3xl leading-kop font-bold sm:text-4xl">
              Zo werken we
            </p>
          </TypeVoorbeeld>
          <TypeVoorbeeld bijschrift="Kop 3 · Barlow Semi Condensed Semibold · 1,5rem">
            <p className="font-display text-2xl leading-kop font-semibold">
              Eerst meten, dan plakken
            </p>
          </TypeVoorbeeld>
          <TypeVoorbeeld bijschrift="Inleiding · Barlow Regular · 1,25rem">
            <p className="max-w-[65ch] text-intro">
              Al {site.ervaring} plakken, frezen en monteren we reclame voor
              ondernemers in {site.regio}.
            </p>
          </TypeVoorbeeld>
          <TypeVoorbeeld bijschrift="Lopende tekst · Barlow Regular · 1,0625rem · regelafstand 1,6 · ongeveer 65 tekens per regel">
            <p className="max-w-[65ch]">
              We werken met A-merk folies van onder meer 3M, Avery Dennison en
              Oracal. Gietfolie is dunne, soepele folie die zich mooi om
              rondingen legt. Zo blijft je belettering jaren strak zitten, ook
              op de snelweg en in de winter.{" "}
              <Link
                href={paginas.offerte.pad}
                className="font-medium text-blauw underline decoration-2 underline-offset-4 hover:text-navy"
              >
                Vraag een offerte aan
              </Link>
              .
            </p>
          </TypeVoorbeeld>
          <TypeVoorbeeld bijschrift="Klein · Barlow Regular · 0,875rem">
            <p className="max-w-[65ch] text-sm text-inkt-zacht">
              {site.reactiebelofte}. Alle prijzen zijn maatwerk.
            </p>
          </TypeVoorbeeld>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-2xl">Koppen naast elkaar</h3>
          <p className="max-w-[65ch]">
            De lettertypekeuze volgt in fase 2. Hier zie je dezelfde kop in
            beide letters.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-kaart bg-vlak p-6 sm:p-8">
              <Bijschrift>Barlow Semi Condensed Bold</Bijschrift>
              <p className="font-display text-4xl leading-kop font-bold">
                Belettering voor je hele wagenpark
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-kaart bg-vlak p-6 sm:p-8">
              <Bijschrift>Barlow Semibold</Bijschrift>
              <p className="font-sans text-4xl leading-kop font-semibold">
                Belettering voor je hele wagenpark
              </p>
            </div>
          </div>
        </div>
      </Sectie>

      <Sectie toon="vlak" id="knoppen" aria-labelledby="knoppen-kop">
        <OnderdeelKop id="knoppen-kop" titel="Knoppen">
          <p>
            Rond zoals de omlijning van het logo, en minstens 44 pixels hoog.
            Met het toetsenbord zie je een duidelijke focusrand.
          </p>
        </OnderdeelKop>

        <div className="grid gap-4 lg:grid-cols-3">
          {knopVarianten.map(({ variant, uitleg }) => (
            <div
              key={variant}
              className="flex flex-col gap-4 rounded-kaart bg-wit p-6"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-xl capitalize">{variant}</h3>
                <p className="text-sm text-inkt-zacht">{uitleg}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {groottes.map((grootte) => (
                  <Knop key={grootte} variant={variant} grootte={grootte}>
                    {grootte === "groot" ? "Groot" : "Normaal"}
                  </Knop>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="op-donker flex flex-col gap-4 rounded-kaart p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            <h3 className="text-xl">Licht</h3>
            <p className="text-sm">Voor knoppen op een navy vlak.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {groottes.map((grootte) => (
              <Knop key={grootte} variant="licht" grootte={grootte}>
                {grootte === "groot" ? "Groot" : "Normaal"}
              </Knop>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-kaart bg-wit p-6 sm:p-8">
          <h3 className="text-xl">Als link en uitgeschakeld</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Knop href={offerteKnop.href}>{offerteKnop.label}</Knop>
            <Knop href={site.whatsapp} variant="secundair">
              Stuur een WhatsApp
            </Knop>
            <Knop href={site.telefoon.link} variant="tekst">
              Bel {site.telefoon.weergave}
            </Knop>
            <Knop disabled>Uitgeschakeld</Knop>
          </div>
        </div>
      </Sectie>

      <Sectie id="formulieren" aria-labelledby="formulieren-kop">
        <OnderdeelKop id="formulieren-kop" titel="Formuliervelden">
          <p>
            Elk veld heeft een label. Een hint en een foutmelding staan erbij en
            zijn aan het veld gekoppeld. Een fout zie je aan de tekst, het
            pictogram en de streep, niet alleen aan de kleur.
          </p>
        </OnderdeelKop>

        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
          <div className="flex flex-col gap-8">
            <Bijschrift>Normaal</Bijschrift>
            <Invoer
              label="Bedrijfsnaam"
              naam="voorbeeld-bedrijfsnaam"
              hint="Laat leeg als je particulier bent."
              autoComplete="organization"
            />
            <Tekstvak
              label="Toelichting"
              naam="voorbeeld-toelichting"
              hint="Bijvoorbeeld de maten, het aantal of je planning."
            />
            <Keuzegroep
              legend="Waar gaat je aanvraag over?"
              naam="voorbeeld-onderwerp"
              type="checkbox"
              hint="Kies er een of meer."
              geselecteerd="voertuigreclame"
              opties={categorieOpties.slice(0, 3)}
            />
          </div>

          <div className="flex flex-col gap-8">
            <Bijschrift>Verplicht en met een fout</Bijschrift>
            <Invoer
              label="E-mailadres"
              naam="voorbeeld-email"
              type="email"
              autoComplete="email"
              hint="We sturen je offerte naar dit adres."
              verplicht
            />
            <Invoer
              label="Telefoonnummer"
              naam="voorbeeld-telefoon"
              type="tel"
              autoComplete="tel"
              defaultValue="06 12"
              fout="Vul een volledig telefoonnummer in, zoals 06 12 34 56 78."
              verplicht
            />
            <Keuzelijst
              label="Categorie"
              naam="voorbeeld-categorie"
              leeg="Kies een categorie"
              opties={categorieOpties}
              verplicht
            />
            <Keuzelijst
              label="Dienst"
              naam="voorbeeld-dienst"
              leeg="Kies een dienst"
              opties={voertuigDiensten.map((dienst) => ({
                waarde: dienst.slug,
                label: dienst.naam,
              }))}
              fout="Kies een dienst."
            />
            <Keuzegroep
              legend="Wanneer kunnen we langskomen?"
              naam="voorbeeld-dagdeel"
              opties={[
                { waarde: "ochtend", label: "Ochtend" },
                { waarde: "middag", label: "Middag" },
              ]}
              fout="Kies ochtend of middag."
            />
          </div>
        </div>
      </Sectie>

      <Sectie toon="vlak" id="kaarten" aria-labelledby="kaarten-kop">
        <OnderdeelKop id="kaarten-kop" titel="Kaarten">
          <p>
            Vlakke kaarten met afgeronde hoeken. Met een link is de hele kaart
            klikbaar.
          </p>
        </OnderdeelKop>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {voorbeeldKaarten.map((categorie) => (
            <li key={categorie.slug}>
              <Kaart titel={categorie.naam} href={categoriePad(categorie.slug)}>
                <p>
                  {categorie.diensten
                    .slice(0, 3)
                    .map((dienst) => dienst.naam)
                    .join(", ")}
                  .
                </p>
              </Kaart>
            </li>
          ))}
          <li>
            <Kaart titel="Zonder link">
              <p>Een kaart zonder link, voor een opsomming of een stap.</p>
            </Kaart>
          </li>
        </ul>
      </Sectie>

      <Sectie id="vlakken" aria-labelledby="vlakken-kop">
        <OnderdeelKop id="vlakken-kop" titel="Vlakken en sticker">
          <p>
            Een pagina bestaat uit secties over de volle breedte, in drie tonen:
            wit, licht vlak en navy. Deze sectie is wit. De sticker is een rond
            stempel met een korte tekst.
          </p>
        </OnderdeelKop>
        <div className="flex flex-wrap items-center gap-6">
          <Knop href={paginas.projecten.pad}>Bekijk projecten</Knop>
          <Knop href={paginas.contact.pad} variant="secundair">
            Neem contact op
          </Knop>
        </div>
      </Sectie>

      <Sectie toon="vlak" aria-labelledby="vlak-kop">
        <div className="flex max-w-[65ch] flex-col gap-4">
          <Bijschrift>Sectie · licht vlak</Bijschrift>
          <h2 id="vlak-kop" className="text-4xl leading-kop sm:text-5xl">
            Rustig afwisselen
          </h2>
          <p>
            Het lichte vlak scheidt twee witte secties zonder lijnen of
            schaduwen. Tekst en links blijven goed leesbaar.
          </p>
        </div>
      </Sectie>

      <Sectie toon="donker" aria-labelledby="donker-kop">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex max-w-[65ch] flex-col gap-4">
            <p className="text-sm font-medium tracking-wide uppercase">
              Sectie · navy
            </p>
            <h2 id="donker-kop" className="text-4xl leading-kop sm:text-5xl">
              Klaar voor je nieuwe belettering?
            </h2>
            <p className="text-intro">
              {site.reactiebelofte}. Je spreekt direct met de vakman zelf.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Knop href={offerteKnop.href} variant="licht" grootte="groot">
                {offerteKnop.label}
              </Knop>
              <Knop href={site.whatsapp} variant="licht">
                Stuur een WhatsApp
              </Knop>
            </div>
          </div>
          <Sticker>Binnen 24 uur reactie</Sticker>
        </div>
      </Sectie>

      <Sectie id="logo" aria-labelledby="logo-kop">
        <OnderdeelKop id="logo-kop" titel="Logo">
          <p>
            Het logo in kleur op lichte vlakken, het witte logo op navy. Geef
            het logo ruimte: minstens de hoogte van de letters eromheen.
          </p>
        </OnderdeelKop>
        <div className="grid gap-4 md:grid-cols-2">
          <figure className="flex flex-col gap-4">
            <div className="flex min-h-48 items-center justify-center rounded-kaart border-2 border-vlak bg-wit p-8">
              <Logo toon="donker" className="h-auto w-56 max-w-full" />
            </div>
            <figcaption className="text-sm text-inkt-zacht">
              In kleur, voor wit en licht vlak: <code>signup-logo.svg</code>
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-4">
            <div className="op-donker flex min-h-48 items-center justify-center rounded-kaart p-8">
              <Logo toon="licht" className="h-auto w-56 max-w-full" />
            </div>
            <figcaption className="text-sm text-inkt-zacht">
              Wit, voor navy: <code>signup-logo-wit.svg</code>
            </figcaption>
          </figure>
        </div>
      </Sectie>
    </>
  );
}

/** Eén stap van de typeschaal, met bijschrift. */
function TypeVoorbeeld({
  bijschrift,
  children,
}: {
  bijschrift: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-8 first:pt-0 last:pb-0">
      <Bijschrift>{bijschrift}</Bijschrift>
      {children}
    </div>
  );
}
