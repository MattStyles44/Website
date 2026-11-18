import Link from "next/link";

export interface KruimelpadItem {
  label: string;
  /** Leeg voor de huidige pagina (het laatste item). */
  href?: string;
}

export function Kruimelpad({ items }: { items: readonly KruimelpadItem[] }) {
  return (
    <nav aria-label="Kruimelpad">
      <ol className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <li key={item.label}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {index < items.length - 1 ? " /" : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
