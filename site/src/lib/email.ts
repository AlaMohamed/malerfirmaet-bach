/**
 * Email sending via Resend — branded transactional templates.
 *
 * All outbound mail goes through the shared `emailShell()` layout so the
 * customer experience is consistent across booking confirmations, contact
 * acknowledgements, admin lead notifications, and cancellation receipts.
 *
 * Design principles
 *   - Mobile-first (max-width 600 px, single column)
 *   - Bulletproof HTML (table-based, inline styles — Gmail/Outlook safe)
 *   - Logo hosted at /logo.png (absolute URL so email clients can fetch it)
 *   - System-font body, Playfair-with-Georgia-fallback display headings
 *   - Brand palette: cream surface, charcoal text, muted-green accents
 *
 * If RESEND_API_KEY is missing each function returns a stub success so
 * preview/dev environments don't error.
 */
import { Resend } from "resend";
import { formatHumanDateTime } from "./dk-date";
import { company } from "@/content/site";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function siteUrl(): string {
  // Prefer the explicit production URL when set (e.g. on Vercel), otherwise
  // fall back to the canonical company URL from site.ts. Either way we always
  // emit https:// absolute URLs so email clients can fetch the logo.
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  return (fromEnv && fromEnv.startsWith("http") ? fromEnv : company.url).replace(/\/$/, "");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─────────────────────────────────────────────────────────────────────────────
// iCalendar attachment (booking confirmations only)
// ─────────────────────────────────────────────────────────────────────────────

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsTime(iso: string): string {
  // YYYYMMDDTHHmmssZ
  const d = new Date(iso);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${mi}${ss}Z`;
}

function buildIcs(opts: BookingEmail): string {
  const now = toIcsTime(new Date().toISOString());
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Malerfirmaet Bach ApS//Sofia//DA",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${opts.eventId}@malerfirmaetbach.dk`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcsTime(opts.startISO)}`,
    `DTEND:${toIcsTime(opts.endISO)}`,
    `SUMMARY:${escapeIcs(`Besigtigelse — ${company.name}`)}`,
    `DESCRIPTION:${escapeIcs(`Adam fra Malerfirmaet Bach kommer og besigtiger din opgave.\n\n${opts.projectDescription}\n\nAflys her: ${opts.cancelUrl}`)}`,
    `LOCATION:${escapeIcs(opts.address)}`,
    `ORGANIZER;CN=${escapeIcs(company.name)}:mailto:${company.email}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared HTML shell (used by every template)
// ─────────────────────────────────────────────────────────────────────────────

interface ShellOpts {
  /** Hidden preview text shown by Gmail/Apple Mail in the inbox list. */
  preheader?: string;
  /** Small all-caps tag above the headline (e.g. "Tak", "Bekræftelse"). */
  eyebrow?: string;
  /** H1 displayed prominently. Plain text — escaped automatically. */
  title: string;
  /** Lead paragraph below the title. May contain pre-escaped HTML. */
  introHtml: string;
  /** Main body content (e.g. detail cards). Pre-escaped HTML. */
  bodyHtml: string;
  /** Optional CTA button. */
  cta?: { url: string; label: string };
  /** Optional tiny note in the outermost footer (replaces default). */
  footerNote?: string;
}

function emailShell(opts: ShellOpts): string {
  const url = siteUrl();
  const logoUrl = `${url}/logo.png`;
  const preheader = opts.preheader
    ? `<div style="display:none;font-size:0;line-height:0;color:transparent;opacity:0;mso-hide:all;max-height:0;overflow:hidden;visibility:hidden">${escapeHtml(opts.preheader)}</div>`
    : "";
  const eyebrow = opts.eyebrow
    ? `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;color:#7a9e9a;margin:0 0 14px">${escapeHtml(opts.eyebrow)}</p>`
    : "";
  const cta = opts.cta
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px">
         <tr>
           <td style="background:#1a202c;border-radius:8px">
             <a href="${opts.cta.url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:500;letter-spacing:0.02em;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif">${escapeHtml(opts.cta.label)}</a>
           </td>
         </tr>
       </table>`
    : "";
  const footerNote = opts.footerNote
    ? escapeHtml(opts.footerNote)
    : "Du modtager denne mail fordi du har henvendt dig til os.";

  return `<!doctype html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(opts.title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#F1F1EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1a202c;-webkit-font-smoothing:antialiased;line-height:1.6">
  ${preheader}
  <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="background:#F1F1EC">
    <tr>
      <td align="center" style="padding:32px 16px 8px">
        <table cellpadding="0" cellspacing="0" border="0" width="600" role="presentation" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(26,32,44,0.04)">

          <!-- Logo on cream -->
          <tr>
            <td align="center" style="background:#F7F6F2;padding:36px 32px 28px;border-bottom:1px solid #ECEAE3">
              <a href="${url}" style="text-decoration:none;display:inline-block;border:0">
                <img src="${logoUrl}" alt="${escapeHtml(company.name)}" width="190" style="display:block;width:190px;max-width:190px;height:auto;border:0" />
              </a>
            </td>
          </tr>

          <!-- Brand accent bar -->
          <tr><td style="height:3px;background:#7a9e9a;line-height:3px;font-size:0">&nbsp;</td></tr>

          <!-- Main content -->
          <tr>
            <td style="padding:44px 36px 24px">
              ${eyebrow}
              <h1 style="font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-weight:500;font-size:30px;line-height:1.2;color:#1a202c;margin:0 0 18px;letter-spacing:-0.005em">${escapeHtml(opts.title)}</h1>
              <div style="font-size:16px;line-height:1.65;color:#4a5568;margin:0 0 28px">${opts.introHtml}</div>
              ${opts.bodyHtml}
              ${cta}
            </td>
          </tr>

          <!-- Soft divider -->
          <tr>
            <td style="padding:0 36px"><hr style="border:none;border-top:1px solid #ECEAE3;margin:8px 0"></td>
          </tr>

          <!-- Contact card -->
          <tr>
            <td style="padding:28px 36px 36px">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
                <tr>
                  <td>
                    <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#718096;line-height:1.7;margin:0">
                      <strong style="color:#1a202c;font-size:14px;letter-spacing:0.01em">${escapeHtml(company.name)}</strong><br>
                      <a href="tel:${company.phoneE164}" style="color:#7a9e9a;text-decoration:none">${escapeHtml(company.phone)}</a> · <a href="mailto:${company.email}" style="color:#7a9e9a;text-decoration:none">${escapeHtml(company.email)}</a><br>
                      ${escapeHtml(company.address.street)}, ${escapeHtml(company.address.postal)} ${escapeHtml(company.address.city)}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:20px">
                    <p style="font-family:'Playfair Display',Georgia,serif;font-style:italic;color:#7a9e9a;font-size:16px;margin:0">"${escapeHtml(company.tagline)}"</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Tiny legal footer outside the card -->
        <table cellpadding="0" cellspacing="0" border="0" width="600" role="presentation" style="max-width:600px;width:100%">
          <tr>
            <td align="center" style="padding:20px 16px 32px">
              <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:11px;color:#a0aec0;margin:0;letter-spacing:0.04em;line-height:1.6">
                CVR ${escapeHtml(company.cvrFormatted)} · ${footerNote}<br>
                <a href="${url}/privatlivspolitik" style="color:#a0aec0;text-decoration:underline">Privatlivspolitik</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Detail-card helpers (reused by multiple templates)
// ─────────────────────────────────────────────────────────────────────────────

function detailRow(label: string, value: string, opts: { last?: boolean } = {}): string {
  return `<tr>
    <td style="padding:14px 0${opts.last ? "" : ";border-bottom:1px solid #ECEAE3"}">
      <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#7a9e9a;margin:0 0 6px">${escapeHtml(label)}</p>
      <p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:15px;color:#1a202c;margin:0;line-height:1.5">${value}</p>
    </td>
  </tr>`;
}

function detailCard(rows: string[]): string {
  return `<table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation" style="background:#FAFAF7;border:1px solid #ECEAE3;border-radius:12px;margin:0 0 24px">
    <tr><td style="padding:8px 20px">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" role="presentation">
        ${rows.join("\n")}
      </table>
    </td></tr>
  </table>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking confirmation
// ─────────────────────────────────────────────────────────────────────────────

interface BookingEmail {
  to: string;
  customerName: string;
  startISO: string;
  endISO: string;
  address: string;
  projectDescription: string;
  cancelUrl: string;
  eventId: string;
}

function bookingHtml(opts: BookingEmail): string {
  const firstName = opts.customerName.split(" ")[0] || opts.customerName;
  const when = formatHumanDateTime(opts.startISO);
  const body = detailCard([
    detailRow("Tidspunkt", `<span style="font-family:'Playfair Display',Georgia,serif;font-size:20px;line-height:1.3">${escapeHtml(when)}</span>`),
    detailRow("Adresse", escapeHtml(opts.address)),
    detailRow("Projekt", escapeHtml(opts.projectDescription || "—"), { last: true }),
  ]) + `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#718096;line-height:1.7;margin:0 0 24px">
    <strong style="color:#1a202c">Tilføj til din egen kalender:</strong> Åbn den vedhæftede <code style="background:#F1F1EC;padding:1px 6px;border-radius:4px;font-size:12px">.ics</code>-fil — den fungerer i Apple Calendar, Google Calendar, Outlook m.fl.
  </p>`;

  return emailShell({
    preheader: `Adam besøger dig ${when} — bekræftelse fra ${company.name}`,
    eyebrow: "Bekræftelse",
    title: `Tak ${firstName} — din besigtigelse er booket`,
    introHtml: `Sofia har lige bekræftet aftalen i Adams kalender. Adam glæder sig til at møde dig.`,
    bodyHtml: body,
    cta: { url: opts.cancelUrl, label: "Aflys eller flyt tiden" },
  });
}

function bookingText(opts: BookingEmail): string {
  return [
    `Hej ${opts.customerName.split(" ")[0]},`,
    ``,
    `Sofia har lige booket din uforpligtende besigtigelse hos ${company.name}.`,
    ``,
    `Tidspunkt: ${formatHumanDateTime(opts.startISO)}`,
    `Adresse:   ${opts.address}`,
    ``,
    `Projekt:`,
    opts.projectDescription || "(ingen beskrivelse)",
    ``,
    `Tilføj til din kalender via den vedhæftede .ics-fil.`,
    ``,
    `Skal du flytte eller aflyse tiden? Klik her:`,
    opts.cancelUrl,
    ``,
    `Spørgsmål? Ring ${company.phone} eller skriv til ${company.email}.`,
    ``,
    `Venlige hilsner`,
    company.name,
    company.tagline,
  ].join("\n");
}

export async function sendBookingConfirmation(opts: BookingEmail): Promise<{ ok: boolean; id?: string; stub?: boolean }> {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@malerfirmaetbach.dk";

  if (!client) {
    console.log("[email] Resend not configured — would have sent booking confirmation to:", opts.to);
    return { ok: true, stub: true };
  }

  const ics = buildIcs(opts);

  const r = await client.emails.send({
    from: `${company.name} <${from}>`,
    to: opts.to,
    replyTo: company.email,
    subject: `Bekræftelse: Besigtigelse ${formatHumanDateTime(opts.startISO)}`,
    html: bookingHtml(opts),
    text: bookingText(opts),
    attachments: [
      {
        filename: "besigtigelse.ics",
        content: Buffer.from(ics, "utf8").toString("base64"),
      },
    ],
  });

  if (r.error) {
    console.error("[email] booking confirmation send error", r.error);
    return { ok: false };
  }
  return { ok: true, id: r.data?.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// Contact form: customer confirmation
// ─────────────────────────────────────────────────────────────────────────────

interface ContactConfirmation {
  to: string;
  customerName: string;
  besked: string;
  opgavetype?: string;
  adresse?: string;
}

/**
 * Customer-facing confirmation sent immediately after a contact-form lead
 * lands so the customer knows we received it and has Adam's direct contact
 * info for fast follow-up.
 */
export async function sendContactConfirmation(opts: ContactConfirmation): Promise<{ ok: boolean; stub?: boolean; id?: string }> {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@malerfirmaetbach.dk";

  if (!client) {
    console.log("[email] Resend not configured — would have sent contact confirmation to:", opts.to);
    return { ok: true, stub: true };
  }

  const firstName = opts.customerName.split(" ")[0] || opts.customerName;
  const subject = `Tak for din henvendelse, ${firstName}`;

  const detailRows: string[] = [];
  if (opts.opgavetype) detailRows.push(detailRow("Opgavetype", escapeHtml(opts.opgavetype)));
  if (opts.adresse) detailRows.push(detailRow("Adresse", escapeHtml(opts.adresse)));
  detailRows.push(detailRow("Din besked", `<span style="white-space:pre-wrap">${escapeHtml(opts.besked)}</span>`, { last: true }));

  const body =
    detailCard(detailRows) +
    `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#718096;line-height:1.7;margin:0 0 8px">
      <strong style="color:#1a202c">Vil du booke en besigtigelse direkte?</strong><br>
      Sofia kan finde en tid på under 5 minutter — eller du kan booke selv i kalenderen.
    </p>`;

  const html = emailShell({
    preheader: `Vi har modtaget din henvendelse — Adam vender tilbage hurtigst muligt`,
    eyebrow: "Tak for din henvendelse",
    title: `Tak ${firstName} — vi har modtaget din besked`,
    introHtml: `Adam vender tilbage til dig hurtigst muligt — typisk inden for 24 timer på hverdage. Hvis det haster, er du velkommen til at ringe direkte.`,
    bodyHtml: body,
    cta: { url: `${siteUrl()}/book-besigtigelse`, label: "Book besigtigelse" },
  });

  const text = [
    `Hej ${firstName},`,
    ``,
    `Tak for din henvendelse til ${company.name}.`,
    `Adam vender tilbage hurtigst muligt — typisk inden for 24 timer på hverdage.`,
    ``,
    `--- Din besked ---`,
    opts.besked,
    opts.opgavetype ? `\nOpgavetype: ${opts.opgavetype}` : "",
    opts.adresse ? `Adresse:    ${opts.adresse}` : "",
    ``,
    `Vil du booke en besigtigelse direkte? ${siteUrl()}/book-besigtigelse`,
    ``,
    `Spørgsmål? Ring ${company.phone} eller skriv til ${company.email}.`,
    ``,
    `Venlige hilsner`,
    company.name,
    company.tagline,
  ].filter(Boolean).join("\n");

  const r = await client.emails.send({
    from: `${company.name} <${from}>`,
    to: opts.to,
    replyTo: company.email,
    subject,
    html,
    text,
  });

  if (r.error) {
    console.error("[email] contact confirmation send error", r.error);
    return { ok: false };
  }
  return { ok: true, id: r.data?.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin lead notification (Adam's inbox)
// ─────────────────────────────────────────────────────────────────────────────

interface AdminLeadEmail {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  source: "sofia-callback" | "kontakt";
  /** Freeform note — Sofia's call summary, contact-form details, etc. */
  context?: string;
}

/**
 * Admin notification sent to Adam (LEAD_NOTIFY_EMAIL, default
 * info@malerfirmaetbach.dk) every time a new lead comes in. Used in three
 * cases:
 *   1. Customer submitted the kontakt form
 *   2. Sofia couldn't make the outbound call (Retell down, no phone yet)
 *   3. Sofia completed the call but didn't book a time
 * Ensures Adam never misses a lead even when automation fails.
 */
export async function sendAdminLeadNotification(opts: AdminLeadEmail): Promise<{ ok: boolean; stub?: boolean; id?: string }> {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@malerfirmaetbach.dk";
  const to = process.env.LEAD_NOTIFY_EMAIL ?? company.email;

  if (!client) {
    console.log("[email] Resend not configured — would notify Adam:", opts.customerName);
    return { ok: true, stub: true };
  }

  const sourceLabel = opts.source === "sofia-callback" ? "Ring mig op-formular" : "Kontaktformular";
  const subject = `Nyt lead: ${opts.customerName} (${sourceLabel})`;

  const rows = [
    detailRow("Kilde", escapeHtml(sourceLabel)),
    detailRow("Navn", escapeHtml(opts.customerName)),
    detailRow(
      "Telefon",
      `<a href="tel:${escapeHtml(opts.customerPhone)}" style="color:#7a9e9a;text-decoration:none;font-weight:500">${escapeHtml(opts.customerPhone)}</a>`,
    ),
    detailRow(
      "E-mail",
      `<a href="mailto:${escapeHtml(opts.customerEmail)}" style="color:#7a9e9a;text-decoration:none;font-weight:500">${escapeHtml(opts.customerEmail)}</a>`,
      { last: !opts.context },
    ),
  ];
  if (opts.context) {
    rows.push(
      detailRow(
        "Detaljer",
        `<span style="white-space:pre-wrap">${escapeHtml(opts.context).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#7a9e9a;text-decoration:underline">$1</a>')}</span>`,
        { last: true },
      ),
    );
  }

  const body =
    detailCard(rows) +
    `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:13px;color:#718096;line-height:1.7;margin:0">
      Hvis Sofia ikke nåede at booke en tid, så ring kunden manuelt op snarest muligt.
    </p>`;

  const html = emailShell({
    preheader: `${opts.customerName} — ${sourceLabel}`,
    eyebrow: "Nyt lead modtaget",
    title: `${opts.customerName}`,
    introHtml: `En ny henvendelse er kommet ind via <strong>${escapeHtml(sourceLabel.toLowerCase())}</strong>. Detaljer nedenfor.`,
    bodyHtml: body,
    cta: { url: `tel:${opts.customerPhone}`, label: "Ring til kunden" },
    footerNote: `Automatisk notifikation fra ${escapeHtml(company.name)}`,
  });

  const text = [
    `Nyt lead — ${sourceLabel}`,
    ``,
    `Navn:    ${opts.customerName}`,
    `Telefon: ${opts.customerPhone}`,
    `E-mail:  ${opts.customerEmail}`,
    opts.context ? `\nDetaljer:\n${opts.context}` : "",
    ``,
    `Hvis Sofia ikke nåede at booke en tid: ring kunden manuelt op.`,
  ].filter(Boolean).join("\n");

  const r = await client.emails.send({
    from: `${company.name} <${from}>`,
    to,
    replyTo: opts.customerEmail,
    subject,
    html,
    text,
  });

  if (r.error) {
    console.error("[email] admin lead notification send error", r.error);
    return { ok: false };
  }
  return { ok: true, id: r.data?.id };
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancellation confirmation
// ─────────────────────────────────────────────────────────────────────────────

interface CancelledEmail {
  to: string;
  customerName: string;
  startISO: string;
}

export async function sendCancellationConfirmation(opts: CancelledEmail): Promise<{ ok: boolean; stub?: boolean; id?: string }> {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@malerfirmaetbach.dk";

  if (!client) {
    console.log("[email] Resend not configured — would have sent cancellation to:", opts.to);
    return { ok: true, stub: true };
  }

  const firstName = opts.customerName.split(" ")[0] || opts.customerName;
  const when = formatHumanDateTime(opts.startISO);

  const body =
    detailCard([
      detailRow(
        "Aflyst besigtigelse",
        `<span style="font-family:'Playfair Display',Georgia,serif;font-size:18px;line-height:1.3">${escapeHtml(when)}</span>`,
        { last: true },
      ),
    ]) +
    `<p style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;font-size:14px;color:#718096;line-height:1.7;margin:0 0 8px">
      Tiden er nu fjernet fra Adams kalender. Hvis du senere vil booke en ny tid, er du velkommen til at gøre det.
    </p>`;

  const html = emailShell({
    preheader: `Din besigtigelse ${when} er aflyst`,
    eyebrow: "Aflysning",
    title: `Din besigtigelse er aflyst`,
    introHtml: `Hej ${escapeHtml(firstName)}, vi har modtaget din anmodning om at aflyse besigtigelsen — den er nu fjernet fra Adams kalender.`,
    bodyHtml: body,
    cta: { url: `${siteUrl()}/book-besigtigelse`, label: "Book en ny tid" },
  });

  const text = [
    `Hej ${firstName},`,
    ``,
    `Din besigtigelse ${when} er aflyst og fjernet fra Adams kalender.`,
    ``,
    `Hvis du senere vil booke en ny tid, kan du gøre det her:`,
    `${siteUrl()}/book-besigtigelse`,
    ``,
    `Eller ring ${company.phone}.`,
    ``,
    `Venlige hilsner`,
    company.name,
  ].join("\n");

  const r = await client.emails.send({
    from: `${company.name} <${from}>`,
    to: opts.to,
    replyTo: company.email,
    subject: `Din besigtigelse er aflyst`,
    html,
    text,
  });

  if (r.error) {
    console.error("[email] cancellation send error", r.error);
    return { ok: false };
  }
  return { ok: true, id: r.data?.id };
}
