"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";

import { verstuurOfferte } from "@/app/offerte/actions";
import {
  bestandenAccept,
  bestandenHint,
  bestandenSamenvatting,
  controleerBestanden,
  controleerFormulier,
  ongeldigBericht,
  vroegsteAfspraakDatum,
} from "@/components/offerte/controle";
import {
  beginKeuze,
  categorieOpties,
  dienstOpties,
  foutRegels,
  projectGroepen,
  type ProjectGroep,
  type ProjectVeld,
} from "@/components/offerte/formulier-velden";
import {
  Invoer,
  Keuzegroep,
  Keuzelijst,
  Knop,
  Tekstvak,
} from "@/components/ui";
import { getCategorie } from "@/content/diensten";
import { site, vestiging } from "@/content/site";
import type { Fouten } from "@/lib/offerte/aanvraag";
import { honeypotVeld } from "@/lib/offerte/spam";
import type { VerwerkResultaat } from "@/lib/offerte/verwerk";

export interface OfferteFormulierProps {
  /** Slug uit de link, bijvoorbeeld "voertuigreclame". */
  categorie?: string;
  /** Slug uit de link, bijvoorbeeld "carwrapping". */
  dienst?: string;
  /** De begintoestand, voor de tests. */
  resultaat?: VerwerkResultaat | null;
}

/** Wat de bezoeker in het bestandsveld heeft gekozen. */
interface BestandKeuze {
  aantal: number;
  samenvatting: string;
  melding?: string;
  /** Het resultaat dat in beeld was toen de keuze veranderde. */
  bij: VerwerkResultaat | null;
}

const locatieOpties = [
  { waarde: "locatie", label: "Op locatie, bij jou" },
  {
    waarde: "werkplaats",
    label:
      vestiging === undefined
        ? "In onze werkplaats"
        : `In onze werkplaats in ${vestiging.plaats}`,
  },
] as const;

const dagdeelOpties = [
  { waarde: "ochtend", label: "Ochtend" },
  { waarde: "middag", label: "Middag" },
] as const;

const linkKlassen =
  "font-semibold text-blauw underline decoration-2 underline-offset-4 hover:text-navy";

/**
 * Het offerte- en afspraakformulier (docs/processen.md). Eerst de categorie,
 * daarna alleen de velden die daarbij horen. Versturen gaat via de Server
 * Action `verstuurOfferte`; het formulier controleert eerst zelf met dezelfde
 * regels, zodat een fout meteen in beeld komt.
 */
export function OfferteFormulier(props: OfferteFormulierProps): ReactElement {
  const [serverResultaat, verstuur, bezig] = useActionState(
    verstuurOfferte,
    props.resultaat ?? null,
  );
  // Fouten uit de controle in het formulier zelf, tot het volgende versturen.
  const [lokaal, setLokaal] = useState<VerwerkResultaat | null>(null);
  const resultaat = lokaal ?? serverResultaat;

  const [categorie, setCategorie] = useState(
    () => beginKeuze(props.categorie, props.dienst).categorie,
  );
  const [dienst, setDienst] = useState(
    () => beginKeuze(props.categorie, props.dienst).dienst,
  );
  const [afspraak, setAfspraak] = useState(false);
  const [vroegsteDatum, setVroegsteDatum] = useState<string>();
  const [locatie, setLocatie] = useState("");
  const [bestanden, setBestanden] = useState<BestandKeuze | null>(null);

  const meldingRef = useRef<HTMLDivElement>(null);

  // Na elk resultaat gaat de focus naar de melding, zodat ook wie met het
  // toetsenbord of een schermlezer werkt meteen weet wat er gebeurd is.
  useEffect(() => {
    if (resultaat !== null && !bezig) meldingRef.current?.focus();
  }, [resultaat, bezig]);

  if (resultaat?.status === "ok") {
    return <Bevestiging bericht={resultaat.bericht} meldingRef={meldingRef} />;
  }

  const gekozen = getCategorie(categorie);
  const groep =
    gekozen === undefined ? undefined : projectGroepen[gekozen.formulier];
  const fouten: Fouten =
    resultaat?.status === "ongeldig" ? resultaat.fouten : {};

  // Een nieuwe keuze van bestanden vervangt de melding van het vorige resultaat.
  const bestandFout =
    bestanden !== null && bestanden.bij === resultaat
      ? bestanden.melding
      : (fouten.bestanden ?? bestanden?.melding);
  const bestandenOpnieuw =
    resultaat?.status === "ongeldig" && (bestanden?.aantal ?? 0) === 0;

  const zichtbaar = new Set<string>([
    "categorie",
    "toelichting",
    "bestanden",
    "naam",
    "bedrijfsnaam",
    "email",
    "telefoon",
    "plaats",
    "afspraak",
    ...(gekozen === undefined ? [] : ["dienst"]),
    ...(groep?.velden.map((veld) => veld.naam) ?? []),
    ...(afspraak
      ? ["afspraakLocatie", "afspraakDatum", "afspraakDagdeel"]
      : []),
    ...(afspraak && locatie === "locatie" ? ["afspraakAdres"] : []),
  ]);

  function bijCategorie(event: ChangeEvent<HTMLSelectElement>) {
    setCategorie(event.target.value);
    // Een andere categorie heeft andere diensten.
    setDienst("");
  }

  function bijAfspraak(event: FormEvent<HTMLDivElement>) {
    const doel = event.target;
    if (!(doel instanceof HTMLInputElement) || doel.name !== "afspraak") return;
    setAfspraak(doel.checked);
    if (doel.checked) {
      setVroegsteDatum(vroegsteAfspraakDatum(new Date()));
    } else {
      setLocatie("");
    }
  }

  function bijBestanden(event: ChangeEvent<HTMLInputElement>) {
    const lijst = Array.from(event.currentTarget.files ?? []);
    setBestanden({
      aantal: lijst.length,
      samenvatting: lijst.length === 0 ? "" : bestandenSamenvatting(lijst),
      melding: controleerBestanden(lijst),
      bij: resultaat,
    });
  }

  function bijVersturen(event: FormEvent<HTMLFormElement>) {
    // Zelf versturen: zo blijft alles wat de bezoeker invulde staan.
    event.preventDefault();
    if (bezig) return;
    const formData = new FormData(event.currentTarget);
    const gevonden = controleerFormulier(formData, new Date());
    if (gevonden !== undefined) {
      setLokaal({
        status: "ongeldig",
        bericht: ongeldigBericht,
        fouten: gevonden,
      });
      return;
    }
    setLokaal(null);
    startTransition(() => verstuur(formData));
  }

  const statusBestanden =
    bestanden !== null && bestanden.aantal > 0
      ? bestanden.samenvatting
      : bestandenOpnieuw
        ? "Had je bestanden gekozen? Kies ze dan opnieuw."
        : "";

  return (
    <div className="flex min-w-0 flex-col gap-8">
      {resultaat?.status === "ongeldig" ? (
        <FoutOverzicht
          bericht={resultaat.bericht}
          fouten={resultaat.fouten}
          zichtbaar={zichtbaar}
          bestandenOpnieuw={bestandenOpnieuw}
          meldingRef={meldingRef}
        />
      ) : null}
      {resultaat?.status === "fout" || resultaat?.status === "te-vaak" ? (
        <NietVerstuurd
          titel={
            resultaat.status === "te-vaak"
              ? "Probeer het later opnieuw"
              : "Er ging iets mis"
          }
          bericht={resultaat.bericht}
          meldingRef={meldingRef}
        />
      ) : null}

      <form
        action={verstuur}
        onSubmit={bijVersturen}
        noValidate
        className="relative flex flex-col gap-8"
      >
        <Deel id="deel-onderwerp" titel="Waar gaat het om?">
          <Keuzelijst
            label="Categorie"
            naam="categorie"
            leeg="Kies een categorie"
            opties={categorieOpties}
            value={categorie}
            onChange={bijCategorie}
            fout={fouten.categorie}
            verplicht
          />
          {gekozen === undefined ? (
            <p className="text-inkt-zacht">
              Kies eerst een categorie. Daarna zie je de vragen die erbij horen.
            </p>
          ) : (
            <Keuzelijst
              label="Dienst"
              naam="dienst"
              leeg="Weet ik nog niet"
              hint="Twijfel je? Laat dit open, dan denken we mee."
              opties={dienstOpties(gekozen.slug)}
              value={dienst}
              onChange={(event) => setDienst(event.target.value)}
              fout={fouten.dienst}
            />
          )}
          {gekozen !== undefined && groep !== undefined ? (
            <ProjectVelden
              key={gekozen.formulier}
              groep={groep}
              fouten={fouten}
            />
          ) : null}
          <Tekstvak
            label="Toelichting"
            naam="toelichting"
            hint="Vertel kort wat je wilt, bijvoorbeeld je planning of je huisstijl."
            maxLength={2000}
            fout={fouten.toelichting}
          />
        </Deel>

        <Deel id="deel-bestanden" titel="Bestanden en foto's">
          <div className="flex flex-col gap-2">
            <Invoer
              label="Kies je bestanden"
              naam="bestanden"
              type="file"
              multiple
              accept={bestandenAccept}
              hint={bestandenHint}
              fout={bestandFout}
              onChange={bijBestanden}
              aria-describedby="bestanden-status"
              className="cursor-pointer file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-vlak file:px-4 file:py-1.5 file:font-semibold file:text-navy"
            />
            <p
              id="bestanden-status"
              aria-live="polite"
              className="text-sm font-semibold"
            >
              {statusBestanden}
            </p>
          </div>
        </Deel>

        <Deel
          id="deel-gegevens"
          titel="Je gegevens"
          uitleg="Zo kunnen we je de offerte sturen, en je appen of bellen als we een vraag hebben."
        >
          <Invoer
            label="Naam"
            naam="naam"
            autoComplete="name"
            fout={fouten.naam}
            verplicht
          />
          <Invoer
            label="Bedrijfsnaam"
            naam="bedrijfsnaam"
            autoComplete="organization"
            hint="Laat leeg als je particulier bent."
            fout={fouten.bedrijfsnaam}
          />
          <Invoer
            label="E-mailadres"
            naam="email"
            type="email"
            autoComplete="email"
            hint="Hier sturen we de bevestiging en de offerte naartoe."
            fout={fouten.email}
            verplicht
          />
          <Invoer
            label="Telefoonnummer"
            naam="telefoon"
            type="tel"
            autoComplete="tel"
            hint="Voor een korte vraag via WhatsApp of telefoon."
            fout={fouten.telefoon}
            verplicht
          />
          <Invoer
            label="Plaats"
            naam="plaats"
            autoComplete="address-level2"
            fout={fouten.plaats}
            verplicht
          />
        </Deel>

        <Deel
          id="deel-afspraak"
          titel="Afspraak"
          uitleg="Liever eerst samen kijken? Vraag een meet- of adviesafspraak aan, op locatie of in onze werkplaats."
        >
          <div onChange={bijAfspraak}>
            <Keuzegroep
              legend="Wil je een afspraak?"
              naam="afspraak"
              type="checkbox"
              hint="We bevestigen de afspraak altijd persoonlijk. Tot die tijd is het een verzoek."
              opties={[
                {
                  waarde: "ja",
                  label: "Ja, ik wil een meet- of adviesafspraak",
                },
              ]}
            />
          </div>
          {afspraak ? (
            <div className="flex flex-col gap-6 border-l-4 border-vlak pl-4 sm:pl-6">
              <Keuzelijst
                label="Waar wil je de afspraak?"
                naam="afspraakLocatie"
                leeg="Kies een plek"
                opties={locatieOpties}
                defaultValue=""
                onChange={(event) => setLocatie(event.target.value)}
                fout={fouten.afspraakLocatie}
                verplicht
              />
              {locatie === "locatie" ? (
                <Invoer
                  label="Adres van de afspraak"
                  naam="afspraakAdres"
                  autoComplete="street-address"
                  hint="Straat, huisnummer en plaats."
                  fout={fouten.afspraakAdres}
                  verplicht
                />
              ) : null}
              <Invoer
                label="Voorkeursdatum"
                naam="afspraakDatum"
                type="date"
                min={vroegsteDatum}
                hint="Vandaag of later."
                fout={fouten.afspraakDatum}
                className="sm:max-w-xs"
                verplicht
              />
              <Keuzelijst
                label="Dagdeel"
                naam="afspraakDagdeel"
                leeg="Kies een dagdeel"
                opties={dagdeelOpties}
                defaultValue=""
                fout={fouten.afspraakDagdeel}
                verplicht
              />
            </div>
          ) : null}
        </Deel>

        {/* Honeypot: onzichtbaar voor mensen en schermlezers; bots vullen het in. */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden"
        >
          <label htmlFor={honeypotVeld}>Laat dit veld leeg</label>
          <input
            id={honeypotVeld}
            name={honeypotVeld}
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col items-start gap-4">
          <p className="text-sm text-inkt-zacht">
            We gebruiken je gegevens alleen om je aanvraag te beantwoorden. Lees
            meer in de{" "}
            <Link href="/privacy" className={linkKlassen}>
              privacyverklaring
            </Link>
            .
          </p>
          <Knop type="submit" grootte="groot" disabled={bezig}>
            {bezig ? "Bezig met versturen…" : "Aanvraag versturen"}
          </Knop>
          <p aria-live="polite" className="sr-only">
            {bezig ? "Je aanvraag wordt verstuurd." : ""}
          </p>
        </div>
      </form>
    </div>
  );
}

/** Een deel van het formulier met een kop, op een wit vlak. */
function Deel({
  id,
  titel,
  uitleg,
  children,
}: {
  id: string;
  titel: string;
  uitleg?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col gap-6 rounded-kaart bg-wit p-5 sm:p-8"
    >
      <div className="flex flex-col gap-2">
        <h2 id={id} className="text-3xl">
          {titel}
        </h2>
        {uitleg ? <p className="text-inkt-zacht">{uitleg}</p> : null}
      </div>
      {children}
    </section>
  );
}

/** De velden die bij het formuliertype van de gekozen categorie horen. */
function ProjectVelden({
  groep,
  fouten,
}: {
  groep: ProjectGroep;
  fouten: Fouten;
}) {
  return (
    <div
      role="group"
      aria-labelledby="project-kop"
      className="flex min-w-0 flex-col gap-6 border-t-2 border-vlak pt-6"
    >
      <div className="flex flex-col gap-2">
        <h3 id="project-kop" className="text-2xl">
          {groep.titel}
        </h3>
        {groep.uitleg ? (
          <p className="text-inkt-zacht">{groep.uitleg}</p>
        ) : null}
      </div>
      {groep.velden.map((veld) => (
        <ProjectInvoer key={veld.naam} veld={veld} fout={fouten[veld.naam]} />
      ))}
    </div>
  );
}

function ProjectInvoer({ veld, fout }: { veld: ProjectVeld; fout?: string }) {
  if (veld.soort === "keuze") {
    return (
      <Keuzelijst
        label={veld.label}
        naam={veld.naam}
        hint={veld.hint}
        leeg={veld.leeg}
        opties={veld.opties}
        defaultValue=""
        fout={fout}
        verplicht={veld.verplicht}
      />
    );
  }
  return (
    <Invoer
      label={veld.label}
      naam={veld.naam}
      hint={veld.hint}
      inputMode={veld.invoer}
      maxLength={veld.maxLengte}
      fout={fout}
      verplicht={veld.verplicht}
      className={veld.kort ? "sm:max-w-xs" : undefined}
    />
  );
}

/** Ga naar het veld bij een fout, en zet de focus erin. */
function naarVeld(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const veld = document.getElementById(id);
  if (veld === null) return;
  event.preventDefault();
  veld.scrollIntoView({ block: "center" });
  veld.focus({ preventScroll: true });
}

function FoutOverzicht({
  bericht,
  fouten,
  zichtbaar,
  bestandenOpnieuw,
  meldingRef,
}: {
  bericht: string;
  fouten: Fouten;
  zichtbaar: ReadonlySet<string>;
  bestandenOpnieuw: boolean;
  meldingRef: RefObject<HTMLDivElement | null>;
}) {
  const regels = foutRegels(fouten, zichtbaar);
  return (
    <div
      ref={meldingRef}
      role="alert"
      tabIndex={-1}
      aria-labelledby="fouten-kop"
      className="flex flex-col gap-4 rounded-kaart border-4 border-fout bg-wit p-5 sm:p-8"
    >
      <h2 id="fouten-kop" className="text-3xl">
        Controleer je aanvraag
      </h2>
      <p>{bericht}</p>
      {regels.length > 0 ? (
        <ul className="flex list-disc flex-col gap-2 pl-6 text-fout marker:text-fout">
          {regels.map((regel) => (
            <li key={regel.naam}>
              {regel.id === undefined ? (
                <span className="font-semibold">{regel.melding}</span>
              ) : (
                <a
                  href={`#${regel.id}`}
                  onClick={(event) => naarVeld(event, regel.id ?? "")}
                  className="font-semibold text-fout underline decoration-2 underline-offset-4 hover:text-navy"
                >
                  {regel.melding}
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {bestandenOpnieuw ? (
        <p>
          Had je bestanden gekozen? Kies ze dan opnieuw voordat je verstuurt.
        </p>
      ) : null}
    </div>
  );
}

function NietVerstuurd({
  titel,
  bericht,
  meldingRef,
}: {
  titel: string;
  bericht: string;
  meldingRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={meldingRef}
      role="alert"
      tabIndex={-1}
      className="flex flex-col gap-4 rounded-kaart border-4 border-fout bg-wit p-5 sm:p-8"
    >
      <h2 className="text-3xl">{titel}</h2>
      <p>{bericht}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Knop href={site.whatsapp} variant="secundair">
          Stuur een WhatsApp
        </Knop>
        <Knop href={site.telefoon.link} variant="tekst">
          Bel {site.telefoon.weergave}
        </Knop>
      </div>
    </div>
  );
}

function Bevestiging({
  bericht,
  meldingRef,
}: {
  bericht: string;
  meldingRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={meldingRef}
      role="status"
      tabIndex={-1}
      className="flex flex-col gap-4 rounded-kaart bg-wit p-5 sm:p-8"
    >
      <h2 className="text-3xl">Je aanvraag is verstuurd</h2>
      <p className="text-intro">{bericht}</p>
      <p>
        Wil je nog iets aanvullen? Stuur een{" "}
        <a
          href={site.whatsapp}
          rel="noopener noreferrer"
          className={linkKlassen}
        >
          WhatsApp
        </a>{" "}
        of bel{" "}
        <a href={site.telefoon.link} className={linkKlassen}>
          {site.telefoon.weergave}
        </a>
        .
      </p>
    </div>
  );
}
