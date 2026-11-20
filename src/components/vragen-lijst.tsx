import { PlusPictogram } from "@/components/pictogrammen";
import { cn } from "@/lib/utils";

export interface Vraag {
  vraag: string;
  antwoord: string;
}

/**
 * Veelgestelde vragen als uitklapbare items (`<details>`). Het antwoord staat
 * altijd in de HTML, ook dichtgeklapt. Geef de toon van de sectie mee: de
 * items krijgen dan het vlak dat ertegen afsteekt.
 */
export function VragenLijst({
  vragen,
  toon = "wit",
}: {
  vragen: readonly Vraag[];
  toon?: "wit" | "vlak";
}) {
  return (
    <div className="flex max-w-4xl flex-col gap-3">
      {vragen.map((item) => (
        <details
          key={item.vraag}
          className={cn(
            "group rounded-kaart px-5 sm:px-8",
            toon === "vlak" ? "bg-wit" : "bg-vlak",
          )}
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-xl leading-kop font-bold hover:text-blauw [&::-webkit-details-marker]:hidden">
            {item.vraag}
            <PlusPictogram className="size-6 text-blauw transition-transform duration-150 ease-out group-open:rotate-45 motion-reduce:transition-none" />
          </summary>
          <p className="max-w-[65ch] pb-6">{item.antwoord}</p>
        </details>
      ))}
    </div>
  );
}
