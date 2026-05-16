/**
 * Server-side image downscaler for contact-form uploads.
 *
 * Modern phone cameras shoot 8-15 MB JPEGs at 12 MP+. Adam doesn't
 * need print resolution to assess a paint job — what matters is the
 * subject is clearly visible. So before we ship a customer's
 * attachment to Drive + the admin email, we transcode it:
 *
 *   - Resize to a max long edge of LONG_EDGE_PX (1920 px). EXIF
 *     orientation is auto-applied so portrait photos don't end up
 *     sideways.
 *   - Re-encode as JPEG with mozjpeg + quality 85. This is
 *     visually indistinguishable from the source for inspection
 *     photos but typically ~10x smaller on disk.
 *
 * Failures are non-fatal. If sharp can't decode a buffer (HEIC on a
 * server build without libheif, corrupt file, etc.) we hand back
 * the original bytes untouched and the upload still proceeds.
 *
 * Notes:
 *   - This runs server-side only — the Next.js API route is nodejs
 *     runtime so sharp's native binary is available.
 *   - Output content type is always image/jpeg regardless of input
 *     because mozjpeg gives us the best size/quality trade-off.
 *     The filename is rewritten to .jpg to match.
 */
import sharp from "sharp";

const LONG_EDGE_PX = 1920;
const JPEG_QUALITY = 85;

export interface ResizedImage {
  name: string;
  type: string;
  bytes: Buffer;
}

/**
 * Best-effort downscale + recompress. Returns the original buffer
 * (typed as the input) if sharp can't process it.
 */
export async function shrinkForUpload(file: {
  name: string;
  type: string;
  bytes: Buffer;
}): Promise<ResizedImage> {
  try {
    const meta = await sharp(file.bytes).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;
    const long = Math.max(w, h);

    // Skip resize when the source is already small enough — saves CPU
    // and avoids generation-loss recompression of already-light files.
    const needsResize = long > LONG_EDGE_PX;

    let pipeline = sharp(file.bytes).rotate(); // EXIF orientation
    if (needsResize) {
      pipeline = pipeline.resize({
        width: w >= h ? LONG_EDGE_PX : undefined,
        height: h > w ? LONG_EDGE_PX : undefined,
        fit: "inside",
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: true,
      });
    }

    const out = await pipeline
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
      .toBuffer();

    // Rewrite filename to .jpg since we re-encoded as JPEG. Keep the
    // original stem so the customer's labels (køkken-før.heic) are
    // still meaningful in the inbox.
    const stem = file.name.replace(/\.[^.]+$/, "");
    return {
      name: `${stem}.jpg`,
      type: "image/jpeg",
      bytes: out,
    };
  } catch (err) {
    // Don't fail the whole upload because sharp choked on one file.
    // Log + pass the original through unchanged.
    console.warn("[image-resize] failed; passing original through:", file.name, err);
    return file;
  }
}
