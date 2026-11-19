import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Eenvoudige lijnpictogrammen in de kleur van de tekst (`currentColor`).
 * Altijd decoratief: de tekst ernaast zegt wat de link of knop doet.
 */
function Pictogram({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5 shrink-0", className)}
    >
      {children}
    </svg>
  );
}

type PictogramProps = { className?: string };

export function TelefoonPictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <path d="M5 4h3.5l1.75 4.5-2.25 1.5a11 11 0 0 0 6 6l1.5-2.25L20 15.5V19a1.5 1.5 0 0 1-1.5 1.5A16.5 16.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4Z" />
    </Pictogram>
  );
}

/** Een spraakwolk: voor WhatsApp, zonder het merklogo na te tekenen. */
export function BerichtPictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <path d="M4 19.5 5.3 15.6A8 8 0 1 1 8.4 18.7Z" />
      <path d="M9 11h.01M12 11h.01M15 11h.01" />
    </Pictogram>
  );
}

export function MailPictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </Pictogram>
  );
}

export function LocatiePictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </Pictogram>
  );
}

export function PijlPictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </Pictogram>
  );
}

export function VinkPictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Pictogram>
  );
}

export function MenuPictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Pictogram>
  );
}

export function SluitPictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Pictogram>
  );
}

export function PlusPictogram({ className }: PictogramProps) {
  return (
    <Pictogram className={className}>
      <path d="M12 5v14M5 12h14" />
    </Pictogram>
  );
}
