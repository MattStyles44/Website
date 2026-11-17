# Merkidentiteit: SignUp Reclame

Bron: huidige site `www.sign-up.nl` en interview fase 0, ronde 2 (17 november 2026). Gebruik in de code alleen de tokens hieronder, nooit losse kleurcodes.

## Merkgevoel

Bezoekers moeten SignUp ervaren als:

1. **Vakkundig:** 25 jaar ervaring, A-merk materialen, strakke afwerking. Laat dit zien met projecten en details, niet met superlatieven.
2. **Nuchter:** eerlijke taal, geen marketingpraat en geen loze beloftes. Gewoon zeggen wat het is, wat het kost en hoe lang het meegaat.
3. **Toegankelijk:** laagdrempelig contact, korte lijnen, geen drempels om een vraag te stellen. De eigenaren zijn zichtbaar.

## Tone of voice

- Spreek de klant aan met **je/jij**, ook zakelijke klanten.
- Korte zinnen, actieve vorm, concreet. Zeg bijvoorbeeld "We plakken je bus in één dag" in plaats van "Wij verzorgen uw complete voertuigbelettering".
- Vaktermen (gietfolie, carwrap) mogen, maar leg ze kort uit.

## Logo

- Woordmerk "SIGNUP" met "RECLAME" eronder, in donkerblauw en merkblauw, binnen een afgeronde omlijning.
- Er is een vectorbestand en een witte versie voor donkere achtergronden.
- [ ] **Aanleveren:** beide versies als SVG (of EPS/AI/PDF; ik zet ze om naar SVG). Ze komen in `public/brand/`.

## Kleuren (bevestigd)

| Token        | Waarde    | Gebruik                                              |
| ------------ | --------- | ---------------------------------------------------- |
| `brand-navy` | `#172746` | Primair: koppen, tekst, donkere vlakken              |
| `brand-blue` | `#006D9A` | Merkblauw: knoppen, links, accenten                  |
| `ink-muted`  | `#666666` | Secundaire tekst (controleren op voldoende contrast) |
| `surface`    | `#FFFFFF` | Achtergrond                                          |

Het lichtblauw `#2EA3F2` van de huidige site was de standaardkleur van het thema en vervalt.

## Lettertypen

De lettertypen mogen anders dan Montserrat en Poppins. Ze worden zelf gehost via `next/font`.

- **Voorstel:** Barlow voor koppen en lopende tekst. Dit lettertype is gebaseerd op verkeersborden. Dat past bij signing, is goed leesbaar op afstand en voelt nuchter. Barlow Semi Condensed kan in koppen zorgen voor meer kracht op weinig ruimte.
- [ ] Definitieve keuze in fase 2, op de `/styleguide`-pagina naast elkaar beoordelen.

## Inspiratie: Stock Dutch Design (`stockdutchdesign.com`)

Een interieurontwerpbureau. Wat we overnemen is de aanpak, niet de luxe uitstraling, want die past niet bij "nuchter":

- **Projecten centraal:** grote projectfoto's als collage; het werk verkoopt zichzelf.
- **Persoonlijk:** de namen en het gezicht van de eigenaren staan prominent op de homepage.
- **Rustig:** weinig menu-items, grote kleurvlakken en veel witruimte.
- **Bewijs van derden:** een doorlopende balk met een quote uit de pers. Voor SignUp worden dat Google-reviews en logo's van zakelijke klanten.
- **Niet overnemen:** het sierlijke schreeflettertype (Freight Display) en de zachte roze en bruine tinten.

## Beeld

- Projectfoto's (liefst voor/na) volgen later. Tot die tijd gebruiken we tijdelijke vlakken, geen stockfoto's.
- TikTok-video's en foto's van werkplaats en team mogen op de site.
- De foto van de twee eigenaren van de huidige homepage is een goede kandidaat voor de nieuwe homepage.

## Open punten

- [ ] Logo als SVG plus witte versie aanleveren.
- [ ] Projectfoto's en video's verzamelen, met per project: dienst, klant (mag de naam genoemd worden?) en plaats.
- [ ] Lettertypekeuze in fase 2.
