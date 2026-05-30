import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
    loadSourceRegistry,
    getSourceById,
    getSourceByUrl,
    resolveSourceIds,
    validateSourceIdsExist,
    rankSourcesForTopic,
    getSourcesForTopic,
    rejectUnknownExternalUrls,
    _resetSourceRegistryCache,
} from './source-registry';

/**
 * Tests run in two layers:
 *
 *   1. Sanity checks against the committed registry at data/source-
 *      registry.json so the on-disk file always satisfies the structural
 *      contract.
 *   2. Behavioural checks against a tiny ephemeral registry written to a
 *      temp directory so each helper can be driven in isolation.
 */

const ROOT = path.resolve(__dirname, '..', '..');
const REAL_REGISTRY = path.join(ROOT, 'data', 'source-registry.json');

afterEach(() => {
    _resetSourceRegistryCache();
});

describe('committed source registry on disk', () => {
    it('parses and has at least 20 sources', () => {
        const reg = loadSourceRegistry(REAL_REGISTRY);
        expect(reg.sources.length).toBeGreaterThanOrEqual(20);
    });

    it('every source has a unique ID', () => {
        const reg = loadSourceRegistry(REAL_REGISTRY);
        const ids = reg.sources.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('every source has a unique URL', () => {
        const reg = loadSourceRegistry(REAL_REGISTRY);
        const urls = reg.sources.map((s) => s.url.replace(/\/$/, '').toLowerCase());
        expect(new Set(urls).size).toBe(urls.length);
    });

    it('every required field is present', () => {
        const reg = loadSourceRegistry(REAL_REGISTRY);
        for (const s of reg.sources) {
            expect(s.id, 'id').toBeTruthy();
            expect(s.title, `title for ${s.id}`).toBeTruthy();
            expect(s.url, `url for ${s.id}`).toBeTruthy();
            expect(s.url.startsWith('https://'), `${s.id} url must be https`).toBe(true);
            expect(s.domain, `domain for ${s.id}`).toBeTruthy();
            expect(Array.isArray(s.categories), `categories for ${s.id}`).toBe(true);
            expect(s.categories.length, `categories for ${s.id}`).toBeGreaterThan(0);
            expect(s.sourceType, `sourceType for ${s.id}`).toBeTruthy();
            expect(s.lastVerifiedAt, `lastVerifiedAt for ${s.id}`).toBeTruthy();
        }
    });

    it('rejects banned newsroom domains', () => {
        const reg = loadSourceRegistry(REAL_REGISTRY);
        const banned = [
            'reuters.com',
            'nytimes.com',
            'wsj.com',
            'bloomberg.com',
            'forbes.com',
        ];
        for (const s of reg.sources) {
            for (const b of banned) {
                expect(
                    s.domain.endsWith(b),
                    `${s.id} (${s.domain}) is banned`,
                ).toBe(false);
            }
        }
    });
});

describe('registry helpers on an ephemeral registry', () => {
    let tmpDir: string;
    let registryPath: string;

    function writeRegistry() {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sreg-'));
        registryPath = path.join(tmpDir, 'source-registry.json');
        fs.writeFileSync(
            registryPath,
            JSON.stringify({
                schemaVersion: 1,
                sources: [
                    {
                        id: 'ftc_job_scams',
                        title: 'FTC Job Scams',
                        url: 'https://consumer.ftc.gov/articles/job-scams',
                        domain: 'consumer.ftc.gov',
                        categories: ['job-scams', 'general-scam-advice'],
                        region: 'us',
                        sourceType: 'official',
                        lastVerifiedAt: '2026-05-29',
                    },
                    {
                        id: 'scamwatch_jobs',
                        title: 'Scamwatch Jobs',
                        url: 'https://www.scamwatch.gov.au/types-of-scams/jobs-and-employment-scams',
                        domain: 'scamwatch.gov.au',
                        categories: ['job-scams'],
                        region: 'au',
                        sourceType: 'official',
                        lastVerifiedAt: '2026-05-20',
                    },
                    {
                        id: 'generic_alerts',
                        title: 'FTC Scam Alerts',
                        url: 'https://consumer.ftc.gov/scams',
                        domain: 'consumer.ftc.gov',
                        categories: ['general-scam-advice', 'reporting-scams'],
                        region: 'us',
                        sourceType: 'official',
                        lastVerifiedAt: '2026-05-29',
                    },
                ],
            }),
        );
        _resetSourceRegistryCache();
    }

    afterEach(() => {
        if (tmpDir) fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('getSourceById returns null for unknown ids', () => {
        writeRegistry();
        expect(getSourceById('does_not_exist', registryPath)).toBeNull();
        expect(getSourceById('ftc_job_scams', registryPath)?.id).toBe('ftc_job_scams');
    });

    it('getSourceByUrl finds a registered URL with/without trailing slash', () => {
        writeRegistry();
        expect(getSourceByUrl('https://consumer.ftc.gov/scams', registryPath)?.id).toBe(
            'generic_alerts',
        );
        expect(
            getSourceByUrl('https://consumer.ftc.gov/scams/', registryPath)?.id,
        ).toBe('generic_alerts');
    });

    it('resolveSourceIds separates resolved from missing IDs', () => {
        writeRegistry();
        const r = resolveSourceIds(['ftc_job_scams', 'does_not_exist'], registryPath);
        expect(r.resolved.map((s) => s.id)).toEqual(['ftc_job_scams']);
        expect(r.missing).toEqual(['does_not_exist']);
    });

    it('validateSourceIdsExist returns only the unknown IDs', () => {
        writeRegistry();
        expect(
            validateSourceIdsExist(['ftc_job_scams', 'bad_id', 'generic_alerts'], registryPath),
        ).toEqual(['bad_id']);
    });

    it('rankSourcesForTopic orders by category match then region', () => {
        writeRegistry();
        const ranked = rankSourcesForTopic(
            { categories: ['job-scams'], region: 'au' },
            registryPath,
        );
        expect(ranked[0].id).toBe('scamwatch_jobs');
    });

    it('getSourcesForTopic guarantees a minimum source count via fallbacks', () => {
        writeRegistry();
        // No category matches → fallback to evergreens.
        const picked = getSourcesForTopic(
            { categories: ['non-existent-cluster'] },
            { min: 2, registryPath },
        );
        expect(picked.length).toBeGreaterThanOrEqual(2);
        expect(picked.some((s) => s.id === 'generic_alerts')).toBe(true);
    });

    it('rejectUnknownExternalUrls flags URLs not in the registry', () => {
        writeRegistry();
        const md = `
Read the [FTC job scams page](https://consumer.ftc.gov/articles/job-scams).

Also see https://reuters.com/article/fake-job-1234 for context.

This internal link is fine: [our checker](/check).

And here's a totally fabricated URL: https://www.ftc.gov/news-events/fake-press-release-2026.
`;
        const offenders = rejectUnknownExternalUrls(md, registryPath);
        expect(offenders).toContain('https://reuters.com/article/fake-job-1234');
        expect(
            offenders.some((u) => u.startsWith('https://www.ftc.gov/news-events/fake')),
        ).toBe(true);
        expect(
            offenders.some((u) => u === 'https://consumer.ftc.gov/articles/job-scams'),
        ).toBe(false);
    });

    it('rejectUnknownExternalUrls allows the reporting allowlist', () => {
        writeRegistry();
        const md =
            'Report to https://reportfraud.ftc.gov/ and https://www.scamwatch.gov.au/report-a-scam.';
        expect(rejectUnknownExternalUrls(md, registryPath)).toEqual([]);
    });

    it('rejectUnknownExternalUrls allows internal scamchecker.app URLs', () => {
        writeRegistry();
        const md = 'See https://scamchecker.app/check for the tool.';
        expect(rejectUnknownExternalUrls(md, registryPath)).toEqual([]);
    });
});
