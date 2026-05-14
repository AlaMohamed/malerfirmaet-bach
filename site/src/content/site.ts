/**
 * Site content — single source of truth for hard-coded content.
 * Designed to mirror Notion schema; later replaceable with a Notion API loader.
 *
 * @see ../app/page.tsx — consumed across all pages
 */

export const company = {
  name: "Malerfirmaet Bach ApS",
  tagline: "Et ord er et ord.",
  cvr: "44071150",
  cvrFormatted: "44 07 11 50",
  address: {
    street: "Høje Gladsaxe 68",
    postal: "2860",
    city: "Søborg",
    country: "Danmark",
  },
  phone: "41 44 07 11",
  phoneE164: "+4541440711",
  email: "info@malerfirmaetbach.dk",
  hours: {
    weekdays: "Man–fre 07:00–17:30",
    weekend: "Weekend efter aftale",
  },
  url: "https://malerfirmaetbach.dk",
  areas: ["København", "Sjælland"],
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61554423687843",
    instagram: "https://www.instagram.com/malerfirmaetbachaps/",
  },
};

export const hero = {
  eyebrow: "København & Sjælland",
  titleA: "Malerfirmaet bag",
  titleB: "Radisson, Scandic",
  titleC: "og Carlsberg Byen.",
  sub: "Erhvervs- og privatmaling i København og på Sjælland. Vi holder aftalt tid og pris — og kvaliteten ses på håndværket.",
  ctaPrimary: { label: "Book uforpligtende besigtigelse", href: "/book-besigtigelse" },
  ctaSecondary: { label: "Se projekter", href: "/projekter" },
  stats: [
    { value: "12+", label: "Hoteller renoveret" },
    { value: "100%", label: "Aftalt pris holdt" },
    { value: "KBH", label: "& Sjælland" },
  ],
};

export const services = [
  {
    slug: "indvendig-maling",
    title: "Indvendig maling",
    short: "Vægge, lofter og træværk i boliger og erhverv.",
    desc: "Grundig forberedelse, rene kanter og slidstærke materialer. Vi afdækker pænt og rydder op hver dag.",
  },
  {
    slug: "udvendig-maling",
    title: "Udvendig maling",
    short: "Facader, vinduer, døre og udvendigt træværk.",
    desc: "Vejrbestandige systemer og professionel afdækning. Vi vurderer alt fra fugt til klargøring.",
  },
  {
    slug: "erhverv-institutioner",
    title: "Erhverv og institutioner",
    short: "Hoteller, børnehaver, kontorer og byggeprojekter.",
    desc: "Vi arbejder i weekender, om natten og uden for åbningstid for at minimere forstyrrelse.",
  },
  {
    slug: "totalrenovering",
    title: "Totalrenovering",
    short: "Vi koordinerer hele projektet — én kontaktperson.",
    desc: "Maler-, tømrer- og gartnerarbejde samlet under ét, så du kun har én ansvarlig.",
  },
  {
    slug: "sproejtemaling",
    title: "Sprøjtemaling",
    short: "Ensartet finish på store flader.",
    desc: "Ideel til nybyg og store erhvervsopgaver hvor finish skal være uden synlige strøg.",
  },
  {
    slug: "farvekonsultation",
    title: "Farvekonsultation",
    short: "Rådgivning om farve- og materialevalg.",
    desc: "Vi sikrer at resultatet matcher rummets brug, lys og holdbarhed — ikke kun trends.",
  },
];

export const usps = [
  {
    title: "Ordholdenhed",
    desc: "Vi overholder aftalt tid og pris. Ingen skjulte tillæg.",
  },
  {
    title: "Kvalitetsgaranti",
    desc: "Intern kvalitetskontrol gennem hele projektet.",
  },
  {
    title: "Anerkendte materialer",
    desc: "Vi bruger de bedste produkter fra faste leverandører.",
  },
  {
    title: "Klar dialog",
    desc: "Én kontaktperson, ingen forvirring, hurtige svar.",
  },
];

export const processSteps = [
  {
    n: 1,
    title: "Dialog og besigtigelse",
    desc: "Vi møder op, lytter og forstår opgaven fuldt ud.",
  },
  {
    n: 2,
    title: "Klar aftale",
    desc: "Skriftligt tilbud med aftalt tid, pris og kvalitet. Ingen skjulte tillæg.",
  },
  {
    n: 3,
    title: "Udførelse med kvalitetskontrol",
    desc: "Anerkendte materialer og løbende kvalitetstjek.",
  },
  {
    n: 4,
    title: "Aflevering og efterservice",
    desc: "Vi afleverer først, når du er tilfreds. Ingen kompromiser.",
  },
];

export const testimonial = {
  quote:
    "Adam var meget serviceminded og resultatorienteret. De leverede et fremragende stykke kvalitetshåndværk og overholdt den aftalte tid og pris. Efter totalrenovationen kom kommunen på besøg og godkendte alt det udførte arbejde.",
  author: "Ingolf & Ghufran",
  role: "Børnehaveprojekt · Totalrenovering",
  initials: "IG",
};

/**
 * Trusted-by ticker on the homepage.
 *
 * `logo` (optional) points to /public/images/partners/<file>.
 * `category` adds an editorial subtitle that shows on hover.
 */
export const trustedBy = [
  { name: "Radisson Blu Scandinavia", category: "Hotel", logo: "/images/partners/logo_radisson_tinted.png" },
  { name: "Scandic Hvidovre",         category: "Hotel", logo: "/images/partners/logo_scandic_tinted.png" },
  { name: "Carlsberg Byen",           category: "Bygherre", logo: "/images/partners/logo_carlsberg_byen.jpg" },
  { name: "Novo Nordisk",             category: "Erhverv" },
  { name: "Hotel Mayfair",            category: "Hotel" },
  { name: "Herlev Kro & Hotel",       category: "Hotel" },
  { name: "Hotel Sanders",            category: "Hotel" },
  { name: "Hotel Nora",               category: "Hotel" },
  { name: "Urban House Copenhagen",   category: "Hotel" },
  { name: "Kulturporten Farum",       category: "Kulturhus" },
  { name: "Mjølnerparken",            category: "Boligkompleks" },
  { name: "Børnehaven Vibevænget",    category: "Institution" },
  { name: "Børnehaven Ved Fortet",    category: "Institution" },
  { name: "Fiomagården",              category: "Erhverv" },
];

// Backward compatibility (text-only list)
export const clients = [
  "Radisson Blu Scandinavia",
  "Scandic Hvidovre",
  "Hotel Sanders",
  "Hotel Nora",
  "Urban House Copenhagen",
  "Herlev Kro & Hotel",
  "Hotel Mayfair",
  "Carlsberg Byen",
  "Novo Nordisk",
  "Mjølnerparken",
  "Fiomagården",
  "3Byggetilbud",
  "Børnehaven Vibevænget",
  "Børnehaven Ved Fortet",
  "Kulturporten Farum",
];

export const faq = [
  {
    q: "Hvad koster et tilbud?",
    a: "Et tilbud er altid gratis og uforpligtende. Vi besigter opgaven og sender et skriftligt tilbud inden for 1–2 hverdage.",
  },
  {
    q: "Arbejder I i weekender?",
    a: "Ja. For erhvervskunder kan vi tilrettelægge arbejdet, så det forstyrrer driften mindst muligt — herunder weekender og aftener.",
  },
  {
    q: "Dækker I hele Danmark?",
    a: "Vi arbejder primært i København og på Sjælland. Kontakt os, og vi vurderer om vi kan hjælpe med din opgave.",
  },
  {
    q: "Hvad er jeres garanti?",
    a: "Vi afleverer ikke arbejdet, før du er tilfreds. Vi bruger anerkendte materialer og følger branchens standarder for kvalitet og reklamationsret.",
  },
  {
    q: "Kan I stå for hele renoveringen?",
    a: "Ja. Vi koordinerer maler-, tømrer- og gartnerarbejde og er din ene kontaktperson gennem hele projektet.",
  },
  {
    q: "Hvornår kan I starte?",
    a: "Det afhænger af opgavens størrelse og vores aktuelle kapacitet. Kontakt os, og vi finder en startdato der passer jer.",
  },
];

export const booking = {
  // Calendly event URL — public, safe to expose
  calendlyUrl: "https://calendly.com/malerfirmaetbach-info/30min",
};

export const nav = {
  primary: [
    { label: "Forside", href: "/" },
    { label: "Projekter", href: "/projekter" },
    { label: "Om os", href: "/om-os" },
    { label: "Kontakt", href: "/kontakt" },
  ],
  cta: { label: "Book besigtigelse", href: "/book-besigtigelse" },
};
