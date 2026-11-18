import type { ReactNode } from "react";

/**
 * Ronde sticker met een korte tekst, iets scheef geplakt. Houd de tekst kort:
 * twee of drie woorden, zoals "25 jaar vakmanschap".
 */
export function Sticker({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-flex size-36 shrink-0 -rotate-6 items-center justify-center rounded-full bg-blauw p-5 text-center font-display text-base leading-tight font-bold tracking-wide text-wit uppercase">
      <span
        aria-hidden="true"
        className="absolute inset-1.5 rounded-full border-2 border-dashed border-wit"
      />
      <span className="relative">{children}</span>
    </span>
  );
}
