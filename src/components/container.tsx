import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Centreert pagina-inhoud, met dezelfde breedte en ruimte als `Sectie`.
 * De <main> zelf staat in de root layout.
 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
