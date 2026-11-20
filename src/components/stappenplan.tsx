import { cn } from "@/lib/utils";

export interface Stap {
  titel: string;
  tekst: string;
}

/**
 * Genummerde stappen als `<ol>`, elke stap met een `<h3>`. Geef de toon van
 * de sectie mee: de stappen krijgen dan het vlak dat ertegen afsteekt.
 */
export function Stappenplan({
  stappen,
  toon = "wit",
}: {
  stappen: readonly Stap[];
  toon?: "wit" | "vlak";
}) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stappen.map((stap, index) => (
        <li
          key={stap.titel}
          className={cn(
            "grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 rounded-kaart p-5 sm:flex sm:flex-col sm:items-start sm:gap-3 sm:p-8",
            toon === "vlak" ? "bg-wit" : "bg-vlak",
          )}
        >
          <span
            aria-hidden="true"
            className="font-display text-4xl leading-none font-bold text-blauw sm:text-5xl"
          >
            {index + 1}
          </span>
          <h3 className="text-2xl leading-kop">{stap.titel}</h3>
          <p className="col-span-2">{stap.tekst}</p>
        </li>
      ))}
    </ol>
  );
}
