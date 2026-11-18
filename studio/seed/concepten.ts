/**
 * Conceptteksten voor de eerste vulling van Sanity (fase 4).
 * Geschreven op basis van docs/brief.md, docs/merk.md en docs/processen.md:
 * je/jij, kort en nuchter, geen prijzen en geen beloftes die niet vaststaan.
 * Garantietermijnen per dienst staan nog niet vast en zijn daarom leeg.
 *
 * Na de import beheert SignUp deze teksten in de Studio. Dit bestand wordt
 * daarna alleen nog gebruikt voor een nieuwe dataset (`npm run seed`).
 */

export interface Stap {
  titel: string;
  tekst: string;
}

export interface Vraag {
  vraag: string;
  antwoord: string;
}

export interface CategorieConcept {
  intro: string;
  alineas: string[];
  /** Standaard werkwijze voor de diensten in deze categorie. */
  werkwijze: Stap[];
}

export interface DienstConcept {
  intro: string;
  alineas: string[];
  voordelen: string[];
  vragen: Vraag[];
}

/** Vraag over de kosten: altijd maatwerk, nooit een bedrag. */
function kosten(vraag: string, afhankelijkVan: string): Vraag {
  return {
    vraag,
    antwoord: `Dat hangt af van ${afhankelijkVan}. Alles is maatwerk, dus je krijgt eerst een vrijblijvende offerte op maat. Je hoort binnen 24 uur op werkdagen van ons.`,
  };
}

const bestandenVraag: Vraag = {
  vraag: "Hoe lever ik mijn logo aan?",
  antwoord:
    "Elk bestand is welkom: EPS, AI, PDF, JPG of PNG. We controleren of het geschikt is en maken je logo zo nodig opnieuw op.",
};

const vergunningVraag = (onderwerp: string): Vraag => ({
  vraag: `Heb ik een vergunning nodig voor ${onderwerp}?`,
  antwoord:
    "Dat verschilt per gemeente. Soms is een omgevingsvergunning nodig. Check dit bij je gemeente voordat je de opdracht geeft.",
});

const aanvraag: Stap = {
  titel: "Aanvraag",
  tekst:
    "Je vult het offerteformulier in of stuurt een WhatsApp-bericht, met foto's en je logo als je dat hebt. Elk bestand is welkom.",
};

const reactie: Stap = {
  titel: "Reactie en advies",
  tekst:
    "Binnen 24 uur op werkdagen hoor je van ons. Je spreekt direct met de vakman die het werk ook uitvoert. Waar nodig komen we kijken en meten.",
};

const offerte: Stap = {
  titel: "Offerte op maat",
  tekst:
    "Je krijgt een vrijblijvende offerte op maat per e-mail. Waar nodig zie je vooraf een ontwerp of werktekening.",
};

export const categorieConcepten: Record<string, CategorieConcept> = {
  voertuigreclame: {
    intro:
      "Belettering en wraps voor bedrijfswagens, personenauto's en complete wagenparken. Met A-merk gietfolie en strak aangebracht, in Groningen en heel Noord-Nederland.",
    alineas: [
      "Je bedrijfswagen is elke dag onderweg in de regio. Met duidelijke belettering zien mensen meteen wie je bent en hoe ze je bereiken. Van een logo op één bestelbus tot een complete vloot in dezelfde huisstijl: alles is maatwerk.",
      "We werken alleen met A-merk gietfolies, zoals Oracal 751C, 3M 2080 en Avery Dennison SW900. Die folies volgen de vormen van je voertuig en krimpen of laten niet los na een jaar.",
      "Ook particulieren zijn welkom, bijvoorbeeld voor een carwrap in een nieuwe kleur of een chrome delete.",
    ],
    werkwijze: [
      aanvraag,
      reactie,
      offerte,
      {
        titel: "Plakken",
        tekst:
          "We maken de belettering of wrap en brengen de folie zelf aan. Je hoort vooraf hoe lang we je voertuig nodig hebben.",
      },
    ],
  },
  gevelreclame: {
    intro:
      "Gevelletters, lichtreclame en gevelborden die je pand herkenbaar maken. Op maat gemaakt en zelf gemonteerd, in Groningen en Noord-Nederland.",
    alineas: [
      "Je gevel is vaak het eerste wat klanten van je bedrijf zien. Met 3D-letters, een lichtbak of een strak gevelbord valt je pand op, overdag en met verlichting ook 's avonds.",
      "We kijken vooraf naar je gevel: de ondergrond, de montagehoogte en hoe de reclame het beste uitkomt. Je krijgt eerlijk advies over materiaal en uitvoering, en we monteren alles zelf.",
    ],
    werkwijze: [
      aanvraag,
      reactie,
      offerte,
      {
        titel: "Maken en monteren",
        tekst:
          "We maken de gevelreclame op maat en monteren die zelf bij jou op locatie.",
      },
    ],
  },
  buitenreclame: {
    intro:
      "Reclameborden, bouwborden, zuilen, bewegwijzering en vlaggen. Weerbestendig gemaakt, zodat je buitenreclame er lang goed uitziet.",
    alineas: [
      "Buitenreclame moet tegen regen, wind en zon kunnen. Daarom kiezen we materialen die daarvoor gemaakt zijn, zoals Dibond en Trespa, met een laminaat dat beschermt tegen uv-licht en krassen.",
      "Van één bouwbord bij een project tot complete bewegwijzering op een bedrijfsterrein: alles wordt op maat gemaakt en in je eigen huisstijl uitgevoerd.",
    ],
    werkwijze: [
      aanvraag,
      reactie,
      offerte,
      {
        titel: "Maken en plaatsen",
        tekst:
          "We maken alles op maat en bespreken vooraf met je waar en hoe het geplaatst wordt.",
      },
    ],
  },
  interieur: {
    intro:
      "Fotobehang, muurteksten, interieurwrapping en wandpanelen voor kantoren, winkels en horeca. Zo laat je je huisstijl ook binnen zien.",
    alineas: [
      "Een kantoor, winkel of wachtruimte zegt veel over je bedrijf. Met een wandprint, een muurtekst of panelen met je logo geef je een ruimte een eigen uitstraling.",
      "Bestaande meubels, balies en deuren kun je met interieurwrapping een nieuwe look geven, zonder ze te vervangen. We adviseren je over wat past bij de ondergrond en het gebruik van de ruimte.",
    ],
    werkwijze: [
      aanvraag,
      reactie,
      offerte,
      {
        titel: "Maken en aanbrengen",
        tekst: "We maken alles op maat en brengen het zelf bij jou aan.",
      },
    ],
  },
  raamfolie: {
    intro:
      "Zandstraalfolie, raambelettering en zonwerende of veiligheidsfolie. Voor privacy, zichtbaarheid of een koelere werkplek.",
    alineas: [
      "Je ramen kunnen meer dan alleen licht doorlaten. Met raambelettering zien voorbijgangers je openingstijden en acties. Met zandstraalfolie houd je inkijk tegen, terwijl het daglicht blijft.",
      "Zonwerende folie houdt warmte en uv-straling buiten, en veiligheidsfolie maakt glas inbraakvertragend. We kijken vooraf welk type glas je hebt, zodat de folie daarbij past.",
    ],
    werkwijze: [
      aanvraag,
      reactie,
      offerte,
      {
        titel: "Plakken",
        tekst:
          "We brengen de folie zelf aan, aan de binnen- of buitenkant van het glas.",
      },
    ],
  },
  ontwerp: {
    intro:
      "Van ontwerp en drukklare bestanden tot beurssigning en het verwijderen van oude reclame. Ook voor alles eromheen kun je bij ons terecht.",
    alineas: [
      "Heb je een logo, maar nog geen idee hoe het op je bus of gevel komt? We vertalen je huisstijl naar voertuigen, gevels en ruimtes, en je ziet vooraf hoe het eruit komt te zien.",
      "Is je logo alleen beschikbaar als een kleine afbeelding? Geen probleem. We controleren elk bestand en maken je logo zo nodig opnieuw op, zodat het op elk formaat scherp is.",
    ],
    werkwijze: [
      aanvraag,
      reactie,
      offerte,
      {
        titel: "Uitvoering",
        tekst:
          "Na je akkoord gaan we aan de slag. Je weet vooraf wat je krijgt en wanneer het klaar is.",
      },
    ],
  },
};

export const dienstConcepten: Record<string, DienstConcept> = {
  "voertuigreclame/autobelettering": {
    intro:
      "Je logo, contactgegevens en huisstijl op je personenauto, bestelbus, vrachtwagen of aanhanger. Voor één voertuig of je complete wagenpark.",
    alineas: [
      "Met belettering op je bedrijfswagen zien mensen direct wie je bent en hoe ze je kunnen bereiken. We plakken logo's, teksten, striping en huisstijlelementen op elk type voertuig: van personenauto tot vrachtwagen en aanhanger.",
      "Heb je meerdere bedrijfswagens? Dan zorgen we dat ze er allemaal hetzelfde uitzien, ook als het verschillende merken of modellen zijn. Geef bij je aanvraag het merk, model en aantal voertuigen door, dan weten we precies wat er nodig is.",
    ],
    voordelen: [
      "A-merk gietfolie, zoals Oracal 751C, die niet krimpt of loslaat",
      "Eén huisstijl op je hele wagenpark",
      "Je spreekt direct met de vakman die je voertuig belettert",
    ],
    vragen: [
      kosten(
        "Wat kost autobelettering?",
        "je voertuig, het ontwerp en het aantal auto's",
      ),
      bestandenVraag,
    ],
  },
  "voertuigreclame/carwrapping": {
    intro:
      "Je auto of bedrijfswagen helemaal in een nieuwe kleur, of volledig bedrukt met je eigen ontwerp. Met hoogwaardige wrapfolie van 3M, Avery Dennison of Oracal.",
    alineas: [
      "Bij een full carwrap bekleden we je hele voertuig met folie. Je kiest een nieuwe kleur, in hoogglans, satin of mat, of een volledig bedrukte wrap met je eigen ontwerp.",
      "We werken met gietfolies zoals 3M 2080 en Avery Dennison SW900. Die laten zich mooi om rondingen vormen en zijn gemaakt om jaren mee te gaan. De folie beschermt je lak ook tegen kleine krasjes.",
    ],
    voordelen: [
      "Hoogwaardige gietfolie van 3M of Avery Dennison",
      "Strak afgewerkt, ook in naden en rondingen",
      "Voor zakelijke en particuliere klanten",
    ],
    vragen: [
      {
        vraag: "Beschadigt een wrap de lak?",
        antwoord:
          "Op een gezonde, originele lak niet. De folie beschermt de lak juist tegen kleine krasjes. Bij overgespoten of beschadigde lak kan bij het verwijderen wel lak loskomen. Daarom kijken we vooraf naar de staat van je lak.",
      },
      {
        vraag: "Kan de wrap er later weer af?",
        antwoord:
          "Ja. Een wrap van A-merk folie kan er later weer af. Laat dat wel door een vakman doen, zodat er geen lijmresten of lakschade ontstaan.",
      },
    ],
  },
  "voertuigreclame/partial-wrapping": {
    intro:
      "Alleen het dak, de spiegelkappen, de motorkap of de spoilers in een andere kleur. Een opvallend accent, zonder je hele auto te wrappen.",
    alineas: [
      "Met partial wrapping geef je je auto een eigen look met een paar accenten. Denk aan een zwart dak, gekleurde spiegelkappen of een motorkap in een contrasterende kleur.",
      "We gebruiken dezelfde A-merk wrapfolie als bij een volledige wrap. Zo sluit de kleur mooi aan en blijft de afwerking strak.",
    ],
    voordelen: [
      "Opvallend resultaat met een kleine ingreep",
      "Dezelfde A-merk wrapfolie als bij een full wrap",
      "Later weer te verwijderen",
    ],
    vragen: [
      {
        vraag: "Welke delen kun je wrappen?",
        antwoord:
          "Veel gekozen zijn het dak, de spiegelkappen, de motorkap en spoilers. Andere delen kan ook, dat bekijken we samen.",
      },
      kosten(
        "Wat kost partial wrapping?",
        "welke delen je wilt laten wrappen en van je auto",
      ),
    ],
  },
  "voertuigreclame/chrome-delete": {
    intro:
      "Chromen raamlijsten, grilles, dakrails en sierlijsten strak afwerken in hoogglans, satin of mat zwart. Voor een rustige, moderne look.",
    alineas: [
      "Bij een chrome delete plakken we de chromen delen van je auto af met folie. Het resultaat is een strakke, donkere afwerking die bij veel auto's moderner oogt.",
      "Het werk zit in de details: rondom raamlijsten en grilles moet de folie precies passen. Met 25 jaar ervaring weten we hoe je dat netjes afwerkt.",
    ],
    voordelen: [
      "Keuze uit hoogglans, satin of mat zwart",
      "Nauwkeurig afgewerkt rondom randen en hoeken",
      "Later weer terug te zetten naar chroom",
    ],
    vragen: [
      {
        vraag: "Kan het later weer terug naar chroom?",
        antwoord:
          "Ja. De folie kan er later weer af, waarna het originele chroom weer zichtbaar is. We kijken vooraf naar de staat van de chromen delen.",
      },
      kosten(
        "Wat kost een chrome delete?",
        "je auto en van welke delen je wilt laten afwerken. Stuur gerust een foto van je auto mee met je aanvraag",
      ),
    ],
  },
  "voertuigreclame/magneetplaten": {
    intro:
      "Tijdelijke reclame op je auto die je er zelf op zet en weer afhaalt. Handig als je je auto niet altijd zakelijk gebruikt.",
    alineas: [
      "Magneetplaten zijn borden van flexibel magneetmateriaal, bedrukt met je logo en contactgegevens. Je zet ze op het portier en haalt ze er weer af wanneer je wilt.",
      "Ze zijn een goede keuze als je auto ook privé rijdt, of als je je reclame alleen tijdens een actie of evenement wilt laten zien.",
    ],
    voordelen: [
      "Zelf aanbrengen en weer verwijderen",
      "Op maat gemaakt voor je voertuig",
      "Bedrukt in je eigen huisstijl",
    ],
    vragen: [
      {
        vraag: "Op welke auto's passen magneetplaten?",
        antwoord:
          "Op vlakke, stalen delen van de carrosserie, zoals de portieren. Op aluminium of kunststof houdt een magneet niet. We kijken samen of je auto geschikt is.",
      },
      {
        vraag: "Hoe blijven magneetplaten goed zitten?",
        antwoord:
          "Zet ze op een schone, droge en vlakke ondergrond. Haal ze er regelmatig af om de plaat en de lak schoon te maken.",
      },
    ],
  },
  "gevelreclame/3d-freesletters": {
    intro:
      "Gevelletters en logo's uit gefreesd acrylaat, Dibond of RVS. Stevig, strak en met diepte, eventueel op afstandshouders.",
    alineas: [
      "3D-freesletters zijn letters en logo's die uit plaatmateriaal worden gefreesd. Door de dikte van het materiaal krijgt je naam diepte en valt die op aan de gevel.",
      "Je kiest het materiaal dat bij je pand past: acrylaat (plexiglas) in veel kleuren, Dibond of RVS. Op afstandshouders komen de letters los van de gevel, wat een mooie schaduwwerking geeft.",
    ],
    voordelen: [
      "Keuze uit acrylaat, Dibond of RVS",
      "Strak gefreesd, ook bij kleine details in je logo",
      "Zelf gemonteerd op je gevel",
    ],
    vragen: [
      {
        vraag: "Welk materiaal past bij mijn gevel?",
        antwoord:
          "Dat hangt af van de uitstraling die je wilt en van de ondergrond. Acrylaat is er in veel kleuren, Dibond is licht en strak, en RVS geeft een luxe uitstraling. We adviseren je daar eerlijk over.",
      },
      vergunningVraag("gevelletters"),
    ],
  },
  "gevelreclame/3d-doosletters": {
    intro:
      "Verlichte gevelletters van aluminium of kunststof, met energiezuinige ledverlichting. Zo is je bedrijf ook 's avonds goed te zien.",
    alineas: [
      "Doosletters zijn holle letters met ledverlichting erin. Je kiest voor direct verlicht, waarbij de voorkant van de letter oplicht, of indirect verlicht (halo-lit), waarbij het licht achter de letter op de gevel schijnt.",
      "We maken de letters op maat van je logo en gevel. Vooraf bespreken we de montage en de stroomaansluiting.",
    ],
    voordelen: [
      "Energiezuinige ledverlichting",
      "Direct of indirect (halo-lit) verlicht",
      "Op maat van je logo en gevel",
    ],
    vragen: [
      {
        vraag: "Wat is het verschil tussen direct en indirect verlicht?",
        antwoord:
          "Bij direct verlicht licht de voorkant van de letter zelf op. Bij indirect verlicht (halo-lit) schijnt het licht naar achteren op de gevel, waardoor er een lichtrand rond de letter ontstaat.",
      },
      vergunningVraag("lichtreclame"),
    ],
  },
  "gevelreclame/lichtbakken": {
    intro:
      "Enkelzijdige lichtbakken voor op de gevel en dubbelzijdige uitsteekbakken die haaks op de gevel hangen. Opvallend, dag en nacht.",
    alineas: [
      "Een lichtbak is een verlichte kast met je logo of naam op de voorkant. Hij hangt plat op de gevel en is van ver te zien.",
      "Een uitsteekbak hangt haaks op de gevel en is aan twee kanten bedrukt. Voorbijgangers zien je bedrijf daardoor uit beide richtingen, handig in een winkelstraat.",
    ],
    voordelen: [
      "Enkel- of dubbelzijdig",
      "Zichtbaar bij dag en nacht",
      "Op maat gemaakt en zelf gemonteerd",
    ],
    vragen: [
      {
        vraag: "Wat is het verschil tussen een lichtbak en een uitsteekbak?",
        antwoord:
          "Een lichtbak hangt plat op de gevel en heeft één bedrukte kant. Een uitsteekbak hangt haaks op de gevel en is aan twee kanten bedrukt, zodat je hem uit beide richtingen ziet.",
      },
      vergunningVraag("een lichtbak"),
    ],
  },
  "gevelreclame/gevelborden": {
    intro:
      "Strakke gevelpanelen van Dibond en aluminium frames met peesdoek of spandoek. Voor een vaste of juist wisselende boodschap op je gevel.",
    alineas: [
      "Een gevelbord van Dibond is een stevig, vlak paneel met je logo en gegevens. Het is weerbestendig en geeft je gevel een nette uitstraling.",
      "Wil je je boodschap af en toe veranderen? Dan is een aluminium frame met peesdoek of spandoek een goede keuze. Het doek kan later worden vervangen, terwijl het frame blijft hangen.",
    ],
    voordelen: [
      "Weerbestendig Dibond voor een vaste boodschap",
      "Frame met vervangbaar doek voor wisselende boodschappen",
      "Op maat van je gevel",
    ],
    vragen: [
      {
        vraag: "Wat is peesdoek?",
        antwoord:
          "Peesdoek is bedrukt textiel met een flexibele rand (de pees) die in een aluminium frame wordt geschoven. Het doek staat strak gespannen en is makkelijk te vervangen.",
      },
      kosten(
        "Wat kost een gevelbord?",
        "het formaat, het materiaal en de montage. Geef bij je aanvraag de afmetingen en een foto van je gevel door",
      ),
    ],
  },
  "buitenreclame/reclameborden": {
    intro:
      "Weerbestendige borden van Dibond, Trespa of Forex, met uv- en krasbestendig laminaat. Voor je bedrijf of je bouwproject.",
    alineas: [
      "Een reclamebord of bouwbord laat zien wie je bent en wat je doet, op de plek waar het gebeurt. Aannemers gebruiken een bouwbord om te laten zien wie er aan een project werkt.",
      "We kiezen het materiaal op basis van de plek en hoe lang het bord moet blijven staan. De bedrukking krijgt een laminaat dat beschermt tegen uv-licht en krassen.",
    ],
    voordelen: [
      "Weerbestendig materiaal voor buiten",
      "Uv- en krasbestendig gelamineerd",
      "Ook voor tijdelijke bouwprojecten",
    ],
    vragen: [
      {
        vraag: "Wat is het verschil tussen Dibond, Trespa en Forex?",
        antwoord:
          "Dibond is een stevige aluminium sandwichplaat die vlak blijft. Trespa is een zware, zeer slijtvaste plaat voor intensief gebruik. Forex is een lichte kunststof plaat, vooral geschikt voor binnen of tijdelijk gebruik.",
      },
      kosten(
        "Wat kost een reclamebord?",
        "het formaat, het materiaal en het aantal borden",
      ),
    ],
  },
  "buitenreclame/reclamezuilen": {
    intro:
      "Verlichte of onverlichte zuilen bij je bedrijfspand. Zo vinden bezoekers je, ook als je pand verder van de weg staat.",
    alineas: [
      "Een reclamezuil of pylon staat vrij, bijvoorbeeld bij de ingang van je terrein of langs de weg. Er kan één bedrijf op staan, of meerdere bedrijven in een bedrijfsverzamelgebouw.",
      "Je kiest voor een verlichte of onverlichte uitvoering. We maken de zuil op maat en bespreken vooraf de plaatsing.",
    ],
    voordelen: [
      "Verlicht of onverlicht",
      "Ruimte voor één of meerdere bedrijven",
      "Op maat in je huisstijl",
    ],
    vragen: [
      vergunningVraag("een reclamezuil"),
      kosten(
        "Wat kost een reclamezuil?",
        "het formaat, de verlichting en de plaatsing",
      ),
    ],
  },
  "buitenreclame/bewegwijzering": {
    intro:
      "Parkeerborden, routebordjes, naamborden en verdiepingsaanduidingen. Zo vinden bezoekers snel hun weg, buiten en binnen.",
    alineas: [
      "Goede bewegwijzering helpt bezoekers, klanten en leveranciers de weg te vinden. Van de parkeerplaats tot de juiste verdieping en het juiste kantoor.",
      "We maken alle borden in dezelfde stijl, passend bij je huisstijl. Zo voelt je terrein of gebouw als één geheel.",
    ],
    voordelen: [
      "Buiten en binnen in één stijl",
      "Duidelijk leesbaar, ook van afstand",
      "Op maat voor je terrein of gebouw",
    ],
    vragen: [
      {
        vraag: "Kunnen jullie een heel terrein in één keer aanpakken?",
        antwoord:
          "Ja. Je geeft door welke plekken bewegwijzering nodig hebben, en we maken een voorstel met alle borden in dezelfde stijl.",
      },
      kosten(
        "Wat kost bewegwijzering?",
        "het aantal borden, de formaten en de plaatsing",
      ),
    ],
  },
  "buitenreclame/vlaggen": {
    intro:
      "Bedrukte bedrijfsvlaggen, gevelbanieren en beachflags. Voor vaste zichtbaarheid bij je pand of tijdelijk op een evenement.",
    alineas: [
      "Een vlag of banier valt van ver op, juist omdat die beweegt. Je kiest een mastvlag of gevelbanier voor bij je pand, of een beachflag die je overal mee naartoe neemt.",
      "We bedrukken vlaggen en banieren in je eigen huisstijl, in het formaat dat bij je plek past.",
    ],
    voordelen: [
      "Vlaggen, banieren en beachflags",
      "In je eigen huisstijl bedrukt",
      "Beachflags makkelijk mee te nemen naar evenementen",
    ],
    vragen: [
      {
        vraag: "Welke vlag past bij mij?",
        antwoord:
          "Voor vaste zichtbaarheid bij je pand kies je een mastvlag of gevelbanier. Sta je op beurzen of evenementen, dan is een beachflag handig: die zet je zelf op en neem je weer mee.",
      },
      kosten("Wat kosten vlaggen?", "het type vlag, het formaat en het aantal"),
    ],
  },
  "interieur/fotobehang": {
    intro:
      "Grootformaat wandprints uit één stuk, op Airtex of Sanotex. Voor kantoren, winkels, horeca en exposities.",
    alineas: [
      "Naadloos fotobehang wordt uit één stuk geprint, dus zonder naden in je beeld. Zo komt een foto, illustratie of je huisstijl groot en rustig op de wand.",
      "We printen op textiel zoals Airtex of Sanotex. Dat geeft een rustige, matte uitstraling.",
    ],
    voordelen: [
      "Uit één stuk geprint, zonder naden",
      "Op maat van je wand",
      "Voor kantoor, winkel en horeca",
    ],
    vragen: [
      {
        vraag: "Kan ik mijn eigen foto gebruiken?",
        antwoord:
          "Ja. We controleren vooraf of je foto scherp genoeg is voor het formaat van je wand. Is dat niet zo, dan denken we mee over een alternatief.",
      },
      {
        vraag: "Wat moet ik doorgeven voor een offerte?",
        antwoord:
          "De maten van je wand (breedte en hoogte), het type ondergrond en zo mogelijk een foto van de wand.",
      },
    ],
  },
  "interieur/muurteksten": {
    intro:
      "Gesneden teksten, quotes en logo's van mat muurvinyl. Een eenvoudige manier om een ruimte persoonlijk te maken.",
    alineas: [
      "Een muurtekst bestaat uit losse, gesneden letters van vinyl. Er zit geen achtergrond omheen, dus het lijkt alsof de tekst op de muur geschilderd is.",
      "Denk aan je logo bij de entree, je kernwaarden in de vergaderruimte of een quote in de kantine. We snijden elke tekst op maat en brengen hem aan.",
    ],
    voordelen: [
      "Strak gesneden, zonder achtergrond",
      "Mat vinyl voor een geschilderde look",
      "Op maat voor elke wand",
    ],
    vragen: [
      {
        vraag: "Op welke muren kan een muurtekst?",
        antwoord:
          "Op de meeste gladde, geverfde muren. Op een ruwe of pas geschilderde muur hecht vinyl minder goed. We kijken vooraf naar je ondergrond.",
      },
      {
        vraag: "Kan een muurtekst er later weer af?",
        antwoord:
          "Ja, maar bij het verwijderen kan verf meekomen, afhankelijk van de muur. Wil je een tekst vaker wisselen, vraag dan naar de mogelijkheden.",
      },
    ],
  },
  "interieur/interieurwrapping": {
    intro:
      "Meubels, balies, deuren en kasten een nieuwe look geven met architecturale wrapfolie. In hout-, beton- of staalstructuur, zonder te vervangen.",
    alineas: [
      "Met interieurwrapping bekleden we bestaande oppervlakken met speciale folie. Een verouderde balie of kast krijgt zo een nieuwe uitstraling, terwijl het meubel zelf blijft staan.",
      "De folie is er in veel structuren, zoals hout, beton en staal. Dat is vaak sneller dan vervangen en het levert minder afval op.",
    ],
    voordelen: [
      "Nieuwe look zonder te vervangen",
      "Hout-, beton- of staalstructuur",
      "Minder afval dan nieuw",
    ],
    vragen: [
      {
        vraag: "Welke oppervlakken kun je wrappen?",
        antwoord:
          "Gladde oppervlakken zoals balies, kasten, deuren en tafels. Zijn ze beschadigd of oneffen, dan bekijken we vooraf wat mogelijk is.",
      },
      kosten(
        "Wat kost interieurwrapping?",
        "de oppervlakken, de folie en de staat van de ondergrond",
      ),
    ],
  },
  "interieur/wandpanelen": {
    intro:
      "Foto- en logopanelen op helder acrylaat of geborsteld aluminium, gemonteerd met RVS-afstandshouders. Voor een verzorgde uitstraling in je ontvangstruimte.",
    alineas: [
      "Een wandpaneel is een print op of achter een plaat van acrylaat of aluminium. Met RVS-afstandshouders komt het paneel los van de muur, wat diepte geeft.",
      "Panelen met je logo passen goed in een receptie, wachtruimte of vergaderruimte. Ook een foto van je werk komt op een paneel mooi tot zijn recht.",
    ],
    voordelen: [
      "Helder acrylaat of geborsteld aluminium",
      "Gemonteerd met RVS-afstandshouders",
      "Op maat gemaakt",
    ],
    vragen: [
      {
        vraag: "Wat is het verschil tussen acrylaat en aluminium?",
        antwoord:
          "Acrylaat (plexiglas) is helder en geeft kleuren diepte en glans. Geborsteld aluminium heeft een metalen uitstraling die goed past bij een zakelijke ruimte.",
      },
      kosten(
        "Wat kost een wandpaneel?",
        "het formaat, het materiaal en het aantal panelen",
      ),
    ],
  },
  "raamfolie/zandstraalfolie": {
    intro:
      "Privacyfolie die eruitziet als gezandstraald glas. Voor kantoorramen, spreekkamers en voordeuren, eventueel met je logo of een patroon.",
    alineas: [
      "Zandstraalfolie maakt glas matglazig. Er komt nog steeds daglicht binnen, maar mensen kunnen niet meer naar binnen kijken.",
      "We kunnen een logo, tekst of patroon uit de folie snijden. Zo combineer je privacy met je huisstijl, bijvoorbeeld in een glazen deur of wand.",
    ],
    voordelen: [
      "Privacy met behoud van daglicht",
      "Eventueel met uitgesneden logo of patroon",
      "Later weer te verwijderen",
    ],
    vragen: [
      {
        vraag: "Kun je door zandstraalfolie heen kijken?",
        antwoord:
          "Nee, de folie is niet doorzichtig. Wel komt er daglicht doorheen. Van dichtbij zie je vage vormen, net als bij echt matglas.",
      },
      {
        vraag: "Wat moet ik doorgeven voor een offerte?",
        antwoord:
          "De maten van je ramen of glaswanden, hoeveel ramen het zijn en of de folie aan de binnen- of buitenkant komt. Een foto helpt ook.",
      },
    ],
  },
  "raamfolie/raambelettering": {
    intro:
      "Je logo, openingstijden, acties en one-way-visionfolie op je winkelruiten. Zo ziet iedereen die langsloopt wat je doet.",
    alineas: [
      "Je etalage is reclameruimte die je al hebt. Met raambelettering laat je je logo, openingstijden en contactgegevens zien, en met tijdelijke teksten je acties.",
      "One-way-visionfolie is aan de buitenkant bedrukt, terwijl je van binnen gewoon naar buiten blijft kijken. Zo gebruik je het hele raam voor reclame.",
    ],
    voordelen: [
      "Vaste belettering of tijdelijke acties",
      "One-way-vision voor reclame op het hele raam",
      "Strak gesneden en geplakt",
    ],
    vragen: [
      {
        vraag: "Wat is one-way-visionfolie?",
        antwoord:
          "Een geperforeerde folie die aan de buitenkant bedrukt is. Van buiten zie je je ontwerp, van binnen kijk je erdoorheen naar buiten.",
      },
      {
        vraag: "Kan ik tijdelijke actieteksten laten plakken?",
        antwoord:
          "Ja. Vertel bij je aanvraag hoe lang de tekst moet blijven zitten, dan kiezen we de folie die daarbij past.",
      },
    ],
  },
  "raamfolie/zonwerende-folie": {
    intro:
      "Raamfolies die warmte en uv-straling tegenhouden, of glas inbraakvertragend maken. Voor een koelere en veiligere werkplek.",
    alineas: [
      "Zonwerende folie houdt een deel van de zonnewarmte buiten. Dat maakt een kantoor of winkel koeler en vermindert schittering op schermen. Het uv-filter beschermt ook je interieur en producten tegen verkleuren.",
      "Veiligheidsfolie houdt glas bij breuk bij elkaar en maakt het lastiger om in te breken. We adviseren welke folie past bij je ramen en wat je ermee wilt bereiken.",
    ],
    voordelen: [
      "Minder warmte en schittering",
      "Uv-filter tegen verkleuren",
      "Inbraakvertragend, en glasscherven blijven bij elkaar",
    ],
    vragen: [
      {
        vraag: "Past zonwerende folie op elk raam?",
        antwoord:
          "Niet elke folie past op elk glas. Vooral bij dubbel glas kijken we vooraf naar het type glas, zodat er geen spanningsbreuk ontstaat. Geef daarom het type glas door als je dat weet.",
      },
      kosten(
        "Wat kost zonwerende folie?",
        "het type folie, het aantal ramen en de maten",
      ),
    ],
  },
  "ontwerp/ontwerp-en-visualisatie": {
    intro:
      "We vertalen je huisstijl naar je voertuigen, gevel of ruimte. Vooraf zie je met werktekeningen op schaal precies hoe het eruit komt te zien.",
    alineas: [
      "Een logo dat op je visitekaartje mooi staat, past niet altijd zomaar op een bus of gevel. We maken een ontwerp dat werkt op het formaat en de vorm van je voertuig of pand.",
      "Voordat we iets maken, krijg je een visualisatie en een werktekening op schaal. Zo weet je precies wat je krijgt en kun je nog aanpassingen doorgeven.",
    ],
    voordelen: [
      "Ontwerp dat past bij je voertuig of pand",
      "Vooraf een werktekening op schaal",
      "Ruimte voor aanpassingen voordat we iets maken",
    ],
    vragen: [
      {
        vraag: "Moet ik al een ontwerp hebben?",
        antwoord:
          "Nee. Heb je alleen een logo of een idee, dan maken we het ontwerp voor je. Heb je al een ontwerp, dan controleren we of het geschikt is.",
      },
      kosten(
        "Wat kost een ontwerp?",
        "wat er ontworpen moet worden en wat je al hebt",
      ),
    ],
  },
  "ontwerp/dtp": {
    intro:
      "Logo's vectoriseren en snij- en printbestanden drukklaar maken. Zodat je reclame op elk formaat scherp is.",
    alineas: [
      "Voor belettering en grote prints is een goed bestand nodig. Een kleine afbeelding van je logo wordt op een bus of gevel al snel wazig.",
      "We vectoriseren je logo: we zetten het om naar lijnen en vlakken, zodat het op elk formaat scherp blijft en uit folie gesneden kan worden. Ook printbestanden maken we drukklaar.",
    ],
    voordelen: [
      "Elk bestand is welkom",
      "Logo's scherp op elk formaat",
      "Snij- en printbestanden drukklaar",
    ],
    vragen: [
      {
        vraag: "Wat is vectoriseren?",
        antwoord:
          "Je logo omzetten van pixels naar lijnen en vlakken. Een vectorbestand blijft scherp, hoe groot je het ook maakt, en is nodig om letters uit folie te snijden.",
      },
      bestandenVraag,
    ],
  },
  "ontwerp/beurssigning": {
    intro:
      "Presentatiewanden, peesdoekframes, displays en tijdelijke bewegwijzering. Zodat je op een beurs of evenement direct opvalt.",
    alineas: [
      "Op een beurs heb je maar een paar seconden om op te vallen. Met een presentatiewand, banners en displays in je huisstijl zien bezoekers meteen wie je bent.",
      "Voor evenementen maken we ook tijdelijke bewegwijzering, zodat bezoekers de weg vinden. Geef bij je aanvraag de datum door, dan plannen we de productie daarop.",
    ],
    voordelen: [
      "Alles in je eigen huisstijl",
      "Frames en displays die je vaker gebruikt",
      "Tijdelijke bewegwijzering voor evenementen",
    ],
    vragen: [
      {
        vraag: "Kan ik mijn beursmateriaal opnieuw gebruiken?",
        antwoord:
          "Ja. Frames en displays kun je vaker gebruiken. Bij peesdoekframes vervang je later alleen het doek.",
      },
      {
        vraag: "Hoe ver van tevoren moet ik bestellen?",
        antwoord:
          "Dat hangt af van wat je nodig hebt. Neem zo vroeg mogelijk contact op en geef de datum van je beurs of evenement door.",
      },
    ],
  },
  "ontwerp/demontage": {
    intro:
      "Oude folie, belettering en lijmresten vakkundig verwijderen. Bijvoorbeeld bij een nieuwe huisstijl, of als je een bedrijfswagen verkoopt.",
    alineas: [
      "Verkoop je een bedrijfswagen of krijg je een nieuwe huisstijl? Dan moet de oude belettering eraf. We verwijderen folie en belettering zorgvuldig, en halen ook de lijmresten weg.",
      "Zelf folie verwijderen kan lakschade of lijmresten opleveren, vooral bij oudere folie. Met de juiste aanpak en middelen beperk je dat risico.",
    ],
    voordelen: [
      "Zorgvuldig verwijderd, inclusief lijmresten",
      "Te combineren met nieuwe belettering",
      "Ervaring met oude en harde folie",
    ],
    vragen: [
      {
        vraag: "Blijven er lijmresten achter?",
        antwoord:
          "Nee, we halen ook de lijmresten weg. Bij heel oude folie kost dat meer tijd, maar je houdt een schone ondergrond over.",
      },
      {
        vraag: "Kan ik demontage combineren met nieuwe belettering?",
        antwoord:
          "Ja. Dan verwijderen we eerst de oude belettering en brengen we daarna de nieuwe aan.",
      },
    ],
  },
};
