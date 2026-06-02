#!/usr/bin/env node
/**
 * Copies the client-side document-scanner runtime assets into `public/scan/`
 * so they are served same-origin.
 *
 * WHY: the site ships a strict Content-Security-Policy (`default-src 'self'`).
 * Loading the pdf.js worker, the Tesseract OCR worker, the Tesseract core WASM
 * and the English language data from a third-party CDN is blocked by that CSP —
 * and cdnjs doesn't even host the exact pinned pdfjs version, so the old CDN
 * worker URL 404'd. Serving every asset from our own origin makes the scanner
 * work under CSP `'self'` with no runtime CDN dependency, in dev and in
 * production on Vercel.
 *
 * Sources are all npm dependencies (deterministic, no network download):
 *   - pdfjs-dist            → pdf.worker.min.mjs
 *   - tesseract.js          → worker.min.js
 *   - tesseract.js-core     → tesseract-core*.{js,wasm} (all variants)
 *   - @tesseract.js-data/eng→ eng.traineddata.gz
 *
 * Output (`public/scan/`) is git-ignored and regenerated on install + build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const OUT = path.join(ROOT, 'public', 'scan');
const OUT_TESS = path.join(OUT, 'tesseract');
const OUT_LANG = path.join(OUT_TESS, 'lang');

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

/** Resolve a file inside an installed package, throwing a clear error if absent. */
function pkgFile(pkg, ...segments) {
    const pkgJson = require.resolve(`${pkg}/package.json`);
    const full = path.join(path.dirname(pkgJson), ...segments);
    if (!fs.existsSync(full)) {
        throw new Error(`[prepare-scan-assets] missing ${pkg}/${segments.join('/')} — run "npm install"`);
    }
    return full;
}

function copy(src, dest) {
    ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
}

function main() {
    ensureDir(OUT);
    ensureDir(OUT_TESS);
    ensureDir(OUT_LANG);

    // 1. pdf.js worker (single module file).
    copy(pkgFile('pdfjs-dist', 'build', 'pdf.worker.min.mjs'), path.join(OUT, 'pdf.worker.min.mjs'));

    // 2. Tesseract main worker script.
    copy(pkgFile('tesseract.js', 'dist', 'worker.min.js'), path.join(OUT_TESS, 'worker.min.js'));

    // 3. Tesseract core — copy every canonical variant so the worker can pick
    //    the right one (simd / relaxedsimd / lstm) at runtime via feature
    //    detection. We skip the stray "<name> 2.ext" duplicate files some
    //    local installs leave behind; a clean CI install won't have them.
    const coreDir = path.dirname(require.resolve('tesseract.js-core/package.json'));
    let coreCount = 0;
    for (const name of fs.readdirSync(coreDir)) {
        if (name.includes(' ')) continue; // skip "tesseract-core 2.wasm" dupes
        if (/^tesseract-core.*\.(js|wasm)$/.test(name) || name === 'index.js') {
            copy(path.join(coreDir, name), path.join(OUT_TESS, name));
            coreCount++;
        }
    }
    if (coreCount === 0) throw new Error('[prepare-scan-assets] no tesseract.js-core files found');

    // 4. English language data (gzip).
    copy(pkgFile('@tesseract.js-data/eng', '4.0.0', 'eng.traineddata.gz'), path.join(OUT_LANG, 'eng.traineddata.gz'));

    console.log(`[prepare-scan-assets] ✓ copied pdf worker + tesseract worker + ${coreCount} core files + eng lang → public/scan/`);
}

main();
