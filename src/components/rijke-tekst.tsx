import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";

import type { Blok } from "@/lib/cms";

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
      const href: unknown = value?.href;
      if (typeof href !== "string") return <>{children}</>;
      if (href.startsWith("/")) {
        return (
          <Link href={href} className="underline">
            {children}
          </Link>
        );
      }
      return (
        <a href={href} className="underline" rel="noopener noreferrer">
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
