import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import { MerkLink } from "@/components/ui/merk-link";
import { cn } from "@/lib/utils";

export type KnopVariant = "primair" | "secundair" | "tekst" | "licht";
export type KnopGrootte = "normaal" | "groot";

interface KnopBasis {
  /** `licht` is voor knoppen op een navy vlak. */
  variant?: KnopVariant;
  grootte?: KnopGrootte;
  children?: ReactNode;
  className?: string;
}

type AlsKnop = KnopBasis &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof KnopBasis> & {
    href?: undefined;
  };

type AlsLink = KnopBasis &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof KnopBasis | "href"> & {
    href: string;
  };

export type KnopProps = AlsKnop | AlsLink;

// Minstens 44px hoog (min-h-11), zodat de knop ook met een duim goed te raken is.
const basis =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-center font-semibold leading-tight transition-colors duration-150 ease-out motion-reduce:transition-none focus-visible:outline-3 focus-visible:outline-offset-3 aria-disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

const varianten: Record<KnopVariant, string> = {
  primair:
    "bg-blauw text-wit hover:bg-navy focus-visible:outline-(--kleur-focus)",
  secundair:
    "border-2 border-blauw text-blauw hover:bg-blauw hover:text-wit focus-visible:outline-(--kleur-focus)",
  tekst:
    "text-blauw underline decoration-2 underline-offset-4 hover:text-navy hover:decoration-navy focus-visible:outline-(--kleur-focus)",
  licht: "bg-wit text-navy hover:bg-vlak focus-visible:outline-wit",
};

const groottes: Record<KnopVariant, Record<KnopGrootte, string>> = {
  primair: { normaal: "px-6 py-2.5", groot: "min-h-14 px-8 py-3.5 text-lg" },
  secundair: { normaal: "px-6 py-2", groot: "min-h-14 px-8 py-3 text-lg" },
  licht: { normaal: "px-6 py-2.5", groot: "min-h-14 px-8 py-3.5 text-lg" },
  tekst: { normaal: "px-2 py-2.5", groot: "min-h-14 px-2 py-3.5 text-lg" },
};

/** De classes van een knop, voor plekken die zelf een element kiezen. */
export function knopKlassen(
  variant: KnopVariant = "primair",
  grootte: KnopGrootte = "normaal",
): string {
  return cn(basis, varianten[variant], groottes[variant][grootte]);
}

/**
 * Knop of link in de vorm van een knop.
 *
 * - Zonder `href` een `<button>`, standaard met `type="button"`.
 * - Met een `href` die met `/` begint een `next/link`.
 * - Met elke andere `href` een `<a>` met `rel="noopener noreferrer"`.
 */
export function Knop(props: KnopProps) {
  if (props.href !== undefined) {
    const { variant, grootte, className, children, ...rest } = props;
    return (
      <MerkLink
        className={cn(knopKlassen(variant, grootte), className)}
        {...rest}
      >
        {children}
      </MerkLink>
    );
  }

  const { variant, grootte, className, children, type, ...rest } = props;
  return (
    <button
      type={type ?? "button"}
      className={cn(knopKlassen(variant, grootte), className)}
      {...rest}
    >
      {children}
    </button>
  );
}
