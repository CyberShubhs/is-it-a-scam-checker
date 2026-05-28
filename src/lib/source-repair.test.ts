import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import os from 'node:os';

/**
 * Integration test for scripts/repair-blog-sources.mjs.
 *
 * We drive the script against a temp content/blog/ directory and a temp
 * registry, then assert the repaired post:
 *   - dropped invalid (off-registry, paywalled, fake) URLs
 *   - mapped a deep-link dead URL to a registry replacement
 *   - kept the minimum-2-source floor
 *   - softened unsupported quantitative claims and named-warning phrases
 *
 * The script is invoked with `npx tsx`-free Node since it's a .mjs.
 */

const ROOT = path.resolve(__dirname, '..', '..');
const REPAIR_SCRIPT = path.join(ROOT, 'scripts', 'repair-blog-sources.mjs');

describe('repair-blog-sources.mjs', () => {
    it('replaces broken FTC press-release URLs with registry evergreens and softens claims', () => {
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'repair-'));
        // Mirror the directory layout the script expects: it walks
        // content/blog/ relative to process.cwd().
        const contentDir = path.join(tmp, 'content', 'blog');
        const dataDir = path.join(tmp, 'data');
        fs.mkdirSync(contentDir, { recursive: true });
        fs.mkdirSync(dataDir, { recursive: true });
        // Use the project's real registry so the repair has somewhere to map
        // dead URLs into. The behaviour we care about is the script's
        // heuristics, not the registry contents.
        fs.copyFileSync(
            path.join(ROOT, 'data', 'source-registry.json'),
            path.join(dataDir, 'source-registry.json'),
        );

        const post = `---
title: "Sample job scam post"
date: "2026-05-01"
summary: "Test fixture for the repair script."
tags: ["job-scam"]
sources:
  - "https://www.ftc.gov/news-events/news/press-releases/2023/11/ftc-warns-bogus-jobs"
  - "https://www.scamwatch.gov.au/types-of-scams/jobs-employment"
  - "https://www.reuters.com/world/fake-job-2024"
---

The FTC warns that fake job offers cost Americans $4.8 million in 2024.

Read more at [the FTC release](https://www.ftc.gov/news-events/news/press-releases/2023/11/ftc-warns-bogus-jobs).

BBC reports that thousands of victims were targeted.
`;

        fs.writeFileSync(
            path.join(contentDir, '2026-05-01-sample-job-scam-post.mdx'),
            post,
        );

        execSync(`node ${JSON.stringify(REPAIR_SCRIPT)} --apply`, {
            cwd: tmp,
            stdio: 'pipe',
            env: {
                ...process.env,
                REPAIR_BLOG_DIR: contentDir,
                REPAIR_REGISTRY_PATH: path.join(dataDir, 'source-registry.json'),
            },
        });

        const repaired = fs.readFileSync(
            path.join(contentDir, '2026-05-01-sample-job-scam-post.mdx'),
            'utf-8',
        );

        // 1. Reuters URL must be gone — both from frontmatter and body.
        expect(repaired).not.toContain('reuters.com');

        // 2. Invented FTC press-release URL must be gone from frontmatter.
        expect(repaired).not.toContain(
            'ftc-warns-bogus-jobs',
        );

        // 3. An evergreen replacement should appear in `sources:`.
        expect(repaired).toMatch(
            /https:\/\/consumer\.ftc\.gov\/articles\/job-scams/,
        );

        // 4. Unsupported "$4.8 million" claim is softened.
        expect(repaired).not.toContain('$4.8 million');

        // 5. "FTC warns" and "BBC reports" are softened away.
        expect(repaired).not.toMatch(/\bFTC warns\b/);
        expect(repaired).not.toMatch(/\bBBC reports\b/);

        // 6. At least 2 sources remain after the repair.
        const sourcesBlock = repaired.match(/sources:\s*\n((?:\s+-\s+.*\n)+)/);
        const sourceCount = sourcesBlock
            ? sourcesBlock[1].split('\n').filter((l) => l.trim().startsWith('-')).length
            : 0;
        expect(sourceCount).toBeGreaterThanOrEqual(2);

        fs.rmSync(tmp, { recursive: true, force: true });
    });
});
