/**
 * Pre-optimize all images in public/images so Next.js Image
 * doesn't have to crunch 7-9 MB originals on the first request.
 *
 * - Resize so the long edge ≤ MAX_EDGE
 * - Re-encode JPEG at quality 82 (mozjpeg) — same visual result, 80-95% smaller
 * - Replace original file in place
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..", "public", "images");
const MAX_EDGE = 2200; // generous for retina; still cuts file size dramatically
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 80;

async function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(jpe?g|png|webp)$/i.test(name)) out.push(p);
  }
  return out;
}

async function optimize(filePath) {
  const original = fs.statSync(filePath).size;
  const ext = path.extname(filePath).toLowerCase();
  const tmp = filePath + ".tmp";

  let pipeline = sharp(filePath, { failOn: "none" }).rotate(); // honour EXIF orientation; tolerate malformed JPEGs
  const meta = await pipeline.metadata();
  const longEdge = Math.max(meta.width || 0, meta.height || 0);
  if (longEdge > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: meta.width >= meta.height ? MAX_EDGE : null,
      height: meta.height > meta.width ? MAX_EDGE : null,
      withoutEnlargement: true,
    });
  }
  if (ext === ".png") {
    pipeline = pipeline.png({ compressionLevel: 9, palette: true });
  } else if (ext === ".webp") {
    pipeline = pipeline.webp({ quality: WEBP_QUALITY });
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true });
  }
  await pipeline.toFile(tmp);

  const newSize = fs.statSync(tmp).size;
  if (newSize < original) {
    fs.renameSync(tmp, filePath);
    return { original, newSize, kept: true };
  }
  fs.unlinkSync(tmp);
  return { original, newSize: original, kept: false };
}

(async () => {
  const files = await walk(ROOT);
  console.log(`Found ${files.length} images.`);
  let totalBefore = 0, totalAfter = 0;
  for (const f of files) {
    try {
      const r = await optimize(f);
      totalBefore += r.original;
      totalAfter += r.newSize;
      const before = (r.original / 1024 / 1024).toFixed(2);
      const after = (r.newSize / 1024 / 1024).toFixed(2);
      const pct = ((1 - r.newSize / r.original) * 100).toFixed(0);
      const tag = r.kept ? "✓" : "—";
      console.log(`  ${tag}  ${before} → ${after} MB (-${pct}%)  ${path.relative(ROOT, f)}`);
    } catch (err) {
      console.warn(`  ✗ failed: ${f}: ${err.message}`);
    }
  }
  const mbBefore = (totalBefore / 1024 / 1024).toFixed(1);
  const mbAfter = (totalAfter / 1024 / 1024).toFixed(1);
  const pct = ((1 - totalAfter / totalBefore) * 100).toFixed(0);
  console.log(`\nTotal: ${mbBefore} MB → ${mbAfter} MB (${pct}% smaller)`);
})().catch((e) => { console.error(e); process.exit(1); });
