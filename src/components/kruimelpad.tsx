import Link from "next/link";

import { cn } from "@/lib/utils";

export interface KruimelpadItem {
  label: string;
  /** Leeg voor de huidige pagina (het laatste item). */
  href?: string;
}

const linkKlassen =
  "inline-flex min-h-11 items-center font-medium text-blauw underline decoration-1 underline-offset-4 hover:text-navy hover:decoration-2";

function Chevron({
  richting,
  className,
}: {
  richting: "links" | "rechts";
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 shrink-0", className)}
    >
      <path
        d={
          richting === "rechts"
            ? "m6 3.5 4.5 4.5L6 12.5"
            : "M10 3.5 5.5 8l4.5 4.5"
        }
      />
    </svg>
  );
}

/**
 * Kruimelpad. Op kleine schermen alleen een terug-link naar de bovenliggende
 * pagina, zodat het pad niet over meerdere regels loopt; vanaf `sm` het hele pad.
 */
export function Kruimelpad({ items }: { items: readonly KruimelpadItem[] }) {
  const ouder = items.findLastIndex((item) => item.href !== undefined);

  return (
    <nav aria-label="Kruimelpad">
      <ol className="flex flex-wrap items-center gap-x-1 text-sm">
        {items.map((item, index) => {
          const laatste = index === items.length - 1;
          return (
            <li
              key={item.label}
              className={cn(
                "items-center gap-1",
                index === ouder ? "flex" : "hidden sm:flex",
              )}
            >
              {index === ouder ? (
                <Chevron richting="links" className="text-blauw sm:hidden" />
              ) : null}
              {item.href ? (
                <Link href={item.href} className={linkKlassen}>
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="inline-flex min-h-11 items-center"
                >
                  {item.label}
                </span>
              )}
              {laatste ? null : (
                <Chevron
                  richting="rechts"
                  className="hidden text-inkt-zacht sm:block"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
