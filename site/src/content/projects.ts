/**
 * Project catalogue — the 7 dedicated case pages + the gallery filter source.
 *
 * Texts are transcribed verbatim from the official project descriptions
 * provided by Adam in /assets/projekter/*.docx. Two cosmetic adjustments
 * relative to the source documents:
 *
 *   - Whitespace normalised (collapsed runs of spaces, em-dashes kept).
 *   - "Jyderrup" corrected to "Jyderup" (the actual Danish spelling).
 *
 * Slug = URL segment under /projekter/[slug]. Don't change slugs after
 * deploy — they're part of our public sitemap and inbound link surface.
 */

export type ProjectCategory = "erhverv" | "institutioner" | "privat";

export interface Project {
  slug: string;
  title: string;
  location: string;
  category: ProjectCategory;
  categoryLabel: string;
  service: string;
  /** Human-readable execution window — e.g. "April – juni 2025". */
  period?: string;
  /** Client / bygherre. */
  client: string;
  /** One-sentence card subtitle + meta description. */
  summary: string;
  /** Full project story, one paragraph per array entry. */
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
    period: "April – juni 2025",
    client: "Hotel Mayfair",
    summary:
      "Renovering og malerbehandling af 6 bagtrapper i forbindelse med istandsættelse af Hotel Mayfair i København.",
    description: [
      "Malerfirmaet Bach ApS har udført renovering og malerbehandling af 6 bagtrapper i forbindelse med istandsættelse af Hotel Mayfair i København.",
      "Opgaven omfattede behandling af meget slidte overflader med fokus på grundig forberedelse og holdbare løsninger. Arbejdet blev udført i perioden april til juni 2025 med effektiv planlægning og høj kvalitet i udførelsen.",
      "Resultatet er seks bagtrapper, der er løftet fra nedslidt stand til et ensartet og professionelt udtryk, hvor de fremstår som nye.",
    ],
    hero: "/images/projects/hotel-mayfair/Projekt Hotel Mayfair.jpg",
    thumbnail: "/images/projects/hotel-mayfair/Projekt Hotel Mayfair.jpg",
    gallery: [
      { src: "/images/projects/hotel-mayfair/Projekt Hotel Mayfair.jpg", alt: "Hotel Mayfair – renoveret bagtrappe", tag: "efter" },
    ],
    featured: true,
  },
  {
    slug: "novo-lyngby",
    title: "Novo Nordisk, Lyngby",
    location: "Lyngby",
    category: "erhverv",
    categoryLabel: "Erhverv",
    service: "Totalrenovering · kontordomicil",
    period: "August 2025 – januar 2026",
    client: "Novo Nordisk",
    summary:
      "Totalrenovering af Novo Nordisks kontordomicil i Lyngby — kontorer, atrium, køkkener, kantine, kælder- og toiletfaciliteter.",
    description: [
      "Malerfirmaet Bach ApS har udført malerarbejde i forbindelse med totalrenovering af kontordomicil for Novo Nordisk i Lyngby.",
      "Opgaven omfattede renovering og malerbehandling af kontorer, atrium, køkkener, kantine, kælder- og toiletfaciliteter. Projektet stillede høje krav til finish, præcision og koordinering på tværs af mange forskellige områder.",
      "Arbejdet blev udført i perioden august 2025 til januar 2026 med fokus på effektiv planlægning og sikker gennemførelse. Der er anvendt et bredt udvalg af farver og overfladebehandlinger, hvilket har bidraget til et moderne og visuelt stærkt arbejdsmiljø.",
      "Resultatet er funktionelle og æstetisk gennemførte rammer, der understøtter dagligdagen for medarbejderne.",
    ],
    hero: "/images/projects/novo-lyngby/20251002_143825.jpg",
    thumbnail: "/images/projects/novo-lyngby/20251002_143825.jpg",
    gallery: [
      { src: "/images/projects/novo-lyngby/20251002_143825.jpg", alt: "Novo Nordisk Lyngby – kontorområde", tag: "efter" },
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
    service: "Industriel malerentreprise · PPV",
    period: "Juni 2025 – marts 2026",
    client: "Novo Nordisk A/S",
    summary:
      "Malerarbejde på Novo Nordisks nye produktionsfaciliteter — Purification Plant 5 (PPV) — i Kalundborg.",
    description: [
      "Malerfirmaet Bach ApS stod for malerarbejdet på Novo Nordisks nye produktionsfaciliteter i Kalundborg — Purification Plant 5 (PPV). Anlægget sikrer Novo Nordisks kapacitet til at producere aktive farmaceutiske ingredienser (API) og rummer samtidig en intern innovationshub med fokus på udvikling af nye produktionsteknologier.",
      "Som malerentreprenør udførte vi alle indvendige bygningsdele — herunder vægge, lofter, døre og malerarbejde.",
    ],
    hero: "/images/projects/novo-kalundborg/Novo Nordisk Kalundborg PPV.jpg",
    thumbnail: "/images/projects/novo-kalundborg/Novo Nordisk Kalundborg PPV.jpg",
    gallery: [
      { src: "/images/projects/novo-kalundborg/Novo Nordisk Kalundborg PPV.jpg", alt: "Novo Nordisk Kalundborg – Purification Plant 5", tag: "efter" },
    ],
  },
  {
    slug: "kulturporten",
    title: "Kulturporten, Farum",
    location: "Farum",
    category: "institutioner",
    categoryLabel: "Institutioner",
    service: "Indvendig malerbehandling · nybyggeri",
    period: "Marts – august 2025",
    client: "Kulturporten Farum",
    summary:
      "Komplet indvendig malerbehandling i forbindelse med nybyggeri af ca. 120 boliger i Kulturporten, Farum.",
    description: [
      "Malerfirmaet Bach ApS har udført malerbehandling i forbindelse med nybyggeri af ca. 120 boliger i Kulturporten, Farum.",
      "Opgaven omfattede komplet indvendig malerbehandling med fokus på ensartet finish og høj kvalitet på tværs af alle boliger. Projektet blev gennemført i perioden marts til august 2025 med effektiv planlægning og tæt koordinering.",
      "Resultatet er moderne boliger med et professionelt og holdbart malerarbejde, leveret inden for den aftalte tidsramme.",
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
    title: "Mjølnerparken, København N",
    location: "København N",
    category: "erhverv",
    categoryLabel: "Boligforening",
    service: "Renovering af flytteboliger · fællesarealer",
    period: "Januar 2025 – januar 2026",
    client: "Mjølnerparken",
    summary:
      "Malerarbejde i forbindelse med istandsættelse af ca. 100 boliger samt tilhørende kælderområder i Mjølnerparken, København N.",
    description: [
      "Malerfirmaet Bach ApS har udført malerarbejde i forbindelse med istandsættelse af ca. 100 boliger samt tilhørende kælderområder i Mjølnerparken, København N.",
      "Opgaven omfattede løbende renovering af flytteboliger med fokus på effektiv udførelse, fleksibel planlægning og ensartet kvalitet på tværs af alle enheder. Arbejdet blev gennemført i perioden januar 2025 til januar 2026 med høj grad af koordinering.",
      "Resultatet er velistandsatte boliger klar til indflytning samt opdaterede fællesarealer med et professionelt og holdbart finish.",
    ],
    hero: "/images/projects/mjolnerparken/intro1-4096x2304.jpg",
    thumbnail: "/images/projects/mjolnerparken/intro1-4096x2304.jpg",
    gallery: [
      { src: "/images/projects/mjolnerparken/intro1-4096x2304.jpg", alt: "Mjølnerparken – facade", tag: "efter" },
    ],
  },
  {
    slug: "lygten",
    title: "Lygten C, København NV",
    location: "København NV",
    category: "erhverv",
    categoryLabel: "Erhverv",
    service: "Malerentreprise · etagebyggeri",
    period: "Juni 2025 – april 2026",
    client: "Almene ungdoms- og seniorboliger",
    summary:
      "Malerentreprise i forbindelse med opførelsen af etagebyggeri i 5 og 6 etager med 70 boliger på Lygten C i København NV.",
    description: [
      "Malerfirmaet Bach ApS har udført malerentreprisen i forbindelse med opførelsen af etagebyggeri i 5 og 6 etager med et samlet bruttoetageareal på ca. 3.800 m² bolig i Lygten C, København NV.",
      "Projektet omfattede malerbehandling af i alt 70 boliger, fordelt på 45 almene ungdomsboliger og 25 almene seniorboliger. Arbejdet er udført med fokus på ensartet finish, høj kvalitet og tilpasning til forskellige boligtyper.",
      "Opgaven er gennemført i perioden juni 2025 til april 2026 med effektiv planlægning og tæt koordinering, hvilket har sikret et professionelt resultat på tværs af hele byggeriet.",
    ],
    hero: "/images/projects/lygten/Projekt Lygten.webp",
    thumbnail: "/images/projects/lygten/Projekt Lygten.webp",
    gallery: [
      { src: "/images/projects/lygten/Projekt Lygten.webp", alt: "Lygten C – etagebyggeri", tag: "efter" },
    ],
  },
  {
    slug: "holmstrup-jyderup",
    title: "Holmstrup Byvej, Jyderup",
    location: "Jyderup",
    category: "privat",
    categoryLabel: "Privat",
    service: "Indvendig maling · nybyggeri",
    period: "Juli – oktober 2025",
    client: "Privatkunde",
    summary:
      "Indvendigt malerarbejde i forbindelse med nybyggeri af privat hus på Holmstrup Byvej i Jyderup.",
    description: [
      "Malerfirmaet Bach ApS har udført indvendigt malerarbejde i forbindelse med nybyggeri af et hus på Holmstrup Byvej i Jyderup.",
      "Opgaven omfattede fuldspartling, opsætning af filt og maling af alle vægge til en ensartet og dækkende overflade. Lofter i gips og akustikplader er spartlet og malet, herunder behandling af ovenlys for et ensartet udtryk. Træværk, herunder fodpaneler og indfatninger, er spartlet, fuget og færdigmalet.",
      "Arbejdet er udført i perioden juli til oktober 2025 med fokus på præcision, ensartet finish og høj kvalitet i alle overflader.",
      "Resultatet er et nyopført hus med moderne, rene og professionelt udførte overflader.",
    ],
    hero: "/images/projects/holmstrup-jyderup/20250724_155427.jpg",
    thumbnail: "/images/projects/holmstrup-jyderup/20250724_155427.jpg",
    gallery: [
      { src: "/images/projects/holmstrup-jyderup/20250724_155427.jpg", alt: "Holmstrup Byvej – stue", tag: "efter" },
      { src: "/images/projects/holmstrup-jyderup/20250724_155553.jpg", alt: "Holmstrup Byvej – soveværelse", tag: "efter" },
      { src: "/images/projects/holmstrup-jyderup/20250724_155635.jpg", alt: "Holmstrup Byvej – gang", tag: "efter" },
      { src: "/images/projects/holmstrup-jyderup/20250724_160002.jpg", alt: "Holmstrup Byvej – detalje", tag: "efter" },
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
