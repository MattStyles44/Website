import { paginas } from "@/content/paginas";

export interface NavItem {
  label: string;
  href: string;
}

/** Hoofdmenu. De knop "Offerte aanvragen" staat er los naast. */
export const hoofdmenu: readonly NavItem[] = [
  { label: "Diensten", href: paginas.diensten.pad },
  { label: "Projecten", href: paginas.projecten.pad },
  { label: "Over ons", href: paginas.overOns.pad },
  { label: "Contact", href: paginas.contact.pad },
];

export const offerteKnop: NavItem = {
  label: "Offerte aanvragen",
  href: paginas.offerte.pad,
};

export const footermenu: readonly NavItem[] = [
  ...hoofdmenu,
  offerteKnop,
  { label: "Privacyverklaring", href: paginas.privacy.pad },
];
