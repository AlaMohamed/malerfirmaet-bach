/**
 * Build a footer-specific logo by:
 *   1. Extracting the LEFT portion (B icon) with full height
 *   2. Extracting the UPPER-RIGHT text (without tagline)
 *   3. Compositing both onto a transparent canvas
 *   4. Trimming any transparent padding so the visible content sits flush left
 */
const sharp = require("sharp");
const path = require("path");

const SRC = path.join(__dirname, "..", "public", "logo.png");
const OUT = path.join(__dirname, "..", "public", "logo-footer.png");

// Empirical bounding boxes derived from pixel scan of logo.png
// (see scripts/crop-footer-logo.notes if curious)
const LEFT = { left: 130, top: 30, width: 260, height: 290 }; // B icon
const TEXT = { left: 400, top: 115, width: 460, height: 130 }; // Malerfirmaet Bach ApS (NO tagline)

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log(`Source: ${meta.width} × ${meta.height}`);

  const leftBuf = await sharp(SRC).extract(LEFT).toBuffer();
  const textBuf = await sharp(SRC).extract(TEXT).toBuffer();

  // Position text vertically centred against B icon
  const canvasW = LEFT.width + 30 + TEXT.width; // gap = 30
  const canvasH = LEFT.height;
  const textTop = Math.round((canvasH - TEXT.height) / 2);

  await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: leftBuf, top: 0, left: 0 },
      { input: textBuf, top: textTop, left: LEFT.width + 30 },
    ])
    .png()
    .toFile(OUT);

  // Now trim any transparent padding so logo sits flush against div edges
  const trimmed = await sharp(OUT).trim({ threshold: 5 }).png().toBuffer();
  await sharp(trimmed).toFile(OUT);

  const outMeta = await sharp(OUT).metadata();
  console.log(`Output: ${outMeta.width} × ${outMeta.height}  →  ${OUT}`);
})().catch((e) => { console.error(e); process.exit(1); });
