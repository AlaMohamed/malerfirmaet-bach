/**
 * Google Drive integration via Service Account.
 *
 * For each lead we:
 *   1. Create a sub-folder named `YYYY-MM-DD HH:MM — Customer Name (kilde)`
 *      inside the parent folder GOOGLE_DRIVE_FOLDER_ID.
 *   2. Upload each provided file into that sub-folder.
 *   3. Return the folder URL so Adam can open it directly from Airtable.
 *
 * Required env vars:
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   - GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY  (full PEM, \n becomes real newline)
 *   - GOOGLE_DRIVE_FOLDER_ID              (Drive folder id Adam shared with the service account)
 *
 * If creds are missing the helpers return a stub result so the API still works.
 */

import { google } from "googleapis";
import { Readable } from "node:stream";

export interface UploadedLead {
  folderId: string | null;
  folderUrl: string | null;
  uploaded: { name: string; id: string | null; viewUrl: string | null; size: number }[];
  stub: boolean;
}

function isConfigured() {
  return (
    !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    !!process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

function getDriveClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return google.drive({ version: "v3", auth });
}

function safeName(s: string) {
  return s.replace(/[<>:"/\\|?*\x00-\x1f]/g, "").trim().slice(0, 120);
}

function timestampSlug() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}.${pad(d.getMinutes())}`;
}

export async function uploadLead(opts: {
  customer: string;
  source: string; // "kontakt" | "sofia-callback"
  files: { name: string; type: string; bytes: Buffer }[];
}): Promise<UploadedLead> {
  if (!isConfigured()) {
    console.log("[drive] not configured — logging metadata only", {
      customer: opts.customer,
      source: opts.source,
      files: opts.files.map((f) => ({ name: f.name, type: f.type, size: f.bytes.length })),
    });
    return { folderId: null, folderUrl: null, uploaded: [], stub: true };
  }

  const drive = getDriveClient();
  const parent = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const folderName = `${timestampSlug()} — ${safeName(opts.customer)} (${opts.source})`;

  // Create folder
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parent],
    },
    fields: "id, webViewLink",
  });

  const folderId = folder.data.id ?? null;
  const folderUrl = folder.data.webViewLink ?? null;

  const uploaded: UploadedLead["uploaded"] = [];
  for (const f of opts.files) {
    const res = await drive.files.create({
      requestBody: {
        name: safeName(f.name),
        parents: folderId ? [folderId] : [parent],
      },
      media: {
        mimeType: f.type || "application/octet-stream",
        body: Readable.from(f.bytes),
      },
      fields: "id, webViewLink",
    });
    uploaded.push({
      name: f.name,
      id: res.data.id ?? null,
      viewUrl: res.data.webViewLink ?? null,
      size: f.bytes.length,
    });
  }

  return { folderId, folderUrl, uploaded, stub: false };
}
