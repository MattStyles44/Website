import { Foutmelding, Hint, type Optie } from "@/components/ui/velden";
import { cn } from "@/lib/utils";

export interface KeuzegroepProps {
  legend: string;
  /** Het `name`-attribuut van elke keuze. */
  naam: string;
  opties: ReadonlyArray<Optie>;
  type?: "radio" | "checkbox";
  /** De waarde van de keuze die vooraf aangevinkt is. */
  geselecteerd?: string;
  hint?: string;
  fout?: string;
}

/**
 * Groep keuzerondjes of vinkjes in een `<fieldset>` met `<legend>`.
 * Hint en fout zijn met `aria-describedby` aan de hele groep gekoppeld.
 */
export function Keuzegroep({
  legend,
  naam,
  opties,
  type = "radio",
  geselecteerd,
  hint,
  fout,
}: KeuzegroepProps) {
  const hintId = hint ? `${naam}-hint` : undefined;
  const foutId = fout ? `${naam}-fout` : undefined;
  const beschreven = [hintId, foutId].filter(Boolean).join(" ");

  return (
    <fieldset
      aria-describedby={beschreven || undefined}
      className={cn("min-w-0", fout && "border-l-4 border-fout pl-4")}
    >
      <legend className="font-semibold">{legend}</legend>
      <div className="mt-2 flex flex-col gap-2">
        {hint ? <Hint id={hintId}>{hint}</Hint> : null}
        {fout ? <Foutmelding id={foutId}>{fout}</Foutmelding> : null}
        <div className="flex flex-col">
          {opties.map((optie, index) => {
            const optieId = `${naam}-${index + 1}`;
            return (
              <div key={optie.waarde} className="flex items-center gap-3">
                <input
                  type={type}
                  id={optieId}
                  name={naam}
                  value={optie.waarde}
                  defaultChecked={optie.waarde === geselecteerd}
                  className={cn(
                    "size-5 shrink-0 cursor-pointer accent-blauw focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--kleur-focus)",
                    type === "radio" ? "rounded-full" : "rounded-sm",
                  )}
                />
                <label
                  htmlFor={optieId}
                  className="flex min-h-11 grow cursor-pointer items-center py-2"
                >
                  {optie.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </fieldset>
  );
}
