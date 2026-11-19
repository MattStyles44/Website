import Link from "next/link";

export interface KruimelpadItem {
  label: string;
  /** Leeg voor de huidige pagina (het laatste item). */
  href?: string;
}

export function Kruimelpad({ items }: { items: readonly KruimelpadItem[] }) {
  return (
    <nav aria-label="Kruimelpad">
      <ol className="flex flex-wrap items-center gap-x-1 text-sm">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {item.href ? (
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center font-medium text-blauw underline decoration-1 underline-offset-4 hover:text-navy hover:decoration-2"
              >
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
            {index < items.length - 1 ? (
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0 text-inkt-zacht"
              >
                <path d="m6 3.5 4.5 4.5L6 12.5" />
              </svg>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
