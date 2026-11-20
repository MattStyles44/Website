import type { ReactNode } from "react";

import { MerkLink } from "@/components/ui/merk-link";
import { cn } from "@/lib/utils";

export interface KaartProps {
  titel: string;
  /** Met een `href` is de titel een link, en is de hele kaart klikbaar. */
  href?: string;
  children?: ReactNode;
  kopNiveau?: "h2" | "h3" | "h4";
}

/**
 * Vlakke kaart met afgeronde hoeken, zonder schaduw. Komt rustig in beeld bij
 * scrollen (`onthul`). Een klikbare kaart komt bij hover iets omhoog, behalve
 * voor wie minder beweging wil.
 */
export function Kaart({ titel, href, children, kopNiveau = "h3" }: KaartProps) {
  const Kop = kopNiveau;
  return (
    <article
      className={cn(
        "onthul relative flex h-full flex-col gap-3 rounded-kaart border-2 border-vlak bg-wit p-5 text-navy sm:p-8",
        href &&
          "group transition-[border-color,translate] duration-150 ease-out hover:-translate-y-1 hover:border-blauw motion-reduce:transition-none motion-reduce:hover:translate-y-0",
      )}
    >
      <Kop className="font-display text-2xl leading-kop font-bold">
        {href ? (
          <MerkLink
            href={href}
            className="underline-offset-4 group-hover:text-blauw group-hover:underline after:absolute after:inset-0 after:rounded-kaart focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-offset-3 focus-visible:after:outline-(--kleur-focus)"
          >
            {titel}
          </MerkLink>
        ) : (
          titel
        )}
      </Kop>
      {children ? <div className="flex flex-col gap-3">{children}</div> : null}
      {href ? (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-auto size-6 text-blauw transition-transform duration-150 ease-out group-hover:translate-x-1 motion-reduce:transition-none"
        >
          <path d="M4 12h15M13 6l6 6-6 6" />
        </svg>
      ) : null}
    </article>
  );
}
