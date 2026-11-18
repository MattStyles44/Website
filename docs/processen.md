# Processen en randvoorwaarden: SignUp Reclame

Bron: interview fase 0, ronde 3 (17 november 2026), plus een DNS-check van `sign-up.nl` op dezelfde dag.

## Offerteaanvraag

**Wat de klant doet:** een formulier invullen met velden per dienst (zie hieronder) en bestanden uploaden.

**Wat er daarna gebeurt:**

1. De aanvraag komt per e-mail binnen bij SignUp, overzichtelijk opgemaakt en met de bestanden erbij. Geen CRM-koppeling.
2. De klant krijgt direct een bevestigingsmail: "We reageren binnen 24 uur op werkdagen", met een samenvatting van de aanvraag.
3. Mattijn reageert persoonlijk, standaard binnen 24 uur op werkdagen.
4. De officiële offerte gaat als PDF per e-mail. Korte afstemming gaat via WhatsApp of telefoon.

**Wat de site moet tonen:** de belofte "Reactie binnen 24 uur op werkdagen", en dat je met de vakman zelf spreekt.

## Formuliervelden per dienst

Het formulier begint met de keuze van de dienst; daarna verschijnen alleen de velden die erbij horen.

| Dienstgroep                                                 | Velden                                                                                                                                    |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Voertuigreclame & carwrapping                               | Merk, model, bouwjaar, lengte/hoogte-variant (bijv. L1H1), aantal voertuigen, lakkleur                                                    |
| Gevelreclame & lichtreclame; buitenreclame & bewegwijzering | Globale afmetingen (B × H), gewenste uitvoering (lichtbak, 3D-letters, gevelbord), ondergrond, montagehoogte, overzichtsfoto van de gevel |
| Interieurdecoratie & wandbekleding                          | Wandmaten (B × H), type ondergrond, eventueel foto's                                                                                      |
| Raamfolies & glasdecoratie                                  | Nog te bepalen in fase 6                                                                                                                  |
| Ontwerp, DTP & maatwerk                                     | Alleen de algemene velden                                                                                                                 |
| Altijd                                                      | Naam, bedrijfsnaam (optioneel), e-mail, telefoon, plaats, toelichting, upload (EPS, AI, PDF, JPG, PNG)                                    |

**Hulp bij aanleveren** (neemt de drempel "gedoe met bestanden" weg): bij het uploadveld staat dat elk bestand welkom is, en dat SignUp controleert of het geschikt is of het logo zo nodig opnieuw opmaakt.

**Kwalificatie:** bij "aantal voertuigen" 3 of meer, of bij een gevelproject, markeert de e-mail de aanvraag als **grote klus**, zodat die bovenaan komt.

## Afspraken

- De klant dient een **afspraakverzoek** in: voorkeursdag, dagdeel (ochtend of middag), op locatie of in de werkplaats, en het adres als het op locatie is.
- Mattijn bevestigt handmatig en houdt zo zelf de regie over de planning.
- Agenda: Apple Agenda (iCloud). Er is geen koppeling nodig. Eventueel krijgt de bevestigingsmail een agendabestand (`.ics`) dat met één klik in iCloud komt.

## Contact en WhatsApp

- WhatsApp Business: 06 51 55 64 33, met de klik-link `https://wa.me/31651556433` (werkt op mobiel en desktop).
- Op elke pagina zichtbaar: een WhatsApp-knop, het telefoonnummer en "Offerte aanvragen".

## Systemen

- **Boekhouding:** e-Boekhouden.nl. Er is geen koppeling nodig.
- **CRM:** geen. Aanvragen komen per e-mail binnen.
- **Agenda:** Apple Agenda (iCloud).

## Prijzen

**Op de site staan geen prijzen.** Alles is maatwerk; elke aanvraag krijgt een vrijblijvende offerte op maat (besluit 18 november 2026). De eerder genoemde vanaf-prijzen zijn alleen interne richtlijnen en komen niet op de site.

## Materialen en garantie

- Uitsluitend A-merk gietfolies: Oracal 751C, 3M 2080 en Avery Dennison SW900.
- Fabrieksgarantie van 3 tot 5+ jaar, afhankelijk van de toepassing.
- Heldere afspraken over aanlevering en nacalculatie.
- [ ] Voor de site: per dienst de garantietermijn, en een korte uitleg wat garantie dekt (loslaten, krimpen, verkleuren) en wat niet.

## Zelf inhoud beheren

Mattijn wil zelf projectfoto's, klantcases en teksten toevoegen, zonder technische kennis of code. Daarvoor komt er een CMS.

- **Voorstel: Sanity.** Het gratis abonnement is ruim genoeg, er is een eenvoudige beheeromgeving, en foto's worden automatisch verkleind en snel geladen. Nieuwe projecten staan direct online zonder nieuwe deploy.
- **Alternatief: Keystatic.** Gratis, met de inhoud in de git-repo. Minder geschikt voor veel grote projectfoto's.
- [ ] Keuze vastleggen in fase 4.

## Huidige site, domein en e-mail (DNS-check 17 november 2026)

| Onderdeel         | Waar het nu staat                                                              |
| ----------------- | ------------------------------------------------------------------------------ |
| DNS (nameservers) | TransIP (`ns0.transip.net`, `ns1.transip.nl`, `ns2.transip.eu`)                |
| E-mail            | MXroute (`chocobo.mxrouting.net`, `chocobo-relay.mxrouting.net`)               |
| Website           | Server op `3.77.231.230` (Amazon, Frankfurt), WordPress-site van het webbureau |
| SPF               | `v=spf1 include:mxroute.com -all`                                              |

**Bevindingen:**

- **Extra MX-record:** er staat een derde MX-record `10 sign-up.nl`, met dezelfde prioriteit als MXroute. Dat stuurt een deel van de inkomende mail naar de webserver. Bij een verhuizing van de website kan dit mail laten verdwijnen of vertragen. Controleren met wie de DNS beheert, en waarschijnlijk verwijderen.
- **SPF voor de nieuwe site:** als de nieuwe site mail verstuurt namens `@sign-up.nl`, bijvoorbeeld bevestigingsmails, moet de verzenddienst aan SPF worden toegevoegd en DKIM worden ingesteld. Anders komen die mails in de spam.
- **Wie is eigenaar:** de registrar is nog niet vastgesteld. De DNS staat bij TransIP, maar dat bewijst niet dat het domein daar ook geregistreerd is. Controleren via de SIDN-whois, en nagaan of het domein op naam van SignUp staat of op naam van het webbureau.

**Bij de overstap moet e-mail ongestoord blijven werken.** Dus alleen het A- en `www`-record wijzigen, de MX-records van MXroute laten staan, en alle oude URL's doorsturen naar de nieuwe (301-redirects) voor behoud van de vindbaarheid.

## Planning en budget

- [ ] Nog vast te stellen, zodra de opzet en de offerte rond zijn.
