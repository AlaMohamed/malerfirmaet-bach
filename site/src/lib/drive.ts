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
 * On any failure (missing creds, auth error, permission denied, API error,
 * network blip) the helper returns an UploadedLead with `error` set and
 * NEVER throws. The caller can surface the error to the admin email so
 * Adam knows exactly which stage broke.
 */

import { google } from "googleapis";
import { Readable } from "node:stream";

export interface UploadedLead {
  folderId: string | null;
  folderUrl: string | null;
  uploaded: { name: string; id: string | null; viewUrl: string | null; size: number }[];
  /** True when env vars are missing — Drive call was skipped entirely. */
  stub: boolean;
  /** Set when upload failed. Tells the admin email which stage broke. */
  error?: { stage: "config" | "auth" | "folder" | "file" | "unknown"; message: string; details?: string };
  /** How many files the caller passed in — useful when error == "file" so
      Adam knows N files were attempted but failed. */
  attempted: number;
}

function isConfigured() {
  return (
    !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    !!process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

function missingConfig(): string {
  const missing: string[] = [];
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) missing.push("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  if (!process.env.GOOGLE_DRIVE_FOLDER_ID) missing.push("GOOGLE_DRIVE_FOLDER_ID");
  return missing.join(", ");
}

function getDriveClient() {
  // Vercel env vars often arrive with literal "\n" strings inside the PEM body
  // (the dashboard stores them verbatim from the JSON key file). The replace
  // here turns those back into real newlines so JWT parsing succeeds.
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

function describeError(err: unknown): string {
  if (err instanceof Error) {
    // Google API errors carry structured details; surface them.
    interface MaybeGoogleErr {
      message?: string;
      response?: { data?: unknown; status?: number };
      code?: number;
    }
    const e = err as MaybeGoogleErr;
    const status = e.response?.status ?? e.code;
    const data = e.response?.data;
    const dataStr = typeof data === "string" ? data : data ? JSON.stringify(data).slice(0, 300) : "";
    return [
      status ? `HTTP ${status}` : null,
      err.message,
      dataStr ? `(${dataStr})` : null,
    ]
      .filter(Boolean)
      .join(" ");
  }
  return String(err);
}

export async function uploadLead(opts: {
  customer: string;
  source: string; // "kontakt" | "sofia-callback"
  files: { name: string; type: string; bytes: Buffer }[];
}): Promise<UploadedLead> {
  const attempted = opts.files.length;

  // 0. Config check — return early stub if env vars missing
  if (!isConfigured()) {
    console.log("[drive] not configured — logging metadata only", {
      customer: opts.customer,
      source: opts.source,
      attempted,
      missing: missingConfig(),
    });
    return {
      folderId: null,
      folderUrl: null,
      uploaded: [],
      stub: true,
      attempted,
      // Only mark as error if the user actually attached files we now can't
      // store. A leadless of files is fine (form allows zero attachments).
      ...(attempted > 0
        ? {
            error: {
              stage: "config",
              message: `Drive er ikke konfigureret på serveren`,
              details: `Manglende env vars: ${missingConfig()}`,
            },
          }
        : {}),
    };
  }

  // 1. Auth + client
  let drive: ReturnType<typeof getDriveClient>;
  try {
    drive = getDriveClient();
  } catch (err) {
    console.error("[drive] auth setup failed", err);
    return {
      folderId: null,
      folderUrl: null,
      uploaded: [],
      stub: false,
      attempted,
      error: {
        stage: "auth",
        message: "Kunne ikke initialisere Google Drive-klient",
        details: describeError(err),
      },
    };
  }

  // 2. Create the sub-folder
  //
  // supportsAllDrives: true is REQUIRED when the parent folder lives in a
  // Shared Drive (Team Drive). Without it Drive returns a misleading
  // "HTTP 404 File not found" even when the service account is a member
  // of the Shared Drive — Google's API only searches "My Drive" by
  // default. We always set the flag (it's a no-op for personal-Drive
  // folders) so both shared-drive and personal-drive setups work.
  const parent = process.env.GOOGLE_DRIVE_FOLDER_ID!;
  const folderName = `${timestampSlug()} — ${safeName(opts.customer)} (${opts.source})`;

  let folderId: string | null = null;
  let folderUrl: string | null = null;
  try {
    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parent],
      },
      fields: "id, webViewLink",
      supportsAllDrives: true,
    });
    folderId = folder.data.id ?? null;
    folderUrl = folder.data.webViewLink ?? null;
  } catch (err) {
    console.error("[drive] folder creation failed", err);
    const detail = describeError(err);
    // 404 on the parent ID almost always means one of:
    //   a) Folder is in a Shared Drive and supportsAllDrives wasn't honored
    //      (shouldn't happen now that we set it) → service account isn't a
    //      member of the Shared Drive.
    //   b) Folder ID is wrong (typo, or folder was deleted/replaced).
    //   c) Folder is in someone's personal Drive and never shared with the
    //      service account email.
    const isNotFound = /404|not found/i.test(detail);
    return {
      folderId: null,
      folderUrl: null,
      uploaded: [],
      stub: false,
      attempted,
      error: {
        stage: "folder",
        message: isNotFound
          ? "Mappen kan ikke ses af service account (404). Tjek: (1) GOOGLE_DRIVE_FOLDER_ID matcher en eksisterende mappe, (2) service account-emailen er tilføjet som Editor på mappen, (3) hvis det er en Shared Drive er service account-emailen tilføjet som Content Manager i selve drevet."
          : "Kunne ikke oprette undermappe i Google Drive",
        details: detail,
      },
    };
  }

  // 3. Upload each file
  const uploaded: UploadedLead["uploaded"] = [];
  const fileErrors: string[] = [];
  for (const f of opts.files) {
    try {
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
        supportsAllDrives: true,
      });
      uploaded.push({
        name: f.name,
        id: res.data.id ?? null,
        viewUrl: res.data.webViewLink ?? null,
        size: f.bytes.length,
      });
    } catch (err) {
      console.error("[drive] file upload failed", { file: f.name, err });
      fileErrors.push(`${f.name}: ${describeError(err)}`);
    }
  }

  if (fileErrors.length > 0 && uploaded.length === 0) {
    // All file uploads failed — most often the "Service Accounts do not
    // have storage quota" 403 when the parent is a personal-Gmail Drive
    // folder. The folder we just created would be an empty orphan
    // cluttering Adam's Drive on every submission, so delete it here.
    // Best-effort: if cleanup itself fails we just log; the form has
    // already succeeded from the user's perspective and the photos are
    // safe as email attachments.
    if (folderId) {
      try {
        await drive.files.delete({ fileId: folderId, supportsAllDrives: true });
        console.log("[drive] cleaned up empty orphan folder", folderId);
      } catch (cleanupErr) {
        console.warn("[drive] orphan folder cleanup failed", folderId, cleanupErr);
      }
    }
    // Detect the specific "no storage quota" error so we can give Adam an
    // actionable message instead of dumping the raw Google response.
    const joined = fileErrors.join(" | ");
    const isQuota = /storage quota|shared drive|oauth delegation/i.test(joined);
    return {
      folderId: null,
      folderUrl: null,
      uploaded,
      stub: false,
      attempted,
      error: {
        stage: "file",
        message: isQuota
          ? `Personlig Gmail-Drive accepterer ikke service-account uploads. Skift til en Shared Drive (Google Workspace) for at fixe permanent.`
          : `${fileErrors.length} fil(er) kunne ikke uploades`,
        details: joined,
      },
    };
  }

  // Partial success: some files made it, some didn't. Return success with
  // the uploaded array — caller can compare uploaded.length to attempted to
  // detect partial failures.
  return { folderId, folderUrl, uploaded, stub: false, attempted };
}
