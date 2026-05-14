/**
 * Project catalogue — the 7 dedicated case pages + the gallery filter source.
 * Slug = URL segment under /projekter/[slug].
 */

export type ProjectCategory = "erhverv" | "institutioner" | "privat";

export interface Project {
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  categoryLabel: string;
  service: string;
  year?: string;
  client: string;
  summary: string;
  description: string[];
  hero: string;
  thumbnail: string;
  gallery: { src: string; alt: string; tag?: "før" | "efter" }[];
  quote?: { text: string; author: string };
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "hotel-mayfair",
    title: "Hotel Mayfair",
    location: "København",
    category: "erhverv",
    categoryLabel: "Erhverv",
    service: "Hotelrenovering",
    client: "Hotel Mayfair",
    summary:
      "Renovering af receptionsområde, gange og udvalgte værelser. Udført i tidsrum hvor hotellet havde lav belægning.",
    description: [
      "Hotel Mayfair i centrum af København fik et omfattende makeover af vores team. Vi koordinerede arbejdet med hotellets driftschef, så maleropgaverne kunne udføres uden at gæsterne blev forstyrret.",
      "Vi brugte støjsvage værktøjer og afdækkede grundigt for at sikre at hotellet kunne fungere normalt under hele forløbet.",
    ],
    hero: "/images/projects/hotel-mayfair/Projekt Hotel Mayfair.jpg",
    thumbnail: "/images/projects/hotel-mayfair/Projekt Hotel Mayfair.jpg",
    gallery: [
      { src: "/images/projects/hotel-mayfair/Projekt Hotel Mayfair.jpg", alt: "Hotel Mayfair – fællesarealer efter renovering", tag: "efter" },
    ],
    featured: true,
  },
  {
    slug: "novo-lyngby",
    title: "Novo Nordisk, Lyngby",
    location: "Lyngby",
    category: "erhverv",
    categoryLabel: "Erhverv",
    service: "Erhvervsmaling",
    client: "Novo Nordisk",
    summary:
      "Maling af kontorer, gange og fællesarealer i Novo Nordisks Lyngby-domicil. Arbejdet udført i etaper for at minimere driftsforstyrrelser.",
    description: [
      "Novo Nordisks kontor i Lyngby skulle have et professionelt løft af interiøret. Vi delte opgaven op i flere etaper, så medarbejderne kunne arbejde uforstyrret.",
      "Materialerne blev valgt med fokus på slidstyrke og lav lugtafgivelse, så luftkvaliteten var god under hele forløbet.",
    ],
    hero: "/images/projects/novo-lyngby/20251002_143715.jpg",
    thumbnail: "/images/projects/novo-lyngby/20251002_143715.jpg",
    gallery: [
      { src: "/images/projects/novo-lyngby/20251002_143715.jpg", alt: "Novo Nordisk Lyngby – kontorområde", tag: "efter" },
      { src: "/images/projects/novo-lyngby/20251002_143720.jpg", alt: "Novo Nordisk Lyngby – gang", tag: "efter" },
      { src: "/images/projects/novo-lyngby/20251002_143739.jpg", alt: "Novo Nordisk Lyngby – mødelokale", tag: "efter" },
      { src: "/images/projects/novo-lyngby/20251002_143746.jpg", alt: "Novo Nordisk Lyngby – detalje", tag: "efter" },
      { src: "/images/projects/novo-lyngby/20251002_143753.jpg", alt: "Novo Nordisk Lyngby – fællesareal", tag: "efter" },
      { src: "/images/projects/novo-lyngby/20251002_143825.jpg", alt: "Novo Nordisk Lyngby – kontor 2", tag: "efter" },
    ],
    featured: true,
  },
  {
    slug: "novo-kalundborg",
    title: "Novo Nordisk, Kalundborg",
    location: "Kalundborg",
    category: "erhverv",
    categoryLabel: "Erhverv",
    service: "Industri-/Erhvervsmaling",
    client: "Novo Nordisk",
    summary:
      "Industrielt malerarbejde på Novo Nordisks produktionsfacilitet i Kalundborg.",
    description: [
      "Vi udførte specialiseret industriel maling på Novo Nordisks store produktionsanlæg i Kalundborg.",
      "Opgaven krævede særlig fokus på sikkerhed og hygiejnemæssige standarder, som vi opfyldte gennem hele processen.",
    ],
    hero: "/images/projects/novo-kalundborg/Novo Nordisk Kalundborg PPV.jpg",
    thumbnail: "/images/projects/novo-kalundborg/Novo Nordisk Kalundborg PPV.jpg",
    gallery: [
      { src: "/images/projects/novo-kalundborg/Novo Nordisk Kalundborg PPV.jpg", alt: "Novo Nordisk Kalundborg – produktionsfacilitet", tag: "efter" },
    ],
  },
  {
    slug: "kulturporten",
    title: "Kulturporten, Farum",
    location: "Farum",
    category: "institutioner",
    categoryLabel: "Institutioner",
    service: "Renovering af kulturhus",
    client: "Furesø Kommune",
    summary:
      "Maling af kulturhusets fællesarealer og lokaler. Arbejdet blev koordineret med løbende aktiviteter i huset.",
    description: [
      "Kulturporten i Farum er et samlingssted for områdets borgere. Vi malede både publikumsarealer, kontorer og bag-scenen-områder.",
      "Vi tilpassede arbejdstider efter husets aktiviteter, så besøgende ikke blev påvirket.",
    ],
    hero: "/images/projects/kulturporten/20250504_140839.jpg",
    thumbnail: "/images/projects/kulturporten/20250504_140839.jpg",
    gallery: [
      { src: "/images/projects/kulturporten/20250504_140839.jpg", alt: "Kulturporten – fællesareal", tag: "efter" },
      { src: "/images/projects/kulturporten/20250505_124236.jpg", alt: "Kulturporten – detalje", tag: "efter" },
      { src: "/images/projects/kulturporten/20250507_085251.jpg", alt: "Kulturporten – mødelokale", tag: "efter" },
      { src: "/images/projects/kulturporten/20250507_085322.jpg", alt: "Kulturporten – kontor", tag: "efter" },
      { src: "/images/projects/kulturporten/20250507_085434.jpg", alt: "Kulturporten – gang", tag: "efter" },
      { src: "/images/projects/kulturporten/20250507_085510.jpg", alt: "Kulturporten – sal", tag: "efter" },
    ],
    featured: true,
  },
  {
    slug: "mjolnerparken",
    title: "Mjølnerparken",
    location: "København N",
    category: "erhverv",
    categoryLabel: "Boligforening",
    service: "Renovering af boligkompleks",
    client: "Mjølnerparken",
    summary:
      "Større malerprojekt i forbindelse med renovering af boligkomplekset Mjølnerparken på Nørrebro.",
    description: [
      "Mjølnerparken gennemgik en omfattende renovering, hvor vi stod for den udvendige og indvendige malerentreprise.",
      "Vi koordinerede tæt med beboerne og de øvrige håndværkere for at minimere generne under arbejdet.",
    ],
    hero: "/images/projects/mjolnerparken/intro1-4096x2304.jpg",
    thumbnail: "/images/projects/mjolnerparken/intro1-4096x2304.jpg",
    gallery: [
      { src: "/images/projects/mjolnerparken/intro1-4096x2304.jpg", alt: "Mjølnerparken – facade", tag: "efter" },
    ],
  },
  {
    slug: "lygten",
    title: "Lygten",
    location: "København NV",
    category: "erhverv",
    categoryLabel: "Erhverv",
    service: "Erhvervsmaling",
    client: "Privat erhverv",
    summary:
      "Erhvervsmaling på Lygten i Københavns nordvestkvarter — moderne kontormiljø.",
    description: [
      "Lygten-projektet omfattede maling af moderne kontorlokaler med fokus på rene linjer og en stilren finish.",
    ],
    hero: "/images/projects/lygten/Projekt Lygten.webp",
    thumbnail: "/images/projects/lygten/Projekt Lygten.webp",
    gallery: [
      { src: "/images/projects/lygten/Projekt Lygten.webp", alt: "Lygten – kontor", tag: "efter" },
    ],
  },
  {
    slug: "holmstrup-jyderup",
    title: "Privat villa, Holmstrup",
    location: "Jyderup",
    category: "privat",
    categoryLabel: "Privat",
    service: "Indvendig maling",
    client: "Privatkunde",
    summary:
      "Komplet indvendig maling af privat villa på Holmstrup Byvej. Stuer, soveværelser, gange og badeværelser.",
    description: [
      "Et privat hjem i Jyderup fik en komplet indvendig renovering. Vi malede stuer, soveværelser, gange og badeværelser med stor omhu for detaljer.",
      "Familien kunne flytte tilbage uden generende lugte eller pletter — vi efterlod boligen klar til indflytning.",
    ],
    hero: "/images/projects/holmstrup-jyderup/20250724_155427.jpg",
    thumbnail: "/images/projects/holmstrup-jyderup/20250724_155427.jpg",
    gallery: [
      { src: "/images/projects/holmstrup-jyderup/20250724_155427.jpg", alt: "Holmstrup villa – stue", tag: "efter" },
      { src: "/images/projects/holmstrup-jyderup/20250724_155553.jpg", alt: "Holmstrup villa – soveværelse", tag: "efter" },
      { src: "/images/projects/holmstrup-jyderup/20250724_155635.jpg", alt: "Holmstrup villa – gang", tag: "efter" },
      { src: "/images/projects/holmstrup-jyderup/20250724_160002.jpg", alt: "Holmstrup villa – detalje", tag: "efter" },
    ],
  },
];

export const categoryFilters: { value: ProjectCategory | "alle"; label: string }[] = [
  { value: "alle", label: "Alle projekter" },
  { value: "erhverv", label: "Erhverv" },
  { value: "institutioner", label: "Institutioner" },
  { value: "privat", label: "Privat" },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured).slice(0, 3);
}
