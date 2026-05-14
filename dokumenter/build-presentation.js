// Malerfirmaet Bach ApS — Shareholder Presentation Builder
// Generates a professional pptx for the new digital platform.

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const {
  FaCheckCircle,
  FaShieldAlt,
  FaCalendarAlt,
  FaEnvelopeOpenText,
  FaDatabase,
  FaPaintRoller,
  FaGlobe,
  FaMobileAlt,
  FaSearch,
  FaUniversalAccess,
  FaCloud,
  FaCogs,
  FaLock,
  FaChartLine,
  FaUsers,
  FaImages,
  FaLightbulb,
  FaArrowRight,
  FaStar,
  FaClipboardCheck,
  FaUserCheck,
  FaMoneyBillWave,
  FaRocket,
  FaCloudUploadAlt,
  FaServer,
  FaFileAlt,
  FaBell,
  FaEye,
  FaEdit,
  FaLanguage,
  FaCookieBite,
  FaTachometerAlt,
  FaKey,
  FaBriefcase,
} = require("react-icons/fa");

// =============================================
// COLOR PALETTE (Bach brand + Apple cinematic)
// =============================================
const C = {
  // Brand
  sage:        "7a9e9a",
  sageDark:    "5a7e7a",
  sageLight:   "a8c2bf",
  sageGhost:   "edf2f1",

  // Foundation
  charcoal:    "2d3748",
  charDark:    "1a202c",
  black:       "0d1117",
  offwhite:    "F7F6F2",
  white:       "FFFFFF",

  // Greys
  warmGray:    "718096",
  lightGray:   "E2E8F0",
  midGray:     "A0AEC0",
  paleGray:    "F1F1EE",

  // Accents
  goldAccent:  "C7A560",
  redAccent:   "C76E5B",
  greenOK:     "68a690",
};

const FONT_HEADER = "Georgia";
const FONT_BODY   = "Calibri";

// =============================================
// ICON HELPERS
// =============================================
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// Each shadow object must be fresh (pptxgenjs mutates them)
const sShadow = () => ({ type: "outer", blur: 8, offset: 2, color: "000000", opacity: 0.10 });
const sShadowLg = () => ({ type: "outer", blur: 14, offset: 4, color: "000000", opacity: 0.18 });

// =============================================
// MAIN
// =============================================
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.author = "Malerfirmaet Bach ApS";
  pres.title  = "Ny digital platform — Strategisk præsentation";
  pres.company = "Malerfirmaet Bach ApS";

  const W = 13.333;
  const H = 7.5;

  // Pre-render icons
  const icons = {};
  const iconJobs = [
    ["check",        FaCheckCircle,      "#" + C.sage],
    ["shield",       FaShieldAlt,        "#" + C.sage],
    ["calendar",     FaCalendarAlt,      "#" + C.sage],
    ["mail",         FaEnvelopeOpenText, "#" + C.sage],
    ["db",           FaDatabase,         "#" + C.sage],
    ["roller",       FaPaintRoller,      "#" + C.sage],
    ["globe",        FaGlobe,            "#" + C.sage],
    ["mobile",       FaMobileAlt,        "#" + C.sage],
    ["search",       FaSearch,           "#" + C.sage],
    ["a11y",         FaUniversalAccess,  "#" + C.sage],
    ["cloud",        FaCloud,            "#" + C.sage],
    ["cogs",         FaCogs,             "#" + C.sage],
    ["lock",         FaLock,             "#" + C.sage],
    ["chart",        FaChartLine,        "#" + C.sage],
    ["users",        FaUsers,            "#" + C.sage],
    ["images",       FaImages,           "#" + C.sage],
    ["lightbulb",    FaLightbulb,        "#" + C.sage],
    ["arrow",        FaArrowRight,       "#" + C.sage],
    ["star",         FaStar,             "#" + C.sage],
    ["clipboard",    FaClipboardCheck,   "#" + C.sage],
    ["userCheck",    FaUserCheck,        "#" + C.sage],
    ["money",        FaMoneyBillWave,    "#" + C.sage],
    ["rocket",       FaRocket,           "#" + C.sage],
    ["upload",       FaCloudUploadAlt,   "#" + C.sage],
    ["server",       FaServer,           "#" + C.sage],
    ["file",         FaFileAlt,          "#" + C.sage],
    ["bell",         FaBell,             "#" + C.sage],
    ["eye",          FaEye,              "#" + C.sage],
    ["edit",         FaEdit,             "#" + C.sage],
    ["lang",         FaLanguage,         "#" + C.sage],
    ["cookie",       FaCookieBite,       "#" + C.sage],
    ["speed",        FaTachometerAlt,    "#" + C.sage],
    ["key",          FaKey,              "#" + C.sage],
    ["briefcase",    FaBriefcase,        "#" + C.sage],

    // White versions for dark backgrounds
    ["check_w",      FaCheckCircle,      "#FFFFFF"],
    ["arrow_w",      FaArrowRight,       "#FFFFFF"],
    ["arrow_sage",   FaArrowRight,       "#" + C.sageLight],
    ["star_w",       FaStar,             "#" + C.goldAccent],
  ];
  for (const [key, comp, color] of iconJobs) {
    icons[key] = await iconToBase64(comp, color, 256);
  }

  // ========================================================
  // SLIDE 1 — COVER
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.charDark };

    // Cover image with darken overlay
    s.addImage({ path: "cover.jpg", x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: H,
      fill: { color: C.black, transparency: 30 },
      line: { type: "none" },
    });

    // Sage left accent bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 2.2, w: 0.07, h: 3.0,
      fill: { color: C.sage }, line: { type: "none" },
    });

    // Eyebrow
    s.addText("STRATEGISK PRÆSENTATION · 2026", {
      x: 0.9, y: 2.2, w: 8, h: 0.4,
      fontFace: FONT_BODY, fontSize: 12, color: C.sageLight,
      bold: true, charSpacing: 8, margin: 0,
    });

    // Title
    s.addText("Malerfirmaet Bach ApS", {
      x: 0.9, y: 2.7, w: 11, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 44, color: C.white,
      italic: true, margin: 0,
    });

    s.addText("Ny digital platform", {
      x: 0.9, y: 3.6, w: 11, h: 1.4,
      fontFace: FONT_HEADER, fontSize: 72, color: C.white,
      bold: true, margin: 0,
    });

    // Tagline
    s.addText("Booking · Lead-håndtering · Indholdsstyring · Vækst", {
      x: 0.9, y: 5.0, w: 11, h: 0.5,
      fontFace: FONT_BODY, fontSize: 18, color: C.sageLight, margin: 0,
    });

    // Footer
    s.addShape(pres.shapes.LINE, {
      x: 0.9, y: 6.8, w: 1.2, h: 0,
      line: { color: C.sage, width: 1.5 },
    });
    s.addText("Forberedt til shareholders · Fortroligt", {
      x: 0.9, y: 6.9, w: 8, h: 0.3,
      fontFace: FONT_BODY, fontSize: 10, color: C.midGray, charSpacing: 4, margin: 0,
    });
    s.addText("malerfirmaetbach.dk", {
      x: W - 4, y: 6.9, w: 3.4, h: 0.3,
      fontFace: FONT_BODY, fontSize: 10, color: C.midGray, align: "right", charSpacing: 4, margin: 0,
    });
  }

  // ========================================================
  // SLIDE 2 — EXECUTIVE SUMMARY
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offwhite };

    // Header
    headerEyebrow(s, "INTRODUKTION");
    s.addText("Hvad bygger vi — og hvorfor", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 38, color: C.charDark, bold: true, margin: 0,
    });

    // Two-column: left summary, right pillars
    s.addText(
      "Malerfirmaet Bach ApS får en ny, professionel hjemmeside der både løfter brandet og fjerner manuelt arbejde fra hverdagen. Platformen er bygget til at konvertere besøgende til kunder, og til at sikre at ingen lead går tabt.",
      {
        x: 0.7, y: 2.2, w: 5.6, h: 1.8,
        fontFace: FONT_BODY, fontSize: 15, color: C.charcoal, valign: "top",
        paraSpaceAfter: 6, margin: 0,
      }
    );

    s.addText("Tre forretningsmål:", {
      x: 0.7, y: 4.1, w: 5.6, h: 0.4,
      fontFace: FONT_HEADER, fontSize: 16, color: C.sageDark, bold: true, italic: true, margin: 0,
    });

    s.addText([
      { text: "1. Tiltrække flere kunder via stærk online tilstedeværelse",  options: { breakLine: true } },
      { text: "2. Automatisere booking, henvendelser og opfølgning",          options: { breakLine: true } },
      { text: "3. Sikre at Adam selv kan opdatere indhold uden udvikler" },
    ], {
      x: 0.7, y: 4.5, w: 5.6, h: 1.7,
      fontFace: FONT_BODY, fontSize: 14, color: C.charcoal,
      paraSpaceAfter: 8, margin: 0,
    });

    // Right column — 4 pillar cards (2x2)
    const pillars = [
      { icon: icons.rocket,   title: "Konvertering", body: "Cinematic design der bygger tillid og driver henvendelser" },
      { icon: icons.cogs,     title: "Automatik",    body: "Booking, e-mail og lead-database arbejder af sig selv" },
      { icon: icons.shield,   title: "Sikkerhed",    body: "GDPR, kryptering og dansk hosting i EU" },
      { icon: icons.chart,    title: "Indsigt",      body: "Google Analytics 4 — fuld synlighed på trafik og leads" },
    ];

    const px = 7.0, py = 2.2, pw = 2.85, ph = 2.0, pgap = 0.18;
    pillars.forEach((p, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = px + col * (pw + pgap);
      const y = py + row * (ph + pgap);
      // card
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: pw, h: ph,
        fill: { color: C.white }, line: { color: C.lightGray, width: 0.5 },
        shadow: sShadow(),
      });
      s.addImage({ data: p.icon, x: x + 0.25, y: y + 0.28, w: 0.45, h: 0.45 });
      s.addText(p.title, {
        x: x + 0.25, y: y + 0.85, w: pw - 0.5, h: 0.4,
        fontFace: FONT_HEADER, fontSize: 17, color: C.charDark, bold: true, margin: 0,
      });
      s.addText(p.body, {
        x: x + 0.25, y: y + 1.25, w: pw - 0.5, h: 0.7,
        fontFace: FONT_BODY, fontSize: 11, color: C.warmGray, valign: "top", margin: 0,
      });
    });

    pageFooter(s, pres, 2);
  }

  // ========================================================
  // SLIDE 3 — HVAD HJEMMESIDEN UNDERSTØTTER (FUNCTIONS GRID)
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    headerEyebrow(s, "FUNKTIONER");
    s.addText("Hvad hjemmesiden understøtter", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 38, color: C.charDark, bold: true, margin: 0,
    });
    s.addText("Otte kerneydelser der dækker hele kundens rejse — fra første besøg til afsluttet projekt.", {
      x: 0.7, y: 1.85, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 14, color: C.warmGray, italic: true, margin: 0,
    });

    const features = [
      { icon: icons.images,    title: "Cinematic projektgalleri", desc: "Dedikerede case-sider med scroll-storytelling og før/efter-visning" },
      { icon: icons.calendar,  title: "Online booking",            desc: "Kunder booker tid direkte i Adams Google Calendar" },
      { icon: icons.mail,      title: "Kontaktformular",           desc: "Generel henvendelse med automatisk bekræftelse til kunden" },
      { icon: icons.db,        title: "Lead-database (CRM)",       desc: "Alle henvendelser samles i Airtable med pipeline-status" },
      { icon: icons.bell,      title: "Cold lead-opfølgning",      desc: "Automatisk påmindelse efter 3 og 6 måneder" },
      { icon: icons.edit,      title: "Selv-redigering (CMS)",     desc: "Adam opdaterer tekst, billeder og projekter via Sanity" },
      { icon: icons.lang,      title: "Dansk + engelsk",           desc: "Fuldt sprog-skifte for hotel- og virksomhedskunder" },
      { icon: icons.search,    title: "SEO + Analytics",           desc: "Google Analytics 4 og struktureret data for synlighed" },
    ];

    const cols = 4, rows = 2;
    const startX = 0.7, startY = 2.5;
    const cardW = 2.95, cardH = 2.2, gap = 0.18;

    features.forEach((f, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: cardW, h: cardH,
        fill: { color: C.offwhite }, line: { color: C.sageGhost, width: 0.5 },
        shadow: sShadow(),
      });
      // Icon circle
      s.addShape(pres.shapes.OVAL, {
        x: x + 0.3, y: y + 0.3, w: 0.7, h: 0.7,
        fill: { color: C.sageGhost }, line: { type: "none" },
      });
      s.addImage({ data: f.icon, x: x + 0.45, y: y + 0.45, w: 0.4, h: 0.4 });
      s.addText(f.title, {
        x: x + 0.3, y: y + 1.1, w: cardW - 0.6, h: 0.4,
        fontFace: FONT_HEADER, fontSize: 14, color: C.charDark, bold: true, margin: 0,
      });
      s.addText(f.desc, {
        x: x + 0.3, y: y + 1.5, w: cardW - 0.6, h: 0.65,
        fontFace: FONT_BODY, fontSize: 10.5, color: C.warmGray, valign: "top", margin: 0,
      });
    });

    pageFooter(s, pres, 3);
  }

  // ========================================================
  // SLIDE 4 — SITEMAP
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offwhite };

    headerEyebrow(s, "SITEMAP");
    s.addText("Hjemmesidens struktur", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 38, color: C.charDark, bold: true, margin: 0,
    });

    // Center root
    const rootX = 5.7, rootY = 2.2, rootW = 2.0, rootH = 0.7;
    s.addShape(pres.shapes.RECTANGLE, {
      x: rootX, y: rootY, w: rootW, h: rootH,
      fill: { color: C.charDark }, line: { type: "none" },
      shadow: sShadowLg(),
    });
    s.addText("FORSIDE", {
      x: rootX, y: rootY, w: rootW, h: rootH,
      fontFace: FONT_HEADER, fontSize: 16, color: C.white,
      align: "center", valign: "middle", bold: true, charSpacing: 4,
    });

    // Horizontal connector line
    s.addShape(pres.shapes.LINE, {
      x: 0.95, y: 3.45, w: 11.4, h: 0,
      line: { color: C.sage, width: 1.2 },
    });
    // Vertical connector from root
    s.addShape(pres.shapes.LINE, {
      x: rootX + rootW / 2, y: rootY + rootH, w: 0, h: 0.55,
      line: { color: C.sage, width: 1.2 },
    });

    const pages = [
      { title: "Projekter", sub: "Galleri + filter" },
      { title: "Cases", sub: "7 dedikerede sider" },
      { title: "Book besigtigelse", sub: "Live kalender" },
      { title: "Kontakt", sub: "Generel formular" },
      { title: "Om os / Adam", sub: "Brand & USPs" },
      { title: "Privatliv & Cookies", sub: "GDPR-sider" },
    ];

    const px = 0.7, py = 3.7, pw = 1.95, ph = 1.4, pgap = 0.13;
    pages.forEach((p, i) => {
      const x = px + i * (pw + pgap);
      // Vertical line down to card
      s.addShape(pres.shapes.LINE, {
        x: x + pw / 2, y: 3.45, w: 0, h: 0.25,
        line: { color: C.sage, width: 1.2 },
      });
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: py, w: pw, h: ph,
        fill: { color: C.white }, line: { color: C.lightGray, width: 0.5 },
        shadow: sShadow(),
      });
      // Top sage strip
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: py, w: pw, h: 0.07,
        fill: { color: C.sage }, line: { type: "none" },
      });
      s.addText(p.title, {
        x: x + 0.1, y: py + 0.25, w: pw - 0.2, h: 0.5,
        fontFace: FONT_HEADER, fontSize: 13, color: C.charDark, bold: true, align: "center", margin: 0,
      });
      s.addText(p.sub, {
        x: x + 0.1, y: py + 0.78, w: pw - 0.2, h: 0.4,
        fontFace: FONT_BODY, fontSize: 10, color: C.warmGray, align: "center", italic: true, margin: 0,
      });
    });

    // Bottom legend
    s.addText("Begge sprog tilgængelige på alle sider · /da og /en", {
      x: 0.7, y: 5.4, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 12, color: C.sageDark, italic: true, align: "center", margin: 0,
    });

    // Highlight: 7 case-pages
    const cpY = 6.0;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: cpY, w: 10.3, h: 1.0,
      fill: { color: C.sageGhost }, line: { color: C.sage, width: 0.7 },
    });
    s.addImage({ data: icons.star, x: 1.8, y: cpY + 0.28, w: 0.4, h: 0.4 });
    s.addText("De 7 dedikerede case-sider:", {
      x: 2.4, y: cpY + 0.13, w: 5, h: 0.35,
      fontFace: FONT_HEADER, fontSize: 13, color: C.charDark, bold: true, margin: 0,
    });
    s.addText("Hotel Mayfair · Holmstrup, Jyderup · Kulturporten Farum · Lygten KBH NV · Mjølnerparken · Novo Nordisk Kalundborg · Novo Nordisk Lyngby", {
      x: 2.4, y: cpY + 0.48, w: 9.3, h: 0.5,
      fontFace: FONT_BODY, fontSize: 11, color: C.charcoal, margin: 0,
    });

    pageFooter(s, pres, 4);
  }

  // ========================================================
  // SLIDE 5 — BOOKING FLOW
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.charDark };

    headerEyebrowDark(s, "FLOW 1 · BOOKING");
    s.addText("Kunden booker tid hos Adam — automatisk", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 32, color: C.white, bold: true, margin: 0,
    });
    s.addText("Fra kundens første klik til mødet er i Adams kalender — ingen manuel håndtering.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.midGray, italic: true, margin: 0,
    });

    // Flow: 6 steps in horizontal flow with arrows
    const steps = [
      { icon: icons.userCheck,   title: "1. Kunden besøger /book-besigtigelse", desc: "Udfylder formular: navn, kontakt, adresse, opgavebeskrivelse, billeder" },
      { icon: icons.upload,      title: "2. Billeder uploades til Google Drive", desc: "Automatisk mappe pr. lead — Adam kan se billeder før mødet" },
      { icon: icons.calendar,    title: "3. Kunden vælger ledig tid",            desc: "Calendly viser kun tider Adam reelt er ledig (Google Calendar-sync)" },
      { icon: icons.briefcase,   title: "4. Møde oprettes automatisk",           desc: "I Adams Google Calendar med alle oplysninger og Drive-link" },
      { icon: icons.mail,        title: "5. Kunden får e-mail-bekræftelse",      desc: "Med tidspunkt + automatisk påmindelse 24t før mødet" },
      { icon: icons.db,          title: "6. Lead gemmes i Airtable",             desc: "Make.com sender alt videre til CRM med status 'Ny henvendelse'" },
    ];

    const sx = 0.6, sy = 2.6, sw = 2.05, sh = 2.7;
    const gap = 0.06;
    steps.forEach((step, i) => {
      const x = sx + i * (sw + gap);
      // step card (slightly tinted)
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: sy, w: sw, h: sh,
        fill: { color: C.charcoal }, line: { color: C.sage, width: 0.5 },
      });
      // Icon circle
      s.addShape(pres.shapes.OVAL, {
        x: x + sw/2 - 0.4, y: sy + 0.25, w: 0.8, h: 0.8,
        fill: { color: C.sage }, line: { type: "none" },
      });
      s.addImage({ data: icons.check_w, x: x + sw/2 - 0.2, y: sy + 0.45, w: 0.4, h: 0.4 });
      s.addText(step.title, {
        x: x + 0.12, y: sy + 1.15, w: sw - 0.24, h: 0.7,
        fontFace: FONT_HEADER, fontSize: 12, color: C.white, bold: true,
        align: "center", valign: "top", margin: 0,
      });
      s.addText(step.desc, {
        x: x + 0.12, y: sy + 1.85, w: sw - 0.24, h: 0.78,
        fontFace: FONT_BODY, fontSize: 9.5, color: C.sageLight,
        align: "center", valign: "top", margin: 0,
      });
    });

    // Connecting arrows (between cards)
    for (let i = 0; i < steps.length - 1; i++) {
      const ax = sx + (i + 1) * sw + i * gap - 0.05;
      s.addImage({ data: icons.arrow_sage, x: ax, y: sy + 1.2, w: 0.18, h: 0.18 });
    }

    // Bottom outcome strip
    const oy = 5.55;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: oy, w: 12.13, h: 1.05,
      fill: { color: C.sage }, line: { type: "none" },
    });
    s.addImage({ data: icons.check_w, x: 0.85, y: oy + 0.32, w: 0.42, h: 0.42 });
    s.addText("Resultat:  Møde i kalenderen, kunde informeret, lead i CRM — uden et eneste manuelt klik fra Adam.", {
      x: 1.4, y: oy + 0.25, w: 11, h: 0.6,
      fontFace: FONT_HEADER, fontSize: 15, color: C.white, bold: true, italic: true, margin: 0,
    });

    pageFooter(s, pres, 5, true);
  }

  // ========================================================
  // SLIDE 6 — KONTAKTFORMULAR FLOW
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offwhite };

    headerEyebrow(s, "FLOW 2 · KONTAKTFORMULAR");
    s.addText("Generel henvendelse — uden booking", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 32, color: C.charDark, bold: true, margin: 0,
    });
    s.addText("For kunder der vil høre nærmere før de binder sig til en tid. Samme gemte lead som booking-flowet.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.warmGray, italic: true, margin: 0,
    });

    // 4 horizontal steps
    const steps = [
      { icon: icons.file,     title: "1. Kunden udfylder formular",          desc: "Navn, e-mail, telefon, opgavebeskrivelse" },
      { icon: icons.mail,     title: "2. Bekræftelse sendes til kunden",      desc: "\"Vi har modtaget din henvendelse\" — INGEN booking nævnes" },
      { icon: icons.bell,     title: "3. Adam får notifikation",             desc: "Med alle oplysninger på info@malerfirmaetbach.dk" },
      { icon: icons.db,       title: "4. Lead gemmes i Airtable",            desc: "Status: 'Ny henvendelse' — klar til opfølgning" },
    ];

    const sx = 0.7, sy = 2.7, sw = 3.0, sh = 2.3;
    const gap = 0.13;
    steps.forEach((step, i) => {
      const x = sx + i * (sw + gap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: sy, w: sw, h: sh,
        fill: { color: C.white }, line: { color: C.lightGray, width: 0.5 },
        shadow: sShadow(),
      });
      // Top accent
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: sy, w: sw, h: 0.08,
        fill: { color: C.sage }, line: { type: "none" },
      });
      s.addImage({ data: step.icon, x: x + sw/2 - 0.3, y: sy + 0.35, w: 0.6, h: 0.6 });
      s.addText(step.title, {
        x: x + 0.2, y: sy + 1.1, w: sw - 0.4, h: 0.5,
        fontFace: FONT_HEADER, fontSize: 14, color: C.charDark, bold: true,
        align: "center", valign: "top", margin: 0,
      });
      s.addText(step.desc, {
        x: x + 0.2, y: sy + 1.6, w: sw - 0.4, h: 0.65,
        fontFace: FONT_BODY, fontSize: 11, color: C.warmGray,
        align: "center", valign: "top", margin: 0,
      });
    });

    // Difference callout box
    const cy = 5.4;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: cy, w: 12.13, h: 1.5,
      fill: { color: C.sageGhost }, line: { color: C.sage, width: 0.7 },
    });
    s.addImage({ data: icons.lightbulb, x: 0.95, y: cy + 0.35, w: 0.55, h: 0.55 });
    s.addText("Forskellen på de to flows:", {
      x: 1.7, y: cy + 0.2, w: 10, h: 0.4,
      fontFace: FONT_HEADER, fontSize: 14, color: C.charDark, bold: true, margin: 0,
    });
    s.addText([
      { text: "Booking-formular:  ", options: { bold: true, color: C.sageDark } },
      { text: "kunden vælger en tid → e-mail med mødetid + Calendly-påmindelse",                  options: { color: C.charcoal, breakLine: true } },
      { text: "Kontaktformular:  ",   options: { bold: true, color: C.sageDark } },
      { text: "kunden skriver kun en besked → e-mail bekræfter blot at vi har modtaget det",      options: { color: C.charcoal } },
    ], {
      x: 1.7, y: cy + 0.6, w: 10.8, h: 0.85,
      fontFace: FONT_BODY, fontSize: 11.5, valign: "top", margin: 0,
    });

    pageFooter(s, pres, 6);
  }

  // ========================================================
  // SLIDE 7 — CRM / AIRTABLE
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    headerEyebrow(s, "LEAD-DATABASE");
    s.addText("CRM med kanban-pipeline i Airtable", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 32, color: C.charDark, bold: true, margin: 0,
    });
    s.addText("Alle leads — uanset hvilket flow de kommer fra — samles ét sted og kan trækkes gennem en visuel pipeline.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.warmGray, italic: true, margin: 0,
    });

    // Kanban columns
    const stages = [
      { name: "Ny henvendelse",  color: C.sage,        count: "Auto" },
      { name: "Møde afholdt",    color: C.sageDark,    count: "Manuel" },
      { name: "Tilbud sendt",    color: C.goldAccent,  count: "Manuel" },
      { name: "Vundet",          color: C.greenOK,     count: "Manuel" },
      { name: "Tabt / Kold",     color: C.redAccent,   count: "Manuel" },
    ];

    const kx = 0.7, ky = 2.55, kw = 2.42, kh = 3.2, kgap = 0.15;
    stages.forEach((st, i) => {
      const x = kx + i * (kw + kgap);
      // header
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: ky, w: kw, h: 0.5,
        fill: { color: st.color }, line: { type: "none" },
      });
      s.addText(st.name, {
        x: x + 0.1, y: ky + 0.05, w: kw - 0.2, h: 0.4,
        fontFace: FONT_HEADER, fontSize: 12, color: C.white, bold: true,
        align: "center", valign: "middle", margin: 0,
      });
      // body column
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: ky + 0.5, w: kw, h: kh - 0.5,
        fill: { color: C.paleGray }, line: { color: C.lightGray, width: 0.5 },
      });
      // sample card
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 0.15, y: ky + 0.7, w: kw - 0.3, h: 0.85,
        fill: { color: C.white }, line: { color: C.lightGray, width: 0.5 },
        shadow: sShadow(),
      });
      s.addText("Lars Andersen", {
        x: x + 0.25, y: ky + 0.78, w: kw - 0.5, h: 0.3,
        fontFace: FONT_BODY, fontSize: 10, color: C.charDark, bold: true, margin: 0,
      });
      s.addText("Lyngby · indvendig", {
        x: x + 0.25, y: ky + 1.05, w: kw - 0.5, h: 0.3,
        fontFace: FONT_BODY, fontSize: 9, color: C.warmGray, italic: true, margin: 0,
      });
      s.addText("12. maj 2026", {
        x: x + 0.25, y: ky + 1.28, w: kw - 0.5, h: 0.25,
        fontFace: FONT_BODY, fontSize: 8, color: C.midGray, margin: 0,
      });
      // Update tag
      s.addText(st.count, {
        x: x + 0.15, y: ky + 0.5 + kh - 0.85, w: kw - 0.3, h: 0.25,
        fontFace: FONT_BODY, fontSize: 8, color: C.warmGray, italic: true,
        align: "right", margin: 0,
      });
    });

    // Cold lead nurture box
    const ny = 6.05;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: ny, w: 12.13, h: 1.0,
      fill: { color: C.charDark }, line: { type: "none" },
    });
    s.addImage({ data: icons.bell, x: 0.95, y: ny + 0.27, w: 0.45, h: 0.45 });
    s.addText("Cold lead-nurturing:", {
      x: 1.55, y: ny + 0.13, w: 4.5, h: 0.35,
      fontFace: FONT_HEADER, fontSize: 13, color: C.sageLight, bold: true, italic: true, margin: 0,
    });
    s.addText("Leads markeret 'Tabt/Kold' udløser automatisk en påmindelse til Adam efter 3 og 6 måneder — så ingen kunde glemmes.", {
      x: 1.55, y: ny + 0.46, w: 11.0, h: 0.5,
      fontFace: FONT_BODY, fontSize: 11, color: C.white, margin: 0,
    });

    pageFooter(s, pres, 7);
  }

  // ========================================================
  // SLIDE 8 — SANITY CMS
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offwhite };

    headerEyebrow(s, "INDHOLDSSTYRING");
    s.addText("Adam redigerer selv — uden udvikler", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 32, color: C.charDark, bold: true, margin: 0,
    });
    s.addText("Sanity CMS giver Adam fuld kontrol over alle tekster, billeder og projekter via et brugervenligt panel.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.warmGray, italic: true, margin: 0,
    });

    // Left: what can be edited
    s.addText("Hvad Adam kan redigere selv:", {
      x: 0.7, y: 2.55, w: 6.0, h: 0.4,
      fontFace: FONT_HEADER, fontSize: 16, color: C.sageDark, bold: true, italic: true, margin: 0,
    });

    const editables = [
      { icon: icons.edit,     text: "Forsidens overskrifter, brødtekst og CTA'er" },
      { icon: icons.images,   text: "Projektbilleder, før/efter, billedtekster" },
      { icon: icons.briefcase,text: "Tilføje nye projekter og case-sider" },
      { icon: icons.users,    text: "Kundereferencer, citater og logoer" },
      { icon: icons.clipboard,text: "FAQ-spørgsmål, services, processtrin" },
      { icon: icons.file,     text: "Privatlivs- og cookiepolitik (juridisk tekst)" },
      { icon: icons.lang,     text: "Begge sprog (dansk + engelsk) i samme view" },
    ];

    editables.forEach((e, i) => {
      const y = 3.0 + i * 0.5;
      s.addImage({ data: e.icon, x: 0.7, y: y + 0.05, w: 0.3, h: 0.3 });
      s.addText(e.text, {
        x: 1.15, y: y, w: 5.5, h: 0.4,
        fontFace: FONT_BODY, fontSize: 12, color: C.charcoal, valign: "middle", margin: 0,
      });
    });

    // Right: workflow box
    const wx = 7.4, wy = 2.55, ww = 5.43, wh = 4.5;
    s.addShape(pres.shapes.RECTANGLE, {
      x: wx, y: wy, w: ww, h: wh,
      fill: { color: C.charDark }, line: { type: "none" },
      shadow: sShadowLg(),
    });
    s.addText("Sådan virker det:", {
      x: wx + 0.4, y: wy + 0.3, w: ww - 0.8, h: 0.5,
      fontFace: FONT_HEADER, fontSize: 16, color: C.sageLight, bold: true, italic: true, margin: 0,
    });

    const steps = [
      { num: "1", title: "Adam logger ind",       desc: "Sanity Studio — sin egen brugerkonto, mobilvenlig" },
      { num: "2", title: "Vælger sektion",        desc: "Forside · Projekter · FAQ · m.m." },
      { num: "3", title: "Redigerer indhold",     desc: "Tekst, billeder, oversættelser — Word-lignende" },
      { num: "4", title: "Klikker 'Publicér'",    desc: "Hjemmesiden opdateres på under 30 sekunder" },
    ];

    steps.forEach((step, i) => {
      const y = wy + 0.85 + i * 0.85;
      // num circle
      s.addShape(pres.shapes.OVAL, {
        x: wx + 0.4, y: y + 0.05, w: 0.55, h: 0.55,
        fill: { color: C.sage }, line: { type: "none" },
      });
      s.addText(step.num, {
        x: wx + 0.4, y: y + 0.05, w: 0.55, h: 0.55,
        fontFace: FONT_HEADER, fontSize: 16, color: C.white, bold: true,
        align: "center", valign: "middle", margin: 0,
      });
      s.addText(step.title, {
        x: wx + 1.1, y: y + 0.0, w: ww - 1.4, h: 0.35,
        fontFace: FONT_HEADER, fontSize: 13, color: C.white, bold: true, margin: 0,
      });
      s.addText(step.desc, {
        x: wx + 1.1, y: y + 0.35, w: ww - 1.4, h: 0.35,
        fontFace: FONT_BODY, fontSize: 10, color: C.sageLight, margin: 0,
      });
    });

    pageFooter(s, pres, 8);
  }

  // ========================================================
  // SLIDE 9 — TECH STACK
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.charDark };

    headerEyebrowDark(s, "TEKNISK FUNDAMENT");
    s.addText("Stack — bygget på enterprise-niveau services", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 30, color: C.white, bold: true, margin: 0,
    });
    s.addText("Hver komponent er valgt for stabilitet, sikkerhed og fri opskalering — ikke for at imponere.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.midGray, italic: true, margin: 0,
    });

    const stack = [
      { layer: "FRONTEND",     items: [ { n: "Next.js 14", d: "React-rammeværk" }, { n: "Tailwind CSS", d: "Design" }, { n: "GSAP + Three.js", d: "Cinematic-effekter" }, { n: "TypeScript", d: "Type-sikkerhed" } ] },
      { layer: "INDHOLD",      items: [ { n: "Sanity CMS", d: "Indhold & medier" }, { n: "Google Drive", d: "Lead-billeder" } ] },
      { layer: "AUTOMATIK",    items: [ { n: "Calendly", d: "Booking" }, { n: "Make.com", d: "Workflow" }, { n: "Resend", d: "Transaktionsmail" }, { n: "Airtable", d: "Lead-CRM" } ] },
      { layer: "DRIFT",        items: [ { n: "Vercel", d: "Hosting (EU)" }, { n: "GitHub", d: "Kode-repo" }, { n: "Google Analytics 4", d: "Statistik" }, { n: "One.com", d: "Domæne & DNS" } ] },
    ];

    const lx = 0.7, ly = 2.5, lw = 12.13, lh = 1.05, lgap = 0.13;
    stack.forEach((s_layer, i) => {
      const y = ly + i * (lh + lgap);
      // layer label
      s.addShape(pres.shapes.RECTANGLE, {
        x: lx, y, w: 1.7, h: lh,
        fill: { color: C.sage }, line: { type: "none" },
      });
      s.addText(s_layer.layer, {
        x: lx, y, w: 1.7, h: lh,
        fontFace: FONT_HEADER, fontSize: 12, color: C.white, bold: true, charSpacing: 4,
        align: "center", valign: "middle", margin: 0,
      });
      // items area
      s.addShape(pres.shapes.RECTANGLE, {
        x: lx + 1.7, y, w: lw - 1.7, h: lh,
        fill: { color: C.charcoal }, line: { color: C.sageDark, width: 0.5 },
      });
      // item chips
      const itemCount = s_layer.items.length;
      const chipWidth = (lw - 1.7 - 0.4) / itemCount;
      s_layer.items.forEach((it, j) => {
        const x = lx + 1.7 + 0.2 + j * chipWidth;
        s.addText(it.n, {
          x: x + 0.05, y: y + 0.18, w: chipWidth - 0.1, h: 0.35,
          fontFace: FONT_HEADER, fontSize: 13, color: C.white, bold: true, margin: 0,
        });
        s.addText(it.d, {
          x: x + 0.05, y: y + 0.55, w: chipWidth - 0.1, h: 0.35,
          fontFace: FONT_BODY, fontSize: 10, color: C.sageLight, italic: true, margin: 0,
        });
      });
    });

    // Bottom note
    s.addText("Alle services er industristandarder med dokumenterede oppetider på 99.9%+ og fuld GDPR-compliance.", {
      x: 0.7, y: 6.85, w: 12.13, h: 0.4,
      fontFace: FONT_BODY, fontSize: 11, color: C.sageLight, italic: true, align: "center", margin: 0,
    });

    pageFooter(s, pres, 9, true);
  }

  // ========================================================
  // SLIDE 10 — SECURITY & GDPR
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    headerEyebrow(s, "SIKKERHED & PRIVATLIV");
    s.addText("Bygget GDPR-først — ikke som en eftertanke", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 30, color: C.charDark, bold: true, margin: 0,
    });
    s.addText("Persondata behandles efter dansk og europæisk lov. Alle data hostes i EU.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.warmGray, italic: true, margin: 0,
    });

    const items = [
      { icon: icons.cookie,  title: "Cookie-samtykke",       desc: "Aktivt samtykke før Google Analytics eller andre tracking-cookies sættes" },
      { icon: icons.lock,    title: "HTTPS overalt",         desc: "Al kommunikation krypteret med TLS 1.3 — A+ rating på SSL Labs" },
      { icon: icons.shield,  title: "EU-hosting",            desc: "Vercel + Sanity opererer i EU-regioner, Airtable EU-region tilgængelig" },
      { icon: icons.key,     title: "API-nøgler i hvælv",    desc: "Hemmeligheder gemmes som Vercel environment variables — aldrig i kode" },
      { icon: icons.file,    title: "Privatlivspolitik",     desc: "Specifikt tilpasset Adams flows: hvilke data, hvor længe, hvilke rettigheder" },
      { icon: icons.userCheck,title: "Ret til sletning",     desc: "Adam kan slette en kundes data fra Airtable + Sanity på under 1 minut" },
    ];

    const ix = 0.7, iy = 2.55, iw = 4.0, ih = 1.55, igap = 0.07;
    const cols = 3;
    items.forEach((it, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const x = ix + col * (iw + igap);
      const y = iy + row * (ih + igap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: iw, h: ih,
        fill: { color: C.offwhite }, line: { color: C.sageGhost, width: 0.5 },
        shadow: sShadow(),
      });
      // Sage left bar
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.08, h: ih,
        fill: { color: C.sage }, line: { type: "none" },
      });
      s.addImage({ data: it.icon, x: x + 0.3, y: y + 0.25, w: 0.45, h: 0.45 });
      s.addText(it.title, {
        x: x + 0.95, y: y + 0.22, w: iw - 1.1, h: 0.4,
        fontFace: FONT_HEADER, fontSize: 14, color: C.charDark, bold: true, margin: 0,
      });
      s.addText(it.desc, {
        x: x + 0.95, y: y + 0.6, w: iw - 1.1, h: 0.85,
        fontFace: FONT_BODY, fontSize: 10.5, color: C.warmGray, valign: "top", margin: 0,
      });
    });

    // Compliance badge bar
    const by = 5.95;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: by, w: 12.13, h: 1.05,
      fill: { color: C.charDark }, line: { type: "none" },
    });
    s.addImage({ data: icons.shield, x: 1.0, y: by + 0.27, w: 0.5, h: 0.5 });
    s.addText("Compliance:", {
      x: 1.65, y: by + 0.13, w: 2.5, h: 0.35,
      fontFace: FONT_HEADER, fontSize: 13, color: C.sageLight, bold: true, italic: true, margin: 0,
    });
    s.addText("GDPR · ePrivacy · Datatilsynets vejledning · WCAG 2.1 AA tilgængelighed · OWASP secure coding-principper", {
      x: 1.65, y: by + 0.45, w: 11.0, h: 0.5,
      fontFace: FONT_BODY, fontSize: 11, color: C.white, margin: 0,
    });

    pageFooter(s, pres, 10);
  }

  // ========================================================
  // SLIDE 11 — PERFORMANCE / SEO / A11Y
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offwhite };

    headerEyebrow(s, "PERFORMANCE · SEO · TILGÆNGELIGHED");
    s.addText("Hurtig, synlig og tilgængelig", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 32, color: C.charDark, bold: true, margin: 0,
    });

    // 3 large columns
    const cols = [
      {
        icon: icons.speed,
        title: "Performance",
        target: "Lighthouse 90+",
        details: [
          "Server-side rendering for hurtigste første visning",
          "Billeder optimeres automatisk pr. enhed",
          "Lazy-loading af tunge effekter (GSAP/Three.js)",
          "Caching på Vercel CDN med EU-noder",
        ],
      },
      {
        icon: icons.search,
        title: "SEO",
        target: "Synlig på Google",
        details: [
          "Sitemap.xml + robots.txt automatisk genereret",
          "Open Graph + Twitter Cards til social deling",
          "Schema.org strukturerede data (LocalBusiness)",
          "Begge sprog indekseres — dansk + engelsk",
        ],
      },
      {
        icon: icons.a11y,
        title: "Tilgængelighed",
        target: "WCAG 2.1 AA",
        details: [
          "Tastatur-navigation på alle interaktive elementer",
          "Skærmlæser-vendlige labels og ARIA-roller",
          "Kontrastforhold mindst 4.5:1 på al tekst",
          "Reducerede animationer respekterer brugerens setup",
        ],
      },
    ];

    const cx = 0.7, cy = 2.4, cw = 4.05, ch = 4.6, cgap = 0.13;
    cols.forEach((col, i) => {
      const x = cx + i * (cw + cgap);
      // Card
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: cy, w: cw, h: ch,
        fill: { color: C.white }, line: { color: C.lightGray, width: 0.5 },
        shadow: sShadowLg(),
      });
      // Top sage strip
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: cy, w: cw, h: 0.12,
        fill: { color: C.sage }, line: { type: "none" },
      });
      // Icon
      s.addImage({ data: col.icon, x: x + cw/2 - 0.4, y: cy + 0.45, w: 0.8, h: 0.8 });
      // Title
      s.addText(col.title, {
        x: x + 0.2, y: cy + 1.4, w: cw - 0.4, h: 0.5,
        fontFace: FONT_HEADER, fontSize: 22, color: C.charDark, bold: true,
        align: "center", margin: 0,
      });
      // Target
      s.addText(col.target, {
        x: x + 0.2, y: cy + 1.95, w: cw - 0.4, h: 0.4,
        fontFace: FONT_HEADER, fontSize: 14, color: C.sageDark, italic: true,
        align: "center", margin: 0,
      });
      // separator
      s.addShape(pres.shapes.LINE, {
        x: x + cw/2 - 0.5, y: cy + 2.45, w: 1.0, h: 0,
        line: { color: C.sage, width: 1 },
      });
      // details
      const detailItems = col.details.map((d, j) => ({
        text: d,
        options: { bullet: { code: "25CF" }, ...(j < col.details.length - 1 ? { breakLine: true } : {}) }
      }));
      s.addText(detailItems, {
        x: x + 0.3, y: cy + 2.65, w: cw - 0.6, h: 1.85,
        fontFace: FONT_BODY, fontSize: 10.5, color: C.charcoal,
        paraSpaceAfter: 6, valign: "top", margin: 0,
      });
    });

    // Mobile-first banner
    const my = 7.15;
    s.addText("Mobile-first design: 80%+ af trafikken kommer fra mobil — derfor optimeres til den først.", {
      x: 0.7, y: my, w: 12.13, h: 0.3,
      fontFace: FONT_BODY, fontSize: 11, color: C.sageDark, italic: true, align: "center", margin: 0,
    });

    pageFooter(s, pres, 11);
  }

  // ========================================================
  // SLIDE 12 — DATA LIFECYCLE / HOW DATA IS STORED
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.white };

    headerEyebrow(s, "DATA-FLOW");
    s.addText("Hvordan data gemmes og flyder", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 32, color: C.charDark, bold: true, margin: 0,
    });
    s.addText("Hver oplysning har én bestemt vej gennem systemet — fra kundens skærm til Adams hverdagsværktøjer.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.warmGray, italic: true, margin: 0,
    });

    // Diagram — kunde top, system midt, adam bunden
    // Top: Customer device
    const topY = 2.5;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 5.3, y: topY, w: 2.7, h: 0.75,
      fill: { color: C.charDark }, line: { type: "none" },
      shadow: sShadow(),
    });
    s.addImage({ data: icons.mobile, x: 5.5, y: topY + 0.18, w: 0.4, h: 0.4 });
    s.addText("Kunden i browser/mobil", {
      x: 6.0, y: topY + 0.18, w: 1.95, h: 0.4,
      fontFace: FONT_HEADER, fontSize: 12, color: C.white, bold: true, valign: "middle", margin: 0,
    });

    // Arrow down
    s.addShape(pres.shapes.LINE, {
      x: 6.65, y: topY + 0.85, w: 0, h: 0.55,
      line: { color: C.sage, width: 1.5 },
    });

    // Middle: 4 storage destinations
    const midY = 3.55;
    const dests = [
      { icon: icons.images,  name: "Sanity CMS",       what: "Side-tekster\nProjektbilleder" },
      { icon: icons.upload,  name: "Google Drive",     what: "Kunde-uploadede\nopgavebilleder" },
      { icon: icons.calendar,name: "Google Calendar",  what: "Mødebookinger\nkalender-events" },
      { icon: icons.db,      name: "Airtable",         what: "Lead-database\nstatus + opfølgning" },
    ];

    const dx = 0.7, dw = 2.95, dh = 1.7, dgap = 0.13;
    dests.forEach((d, i) => {
      const x = dx + i * (dw + dgap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: midY, w: dw, h: dh,
        fill: { color: C.offwhite }, line: { color: C.sage, width: 0.7 },
        shadow: sShadow(),
      });
      s.addImage({ data: d.icon, x: x + dw/2 - 0.3, y: midY + 0.25, w: 0.6, h: 0.6 });
      s.addText(d.name, {
        x: x + 0.2, y: midY + 0.95, w: dw - 0.4, h: 0.35,
        fontFace: FONT_HEADER, fontSize: 13, color: C.charDark, bold: true,
        align: "center", margin: 0,
      });
      s.addText(d.what, {
        x: x + 0.2, y: midY + 1.3, w: dw - 0.4, h: 0.4,
        fontFace: FONT_BODY, fontSize: 10, color: C.warmGray,
        align: "center", valign: "top", margin: 0,
      });
    });

    // Arrow down
    s.addShape(pres.shapes.LINE, {
      x: 6.65, y: midY + dh + 0.05, w: 0, h: 0.45,
      line: { color: C.sage, width: 1.5 },
    });

    // Bottom: Adam's tools
    const botY = 5.7;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: botY, w: 12.13, h: 1.0,
      fill: { color: C.sageDark }, line: { type: "none" },
      shadow: sShadow(),
    });
    s.addImage({ data: icons.userCheck, x: 1.0, y: botY + 0.27, w: 0.5, h: 0.5 });
    s.addText("Adam tilgår alt fra ét sted", {
      x: 1.7, y: botY + 0.13, w: 6, h: 0.4,
      fontFace: FONT_HEADER, fontSize: 14, color: C.white, bold: true, italic: true, margin: 0,
    });
    s.addText("Sanity Studio · Google Drive · Google Calendar · Airtable — alle er tilgængelige fra mobil og desktop med samme login.", {
      x: 1.7, y: botY + 0.5, w: 11.0, h: 0.4,
      fontFace: FONT_BODY, fontSize: 11, color: C.sageLight, margin: 0,
    });

    pageFooter(s, pres, 12);
  }

  // ========================================================
  // SLIDE 13 — DRIFTSOMKOSTNINGER
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offwhite };

    headerEyebrow(s, "DRIFTSØKONOMI");
    s.addText("Månedlige driftsomkostninger", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 32, color: C.charDark, bold: true, margin: 0,
    });
    s.addText("Estimerede løbende udgifter ved opstart. Skalerer med trafik og leads — alle services starter på gratis tier.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.warmGray, italic: true, margin: 0,
    });

    // Cost table
    const tx = 0.7, ty = 2.6, tw = 12.13;
    const rowH = 0.45;

    const rows = [
      ["Vercel hosting",         "Hobby plan",                "0 kr.",   "Gratis indtil ~100k besøg/md"],
      ["Sanity CMS",             "Free tier",                 "0 kr.",   "3 brugere, 10k dokumenter"],
      ["Calendly",               "Standard plan",             "~75 kr.", "Booking + automatisering — kan starte gratis"],
      ["Resend",                 "Free tier",                 "0 kr.",   "3.000 e-mails/md (rigeligt)"],
      ["Make.com",               "Free tier",                 "0 kr.",   "1.000 operationer/md"],
      ["Airtable",               "Free / Team",               "0–140 kr.","Free dækker indtil 1.000 leads"],
      ["Google Workspace",       "Eksisterende",              "—",       "Forventes Adam allerede betaler for"],
      ["Domæne (One.com)",       "Eksisterende",              "—",       "Allerede betalt"],
      ["Google Analytics 4",     "Gratis",                    "0 kr.",   "Standardregler"],
    ];

    // Table header
    s.addShape(pres.shapes.RECTANGLE, {
      x: tx, y: ty, w: tw, h: rowH,
      fill: { color: C.charDark }, line: { type: "none" },
    });
    const headerCols = [
      ["Service",       0.4,  3.0],
      ["Plan",          3.4,  2.5],
      ["Pris/md",       5.9,  1.6],
      ["Kommentar",     7.5,  5.5],
    ];
    headerCols.forEach(([h, x, w]) => {
      s.addText(h, {
        x: tx + x, y: ty, w, h: rowH,
        fontFace: FONT_HEADER, fontSize: 11, color: C.sageLight, bold: true, charSpacing: 4,
        valign: "middle", margin: 0,
      });
    });

    rows.forEach((row, i) => {
      const y = ty + rowH + i * rowH;
      const isAlt = i % 2 === 1;
      s.addShape(pres.shapes.RECTANGLE, {
        x: tx, y, w: tw, h: rowH,
        fill: { color: isAlt ? C.paleGray : C.white }, line: { color: C.lightGray, width: 0.3 },
      });
      const cells = [
        [0.4,  3.0,  row[0], { bold: true, color: C.charDark, size: 11 }],
        [3.4,  2.5,  row[1], { color: C.charcoal, size: 11 }],
        [5.9,  1.6,  row[2], { color: C.sageDark, size: 11, bold: true }],
        [7.5,  5.5,  row[3], { color: C.warmGray, size: 10, italic: true }],
      ];
      cells.forEach(([x, w, t, opts]) => {
        s.addText(t, {
          x: tx + x, y, w, h: rowH,
          fontFace: FONT_BODY, fontSize: opts.size, color: opts.color,
          bold: opts.bold || false, italic: opts.italic || false,
          valign: "middle", margin: 0,
        });
      });
    });

    // Total
    const totalY = ty + rowH + rows.length * rowH + 0.15;
    s.addShape(pres.shapes.RECTANGLE, {
      x: tx, y: totalY, w: tw, h: 0.7,
      fill: { color: C.sage }, line: { type: "none" },
    });
    s.addText("Estimeret startbudget:", {
      x: tx + 0.4, y: totalY, w: 5, h: 0.7,
      fontFace: FONT_HEADER, fontSize: 14, color: C.white, bold: true, italic: true,
      valign: "middle", margin: 0,
    });
    s.addText("0–215 kr./md (årligt: 0–2.580 kr.)", {
      x: tx + 5.5, y: totalY, w: 6.5, h: 0.7,
      fontFace: FONT_HEADER, fontSize: 16, color: C.white, bold: true,
      align: "right", valign: "middle", margin: 0,
    });

    // Note
    s.addText("⚙️  Note: Alle services kan starte på gratis tier. Beløb stiger først når lead-volumen vokser betydeligt — en god type \"problem\" at have.", {
      x: tx, y: totalY + 0.85, w: tw, h: 0.4,
      fontFace: FONT_BODY, fontSize: 10, color: C.warmGray, italic: true, align: "center", margin: 0,
    });

    pageFooter(s, pres, 13);
  }

  // ========================================================
  // SLIDE 14 — TIDSLINJE
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.charDark };

    headerEyebrowDark(s, "PROJEKTTIDSLINJE");
    s.addText("Fra opstart til go-live", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 32, color: C.white, bold: true, margin: 0,
    });
    s.addText("Indikativ tidslinje. Faser kan overlappe, og deploys sker løbende til staging-URL.", {
      x: 0.7, y: 1.8, w: 12, h: 0.4,
      fontFace: FONT_BODY, fontSize: 13, color: C.midGray, italic: true, margin: 0,
    });

    // Horizontal timeline
    const phases = [
      { num: "1", title: "Opsætning",     dur: "Uge 1",    desc: "Konti, repo, design-tokens, Sanity-skemaer" },
      { num: "2", title: "Kerneside",     dur: "Uge 2–3",  desc: "Forside, projekter, om os, kontakt — alt CMS-drevet" },
      { num: "3", title: "Cases + Booking", dur: "Uge 4",  desc: "7 case-sider, Calendly, Make.com-flows, Airtable" },
      { num: "4", title: "Test + Lancering", dur: "Uge 5", desc: "QA, performance, GDPR, DNS-skift, go-live" },
    ];

    const px = 0.7, py = 2.7, pw = 2.95, ph = 3.5, pgap = 0.15;
    phases.forEach((p, i) => {
      const x = px + i * (pw + pgap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y: py, w: pw, h: ph,
        fill: { color: C.charcoal }, line: { color: C.sage, width: 0.7 },
      });
      // Big phase number
      s.addText(p.num, {
        x: x + 0.2, y: py + 0.2, w: pw - 0.4, h: 1.0,
        fontFace: FONT_HEADER, fontSize: 90, color: C.sage, bold: true, italic: true,
        align: "left", valign: "top", margin: 0,
      });
      // Title
      s.addText(p.title, {
        x: x + 0.3, y: py + 1.4, w: pw - 0.6, h: 0.5,
        fontFace: FONT_HEADER, fontSize: 18, color: C.white, bold: true, margin: 0,
      });
      // Duration chip
      s.addShape(pres.shapes.RECTANGLE, {
        x: x + 0.3, y: py + 1.95, w: 1.2, h: 0.32,
        fill: { color: C.sageDark }, line: { type: "none" },
      });
      s.addText(p.dur, {
        x: x + 0.3, y: py + 1.95, w: 1.2, h: 0.32,
        fontFace: FONT_BODY, fontSize: 10, color: C.white, bold: true, charSpacing: 2,
        align: "center", valign: "middle", margin: 0,
      });
      // Description
      s.addText(p.desc, {
        x: x + 0.3, y: py + 2.45, w: pw - 0.6, h: 0.95,
        fontFace: FONT_BODY, fontSize: 11, color: C.sageLight, valign: "top", margin: 0,
      });
    });

    // Connector arrows
    for (let i = 0; i < phases.length - 1; i++) {
      const ax = px + (i + 1) * pw + i * pgap + 0.0;
      s.addImage({ data: icons.arrow_sage, x: ax - 0.05, y: py + ph/2 - 0.15, w: 0.25, h: 0.25 });
    }

    // Go-live banner
    const gy = 6.5;
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: gy, w: 12.13, h: 0.65,
      fill: { color: C.sage }, line: { type: "none" },
    });
    s.addImage({ data: icons.check_w, x: 0.95, y: gy + 0.16, w: 0.34, h: 0.34 });
    s.addText("Go-live målsætning: ca. 4–5 uger fra opstart, afhængigt af adgang til konti og indholdsgodkendelse.", {
      x: 1.45, y: gy + 0.1, w: 11, h: 0.5,
      fontFace: FONT_HEADER, fontSize: 13, color: C.white, bold: true, italic: true,
      valign: "middle", margin: 0,
    });

    pageFooter(s, pres, 14, true);
  }

  // ========================================================
  // SLIDE 15 — RISICI & MITIGATION
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.offwhite };

    headerEyebrow(s, "RISICI · HÅNDTERING");
    s.addText("Hvad kan gå galt — og hvordan vi forhindrer det", {
      x: 0.7, y: 0.95, w: 12, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 30, color: C.charDark, bold: true, margin: 0,
    });

    const risks = [
      {
        risk: "DNS-skift går galt → site nede",
        mitigation: "Staging-URL valideres 100% før DNS skiftes. Rollback inden for 5 minutter via One.com hvis nødvendigt.",
      },
      {
        risk: "Mail-leverance ender i spam",
        mitigation: "SPF + DKIM + DMARC opsættes på malerfirmaetbach.dk fra dag 1. Resend giver bedst leverance på markedet.",
      },
      {
        risk: "Make.com-flow fejler → leads tabes",
        mitigation: "Backup-kopi af lead sendes direkte til Adams e-mail som sikkerhedsnet. Make.com fejlnotifikationer aktiveres.",
      },
      {
        risk: "Adam glemmer Sanity-login",
        mitigation: "Login med Google-konto (Adams eksisterende). Skriftlig CMS-guide vedlagt som PDF + video.",
      },
      {
        risk: "GDPR-klage fra besøgende",
        mitigation: "Fuld cookie-samtykke før sporing. Privatlivspolitik tilpasset Datatilsynets vejledning. Ret til indsigt og sletning automatiseret.",
      },
      {
        risk: "Performance falder ved trafik-stigning",
        mitigation: "Vercel CDN skalerer automatisk. Gratis tier dækker ~100k besøg/md. Lighthouse 90+ verificeret før go-live.",
      },
    ];

    const rx = 0.7, ry = 2.3, rw = 6.0, rh = 1.5, rgap = 0.13;
    risks.forEach((r, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = rx + col * (rw + rgap);
      const y = ry + row * (rh + rgap);
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: rw, h: rh,
        fill: { color: C.white }, line: { color: C.lightGray, width: 0.5 },
        shadow: sShadow(),
      });
      // Left red strip
      s.addShape(pres.shapes.RECTANGLE, {
        x, y, w: 0.08, h: rh,
        fill: { color: C.redAccent }, line: { type: "none" },
      });
      // Risk title
      s.addText("RISIKO:", {
        x: x + 0.3, y: y + 0.18, w: rw - 0.6, h: 0.3,
        fontFace: FONT_BODY, fontSize: 9, color: C.redAccent, bold: true, charSpacing: 4, margin: 0,
      });
      s.addText(r.risk, {
        x: x + 0.3, y: y + 0.4, w: rw - 0.6, h: 0.4,
        fontFace: FONT_HEADER, fontSize: 13, color: C.charDark, bold: true, margin: 0,
      });
      // separator
      s.addShape(pres.shapes.LINE, {
        x: x + 0.3, y: y + 0.85, w: rw - 0.6, h: 0,
        line: { color: C.lightGray, width: 0.5 },
      });
      s.addText("Håndtering:", {
        x: x + 0.3, y: y + 0.92, w: rw - 0.6, h: 0.25,
        fontFace: FONT_BODY, fontSize: 9, color: C.sageDark, bold: true, charSpacing: 3, margin: 0,
      });
      s.addText(r.mitigation, {
        x: x + 0.3, y: y + 1.13, w: rw - 0.6, h: 0.35,
        fontFace: FONT_BODY, fontSize: 10, color: C.warmGray, valign: "top", margin: 0,
      });
    });

    pageFooter(s, pres, 15);
  }

  // ========================================================
  // SLIDE 16 — NÆSTE SKRIDT
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.charDark };

    // Hero image
    s.addImage({ path: "img2.jpg", x: 6.7, y: 0, w: 6.65, h: H, sizing: { type: "cover", w: 6.65, h: H } });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 6.7, y: 0, w: 6.65, h: H,
      fill: { color: C.charDark, transparency: 50 }, line: { type: "none" },
    });

    headerEyebrowDark(s, "BESLUTNING");
    s.addText("Næste skridt", {
      x: 0.7, y: 0.95, w: 6, h: 0.9,
      fontFace: FONT_HEADER, fontSize: 44, color: C.white, bold: true, margin: 0,
    });
    s.addText("Fra godkendelse til lancering på 4–5 uger.", {
      x: 0.7, y: 1.85, w: 6, h: 0.4,
      fontFace: FONT_BODY, fontSize: 14, color: C.sageLight, italic: true, margin: 0,
    });

    const next = [
      { num: "01", title: "Shareholder-godkendelse", desc: "Af stack, omkostninger og tidslinje" },
      { num: "02", title: "Adgangsnøgler",          desc: "Login til GitHub, Vercel, Sanity, Resend, Calendly, Make.com, Airtable" },
      { num: "03", title: "Indhold & billeder",     desc: "Endelig korrekturlæsning af tekster og udvælgelse af projekt-billeder" },
      { num: "04", title: "Udvikling starter",      desc: "Daglige fremskridtsopdateringer og staging-URL fra første uge" },
      { num: "05", title: "Test & launch",          desc: "Adam og shareholders godkender før vi skifter DNS" },
    ];

    next.forEach((n, i) => {
      const y = 2.6 + i * 0.85;
      // num
      s.addText(n.num, {
        x: 0.7, y, w: 0.9, h: 0.7,
        fontFace: FONT_HEADER, fontSize: 30, color: C.sage, bold: true, italic: true,
        valign: "top", margin: 0,
      });
      s.addText(n.title, {
        x: 1.7, y, w: 4.7, h: 0.35,
        fontFace: FONT_HEADER, fontSize: 14, color: C.white, bold: true, margin: 0,
      });
      s.addText(n.desc, {
        x: 1.7, y: y + 0.35, w: 4.7, h: 0.4,
        fontFace: FONT_BODY, fontSize: 10.5, color: C.sageLight, valign: "top", margin: 0,
      });
    });

    // Bottom CTA on right
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.3, y: 5.5, w: 5.4, h: 1.5,
      fill: { color: C.sage }, line: { type: "none" },
      shadow: sShadowLg(),
    });
    s.addText("Klar til at starte.", {
      x: 7.5, y: 5.65, w: 5.0, h: 0.5,
      fontFace: FONT_HEADER, fontSize: 22, color: C.white, bold: true, italic: true, margin: 0,
    });
    s.addText("Når shareholders giver grønt lys, kører første sprint i gang dagen efter.", {
      x: 7.5, y: 6.15, w: 5.0, h: 0.7,
      fontFace: FONT_BODY, fontSize: 11, color: C.white, valign: "top", margin: 0,
    });

    pageFooter(s, pres, 16, true);
  }

  // ========================================================
  // SLIDE 17 — THANK YOU / KONTAKT
  // ========================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.charDark };

    s.addImage({ path: "img3.jpg", x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: W, h: H,
      fill: { color: C.charDark, transparency: 25 }, line: { type: "none" },
    });

    s.addShape(pres.shapes.LINE, {
      x: 0.9, y: 2.5, w: 1.2, h: 0,
      line: { color: C.sage, width: 1.5 },
    });
    s.addText("MALERFIRMAET BACH APS", {
      x: 0.9, y: 2.65, w: 11, h: 0.4,
      fontFace: FONT_BODY, fontSize: 12, color: C.sageLight, charSpacing: 8, bold: true, margin: 0,
    });
    s.addText("Tak for jeres tid.", {
      x: 0.9, y: 3.1, w: 11, h: 1.3,
      fontFace: FONT_HEADER, fontSize: 64, color: C.white, bold: true, italic: true, margin: 0,
    });
    s.addText("Spørgsmål er mere end velkomne.", {
      x: 0.9, y: 4.6, w: 11, h: 0.5,
      fontFace: FONT_BODY, fontSize: 16, color: C.sageLight, italic: true, margin: 0,
    });

    // Contact bar
    const cy = 6.5;
    s.addShape(pres.shapes.LINE, {
      x: 0.9, y: cy - 0.15, w: 11.5, h: 0,
      line: { color: C.sage, width: 0.7 },
    });
    s.addText("Malerfirmaet Bach ApS  ·  Høje Gladsaxe 68, 2860 Søborg  ·  CVR 44 07 11 50", {
      x: 0.9, y: cy, w: 11.5, h: 0.3,
      fontFace: FONT_BODY, fontSize: 10, color: C.midGray, charSpacing: 3, margin: 0,
    });
    s.addText("41 44 07 11  ·  info@malerfirmaetbach.dk  ·  malerfirmaetbach.dk", {
      x: 0.9, y: cy + 0.3, w: 11.5, h: 0.3,
      fontFace: FONT_BODY, fontSize: 10, color: C.midGray, charSpacing: 3, margin: 0,
    });
  }

  // =============================================
  // HELPERS for repeated header & footer
  // =============================================

  function headerEyebrow(slide, label) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 0.55, w: 0.35, h: 0.04,
      fill: { color: C.sage }, line: { type: "none" },
    });
    slide.addText(label, {
      x: 1.15, y: 0.4, w: 11, h: 0.3,
      fontFace: FONT_BODY, fontSize: 10, color: C.sageDark,
      bold: true, charSpacing: 6, margin: 0,
    });
  }
  function headerEyebrowDark(slide, label) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.7, y: 0.55, w: 0.35, h: 0.04,
      fill: { color: C.sage }, line: { type: "none" },
    });
    slide.addText(label, {
      x: 1.15, y: 0.4, w: 11, h: 0.3,
      fontFace: FONT_BODY, fontSize: 10, color: C.sageLight,
      bold: true, charSpacing: 6, margin: 0,
    });
  }

  function pageFooter(slide, pres, num, dark = false) {
    const color = dark ? C.midGray : C.warmGray;
    slide.addText("Malerfirmaet Bach ApS  ·  Strategisk præsentation 2026", {
      x: 0.7, y: H - 0.4, w: 8, h: 0.25,
      fontFace: FONT_BODY, fontSize: 9, color, charSpacing: 2, margin: 0,
    });
    slide.addText(String(num).padStart(2, "0") + " / 17", {
      x: W - 1.5, y: H - 0.4, w: 0.8, h: 0.25,
      fontFace: FONT_BODY, fontSize: 9, color, align: "right", charSpacing: 2, margin: 0,
    });
  }

  // =============================================
  // SAVE
  // =============================================
  const out = path.join(__dirname, "Malerfirmaet-Bach-Shareholder-Praesentation.pptx");
  await pres.writeFile({ fileName: out });
  console.log("✓ Created:", out);
}

build().catch(err => { console.error(err); process.exit(1); });
