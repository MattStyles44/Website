import type { ReactNode } from "react";

import { Kruimelpad, type KruimelpadItem } from "@/components/kruimelpad";
import { Sectie } from "@/components/ui";

/**
 * Het openingsvlak van een pagina: kruimelpad, de enige `<h1>` en de intro.
 * `naast` staat op brede schermen rechts, zoals een sticker.
 */
export function PaginaKop({
  titel,
  kruimels,
  children,
  naast,
}: {
  titel: string;
  kruimels?: readonly KruimelpadItem[];
  children?: ReactNode;
  naast?: ReactNode;
}) {
  return (
    <Sectie toon="vlak" aria-labelledby="pagina-kop">
      <div className="flex flex-col gap-6 lg:gap-8">
        {kruimels ? <Kruimelpad items={kruimels} /> : null}
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-8">
            <h1
              id="pagina-kop"
              className="text-4xl leading-display tracking-tight hyphens-auto sm:text-5xl sm:hyphens-manual lg:text-6xl"
            >
              {titel}
            </h1>
            {children}
          </div>
          {naast ? (
            <div className="flex lg:col-span-4 lg:justify-end">{naast}</div>
          ) : null}
        </div>
      </div>
    </Sectie>
  );
}

/** De intro onder een paginakop: groter en rustig, ongeveer 60 tekens breed. */
export function Intro({ children }: { children: ReactNode }) {
  return <p className="max-w-[60ch] text-intro">{children}</p>;
}

/** Kop van een sectie (`<h2>`), met eventueel een korte tekst en een actie rechts. */
export function SectieKop({
  id,
  titel,
  children,
  actie,
}: {
  id: string;
  titel: string;
  children?: ReactNode;
  actie?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="flex max-w-3xl min-w-0 flex-col gap-4">
        <h2
          id={id}
          className="text-3xl leading-kop tracking-tight sm:text-4xl lg:text-5xl"
        >
          {titel}
        </h2>
        {children ? (
          <div className="max-w-[60ch] text-intro">{children}</div>
        ) : null}
      </div>
      {actie ? <div className="shrink-0">{actie}</div> : null}
    </div>
  );
}

/** Een smal merkblauw streepje boven een kop. Alleen decoratie. */
export function Accent() {
  return (
    <span
      aria-hidden="true"
      className="block h-1.5 w-12 rounded-full bg-blauw"
    />
  );
}
