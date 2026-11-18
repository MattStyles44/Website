import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

/** De gedeelde eigenschappen van Invoer, Tekstvak en Keuzelijst. */
export interface VeldBasis {
  label: string;
  /** Het `name`-attribuut, en standaard ook het `id`. */
  naam: string;
  id?: string;
  hint?: string;
  fout?: string;
  verplicht?: boolean;
}

export interface Optie {
  waarde: string;
  label: string;
}

type Eigen<T> = Omit<T, keyof VeldBasis | "name" | "children">;

export type InvoerProps = VeldBasis &
  Eigen<InputHTMLAttributes<HTMLInputElement>>;

export type TekstvakProps = VeldBasis &
  Eigen<TextareaHTMLAttributes<HTMLTextAreaElement>>;

export type KeuzelijstProps = VeldBasis & {
  opties: ReadonlyArray<Optie>;
  /** Tekst van een eerste, lege keuze, zoals "Kies een categorie". */
  leeg?: string;
} & Eigen<SelectHTMLAttributes<HTMLSelectElement>>;

/** Classes van een tekstveld, keuzelijst of tekstvak. */
export const veldKlassen =
  "block min-h-11 w-full min-w-0 rounded-veld border-2 border-rand bg-wit px-4 py-2 text-basis text-navy transition-colors duration-150 ease-out placeholder:text-inkt-zacht hover:border-navy focus-visible:border-navy focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--kleur-focus) disabled:cursor-not-allowed disabled:bg-vlak aria-invalid:border-fout motion-reduce:transition-none";

/** Ids en attributen die label, hint, fout en het veld aan elkaar koppelen. */
export function veldKoppeling(
  { naam, id, hint, fout }: Pick<VeldBasis, "naam" | "id" | "hint" | "fout">,
  extraBeschrijving?: string,
) {
  const veldId = id ?? naam;
  const hintId = hint ? `${veldId}-hint` : undefined;
  const foutId = fout ? `${veldId}-fout` : undefined;
  const beschreven = [extraBeschrijving, hintId, foutId]
    .filter(Boolean)
    .join(" ");
  return {
    veldId,
    hintId,
    foutId,
    controle: {
      id: veldId,
      name: naam,
      "aria-describedby": beschreven || undefined,
      "aria-invalid": fout ? (true as const) : undefined,
    },
  };
}

/** Foutmelding met een pictogram en het woord "Fout", niet alleen kleur. */
export function Foutmelding({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <p id={id} className="flex items-start gap-2 font-semibold text-fout">
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="mt-[0.2em] size-[1.1em] shrink-0"
      >
        <circle cx="10" cy="10" r="8" />
        <path d="M10 5.75v5" />
        <path d="M10 14.25h.01" />
      </svg>
      <span>
        <span className="sr-only">Fout: </span>
        {children}
      </span>
    </p>
  );
}

/** Kleine tekst onder een label of legend. */
export function Hint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-sm text-inkt-zacht">
      {children}
    </p>
  );
}

/** Zichtbare markering bij een verplicht veld. */
export function VerplichtMarkering() {
  return (
    <span className="ml-1 text-sm font-normal text-inkt-zacht">
      (verplicht)
    </span>
  );
}

/** Label, hint en fout rond een veld. Met een fout krijgt het veld een rode streep. */
function Veld({
  koppeling: { veldId, hintId, foutId },
  label,
  verplicht,
  hint,
  fout,
  children,
}: {
  koppeling: ReturnType<typeof veldKoppeling>;
  label: string;
  verplicht: boolean;
  hint?: string;
  fout?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2",
        fout && "border-l-4 border-fout pl-4",
      )}
    >
      <label htmlFor={veldId} className="font-semibold">
        {label}
        {verplicht ? <VerplichtMarkering /> : null}
      </label>
      {hint ? <Hint id={hintId}>{hint}</Hint> : null}
      {fout ? <Foutmelding id={foutId}>{fout}</Foutmelding> : null}
      {children}
    </div>
  );
}

/** Tekstveld met label. Andere attributen gaan door naar de `<input>`. */
export function Invoer({
  label,
  naam,
  id,
  hint,
  fout,
  verplicht = false,
  required,
  className,
  "aria-describedby": beschrijving,
  ...rest
}: InvoerProps) {
  const koppeling = veldKoppeling({ naam, id, hint, fout }, beschrijving);
  const isVerplicht = verplicht || required === true;
  return (
    <Veld
      koppeling={koppeling}
      label={label}
      verplicht={isVerplicht}
      hint={hint}
      fout={fout}
    >
      <input
        {...rest}
        {...koppeling.controle}
        required={isVerplicht || undefined}
        className={cn(veldKlassen, className)}
      />
    </Veld>
  );
}

/** Tekstvak met label. Andere attributen gaan door naar de `<textarea>`. */
export function Tekstvak({
  label,
  naam,
  id,
  hint,
  fout,
  verplicht = false,
  required,
  className,
  rows = 5,
  "aria-describedby": beschrijving,
  ...rest
}: TekstvakProps) {
  const koppeling = veldKoppeling({ naam, id, hint, fout }, beschrijving);
  const isVerplicht = verplicht || required === true;
  return (
    <Veld
      koppeling={koppeling}
      label={label}
      verplicht={isVerplicht}
      hint={hint}
      fout={fout}
    >
      <textarea
        {...rest}
        {...koppeling.controle}
        rows={rows}
        required={isVerplicht || undefined}
        className={cn(veldKlassen, "min-h-32 py-3", className)}
      />
    </Veld>
  );
}

/** Keuzelijst (`<select>`) met label. Andere attributen gaan door naar de `<select>`. */
export function Keuzelijst({
  label,
  naam,
  id,
  hint,
  fout,
  verplicht = false,
  required,
  className,
  opties,
  leeg,
  "aria-describedby": beschrijving,
  ...rest
}: KeuzelijstProps) {
  const koppeling = veldKoppeling({ naam, id, hint, fout }, beschrijving);
  const isVerplicht = verplicht || required === true;
  return (
    <Veld
      koppeling={koppeling}
      label={label}
      verplicht={isVerplicht}
      hint={hint}
      fout={fout}
    >
      <div className="relative">
        <select
          {...rest}
          {...koppeling.controle}
          required={isVerplicht || undefined}
          className={cn(
            veldKlassen,
            "cursor-pointer appearance-none pr-12",
            className,
          )}
        >
          {leeg !== undefined ? <option value="">{leeg}</option> : null}
          {opties.map((optie) => (
            <option key={optie.waarde} value={optie.waarde}>
              {optie.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-navy"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </div>
    </Veld>
  );
}
