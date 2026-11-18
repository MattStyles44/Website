import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";

export type MerkLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
> & { href: string };

/**
 * Een link die zelf kiest hoe hij rendert: een pad op de site (`/…`) wordt een
 * `next/link`, elk ander adres een gewone `<a>` met `rel="noopener noreferrer"`.
 */
export function MerkLink({ href, rel, children, ...rest }: MerkLinkProps) {
  if (isInterneLink(href)) {
    return (
      <Link href={href} rel={rel} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} rel={veiligeRel(rel)} {...rest}>
      {children}
    </a>
  );
}

/** Een pad op de eigen site: begint met één `/`, niet met `//` of `/\`. */
export function isInterneLink(href: string): boolean {
  return /^\/(?![/\\])/.test(href);
}

/** Voegt `noopener noreferrer` toe aan een eventueel meegegeven `rel`. */
function veiligeRel(rel: string | undefined): string {
  const waarden = new Set((rel ?? "").split(/\s+/).filter(Boolean));
  waarden.add("noopener");
  waarden.add("noreferrer");
  return [...waarden].join(" ");
}
