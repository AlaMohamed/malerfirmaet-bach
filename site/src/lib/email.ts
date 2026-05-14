/**
 * Email sending via Resend.
 *
 * Confirmation e-mail includes:
 *   - Branded HTML body (Bach palette)
 *   - Booking details
 *   - "Tilføj til kalender" — iCal attachment
 *   - Aflysnings-link
 *
 * If RESEND_API_KEY is missing the helper logs metadata and returns a stub
 * result, so the API still works in dev.
 */
import { Resend } from "resend";
import { formatHumanDateTime } from "./dk-date";
import { company } from "@/content/site";

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

function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

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

function htmlBody(opts: BookingEmail): string {
  const when = formatHumanDateTime(opts.startISO);
  return `<!doctype html>
<html lang="da">
<body style="margin:0;padding:0;background:#F7F6F2;font-family:Inter,Arial,sans-serif;color:#2d3748">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a202c;margin:0 0 8px">Tak ${opts.customerName.split(" ")[0]} — din besigtigelse er booket</h1>
    <p style="color:#718096;font-size:15px;line-height:1.6;margin:0 0 24px">Sofia har lige bekræftet aftalen i Adams kalender. Adam glæder sig til at møde dig.</p>

    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:24px;margin:24px 0">
      <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7a9e9a;margin:0 0 12px">Tidspunkt</p>
      <p style="font-family:Georgia,serif;font-size:22px;color:#1a202c;margin:0 0 20px">${when}</p>

      <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7a9e9a;margin:0 0 6px">Adresse</p>
      <p style="font-size:15px;color:#2d3748;margin:0 0 20px">${opts.address}</p>

      <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7a9e9a;margin:0 0 6px">Projekt</p>
      <p style="font-size:14px;color:#718096;line-height:1.6;margin:0">${opts.projectDescription || "—"}</p>
    </div>

    <p style="font-size:13px;color:#718096;line-height:1.6;margin:0 0 24px">
      <strong>Tilføj til din egen kalender:</strong> Åbn den vedhæftede <code>.ics</code>-fil — den fungerer i Apple Calendar, Google Calendar, Outlook m.fl.
    </p>

    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
      <tr>
        <td style="background:#2d3748;border-radius:8px">
          <a href="${opts.cancelUrl}" style="display:inline-block;padding:14px 28px;color:#fff;font-size:14px;text-decoration:none;font-weight:500">Aflys eller flyt tiden</a>
        </td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #E2E8F0;margin:32px 0">

    <p style="font-size:13px;color:#718096;line-height:1.6;margin:0 0 12px">
      Spørgsmål?<br>
      <strong style="color:#2d3748">${company.name}</strong><br>
      ${company.phone} · <a href="mailto:${company.email}" style="color:#7a9e9a">${company.email}</a><br>
      ${company.address.street}, ${company.address.postal} ${company.address.city}
    </p>
    <p style="font-family:Georgia,serif;font-style:italic;color:#7a9e9a;font-size:14px;margin:16px 0 0">
      ${company.tagline}
    </p>
  </div>
</body>
</html>`;
}

function textBody(opts: BookingEmail): string {
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
    console.log("[email] Resend not configured — would have sent to:", opts.to);
    return { ok: true, stub: true };
  }

  const ics = buildIcs(opts);

  const r = await client.emails.send({
    from: `${company.name} <${from}>`,
    to: opts.to,
    replyTo: company.email,
    subject: `Bekræftelse: Besigtigelse ${formatHumanDateTime(opts.startISO)}`,
    html: htmlBody(opts),
    text: textBody(opts),
    attachments: [
      {
        filename: "besigtigelse.ics",
        content: Buffer.from(ics, "utf8").toString("base64"),
      },
    ],
  });

  if (r.error) {
    console.error("[email] resend send error", r.error);
    return { ok: false };
  }
  return { ok: true, id: r.data?.id };
}

interface CancelledEmail {
  to: string;
  customerName: string;
  startISO: string;
}

/**
 * Backup notification to Adam — used in two cases:
 *   1. Sofia can't make the outbound call (Retell down, no phone number yet)
 *   2. Sofia completed the call but DID NOT book a time
 *
 * Ensures Adam never misses a lead even when automation fails.
 */
interface AdminLeadEmail {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  source: "sofia-callback" | "kontakt";
  context?: string; // freeform note, e.g. Sofia's call summary
}

export async function sendAdminLeadNotification(opts: AdminLeadEmail): Promise<{ ok: boolean; stub?: boolean }> {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@malerfirmaetbach.dk";
  const to = process.env.LEAD_NOTIFY_EMAIL ?? company.email;

  if (!client) {
    console.log("[email] Resend not configured — would notify Adam:", opts.customerName);
    return { ok: true, stub: true };
  }

  const sourceLabel = opts.source === "sofia-callback" ? "Ring mig op-formular" : "Kontaktformular";
  const subject = `Nyt lead: ${opts.customerName} (${sourceLabel})`;
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#2d3748;padding:24px;max-width:600px">
    <h2 style="font-family:Georgia,serif;margin:0 0 16px">Nyt lead modtaget</h2>
    <p style="color:#718096;margin:0 0 24px">Kilde: <strong>${sourceLabel}</strong></p>
    <div style="background:#F7F6F2;border:1px solid #E2E8F0;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px"><strong>Navn:</strong> ${opts.customerName}</p>
      <p style="margin:0 0 8px"><strong>Telefon:</strong> <a href="tel:${opts.customerPhone}">${opts.customerPhone}</a></p>
      <p style="margin:0 0 8px"><strong>E-mail:</strong> <a href="mailto:${opts.customerEmail}">${opts.customerEmail}</a></p>
      ${opts.context ? `<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #E2E8F0"><strong>Detaljer:</strong><br>${opts.context.replace(/\n/g, "<br>")}</p>` : ""}
    </div>
    <p style="font-size:13px;color:#718096">Hvis Sofia ikke nåede at booke en tid: ring kunden manuelt op.</p>
  </body></html>`;
  const text = [
    `Nyt lead — ${sourceLabel}`,
    ``,
    `Navn:    ${opts.customerName}`,
    `Telefon: ${opts.customerPhone}`,
    `E-mail:  ${opts.customerEmail}`,
    opts.context ? `\nDetaljer:\n${opts.context}` : "",
  ].filter(Boolean).join("\n");

  await client.emails.send({
    from: `${company.name} <${from}>`,
    to,
    replyTo: opts.customerEmail,
    subject,
    html,
    text,
  });
  return { ok: true };
}

interface ContactConfirmation {
  to: string;
  customerName: string;
  besked: string;
  opgavetype?: string;
  adresse?: string;
}

/**
 * Customer-facing confirmation for the kontakt-form submission.
 *
 * Sent immediately after a contact-form lead lands so the customer:
 *   - knows we got the message
 *   - has Adam's direct contact info in their inbox for fast reference
 *   - sees a friendly tone consistent with the booking confirmation
 *
 * If RESEND_API_KEY is unset, returns a stub success (matches the rest of
 * the email helpers — lets dev/preview work without leaking errors).
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

  const html = `<!doctype html>
<html lang="da">
<body style="margin:0;padding:0;background:#F7F6F2;font-family:Inter,Arial,sans-serif;color:#2d3748">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px">
    <h1 style="font-family:Georgia,serif;font-size:28px;color:#1a202c;margin:0 0 8px">Tak ${firstName} — vi har modtaget din henvendelse</h1>
    <p style="color:#718096;font-size:15px;line-height:1.6;margin:0 0 24px">Adam vender tilbage til dig hurtigst muligt — typisk inden for 24 timer på hverdage. Hvis det haster, er du velkommen til at ringe direkte.</p>

    <div style="background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:24px;margin:24px 0">
      <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7a9e9a;margin:0 0 6px">Din besked</p>
      <p style="font-size:14px;color:#2d3748;line-height:1.6;margin:0 0 16px;white-space:pre-wrap">${escapeHtml(opts.besked)}</p>
      ${opts.opgavetype ? `<p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7a9e9a;margin:16px 0 6px;padding-top:16px;border-top:1px solid #F1F1EC">Opgavetype</p><p style="font-size:14px;color:#2d3748;margin:0 0 8px">${escapeHtml(opts.opgavetype)}</p>` : ""}
      ${opts.adresse ? `<p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#7a9e9a;margin:16px 0 6px">Adresse</p><p style="font-size:14px;color:#2d3748;margin:0">${escapeHtml(opts.adresse)}</p>` : ""}
    </div>

    <p style="font-size:13px;color:#718096;line-height:1.6;margin:0 0 24px">
      <strong>Vil du booke en besigtigelse med det samme?</strong><br>
      <a href="${company.url}/book-besigtigelse" style="color:#7a9e9a">${company.url.replace("https://", "")}/book-besigtigelse</a> — Sofia hjælper dig med at finde en tid på under 5 minutter.
    </p>

    <hr style="border:none;border-top:1px solid #E2E8F0;margin:32px 0">

    <p style="font-size:13px;color:#718096;line-height:1.6;margin:0 0 12px">
      <strong style="color:#2d3748">${company.name}</strong><br>
      ${company.phone} · <a href="mailto:${company.email}" style="color:#7a9e9a">${company.email}</a><br>
      ${company.address.street}, ${company.address.postal} ${company.address.city}
    </p>
    <p style="font-family:Georgia,serif;font-style:italic;color:#7a9e9a;font-size:14px;margin:16px 0 0">
      ${company.tagline}
    </p>
  </div>
</body>
</html>`;

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
    `Vil du booke en besigtigelse direkte? ${company.url}/book-besigtigelse`,
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendCancellationConfirmation(opts: CancelledEmail): Promise<{ ok: boolean; stub?: boolean }> {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@malerfirmaetbach.dk";
  if (!client) {
    console.log("[email] Resend not configured — would have sent cancellation to:", opts.to);
    return { ok: true, stub: true };
  }
  const when = formatHumanDateTime(opts.startISO);
  await client.emails.send({
    from: `${company.name} <${from}>`,
    to: opts.to,
    replyTo: company.email,
    subject: `Din besigtigelse er aflyst`,
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#2d3748;padding:24px">
      <h2 style="font-family:Georgia,serif">Din besigtigelse er aflyst</h2>
      <p>Hej ${opts.customerName.split(" ")[0]},</p>
      <p>Vi har modtaget din anmodning om at aflyse besigtigelsen <strong>${when}</strong>. Den er nu fjernet fra Adams kalender.</p>
      <p>Hvis du senere vil booke en ny tid, kan du gøre det på <a href="${company.url}/book-besigtigelse">${company.url.replace("https://", "")}/book-besigtigelse</a> eller ringe os på ${company.phone}.</p>
      <p>Venlige hilsner<br>${company.name}</p>
    </body></html>`,
    text: `Hej ${opts.customerName.split(" ")[0]},\n\nDin besigtigelse ${when} er aflyst.\n\nVenlig hilsen, ${company.name}`,
  });
  return { ok: true };
}
