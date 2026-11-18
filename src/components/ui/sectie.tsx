import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type SectieToon = "wit" | "vlak" | "donker";

export interface SectieProps {
  /** `donker` is navy met witte tekst. */
  toon?: SectieToon;
  children?: ReactNode;
  id?: string;
  "aria-labelledby"?: string;
}

const tonen: Record<SectieToon, string> = {
  wit: "bg-wit text-navy",
  vlak: "bg-vlak text-navy",
  donker: "op-donker",
};

/** Vlak over de volle breedte, met de inhoud in een gecentreerde container. */
export function Sectie({
  toon = "wit",
  children,
  id,
  "aria-labelledby": gelabeldDoor,
}: SectieProps) {
  return (
    <section
      id={id}
      aria-labelledby={gelabeldDoor}
      className={cn("w-full py-14 sm:py-20 lg:py-28", tonen[toon])}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:gap-12 lg:px-8">
        {children}
      </div>
    </section>
  );
}
