# Review fase 4 en 5

## Samenvatting

Ik heb de code van fase 4 (Sanity Studio, de datalaag in `src/lib/cms`, rijke tekst en de webhook `/api/revalidate`) en fase 5 (JSON-LD, metadata en Open Graph, gegenereerde deelafbeeldingen) nagekeken aan de hand van de checklist C1 tot en met C13. Dat leverde zeven bevindingen op. Vier zijn opgelost, elk met een regressietest in `tests/review-*.test.ts`: onveilige links in rijke tekst, vaste pagina's zonder deelafbeelding, deelafbeeldingen voor webadressen die niet bestaan, en het depubliceren van vaste documenten via een release in de Studio. Drie bevindingen zitten in beschermde bestanden of vragen een keuze van de eigenaar en staan hieronder als advies. Na de wijzigingen slagen `lint`, `typecheck`, `format:check`, `test`, `build`, de acceptatietests en in `studio/` `typecheck` en `sanity schema validate`.

## Bevindingen

### R1: Onveilige links in rijke tekst

- **Ernst:** middel
- **Bestand:** `src/components/rijke-tekst.tsx:20-67`
- **Probleem:** Elke tekenreeks als `href` werd een link. Alles wat met `/` begon werd een interne `Link`, dus `//voorbeeld.nl` en `/\voorbeeld.nl` gingen naar een ander domein, zonder `rel`. Alle andere waarden werden een `<a>`, ook `javascript:`, `data:`, `vbscript:`, `ftp:` en een lege `href`. React blokkeert alleen `javascript:`, en de validatie in de Studio geldt niet voor documenten die via de API of een import binnenkomen.
- **Oplossing:** De nieuwe functie `linkDoel` laat de URL-parser beslissen. Een pad wordt alleen een interne link als het na het parsen op hetzelfde domein blijft. Een extern adres wordt alleen een link met `http:`, `https:`, `mailto:` of `tel:`, en houdt `rel="noopener noreferrer"`. Al het andere wordt gewone tekst, ook adressen met tabs of spaties ertussen. Spaties rond een adres worden weggehaald.
- **Status:** opgelost
- **Test:** `tests/review-links.test.ts`

### R2: Vaste pagina's hebben geen deelafbeelding

- **Ernst:** middel
- **Bestand:** `src/content/paginas.ts:107-121`, `src/lib/seo/standaard-deelafbeelding.ts`, `src/app/opengraph-image.tsx`
- **Probleem:** Next.js voegt metadata van verschillende segmenten alleen op het bovenste niveau samen. `paginaMetadata` geeft elke vaste pagina een eigen `openGraph`, en daarmee verdwijnt de afbeelding die `app/opengraph-image.tsx` op het niveau van de layout zet. In de build van de basis hadden `/diensten`, `/projecten`, `/over-ons`, `/contact`, `/offerte` en `/privacy` geen `og:image` en kregen ze `twitter:card` `summary`. Een gedeelde link naar die pagina's toonde dus geen afbeelding. Alleen de homepage en de categorie- en dienstpagina's (met een eigen `opengraph-image` in hun map) hadden er een.
- **Oplossing:** De vaste pagina's, behalve de homepage, verwijzen nu zelf naar de algemene deelafbeelding `/opengraph-image`, met formaat, type en alt. Die gegevens staan op één plek, in het nieuwe `src/lib/seo/standaard-deelafbeelding.ts`, dat geen `next/og` laadt. De homepage, categorieën en diensten blijven de afbeelding uit hun eigen map gebruiken. Na de build hebben alle zes pagina's `og:image` en `summary_large_image`.
- **Status:** opgelost
- **Test:** `tests/review-og-afbeelding.test.ts`

### R3: Deelafbeelding voor webadressen die niet bestaan

- **Ernst:** laag
- **Bestand:** `src/app/diensten/[categorie]/opengraph-image.tsx:19-32`, `src/app/diensten/[categorie]/[dienst]/opengraph-image.tsx:22-33`
- **Probleem:** Voor een onbekende categorie of dienst gaf de afbeeldingsroute status 200 met de slogan als titel, bijvoorbeeld bij `/diensten/bestaat-niet/opengraph-image` en `/diensten/interieur/autobelettering/opengraph-image`. Met Cache Components is `dynamicParams = false` niet beschikbaar. Elk willekeurig webadres liet de server dus een nieuwe afbeelding tekenen en bewaren, terwijl de bijbehorende pagina een 404 is.
- **Oplossing:** Beide routes roepen nu `notFound()` aan als de categorie of de combinatie van categorie en dienst niet bestaat, net als de pagina's. Met `next start` gecontroleerd: onbekende adressen geven 404, de 30 bestaande afbeeldingen worden nog steeds vooraf gebouwd en geven 200.
- **Status:** opgelost
- **Test:** `tests/review-og-onbekend.test.ts`

### R4: Studio laat vaste documenten depubliceren via een release

- **Ernst:** laag
- **Bestand:** `studio/sanity.config.ts:21`, `studio/schemaTypes/vast.ts`, `studio/schemaTypes/index.ts`
- **Probleem:** Het filter op documentacties verwijderde alleen `delete`, `duplicate` en `unpublish`. In Sanity 6 biedt de releases-plugin bij een versie in een release ook `unpublishVersion` aan, en die depubliceert het document zodra de release wordt gepubliceerd. Op een abonnement met Content Releases kon een redacteur zo een categorie of dienst toch laten verdwijnen, en dan toont de site weer de vaste tekst uit de code.
- **Oplossing:** Het filter staat nu in `studio/schemaTypes/vast.ts`, als `toegestaneActies`, samen met `vasteTypes`, zonder afhankelijkheid van het `sanity`-pakket zodat het in de tests van de site te controleren is. `unpublishVersion` is aan de verboden acties toegevoegd. De Studio-configuratie roept deze functie aan; projecten houden al hun acties. In de basis bestond die module nog niet, dus de test faalt daar al bij het importeren.
- **Status:** opgelost
- **Test:** `tests/review-studio-acties.test.ts`

### R5: Adres in de gestructureerde gegevens staat nergens op de site

- **Ernst:** laag
- **Bestand:** `src/app/layout.tsx:30-35`, `src/content/site.ts:35-39`, `src/components/site-footer.tsx`, `src/app/contact/page.tsx`
- **Probleem:** Elke pagina beschrijft SignUp als `LocalBusiness` met het adres Koldingweg 9, 9723 HL Groningen, maar dat adres staat niet in de footer, niet op de contactpagina en ook nergens anders op de site. De richtlijnen van Google voor gestructureerde gegevens vragen dat je alleen markeert wat de bezoeker ook kan zien.
- **Oplossing:** Advies: toon het vestigingsadres in de footer en op de contactpagina, zodat het gelijk loopt met de JSON-LD en het Google Bedrijfsprofiel. Dat zijn beschermde bestanden en het hoort bij de interfacefase. Wil de eigenaar het adres niet tonen, laat dan `address` weg (`vestiging` op `undefined`), dan beschrijft de code SignUp als `Organization`.
- **Status:** advies

### R6: Studio belooft dat de introductie de omschrijving in Google wordt

- **Ernst:** laag
- **Bestand:** `studio/schemaTypes/dienst.ts:23-31`, `studio/schemaTypes/categorie.ts:18-26`, `src/content/paginas.ts:142-176`
- **Probleem:** Bij het veld Introductie staat in de Studio "Ook gebruikt als omschrijving in Google". De site gebruikt de introductie uit Sanity alleen op de pagina en in de `Service`-gegevens. De meta-omschrijving en `og:description` komen uit de code (`categorieMetadata`, `dienstMetadata`). Een redacteur die de introductie aanpast voor Google ziet daar dus niets veranderen.
- **Oplossing:** Advies: een keuze voor de eigenaar. Of de helptekst in de Studio aanpassen, zodat die alleen nog "bovenaan de pagina" noemt. Of `generateMetadata` op de categorie- en dienstpagina's de introductie uit Sanity laten gebruiken, met de tekst uit de code als terugval; houd dan rekening met de grens van ongeveer 160 tekens die Google toont, tegenover de 300 tekens in de Studio.
- **Status:** advies

### R7: Seed-script vraagt een nieuwere Node-versie dan de Studio opgeeft

- **Ernst:** laag
- **Bestand:** `studio/package.json:8-15`, `studio/seed/maak-seed.ts`
- **Probleem:** `npm run seed` voert `node seed/maak-seed.ts` uit, zonder vlag. Node 22 voert TypeScript pas zonder extra instelling uit vanaf 22.18.0, terwijl `engines` in `studio/package.json` `>=22.12` toestaat. Op Node 22.12 tot en met 22.17 faalt het script, omdat Node een `.ts`-bestand dan niet zonder vlag herkent.
- **Oplossing:** Advies: zet `engines.node` in `studio/package.json` op `>=22.18`, of voeg `--experimental-strip-types` toe aan het `seed`-script. Dat is een beschermd bestand, daarom niet aangepast. Op een recente Node maakt het script 30 documenten met unieke ID's (gecontroleerd).
- **Status:** advies

## Nagekeken

- **C1** Links in rijke tekst: welke `href` een link wordt, intern of extern, en `rel`. Bevinding R1 (opgelost). Paden zonder `/` aan het begin (bijvoorbeeld `diensten/x`) worden nu gewone tekst; de Studio vraagt al om een pad met `/` of een volledig adres. Externe links, ook `mailto:` en `tel:`, krijgen `rel="noopener noreferrer"`, interne links gaan via `next/link`.
- **C2** JSON-LD: `serialiseerJsonLd` vervangt elke `<` door `<`, zoals de Next.js-gids voorschrijft. Daarmee kan tekst uit het CMS geen `</script>` of `<!--` vormen, en `JSON.parse` geeft dezelfde gegevens terug. De scripts staan als gewone `<script type="application/ld+json">` (niet `next/script`) in de body van de layout en van de categorie- en dienstpagina's. Geen bevinding.
- **C3** Gestructureerde gegevens: `LocalBusiness` heeft de verplichte `name` en `address`, plus `telephone`, `url`, `email` en `areaServed`. `WebSite`, `Service` en `BreadcrumbList` verwijzen met vaste `@id`'s (`#organisatie`, `#website`, `#dienst`), allemaal op basis van `APP_URL`. Het kruimelpad in JSON-LD is gelijk aan het zichtbare kruimelpad, met absolute URL's. `FAQPage` komt er alleen bij als de vragen zichtbaar in de `dl` staan (Google toont FAQ-resultaten tegenwoordig vooral voor overheids- en zorgsites, maar de opmaak kan geen kwaad). Bevinding R5 (advies): het adres staat nergens zichtbaar op de site.
- **C4** Metadata en Open Graph: `metadataBase` komt uit `APP_URL`, en canonical en `og:url` worden in de build correct absoluut gemaakt. Het titelsjabloon geldt niet voor de homepage (`absolute`). Omdat Next.js metadata alleen op het bovenste niveau samenvoegt, verloren de vaste pagina's hun `og:image`: bevinding R2 (opgelost). Categorie- en diensttitels bevatten met het sjabloon twee keer "Groningen", en sommige omschrijvingen zijn langer dan 160 tekens. Dat is een keuze over de inhoud, geen fout.
- **C5** Deelafbeeldingen: de bestandsconventie, de exports `alt`, `size` en `contentType` en `generateStaticParams` zijn correct; de build maakt 6 categorie- en 24 dienstafbeeldingen vooraf. Onbekende params gaven een afbeelding met status 200: bevinding R3 (opgelost). De alt-tekst van categorie- en dienstafbeeldingen is algemeen ("dienst op maat"), maar niet onjuist. Per pagina een eigen alt kan later met `generateImageMetadata`. Geen bevinding daarover.
- **C6** Cache Components: de drie ophaalfuncties gebruiken `'use cache'` met `cacheTag("sanity")`, en `cacheLife("minutes")` bij development of `cacheLife("hours")` in productie (revalidate na 1 uur, expire na 1 dag, zoals de build toont). De returnwaarden zijn gewone objecten en arrays, dus serialiseerbaar. Zonder project-ID valt alles terug op de code. Een netwerkfout gaat door, zodat een build met Sanity faalt in plaats van lege teksten te publiceren. Geen bevinding.
- **C7** Webhook: de body wordt eerst als tekst gelezen en daarna met `isValidSignature` (HMAC-SHA256) gecontroleerd. Zonder geheim geeft de route 503, bij een ontbrekende of ongeldige handtekening, of een handtekening die niet bij de inhoud past, 401, en bij een geldige 200 met `revalidateTag("sanity", { expire: 0 })`, zoals de documentatie dat voor webhooks aanraadt. De bibliotheek controleert niet hoe oud de tijdstempel is; een herhaald verzoek ververst alleen de cache, dus dat is acceptabel. Geen bevinding.
- **C8** Sanity-client: `perspective: "published"` (concepten blijven onzichtbaar), een vaste `apiVersion` die in het verleden ligt, `useCdn: false` omdat Next.js zelf cachet en de webhook direct ververst, en `null` zonder `SANITY_PROJECT_ID`, met de dataset gevalideerd in `src/env.ts`. Geen bevinding.
- **C9** Zod in `bron.ts`: `null` en ontbrekende velden worden een lege lijst of `undefined`, een lege introductie valt terug op de omschrijving uit de code, een onleesbaar document valt terug met een waarschuwing, een onleesbaar project wordt overgeslagen, en verwijzingen naar onbekende of verwijderde diensten vallen weg via `getDienst`. Eén ongeldige stap of vraag laat de hele dienst terugvallen; dat staat zo beschreven en is bewust. Geen bevinding.
- **C10** Studio, GROQ en zod komen overeen in veldnamen en types (`intro`, `tekst`, `voordelen`, `werkwijze{titel, tekst}`, `vragen{vraag, antwoord}`, `garantie`, `slug.current`, `diensten[]->{categorie, slug}`). De limieten staan alleen in de Studio, wat volstaat. Het seed-script gebruikt ID's `categorie-<slug>` en `dienst-<categorie>-<slug>` die passen bij `structure.ts`, unieke `_key`'s, de `_type`'s `stap` en `vraag` uit het schema, en `--missing` laat bestaande documenten ongemoeid. Bevindingen R6 en R7 (advies).
- **C11** Studio-configuratie: sjablonen en `newDocumentOptions` voor categorie en dienst zijn verwijderd, dus aanmaken kan niet, en verwijderen, dupliceren en depubliceren zijn uitgezet. Depubliceren via een release kon nog: bevinding R4 (opgelost). Het menu filtert diensten per categorie met `categorie == $categorie`, op basis van de ID-conventie uit de seed. Geen verdere bevinding.
- **C12** HTML en toegankelijkheid: één `h1` per pagina, secties met `h2` en `aria-labelledby`, een `ol` voor de werkwijze, een `dl` met `div`-groepen voor de vragen (geldige HTML), lijsten voor diensten en projecten, en het kruimelpad als `nav` met `ol` en `aria-current`. Rijke tekst levert alleen `p`, `h2`, `h3` en lijsten. Geen bevinding.
- **C13** Testgaten: er waren geen tests voor de links in rijke tekst, voor `og:image` in de metadata, voor de afbeeldingsroutes en voor de Studio-acties. Die zijn nu gedekt door de vier `tests/review-*.test.ts`. Nog niet getest zijn de cache-instellingen in `src/lib/cms/index.ts` en de clientinstellingen in `src/lib/cms/client.ts`; die tests zijn de moeite waard bij de volgende wijziging daar.
