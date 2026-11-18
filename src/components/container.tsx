import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Centreert pagina-inhoud. De <main> zelf staat in de root layout. */
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
        "mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
