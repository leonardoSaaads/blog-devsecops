/**
 * Generates WebP variants of the images in `public/` (see src/lib/images/variants.mts).
 *
 * Run by `npm run dev` and `npm run build` (Node with native type stripping).
 * Incremental: only re-encodes images changed since the last run. Reads only regular
 * files inside `public/` (symbolic links are ignored).
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  VARIANT_WIDTHS,
  VARIANTS_DIR,
  isOptimizable,
  variantPath,
} from "../src/lib/images/variants.mts";

const PUBLIC_DIR = path.resolve(import.meta.dirname, "..", "public");
const OUTPUT_DIR = path.join(PUBLIC_DIR, VARIANTS_DIR);
const STAMP_FILE = path.resolve(
  import.meta.dirname,
  "..",
  "node_modules",
  ".cache",
  "optimize-images.json",
);

/** Visual quality close to the original for screenshots, with legible text. */
const WEBP_OPTIONS = { quality: 80, effort: 5, smartSubsample: true } as const;
const SETTINGS = JSON.stringify({ widths: VARIANT_WIDTHS, webp: WEBP_OPTIONS });

async function listImages(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return full === OUTPUT_DIR ? [] : listImages(full);
      return entry.isFile() ? [full] : [];
    }),
  );
  return nested.flat();
}

function publicSrc(file: string): string {
  return `/${path.relative(PUBLIC_DIR, file).split(path.sep).join("/")}`;
}

async function isFresh(source: string, outputs: string[]): Promise<boolean> {
  const sourceTime = (await fs.stat(source)).mtimeMs;
  try {
    const times = await Promise.all(outputs.map(async (out) => (await fs.stat(out)).mtimeMs));
    return times.every((time) => time >= sourceTime);
  } catch {
    return false;
  }
}

async function optimize(file: string): Promise<boolean> {
  const src = publicSrc(file);
  const outputs = VARIANT_WIDTHS.map((width) => path.join(PUBLIC_DIR, variantPath(src, width)!));
  if (await isFresh(file, outputs)) return false;

  const { width: original = 0 } = await sharp(file).metadata();
  await fs.mkdir(path.dirname(outputs[0]!), { recursive: true });
  // Widths above the original would produce the same file: encode once and copy.
  const encoded = new Map<number, string>();
  for (const [index, width] of VARIANT_WIDTHS.entries()) {
    const target = Math.min(width, original);
    const output = outputs[index]!;
    const existing = encoded.get(target);
    if (existing) {
      await fs.copyFile(existing, output);
      continue;
    }
    await sharp(file)
      .resize({ width: target, withoutEnlargement: true })
      .webp(WEBP_OPTIONS)
      .toFile(output);
    encoded.set(target, output);
  }
  return true;
}

async function main(): Promise<void> {
  // Settings that differ from the last run invalidate every variant.
  const previous = await fs.readFile(STAMP_FILE, "utf8").catch(() => "");
  if (previous !== SETTINGS) await fs.rm(OUTPUT_DIR, { recursive: true, force: true });

  const images = (await listImages(PUBLIC_DIR)).filter((file) => isOptimizable(publicSrc(file)));
  const started = performance.now();
  let generated = 0;
  for (const file of images) {
    if (await optimize(file)) generated++;
  }

  await fs.mkdir(path.dirname(STAMP_FILE), { recursive: true });
  await fs.writeFile(STAMP_FILE, SETTINGS);
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  console.log(
    `[images] ${images.length} images, ${generated} updated in ${seconds}s → public/${VARIANTS_DIR}/`,
  );
}

await main();
