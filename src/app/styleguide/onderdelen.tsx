import type { ReactNode } from "react";

import { merkKleuren, type MerkKleur } from "@/content/merk";
import { contrast, contrastLabel, tokenNaam } from "@/lib/kleuren";

/** Waar elke kleur voor is, en tegen welke kleur we het contrast tonen. */
export const kleurUitleg: Record<
  MerkKleur,
  { naam: string; gebruik: string; tegen: MerkKleur }
> = {
  navy: {
    naam: "Navy",
    gebruik: "Koppen, tekst en donkere vlakken.",
    tegen: "wit",
  },
  blauw: {
    naam: "Merkblauw",
    gebruik: "Knoppen, links en accenten.",
    tegen: "wit",
  },
  wit: {
    naam: "Wit",
    gebruik: "Achtergrond, en tekst op navy.",
    tegen: "navy",
  },
  inktZacht: {
    naam: "Zachte tekst",
    gebruik: "Hints, bijschriften en andere secundaire tekst.",
    tegen: "wit",
  },
  vlak: {
    naam: "Licht vlak",
    gebruik: "Lichte secties tussen de witte.",
    tegen: "navy",
  },
  rand: {
    naam: "Rand",
    gebruik: "Rand van formuliervelden.",
    tegen: "wit",
  },
  fout: {
    naam: "Fout",
    gebruik: "Foutmeldingen bij formuliervelden.",
    tegen: "wit",
  },
};

/** De kleurparen die minstens het WCAG-contrast halen, zoals docs/merk.md vraagt. */
export const contrastParen: ReadonlyArray<{
  voorgrond: MerkKleur;
  achtergrond: MerkKleur;
  minimum: number;
}> = [
  { voorgrond: "navy", achtergrond: "wit", minimum: 4.5 },
  { voorgrond: "wit", achtergrond: "navy", minimum: 4.5 },
  { voorgrond: "blauw", achtergrond: "wit", minimum: 4.5 },
  { voorgrond: "wit", achtergrond: "blauw", minimum: 4.5 },
  { voorgrond: "inktZacht", achtergrond: "wit", minimum: 4.5 },
  { voorgrond: "inktZacht", achtergrond: "vlak", minimum: 4.5 },
  { voorgrond: "navy", achtergrond: "vlak", minimum: 4.5 },
  { voorgrond: "blauw", achtergrond: "vlak", minimum: 4.5 },
  { voorgrond: "fout", achtergrond: "wit", minimum: 4.5 },
  { voorgrond: "rand", achtergrond: "wit", minimum: 3 },
];

/** Kop en inleiding van een onderdeel van de stijlgids. */
export function OnderdeelKop({
  id,
  titel,
  children,
}: {
  id: string;
  titel: string;
  children: ReactNode;
}) {
  return (
    <header className="flex max-w-[65ch] flex-col gap-4">
      <h2 id={id} className="text-4xl leading-kop sm:text-5xl">
        {titel}
      </h2>
      <div className="text-intro">{children}</div>
    </header>
  );
}

/** Klein bijschrift boven een voorbeeld: wat het is en hoe je het gebruikt. */
export function Bijschrift({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm font-medium tracking-wide text-inkt-zacht uppercase">
      {children}
    </p>
  );
}

/** Een kleurstaal met naam, waarde, token en contrast, uit `merkKleuren`. */
export function Kleurstaal({ kleur }: { kleur: MerkKleur }) {
  const waarde = merkKleuren[kleur];
  const { naam, gebruik, tegen } = kleurUitleg[kleur];
  const tegenWaarde = merkKleuren[tegen];
  return (
    <li className="flex flex-col overflow-hidden rounded-kaart border-2 border-vlak bg-wit">
      <div
        className="flex h-28 items-end border-b-2 border-vlak p-4 font-display text-4xl font-bold"
        style={{ backgroundColor: waarde, color: tegenWaarde }}
      >
        <span aria-hidden="true">Aa</span>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="text-xl">{naam}</h3>
        <p className="text-sm">{gebruik}</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-inkt-zacht">Waarde</dt>
          <dd>
            <code className="font-semibold">{waarde}</code>
          </dd>
          <dt className="text-inkt-zacht">Token</dt>
          <dd className="min-w-0 break-all">
            <code>--color-{tokenNaam(kleur)}</code>
          </dd>
          <dt className="text-inkt-zacht">In code</dt>
          <dd className="min-w-0 break-all">
            <code>merkKleuren.{kleur}</code>
          </dd>
          <dt className="text-inkt-zacht">Contrast</dt>
          <dd>
            {contrastLabel(contrast(waarde, tegenWaarde))} met{" "}
            {kleurUitleg[tegen].naam.toLowerCase()}
          </dd>
        </dl>
      </div>
    </li>
  );
}
