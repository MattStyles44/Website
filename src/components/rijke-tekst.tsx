import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";

import type { Blok } from "@/lib/cms";

/** Schema's die als externe link mogen; elk ander adres wordt gewone tekst. */
const externeSchemas = new Set(["http:", "https:", "mailto:", "tel:"]);

/** Denkbeeldig domein, om te controleren of een pad op deze site blijft. */
const eigenSite = "https://site.invalid";

function leesUrl(adres: string, basis?: string): URL | undefined {
  try {
    return new URL(adres, basis);
  } catch {
    return undefined;
  }
}

/**
 * Waar een link uit Sanity naartoe mag: een pad op deze site, een extern adres
 * met een veilig schema, of nergens (dan wordt het gewone tekst). Browsers lezen
 * `//voorbeeld.nl` en `/\voorbeeld.nl` als een ander domein en negeren tabs,
 * dus de URL-parser beslist, niet het eerste teken.
 */
function linkDoel(
  href: unknown,
): { soort: "intern" | "extern"; href: string } | undefined {
  if (typeof href !== "string") return undefined;
  const adres = href.trim();
  if (adres.startsWith("/")) {
    return leesUrl(adres, eigenSite)?.origin === eigenSite
      ? { soort: "intern", href: adres }
      : undefined;
  }
  const url = leesUrl(adres);
  return url && externeSchemas.has(url.protocol)
    ? { soort: "extern", href: adres }
    : undefined;
}

/** Weergave van rijke tekst uit Sanity. Vormgeving volgt in de interfacefase. */
const componenten: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h2: ({ children }) => <h2 className="text-xl font-semibold">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold">{children}</h3>,
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => {
      const doel = linkDoel(value?.href);
      if (!doel) return <>{children}</>;
      if (doel.soort === "intern") {
        return (
          <Link href={doel.href} className="underline">
            {children}
          </Link>
        );
      }
      return (
        <a href={doel.href} className="underline" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
};

export function RijkeTekst({ value }: { value: Blok[] }) {
  if (value.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <PortableText value={value} components={componenten} />
    </div>
  );
}
