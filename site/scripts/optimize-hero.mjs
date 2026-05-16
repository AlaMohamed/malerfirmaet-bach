/**
 * One-off image-optimisation script for hero/background imagery.
 *
 * Source assets straight out of a camera or DOCX export are often
 * larger than they need to be (poor compression, embedded color
 * profiles, etc.). We re-encode through sharp + mozjpeg so the
 * deployed file is the smallest possible at the visual quality we
 * need, then Next/Image generates AVIF / WebP from there on demand.
 *
 * Run from repo root:
 *   node scripts/optimize-hero.mjs \
 *     --src "assets/projekter/Projektbilleder Novo Kalundborg/Novo Nordisk Kalundborg PPV.jpg" \
 *     --out "site/public/images/shared/hero-novo-kalundborg.jpg"
 *
 * Defaults: max width 2400px (covers retina up to 1200px CSS width),
 * sharpen 0.6, quality 86 — visually indistinguishable from the
 * source for hero backgrounds where a gradient overlay sits on top.
 */
import sharp from "sharp";
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { statSync } from "node:fs";

const { values } = parseArgs({
  options: {
    src: { type: "string" },
    out: { type: "string" },
    maxWidth: { type: "string", default: "2400" },
    quality: { type: "string", default: "86" },
  },
});

if (!values.src || !values.out) {
  console.error("usage: node scripts/optimize-hero.mjs --src <input> --out <output>");
  process.exit(1);
}

const srcPath = resolve(values.src);
const outPath = resolve(values.out);
const maxW = parseInt(values.maxWidth, 10);
const q = parseInt(values.quality, 10);

const srcMeta = await sharp(srcPath).metadata();
const srcStat = statSync(srcPath);
console.log(`Source: ${srcPath}`);
console.log(`  ${srcMeta.width}×${srcMeta.height} · ${(srcStat.size / 1024).toFixed(0)} KB`);

// Don't upscale — sharp's withoutEnlargement keeps native size when
// source is smaller than maxWidth. Upscaled pixels would just be
// interpolated blur, not real detail.
const outW = Math.min(srcMeta.width ?? maxW, maxW);

await sharp(srcPath)
  .resize({
    width: outW,
    withoutEnlargement: true,
    kernel: sharp.kernel.lanczos3,
  })
  // A light unsharp mask compensates for the slight softening that
  // happens during JPEG re-encoding. Numbers chosen by eye.
  .sharpen({ sigma: 0.7, m1: 0.5, m2: 1 })
  .jpeg({
    quality: q,
    mozjpeg: true, // ~10-20% smaller than libjpeg-turbo at same quality
    chromaSubsampling: "4:4:4", // preserves color fidelity for hero imagery
    progressive: true,
  })
  .toFile(outPath);

const outStat = statSync(outPath);
const outMeta = await sharp(outPath).metadata();
console.log(`Output: ${outPath}`);
console.log(`  ${outMeta.width}×${outMeta.height} · ${(outStat.size / 1024).toFixed(0)} KB`);
console.log(
  `  ${((1 - outStat.size / srcStat.size) * 100).toFixed(0)}% smaller`,
);
