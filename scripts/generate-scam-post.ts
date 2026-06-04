/**
 * generate-scam-post.ts
 *
 * Generates a new scam/cybersecurity blog post using AI (Gemini primary, Groq fallback).
 * The AI researches current scam trends and writes an original,
 * SEO-optimised post in a journalistic tone — free of AI patterns.
 *
 * Usage:
 *   GEMINI_API_KEY=xxx GROQ_API_KEY=xxx npx tsx scripts/generate-scam-post.ts
 *
 * Environment variables:
 *   GEMINI_API_KEY — Google Gemini API key (primary)
 *   GROQ_API_KEY   — Groq API key (fallback if Gemini fails)
 */

import * as fs from 'fs';
import * as path from 'path';
import {
    validateGeneratedPostQuality,
    type GeneratedPost,
} from '../src/lib/post-quality';
import { buildCleanBlogSlug } from '../src/lib/blogSlug';
import {
    loadQuestionBank,
    listRemainingQuestions,
    pickUnusedQuestion,
    recordUsedQuestion,
    recordSkippedQuestion,
    type QuestionBankEntry,
} from '../src/lib/question-bank';
import {
    getSourcesForTopic,
    resolveSourceIds,
    rejectUnknownExternalUrls,
    type SourceEntry,
} from '../src/lib/source-registry';

// ── Safety guardrails ──────────────────────────────────────────────────────

/**
 * Strings that MUST NOT appear in the output unless they are inside a clearly
 * labelled warning or "red flags" context (i.e. preceded by 🚩 or inside a
 * section headed "Red Flags" / "Warning").
 */
const DANGEROUS_STRINGS = [
    'send gift cards',
    'download this file',
    'remote access',
];

function validateContent(content: string): void {
    const lines = content.split('\n');
    let inSafeSection = false;

    for (const line of lines) {
        const lower = line.toLowerCase();

        if (/^##?\s+(red flags|warning)/i.test(line)) {
            inSafeSection = true;
            continue;
        }
        if (/^##?\s+/i.test(line)) {
            inSafeSection = false;
            continue;
        }
        const isFlagLine = line.includes('🚩');

        if (!inSafeSection && !isFlagLine) {
            for (const dangerous of DANGEROUS_STRINGS) {
                if (lower.includes(dangerous)) {
                    throw new Error(
                        `Safety check failed: output contains "${dangerous}" outside a warning context. ` +
                        `Move it under a "Red Flags" heading or prefix with 🚩.`,
                    );
                }
            }
        }
    }
}

// ── AI pattern detection & humanisation ────────────────────────────────────

/**
 * Exhaustive list of phrases that betray AI-generated content.
 * These get stripped from every generated post automatically.
 * Organised by category for maintainability.
 */
const AI_SLOP_PHRASES = [
    // Opening clichés
    'in today\'s digital landscape',
    'in today\'s digital age',
    'in today\'s digital world',
    'in today\'s world',
    'in today\'s interconnected world',
    'in today\'s fast-paced world',
    'in an increasingly connected',
    'in an increasingly digital',
    'in an era of',
    'in the ever-evolving world',
    'in the rapidly evolving',
    'as technology continues to evolve',
    'as we navigate the',
    'as the digital world',
    'the digital age has brought',

    // Transition filler
    'it\'s important to note',
    'it is important to note',
    'it\'s worth noting',
    'it is worth noting',
    'it\'s crucial to',
    'it is crucial to',
    'it\'s essential to',
    'it is essential to',
    'it\'s worth mentioning',
    'it is worth mentioning',
    'it\'s no secret that',
    'it is no secret that',
    'it bears mentioning',
    'moreover',
    'furthermore',
    'additionally',
    'consequently',
    'subsequently',

    // Engagement bait
    'let\'s dive in',
    'let\'s dive into',
    'let\'s take a closer look',
    'let\'s explore',
    'let\'s break it down',
    'let\'s examine',
    'let\'s unpack',
    'here\'s what you need to know',
    'here\'s the thing',
    'here is what you should know',
    'without further ado',
    'buckle up',
    'stay tuned',
    'read on to find out',
    'spoiler alert',
    'you won\'t believe',

    // Article self-reference
    'in this article, we will',
    'in this article, we',
    'in this blog post',
    'in this post, we',
    'this article will',
    'this post will',
    'this guide will',
    'we\'ll explore',
    'we\'ll discuss',
    'we\'ll look at',
    'we\'ll examine',
    'we will explore',
    'we will discuss',

    // Conclusion filler
    'in conclusion',
    'to sum up',
    'to summarize',
    'to wrap up',
    'to recap',
    'the bottom line is',
    'all in all',
    'at the end of the day',
    'when all is said and done',
    'the takeaway here',

    // Corporate buzzwords
    'delve into',
    'delving into',
    'deep dive',
    'unpack this',
    'breaking down',
    'the landscape of',
    'navigate the complexities',
    'paradigm shift',
    'synergy',
    'holistic approach',
    'robust solution',
    'robust framework',
    'seamless experience',
    'seamlessly',
    'leverage',
    'leveraging',
    'utilize',
    'utilizing',
    'empower',
    'empowering',
    'game-changer',
    'game changer',
    'cutting-edge',
    'cutting edge',
    'state-of-the-art',
    'revolutionize',
    'revolutionary',
    'groundbreaking',
    'unprecedented',
    'innovative solution',
    'next-level',

    // Guide/list clichés
    'comprehensive guide',
    'ultimate guide',
    'definitive guide',
    'everything you need to know',
    'all you need to know',
    'one-stop',
    'a closer look at',
    'demystifying',
    'demystify',

    // Reassurance filler
    'rest assured',
    'look no further',
    'fear not',
    'don\'t worry',
    'the good news is',
    'the bad news is',

    // False authority
    'serves as a reminder',
    'serves as a stark reminder',
    'serves as a wake-up call',
    'one thing is clear',
    'there\'s no denying',
    'the reality is',
    'the truth is',
    'the fact remains',
    'the fact of the matter',
    'experts agree',
    'studies show',
    'research shows',
    'according to experts',
    'needless to say',
    'it goes without saying',
    'goes without saying',
    'it should come as no surprise',
    'it comes as no surprise',

    // Overused adjectives
    'ever-evolving',
    'ever-changing',
    'ever-growing',
    'ever-increasing',
    'ever-present',
    'rapidly growing',
    'rapidly evolving',
    'rapidly changing',
    'increasingly sophisticated',
    'increasingly complex',
    'powerful tool',
    'invaluable',
    'indispensable',
    'pivotal',
    'paramount',

    // AI self-identification (critical to catch)
    'as an ai',
    'as a language model',
    'i generated',
    'here is your',
    'here\'s your',
    'i hope this helps',
    'i\'ve written',
    'i have written',
    'i\'ve created',
    'i have created',
    'i\'ve generated',
    'i have generated',
    'below is',
    'here is a',
    'i\'ve compiled',
    'i have compiled',
    'i\'ve put together',
    'i have put together',
    'please find',
    'please note that',
    'i\'d be happy to',
    'feel free to',

    // Unnecessary hedging
    'may or may not',
    'could potentially',
    'might possibly',
    'to some extent',
    'in some cases',
    'in many cases',
    'it depends on',
    'various factors',
    'a myriad of',
    'a plethora of',
    'a wide range of',
    'a broad spectrum',
    'multifaceted',
];

function stripAIPatterns(content: string): string {
    let cleaned = content;

    for (const phrase of AI_SLOP_PHRASES) {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match the phrase with optional surrounding punctuation/spaces
        const regex = new RegExp(`\\b${escaped}\\b[,.]?\\s*`, 'gi');
        cleaned = cleaned.replace(regex, '');
    }

    // Fix sentences that now start with lowercase after stripping
    cleaned = cleaned.replace(/\.\s+([a-z])/g, (_, letter) => `. ${letter.toUpperCase()}`);

    // Clean up double spaces, orphaned commas, empty lines
    cleaned = cleaned.replace(/,\s*,/g, ',');
    cleaned = cleaned.replace(/\.\s*\./g, '.');
    cleaned = cleaned.replace(/ {2,}/g, ' ');
    cleaned = cleaned.replace(/^\s+$/gm, '');
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    return cleaned.trim();
}

function detectAIPatterns(content: string): string[] {
    const found: string[] = [];
    const lower = content.toLowerCase();
    for (const phrase of AI_SLOP_PHRASES) {
        if (lower.includes(phrase)) {
            found.push(phrase);
        }
    }
    return found;
}

// ── FindQuestions question bank ────────────────────────────────────────────
//
// The bank lives in data/findquestions-bank.json and the used/skipped
// ledger in data/used-blog-questions.json. All pick/skip helpers are now
// exported from src/lib/question-bank.ts so vitest can drive them against
// a temp directory without invoking this CLI script.

// ── Existing post dedup ────────────────────────────────────────────────────

function getExistingTitles(): string[] {
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    if (!fs.existsSync(blogDir)) return [];

    return fs
        .readdirSync(blogDir)
        .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
        .map((f) => {
            const raw = fs.readFileSync(path.join(blogDir, f), 'utf-8');
            const titleMatch = raw.match(/^title:\s*"(.+)"/m);
            return titleMatch ? titleMatch[1].toLowerCase() : '';
        })
        .filter(Boolean);
}

interface ExistingPostSignal {
    slug: string;
    title: string;
    summary: string;
    tags: string[];
    /** Inferred from tags + title — used for cluster-level dedupe. */
    cluster: string | null;
    /** Named entities: agencies, brand names, dollar amounts. Cheap regex. */
    entities: string[];
}

const CLUSTER_TAG_HINTS: Record<string, string[]> = {
    'job-scams': ['job', 'employment', 'recruitment', 'onboarding'],
    'crypto-checker': ['crypto', 'bitcoin', 'wallet', 'staking', 'mining', 'pig-butchering', 'defi'],
    'sms-checker': ['sms', 'text', 'whatsapp', 'smishing'],
    'phone-checker': ['phone', 'call', 'voice'],
    'email-checker': ['phishing', 'email', 'bec'],
    'website-checker': ['website', 'store', 'shop', 'marketplace', 'rental'],
    australia: ['australia', 'ato', 'mygov', 'auspost', 'scamwatch'],
    uk: ['uk', 'hmrc', 'royal-mail', 'evri', 'action-fraud', 'dvla'],
};

function inferCluster(haystack: string): string | null {
    const lower = haystack.toLowerCase();
    for (const [cluster, hints] of Object.entries(CLUSTER_TAG_HINTS)) {
        if (hints.some((h) => lower.includes(h))) return cluster;
    }
    return null;
}

function extractEntities(haystack: string): string[] {
    const out = new Set<string>();
    const lower = haystack.toLowerCase();
    // Agency / brand keywords
    const tokens = [
        'fbi', 'ftc', 'irs', 'ic3', 'scamwatch', 'reportcyber', 'ato', 'mygov', 'auspost',
        'hmrc', 'dvla', 'royal mail', 'evri', 'action fraud', 'ncsc',
        'commbank', 'nab', 'anz', 'westpac', 'barclays', 'lloyds', 'hsbc', 'monzo', 'santander',
        'paypal', 'venmo', 'zelle', 'payid', 'cashapp',
        'linkt', 'binance', 'coinbase', 'kraken',
        'careconnect', 'foodiefast',
    ];
    for (const t of tokens) if (lower.includes(t)) out.add(t);
    // Dollar amounts e.g. "$5m", "$1.2 million", "£750k"
    for (const m of haystack.match(/[$£€]\s?\d[\d.,]*\s?(m|million|k|thousand|bn|billion)?/gi) ?? []) {
        out.add(m.toLowerCase().replace(/\s+/g, ''));
    }
    return [...out];
}

function getExistingPostSignals(): ExistingPostSignal[] {
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    if (!fs.existsSync(blogDir)) return [];

    return fs
        .readdirSync(blogDir)
        .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'))
        .map((f) => {
            const raw = fs.readFileSync(path.join(blogDir, f), 'utf-8');
            const title = (raw.match(/^title:\s*"(.+)"/m)?.[1] ?? '').toLowerCase();
            const summary = (raw.match(/^summary:\s*"(.+)"/m)?.[1] ?? '').toLowerCase();
            const tagsRaw = raw.match(/^tags:\s*\[(.*?)\]/m)?.[1] ?? '';
            const tags = tagsRaw
                .split(',')
                .map((t) => t.replace(/["'\s]/g, '').toLowerCase())
                .filter(Boolean);
            const signalHaystack = `${title} ${summary} ${tags.join(' ')} ${raw}`;
            return {
                slug: f.replace(/\.mdx$/, ''),
                title,
                summary,
                tags,
                cluster: inferCluster(signalHaystack),
                entities: extractEntities(signalHaystack),
            };
        });
}

// ── Gemini API call with model fallback ────────────────────────────────────

// Gemini is the PRIMARY provider. The weekly post is long-form + high quality,
// so we lead with the strongest model. `GEMINI_MODEL` (env) overrides the
// primary; the rest are in-provider fallbacks for quota/availability. Groq is a
// separate, lower-priority fallback (see callGroq) used only if Gemini fails.
const GEMINI_MODELS = [
    process.env.GEMINI_MODEL || 'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
].filter((m, i, arr) => arr.indexOf(m) === i); // de-dupe if GEMINI_MODEL matches a fallback

async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not set');
    }

    let lastError = '';

    for (const model of GEMINI_MODELS) {
        console.log(`   Trying model: ${model}...`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Try up to 2 attempts per model (with a delay on retry)
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [{ text: prompt }],
                            },
                        ],
                        generationConfig: {
                            temperature: 1.0,
                            topP: 0.95,
                            topK: 40,
                            maxOutputTokens: 16384,
                            responseMimeType: 'application/json',
                        },
                    }),
                });

                if (response.status === 429) {
                    const errBody = await response.text();
                    const retryMatch = errBody.match(/"retryDelay":\s*"(\d+)s"/);
                    const waitSec = retryMatch ? Math.min(parseInt(retryMatch[1], 10), 60) : 30;

                    if (attempt === 1) {
                        console.log(`   ⏳ Rate limited on ${model}, waiting ${waitSec}s...`);
                        await new Promise((r) => setTimeout(r, waitSec * 1000));
                        continue;
                    }

                    lastError = `Rate limited on ${model}`;
                    console.log(`   ⚠️  ${model} quota exhausted, trying next model...`);
                    break;
                }

                if (!response.ok) {
                    const errText = await response.text();
                    lastError = `${model} error ${response.status}: ${errText.slice(0, 200)}`;
                    console.log(`   ⚠️  ${model} returned ${response.status}, trying next model...`);
                    break;
                }

                const data = await response.json();
                const parts = data?.candidates?.[0]?.content?.parts ?? [];
                let text = '';
                for (const part of parts) {
                    if (part.text && !part.thought) {
                        text = part.text;
                    }
                }
                if (!text && parts.length > 0) {
                    text = parts[parts.length - 1]?.text ?? '';
                }

                if (!text) {
                    lastError = `${model} returned empty response`;
                    console.log(`   ⚠️  ${model} returned empty response, trying next model...`);
                    break;
                }

                console.log(`   ✓ Got response from ${model}`);
                return text;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                lastError = `${model} network error: ${msg}`;
                if (attempt === 1) {
                    console.log(`   ⏳ Network error on ${model}, retrying...`);
                    await new Promise((r) => setTimeout(r, 5000));
                    continue;
                }
                break;
            }
        }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError}`);
}

// ── Groq API call (fallback provider) ─────────────────────────────────────

const GROQ_MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
];

async function callGroq(prompt: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY not set');
    }

    let lastError = '';

    for (const model of GROQ_MODELS) {
        console.log(`   Trying Groq model: ${model}...`);

        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a JSON-only response bot. Return ONLY valid JSON with no markdown fences, no commentary, no text before or after the JSON object.',
                            },
                            { role: 'user', content: prompt },
                        ],
                        temperature: 1.0,
                        max_tokens: 4096,
                        response_format: { type: 'json_object' },
                    }),
                });

                if (response.status === 429) {
                    if (attempt === 1) {
                        console.log(`   ⏳ Rate limited on Groq ${model}, waiting 30s...`);
                        await new Promise((r) => setTimeout(r, 30000));
                        continue;
                    }
                    lastError = `Rate limited on Groq ${model}`;
                    console.log(`   ⚠️  Groq ${model} quota exhausted, trying next model...`);
                    break;
                }

                if (!response.ok) {
                    const errText = await response.text();
                    lastError = `Groq ${model} error ${response.status}: ${errText.slice(0, 200)}`;
                    console.log(`   ⚠️  Groq ${model} returned ${response.status}, trying next model...`);
                    break;
                }

                const data = await response.json();
                const text = data?.choices?.[0]?.message?.content ?? '';

                if (!text) {
                    lastError = `Groq ${model} returned empty response`;
                    console.log(`   ⚠️  Groq ${model} returned empty response, trying next model...`);
                    break;
                }

                console.log(`   ✓ Got response from Groq ${model}`);
                return text;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                lastError = `Groq ${model} network error: ${msg}`;
                if (attempt === 1) {
                    console.log(`   ⏳ Network error on Groq ${model}, retrying...`);
                    await new Promise((r) => setTimeout(r, 5000));
                    continue;
                }
                break;
            }
        }
    }

    throw new Error(`All Groq models failed. Last error: ${lastError}`);
}

// ── JSON repair ───────────────────────────────────────────────────────────

/**
 * Fix unescaped control characters inside JSON string values.
 * Models often return literal newlines/tabs inside the "body" string
 * which breaks JSON.parse.
 */
function repairJSON(raw: string): string {
    try {
        JSON.parse(raw);
        return raw; // Already valid
    } catch {
        // Walk char-by-char, tracking whether we're inside a string.
        // Replace literal control chars inside strings with their escapes.
        let result = '';
        let inString = false;
        let escaped = false;

        for (let i = 0; i < raw.length; i++) {
            const ch = raw[i];

            if (escaped) {
                result += ch;
                escaped = false;
                continue;
            }

            if (ch === '\\' && inString) {
                result += ch;
                escaped = true;
                continue;
            }

            if (ch === '"') {
                inString = !inString;
                result += ch;
                continue;
            }

            if (inString) {
                if (ch === '\n') { result += '\\n'; continue; }
                if (ch === '\r') { result += '\\r'; continue; }
                if (ch === '\t') { result += '\\t'; continue; }
            }

            result += ch;
        }

        return result;
    }
}

/**
 * Clean raw AI text → parsed JSON, with repair attempts.
 */
function parseAIResponse(raw: string): GeneratedPost {
    let jsonStr = raw.trim();
    if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    }

    // Attempt 1: direct parse
    try {
        return JSON.parse(jsonStr);
    } catch {
        // Attempt 2: repair control chars and retry
        const repaired = repairJSON(jsonStr);
        try {
            return JSON.parse(repaired);
        } catch (parseErr: unknown) {
            const parseMsg = parseErr instanceof Error ? parseErr.message : String(parseErr);
            console.error('Failed to parse AI response as JSON (even after repair).');
            console.error('Parse error:', parseMsg);
            console.error('Response length:', raw.length, 'chars');
            console.error('Last 100 chars:', JSON.stringify(raw.slice(-100)));
            console.error('Raw response (first 500 chars):', raw.slice(0, 500));
            throw new Error('AI did not return valid JSON.');
        }
    }
}

// ── Post generation ────────────────────────────────────────────────────────
// (Slug construction now lives in src/lib/blogSlug.ts → buildCleanBlogSlug.)

/**
 * Topic clusters mapped to live keyword demand (SEO/KWResults.csv) and the
 * FindQuestions PDF (SEO/blog-topics-scam-checker.pdf). Every generated post
 * must be tagged with one primary cluster before writing — this keeps posts
 * tied to a query intent instead of producing generic "alerts" that get
 * marked Crawled - currently not indexed.
 */
const KEYWORD_CLUSTERS = [
    {
        slug: 'website-checker',
        primaryQueries: ['scam website checker', 'scam site checker', 'free website scam checker', 'online store scam checker', 'shopping website scam checker'],
        notes: 'Fake online stores, lookalike domains, checkout fraud, dropshipping scams, social-ad-driven fake sales.',
        relatedInternalRoutes: ['/scam-website-checker', '/check-scam-link', '/guides/is-this-website-legit'],
    },
    {
        slug: 'link-checker',
        primaryQueries: ['scam link checker', 'scam url checker', 'is this link a scam checker'],
        notes: 'Lookalike domains, URL shorteners, phishing links, subdomain tricks.',
        relatedInternalRoutes: ['/check-scam-link', '/guides/how-to-spot-a-fake-link'],
    },
    {
        slug: 'email-checker',
        primaryQueries: ['scam email checker', 'is this email a scam checker'],
        notes: 'Phishing, fake invoices, business email compromise, fake refund emails, sender header spoofing.',
        relatedInternalRoutes: ['/check-scam-email', '/guides/email-phishing-examples'],
    },
    {
        slug: 'sms-checker',
        primaryQueries: ['scam message checker', 'scam text checker', 'text scam checker'],
        notes: 'SMS/WhatsApp phishing, OTP harvesting, parcel-redelivery, family-impersonation, bank fraud SMS.',
        relatedInternalRoutes: ['/check-scam-text', '/guides/scam-text-message-examples', '/guides/whatsapp-scams-examples'],
    },
    {
        slug: 'phone-checker',
        primaryQueries: ['scam phone number checker', 'scam call checker', 'scam call number checker', 'free scam call checker'],
        notes: 'Robocalls, fake bank fraud-team calls, tax-authority arrest threats, tech-support scams, voicemail phishing.',
        relatedInternalRoutes: ['/scam-phone-number-checker', '/guides/bank-impersonation-scams', '/reports/phone-numbers'],
    },
    {
        slug: 'crypto-checker',
        primaryQueries: ['crypto scam checker'],
        notes: 'Wallet drainers, fake exchanges, pig-butchering, fake staking, seed-phrase harvesting, recovery scams.',
        relatedInternalRoutes: ['/crypto-scam-checker', '/blog/crypto-scams', '/reports/crypto-wallets'],
    },
    {
        slug: 'australia',
        primaryQueries: ['scam checker australia', 'scam website checker australia'],
        notes: 'ATO/myGov scams, Scamwatch campaigns, AusPost/Linkt SMS, AU bank impersonation, PayID/Marketplace fraud.',
        relatedInternalRoutes: ['/scam-checker-australia', '/guides/ato-scam-text-email', '/guides/payid-scams-australia'],
    },
    {
        slug: 'uk',
        primaryQueries: ['scam website checker uk'],
        notes: 'HMRC, DVLA, Royal Mail/Evri redelivery scams, Action Fraud campaigns, UK bank impersonation.',
        relatedInternalRoutes: ['/scam-website-checker-uk'],
    },
    {
        slug: 'job-scams',
        primaryQueries: ['job scam', 'fake job offer', 'is my job offer a scam', 'employment scam', 'remote job scam'],
        notes: 'Task scams, fake-cheque overpayments, equipment-purchase scams, identity-theft onboarding, recruitment-fee scams. Source: FindQuestions PDF.',
        relatedInternalRoutes: ['/guides/job-scams', '/blog/job-scams', '/check'],
    },
] as const;

type KeywordCluster = (typeof KEYWORD_CLUSTERS)[number];

interface BuiltPrompt {
    prompt: string;
    cluster: KeywordCluster;
    questionId?: string;
    /**
     * Sources the generator has pre-curated from the registry for this
     * question. The AI is told to reference only these sources (by ID),
     * which guarantees every citation resolves to a real URL.
     */
    preselectedSources: SourceEntry[];
}

/**
 * Build a prompt that asks the model to answer ONE specific question from
 * the FindQuestions bank. This produces stronger search-intent alignment
 * than the legacy random-angle prompt because every post is anchored to a
 * real query a real person typed somewhere.
 *
 * The post is framed as a realistic-scenario Q&A so we never publish fake
 * first-person stories. The author label remains "Shubham Singla" reviewing
 * a composite case — never a fabricated personal anecdote.
 */
function buildQuestionPrompt(
    question: QuestionBankEntry,
    existingTitles: string[],
): BuiltPrompt {
    // Job-related questions get routed to the job-scams cluster so the
    // cluster-specific internal-link gate in post-quality.ts is satisfied.
    const cluster =
        KEYWORD_CLUSTERS.find((c) => c.slug === 'job-scams') ?? KEYWORD_CLUSTERS[0];
    const today = new Date().toISOString().split('T')[0];

    const existingContext =
        existingTitles.length > 0
            ? `\n\nALREADY PUBLISHED (avoid duplicating these titles):\n${existingTitles
                  .map((t) => `- ${t}`)
                  .join('\n')}`
            : '';

    // Pre-curate the citation list from the registry. The AI does NOT get
    // to invent URLs — it can only reference these IDs. This is the single
    // most important change preventing 404/401/hallucinated citations.
    const preselectedSources = getSourcesForTopic(
        {
            categories: ['job-scams', 'fake-cheque-scams', 'general-scam-advice'],
            region: 'global',
            keywordHaystack: `${question.question} ${question.intent}`,
        },
        { min: 3, max: 4 },
    );

    const sourcesBlock = preselectedSources
        .map(
            (s, i) =>
                `  ${i + 1}. id="${s.id}" — ${s.title} (${s.domain}) :: ${s.url}`,
        )
        .join('\n');

    const promptText = `You are writing a blog post for scamchecker.app — a free tool that helps people check if messages, emails, links, and job offers are scams.

The post must answer exactly this one question from a real reader:

QUESTION ID: ${question.id}
QUESTION: ${question.question}
SEARCH INTENT BEHIND THE QUESTION: ${question.intent}

You are writing as "Shubham Singla", the cybersecurity professional who runs scamchecker.app. The voice is calm, plain-English, security-first. Do NOT pretend you personally received this scam — instead, open with a clearly-labelled realistic example scenario / composite case based on common patterns reported on Reddit and to government scam agencies. Never invent specific victim names, employer names, dollar amounts, or laws that you cannot tie to a cited source.

PRIMARY KEYWORD CLUSTER: ${cluster.slug}
Cluster scope: ${cluster.notes}
You MUST include at least one normal markdown link to one of these internal routes in the body: ${cluster.relatedInternalRoutes.join(', ')}.

DATE: ${today}
${existingContext}

REQUIRED STRUCTURE — every section must appear in this order using EXACTLY these H2 headings (case-insensitive match is OK, do not abbreviate):
1. SEO title (50-65 chars) that mirrors the question's intent.
2. Short intro (2-3 sentences) explaining the scenario someone is in when they Google this question.
3. "## ${question.question}" — restate the question verbatim as the first H2.
4. "## Example scenario" — clearly labelled. Open with: "Here's a realistic composite scenario based on patterns reported to Action Fraud, the FTC and r/Scams:" then a 4-6 sentence first-person narrative. Add the disclaimer: "This is a realistic example built from common reports — not a single real person's story."
5. "## How This Scam Works" — plain-English answer to the question, 200-350 words, no bullets. Mention the specific scam mechanics in answer to the question.
6. "## Who Is Being Targeted" — 1-2 paragraphs naming who falls for this pattern (graduates, remote job seekers, etc.) and on which platforms.
7. "## Red Flags to Watch For" — 4-6 🚩 emoji bullets.
8. "## What to Do Before You Click, Reply, or Pay" — numbered steps, 3-5 items, must include a link to [our free scam checker](/check) or the cluster-specific checker.
9. "## What to Do If You've Already Been Affected" — numbered steps, 3-5 items. Must link to [/have-i-been-scammed](/have-i-been-scammed).
10. "## Where to Report" — official channels:
   - 🇦🇺 Australia: [Scamwatch](https://www.scamwatch.gov.au/report-a-scam)
   - 🇺🇸 USA: [FTC ReportFraud](https://reportfraud.ftc.gov/)
   - 🇬🇧 UK: [Action Fraud](https://www.actionfraud.police.uk/)
   - 🌐 International: [Global Scam Reporting Directory](/global-scam-reporting)
11. "## Frequently Asked Questions" — 5 to 8 concise Q&A pairs covering the real follow-up questions a searcher would ask. Each question is a bolded line that ends with a question mark, e.g. **Is it safe to reply just to verify?**, followed by a 1-3 sentence plain-English answer.
12. "## Related Scam Checker pages" — bullet list of 2-3 internal links: at least one checker page, at least one pillar/guide or related blog category page, and /reports where relevant.
13. A short closing sentence with a [free scam checker](/check) link.

The headings #5 through #12 above are mandatory for the deterministic quality gate. Do not rename them. Their wording must match exactly.

INTERNAL LINKING: include AT LEAST 5 internal markdown links to Scam Checker routes spread naturally across the whole body (not all bunched in one list). Always include a clear call-to-action link to the single most relevant checker tool for this topic's cluster.

SOURCES — STRICT RULES (this is the most important section of these instructions):
- You MAY ONLY cite sources from this approved registry. Do NOT invent URLs. Do NOT use BBC, Reuters, news articles, dated press releases, or any URL not in this list:

${sourcesBlock}

- In the JSON output, the "sources" array MUST contain ONLY the registry IDs you used (e.g. ["ftc_job_scams", "ic3_home"]). Do NOT put URLs in "sources".
- In the markdown body, you MAY mention an agency by name (e.g. "the FTC", "Scamwatch", "Action Fraud") and OPTIONALLY include the exact URL from the registry above as a markdown link with descriptive anchor text. Any URL not exactly matching the registry above will cause the post to be rejected.
- Pick at least 3 source IDs from the registry above. Prefer the ones with the most relevant title for the question.
- Do NOT cite Reuters, BBC, the Guardian, Forbes, Bloomberg, the WSJ, the NYT, or other paywalled / bot-blocking newsrooms.
- Do NOT claim "FTC warns X" or "FBI warns Y" unless that specific claim is directly supported by the title of the registry entry you cite.

CLAIM RULES:
- No invented statistics, dollar amounts, victim counts, dates, or incident names.
- Quantitative claims ("millions lost", "thousands affected") are not allowed unless you are citing the IC3 annual report or an evergreen statistics page from the registry. When in doubt, write qualitative language ("widely reported", "common pattern") instead of numbers.
- Frame the post as an evergreen explainer of the scam pattern. Do not pretend a specific news event is breaking unless a real news source is in the registry above.

WORD COUNT: 1800-2800 words in the body (not counting frontmatter). This is a weekly flagship article — go deep, stay specific, and never pad with filler to hit the count.

VOICE rules (non-negotiable):
- Plain English, short paragraphs, active voice.
- No AI clichés. No "in today's digital landscape". No "delve", "leverage", "robust", "seamless", "paramount", "crucial", "invaluable".
- No self-reference ("in this article", "we'll explore").
- The example scenario is always framed as a composite — never claimed as a personal experience of the author.

OUTPUT FORMAT — Return ONLY pure JSON. No markdown fences. No commentary. All newlines inside the body string must be escaped as \\n.
{
  "title": "Title (50-58 chars, under 60) that answers the question",
  "summary": "Meta description (140-155 chars, under 160) that hooks searchers",
  "tags": ["job-scam", "fake-job-offer", "scam-alert"],
  "sourceIds": ["${preselectedSources.map((s) => s.id).slice(0, 3).join('", "')}"],
  "body": "Full markdown body with the structure above",
  "primaryKeyword": "the single search phrase this post should rank for",
  "secondaryKeywords": ["3 to 6 closely related search phrases this post should also rank for"],
  "searchIntent": "informational",
  "audience": "People searching: \\"${question.question.toLowerCase()}\\"",
  "region": "global",
  "category": "${cluster.slug}",
  "questionId": "${question.id}",
  "claimSupport": [
    { "claim": "exact snippet from the body that contains a statistic or named incident", "sourceId": "${preselectedSources[0]?.id ?? 'ftc_scam_alerts'}" }
  ]
}`;

    return {
        prompt: promptText,
        cluster,
        questionId: question.id,
        preselectedSources,
    };
}

function buildPrompt(existingTitles: string[]): BuiltPrompt {
    const existingContext = existingTitles.length > 0
        ? `\n\nALREADY PUBLISHED (you MUST write about a DIFFERENT topic):\n${existingTitles.map((t) => `- ${t}`).join('\n')}`
        : '';

    const today = new Date().toISOString().split('T')[0];

    // Pick a primary keyword cluster first. The post is built around that
    // cluster's intent — not around a generic "alert" angle. This is the
    // single biggest lever for moving posts out of "Crawled - currently not
    // indexed" status in Google Search Console.
    const cluster = KEYWORD_CLUSTERS[Math.floor(Math.random() * KEYWORD_CLUSTERS.length)];
    const clusterBrief = `
PRIMARY KEYWORD CLUSTER FOR THIS POST: ${cluster.slug}
Primary search queries to target: ${cluster.primaryQueries.join(', ')}
Cluster scope: ${cluster.notes}
You MUST naturally include 1-2 of the primary search queries in the title or first H2.
Link to at least one of these related internal routes in the body using a normal markdown link: ${cluster.relatedInternalRoutes.join(', ')}.
`;

    // Preselect a few evergreen sources from the registry so the model
    // never needs to invent URLs. Same mechanism as buildQuestionPrompt.
    const legacyPreselected = getSourcesForTopic(
        {
            categories: ['general-scam-advice', 'reporting-scams'],
            keywordHaystack: cluster.notes,
        },
        { min: 3, max: 4 },
    );
    const legacySourcesBlock = legacyPreselected
        .map(
            (s, i) =>
                `  ${i + 1}. id="${s.id}" — ${s.title} (${s.domain}) :: ${s.url}`,
        )
        .join('\n');

    const angles = [
        'Focus on a specific new scam reported in the last 48 hours. Name the exact scam, the country affected, and how many people have been hit. Only use real, named incidents — do not invent statistics, victim names, or company names.',
        'Write about a new phishing technique or social engineering tactic that criminals are using right now. Be extremely specific about how the attack works technically. Cite at least one credible source URL.',
        'Cover a recent data breach or cybersecurity incident and explain what ordinary people should do to protect themselves. Use the breach\'s real reported numbers from the source URL.',
        'Write about a scam targeting a specific demographic (elderly, students, small business owners, job seekers) with a real recent example. Cite government or major news sources.',
        'Investigate a new type of fraud involving cryptocurrency, investment apps, or payment platforms. Use real platform names. Dollar amounts must be sourced — do not invent.',
        'Cover a government warning or law enforcement action against scammers. Reference the specific agency and their advisory by URL.',
        'Write about a scam exploiting current events (tax season, holidays, natural disasters, new tech releases). Be timely and specific.',
        'Expose a romance scam, employment scam, or rental scam technique with step-by-step details of how the con unfolds.',
    ];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];

    const promptText = `You are writing a blog post for scamchecker.app — a free tool that helps people check if messages, emails, and links are scams.

CRITICAL RULE: You are NOT an AI assistant writing a blog post. You ARE a cybersecurity journalist named "The Scam Checker Team". Write as if you personally investigated this story. Never refer to yourself as AI. Never use phrases like "here is" or "I've compiled" or "below is". The reader should have ZERO indication this was written by AI.

YOUR ASSIGNMENT: ${randomAngle}
${clusterBrief}
${existingContext}

DATE: ${today}

INSTANT-REJECT CRITERIA (the post will be discarded and rewritten if any of these are true):
- The post invents incident names, victim names, company names, or dollar amounts that are not in your cited sources.
- The post has fewer than 2 real, working source URLs from government agencies, recognised news outlets, or established security firms.
- The post lacks ANY of these practical sections: "How the Scam Works", "Red Flags to Watch For", "What to Do Before You Click/Reply/Pay", "What to Do If You've Already Been Affected", "Where to Report", "Related Scam Checker pages".
- The post has no internal links to any Scam Checker route (must include at least 2 of: /check, /check-scam-text, /check-scam-email, /check-scam-link, /scam-website-checker, /scam-phone-number-checker, /crypto-scam-checker, /guides/job-scams, /have-i-been-scammed, /reports, /global-scam-reporting, plus the cluster-specific routes listed above).
- The post duplicates the topic, primary keyword, or victim story of an already-published post in the list below.
- The post is a generic "urgent alert" with no clear query intent or no verifiable specifics.

WRITING VOICE — these rules are non-negotiable:
- Write like a crime reporter at The Guardian or BBC. Short, punchy paragraphs. Active voice. No fluff.
- Start with a SPECIFIC detail — a number, a victim's experience (anonymised), a dollar amount, a date. Never start with a generic statement.
- Use contractions naturally (don't, can't, won't, it's).
- Vary your sentence structure. Mix 5-word sentences with 20-word sentences.
- Include at least one rhetorical question.
- Use transition words sparingly and naturally — never "moreover", "furthermore", "additionally", "consequently", "subsequently".
- NEVER use passive voice when active voice works.
- Be direct. Cut every word that doesn't earn its place.
- Sound like you're telling a mate about something alarming you just read — authoritative but approachable.
- Each paragraph should be 2-3 sentences maximum. No walls of text.

THINGS THAT WILL GET THIS POST REJECTED (instant fail):
- Any opening that starts with "In today's..." or "In an increasingly..." or "As technology..."
- The words: "delve", "landscape", "robust", "seamless", "leverage", "utilize", "empower", "paradigm", "synergy", "holistic", "comprehensive guide", "deep dive"
- Phrases like: "it's important to note", "it's worth noting", "here's what you need to know", "let's dive in", "buckle up", "stay tuned", "in conclusion", "to sum up", "at the end of the day"
- Any self-reference like "in this article", "this post will", "we'll explore", "we'll discuss"
- Any AI self-identification: "as an AI", "I generated", "here is your", "below is", "I've compiled"
- Overuse of bullet points. Use them for red flags ONLY. Everything else should be prose.
- The word "crucial" or "paramount" or "invaluable"
- Starting consecutive paragraphs with the same word

SEO REQUIREMENTS:
- Title: 50-65 characters, primary keyword front-loaded, makes people want to click
- Meta summary: 140-155 characters exactly, secondary keyword included, reads like a Google snippet
- Tags: 3-5 tags mixing broad terms ("phishing", "scam-alert") with specific ones matching the topic
- Primary keyword should appear 3-5 times naturally in the body
- Include 2-3 subheadings phrased as questions people would search on Google

REQUIRED STRUCTURE (every section must be present — no exceptions):
1. Opening hook: A startling specific fact, sourced from one of your URLs. No preamble. Example: "The FTC's 2024 IC3 report recorded $501 million in US job-scam losses." Never invent numbers.
2. "## How This Scam Works" — Prose, step by step with specifics. No bullet points here.
3. "## Who Is Being Targeted" — Be specific: age groups, regions, platforms, occupations.
4. "## Red Flags to Watch For" — Use 🚩 emoji bullets (the ONLY section where bullets are appropriate):
   - 🚩 Flag 1
   - 🚩 Flag 2
   - etc (4-6 flags)
5. "## What to Do Before You Click, Reply, or Pay" — Numbered steps, 3-5 items. Must include running the message through [our free scam checker](/check) or the relevant cluster-specific checker page.
6. "## What to Do If You've Already Been Affected" — Numbered steps, 3-5 items, practical and direct. Must link to [/have-i-been-scammed](/have-i-been-scammed).
7. "## Where to Report" — Use these exact links:
   - 🇦🇺 Australia: [Scamwatch](https://www.scamwatch.gov.au/report-a-scam)
   - 🇺🇸 USA: [FTC ReportFraud](https://reportfraud.ftc.gov/)
   - 🇬🇧 UK: [Action Fraud](https://www.actionfraud.police.uk/)
   - 🌐 International: [Global Scam Reporting Directory](/global-scam-reporting)
8. "## Frequently Asked Questions" — 5 to 8 concise Q&A pairs. Each question is a bolded line ending in a question mark, followed by a 1-3 sentence answer covering the real follow-ups a searcher would have.
9. "## Related Scam Checker pages" — A short bullet list linking to 2-3 of the cluster's related internal routes (listed above) and any other relevant /check-*, /guides/*, or /reports/* routes.
10. A single closing sentence with this internal link naturally included: [free scam checker](/check)

INTERNAL LINKING: include AT LEAST 5 internal markdown links to Scam Checker routes spread across the body, including a clear CTA to the most relevant checker tool.

WORD COUNT: Between 1800 and 2800 words (body only, not frontmatter). This is a weekly flagship article — depth and specificity, never filler.

OPENING RULE: The body must start with an answer-first sentence — what the scam is and what a reader should do — not a generic introduction or hype.

PRIMARY KEYWORD: pick exactly one phrase that this post should rank for. Not a comma-stuffed list. The value of \`primaryKeyword\` in the JSON must be that single phrase.

SEARCH INTENT: choose one of "informational", "commercial", "transactional", "navigational" and put it in \`searchIntent\`.

CLAIM SUPPORT: for every statistic, dollar amount, named agency warning, or named incident in the body, output a \`claimSupport\` entry pairing the exact text from the body with the registry source ID that backs it.

SOURCES — STRICT RULES:
- You MAY ONLY cite sources from this approved registry:

${legacySourcesBlock}

- The "sourceIds" array MUST contain registry IDs only (e.g. ["ftc_scam_alerts", "ic3_home"]). Do NOT use URLs.
- Do NOT cite Reuters, BBC, NYT, Forbes, Bloomberg, WSJ — these block bots and the source-check script rejects them.
- Do NOT make quantitative claims ("X million lost") unless citing IC3 statistics. Default to qualitative descriptions.

OUTPUT FORMAT — Return ONLY pure JSON. No markdown fences. No commentary. No text before or after.
CRITICAL: All newlines in the body MUST be encoded as \\n inside the JSON string. Do NOT use literal newlines inside string values.
{
  "title": "Your Title Here (50-65 chars)",
  "summary": "Your meta description (140-155 chars)",
  "tags": ["tag1", "tag2", "tag3"],
  "sourceIds": ["${legacyPreselected.map((s) => s.id).slice(0, 3).join('", "')}"],
  "body": "Full markdown body with \\n for newlines",
  "primaryKeyword": "scam phone number checker",
  "secondaryKeywords": ["3 to 6 closely related search phrases"],
  "searchIntent": "informational",
  "audience": "Adults receiving suspicious calls or SMS in AU/UK/US",
  "region": "global",
  "category": "${cluster.slug}",
  "claimSupport": [
    { "claim": "exact text snippet from the body", "sourceId": "${legacyPreselected[0]?.id ?? 'ftc_scam_alerts'}" }
  ]
}`;

    return {
        prompt: promptText,
        cluster,
        preselectedSources: legacyPreselected,
    };
}

/**
 * Try to generate a post using a specific provider function.
 * Returns the parsed post or throws on failure.
 */
async function tryProvider(
    name: string,
    callFn: (prompt: string) => Promise<string>,
    prompt: string,
): Promise<GeneratedPost> {
    const raw = await callFn(prompt);
    const parsed = parseAIResponse(raw);

    if (!parsed.title || !parsed.summary || !parsed.body) {
        throw new Error(`${name} response missing required fields (title, summary, or body).`);
    }

    if (!Array.isArray(parsed.tags) || parsed.tags.length === 0) {
        parsed.tags = ['scam-alert'];
    }
    if (!Array.isArray(parsed.sources)) {
        parsed.sources = [];
    }

    return parsed;
}

/**
 * Drive the configured providers (Gemini → Groq) against a single built
 * prompt. Returns the parsed post or throws when every provider fails.
 *
 * Separated from question selection so the retry loop in main() can call
 * this once per attempt without re-running pickUnusedQuestion logic.
 */
async function runProvidersForPrompt(prompt: string): Promise<GeneratedPost> {
    const providers: { name: string; fn: (p: string) => Promise<string> }[] = [];
    if (process.env.GEMINI_API_KEY) {
        providers.push({ name: 'Gemini', fn: callGemini });
    }
    if (process.env.GROQ_API_KEY) {
        providers.push({ name: 'Groq', fn: callGroq });
    }
    if (providers.length === 0) {
        throw new Error('No AI provider available. Set GEMINI_API_KEY and/or GROQ_API_KEY.');
    }

    console.log(
        `🤖 Providers (in order): ${providers.map((p) => p.name).join(' → ')}. Gemini is primary.`,
    );
    let lastError = '';
    for (let i = 0; i < providers.length; i++) {
        const { name, fn } = providers[i];
        try {
            const post = await tryProvider(name, fn, prompt);
            // Log which provider produced the post (name only — never keys).
            console.log(`✅ Generated using provider: ${name}`);
            return post;
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            lastError = msg;
            console.log(`\n⚠️  ${name} failed: ${msg}`);
            if (i < providers.length - 1) {
                console.log(`🔄 Trying next provider...\n`);
            }
        }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError}`);
}

// Note: the previous single-shot `generatePost()` helper was replaced by the
// retry-aware `attemptOneQuestion()` loop in main(). Keeping a thin
// wrapper around runProvidersForPrompt is no longer useful — there is no
// other caller in the codebase.

// ── Disclaimer ─────────────────────────────────────────────────────────────

const DISCLAIMER =
    '> **Disclaimer:** This post is for informational purposes only and does not constitute legal or financial advice. If you believe you have been targeted, contact your bank and local authorities immediately.';

// ── Per-attempt result envelope ────────────────────────────────────────────

/**
 * What happened when we tried to publish one generated post.
 *
 *  - `success`           — file written, ledger updated, action should commit.
 *  - `duplicate-topic`   — dedupe gate rejected the draft; question is
 *                          permanently skipped and the action should try the
 *                          next question without stopping.
 *  - `quality-fail`      — deterministic quality gate rejected the draft;
 *                          the question is NOT skipped (the AI may produce
 *                          something better next run) but we still try the
 *                          next question in this run.
 */
type AttemptOutcome =
    | { type: 'success'; slug: string; questionId?: string }
    | {
          type: 'duplicate-topic';
          questionId?: string;
          matched?: { slug?: string; title?: string };
      }
    | { type: 'quality-fail'; reasons: string[]; questionId?: string }
    // Dry run: the draft passed every gate but was intentionally NOT written.
    | { type: 'dry-run'; questionId?: string; title: string };

/** True when DRY_RUN=true (workflow input) or `--dry-run` is passed. */
const IS_DRY_RUN =
    process.env.DRY_RUN === 'true' || process.argv.includes('--dry-run');

/**
 * Build prompt → call providers → dedupe → quality-gate → write MDX → record
 * the ledger entry. Returns a structured outcome so the caller can decide
 * whether to retry, skip, or stop.
 */
async function attemptOneQuestion(
    blogDir: string,
    questionEntry: QuestionBankEntry | null,
): Promise<AttemptOutcome> {
    const existingTitles = getExistingTitles();
    let prompt: string;
    let cluster: KeywordCluster;
    let questionId: string | undefined;

    if (questionEntry) {
        console.log(
            `🧭 Trying FindQuestions bank entry ${questionEntry.id}: "${questionEntry.question}"`,
        );
        const built = buildQuestionPrompt(questionEntry, existingTitles);
        prompt = built.prompt;
        cluster = built.cluster;
        questionId = built.questionId;
    } else {
        // Bank exhausted — fall back to the legacy random-cluster prompt so
        // the action still produces something useful on long-tail days.
        const built = buildPrompt(existingTitles);
        prompt = built.prompt;
        cluster = built.cluster;
    }

    const post = await runProvidersForPrompt(prompt);
    console.log(`📝 Topic: ${post.title}`);
    console.log(
        `📂 Cluster: ${cluster.slug} (routes: ${cluster.relatedInternalRoutes.join(', ')})`,
    );

    const body = stripAIPatterns(post.body);
    const remaining = detectAIPatterns(body);
    if (remaining.length > 0) {
        console.warn(`⚠️  AI patterns stripped: ${remaining.join(', ')}`);
    }

    // ── Source-ID resolution ──────────────────────────────────────────────
    // The AI was told to emit `sourceIds` (registry IDs). We resolve those
    // into real URLs here. Any unknown ID is a quality-fail. We also fall
    // back to URLs in the legacy `sources` field for backward compatibility
    // with older fixtures, but new posts should always use sourceIds.
    const rawIds = Array.isArray(post.sourceIds)
        ? post.sourceIds.filter((s) => typeof s === 'string')
        : [];
    let resolvedSources: SourceEntry[] = [];
    if (rawIds.length > 0) {
        const r = resolveSourceIds(rawIds);
        if (r.missing.length > 0) {
            return {
                type: 'quality-fail',
                reasons: [
                    `Unknown source IDs: ${r.missing.join(', ')}. The AI may only cite IDs from data/source-registry.json.`,
                ],
                questionId,
            };
        }
        resolvedSources = r.resolved;
    }
    if (resolvedSources.length < 2) {
        return {
            type: 'quality-fail',
            reasons: [
                `Only ${resolvedSources.length} resolved registry source(s); minimum is 2. The AI must emit at least 2 sourceIds.`,
            ],
            questionId,
        };
    }

    // Ban any external URL in the body that isn't in the registry / on the
    // reporting allowlist. This catches AI smuggling URLs into the prose.
    const offenders = rejectUnknownExternalUrls(body);
    if (offenders.length > 0) {
        return {
            type: 'quality-fail',
            reasons: [
                `Body contains ${offenders.length} external URL(s) outside the source registry: ${offenders.slice(0, 3).join(', ')}${offenders.length > 3 ? '…' : ''}`,
            ],
            questionId,
        };
    }

    // Sources written to frontmatter are derived from the resolved registry
    // entries — never from raw AI output. This is what guarantees no
    // hallucinated URL ever lands in a published post.
    const resolvedUrls = resolvedSources.map((s) => s.url);
    // Keep `post.sources` (URL strings) in sync so existing validators that
    // expect the legacy field continue to work.
    post.sources = resolvedUrls;

    // ── MDX assembly ──────────────────────────────────────────────────────
    const sourceYaml = resolvedUrls.length > 0
        ? resolvedUrls.map((s) => `  - "${s}"`).join('\n')
        : '  - "https://consumer.ftc.gov/scam-alerts"';
    const tagYaml = JSON.stringify(post.tags);
    const today = new Date().toISOString().split('T')[0];
    const yamlEscape = (s: string) => s.replace(/"/g, '\\"');
    const optionalLine = (key: string, value: string | undefined) =>
        value ? `${key}: "${yamlEscape(value)}"\n` : '';
    // Build a sourceIds frontmatter block so the repair script and the
    // changed-post source check can verify registry membership directly.
    const sourceIdsYaml = `sourceIds: ${JSON.stringify(rawIds)}\n`;
    // Secondary keywords (weekly long-form posts) — written when the model
    // supplies them. Capped at 6 so the frontmatter stays tidy.
    const secondaryKeywordsYaml =
        Array.isArray(post.secondaryKeywords) && post.secondaryKeywords.length > 0
            ? `secondaryKeywords: ${JSON.stringify(post.secondaryKeywords.slice(0, 6))}\n`
            : '';
    // claimSupport: prefer the new sourceId form, fall back to legacy URL.
    const claimSupportYaml = Array.isArray(post.claimSupport) && post.claimSupport.length > 0
        ? `claimSupport:\n${post.claimSupport
              .map((c) => {
                  const lines = [`  - claim: "${yamlEscape(c.claim)}"`];
                  if (c.sourceId) lines.push(`    sourceId: "${yamlEscape(c.sourceId)}"`);
                  if (c.source) lines.push(`    source: "${yamlEscape(c.source)}"`);
                  return lines.join('\n');
              })
              .join('\n')}\n`
        : '';

    const content = `---
title: "${yamlEscape(post.title)}"
date: "${today}"
summary: "${yamlEscape(post.summary)}"
tags: ${tagYaml}
sources:
${sourceYaml}
${sourceIdsYaml}${secondaryKeywordsYaml}${optionalLine('updated', today)}${optionalLine('category', post.category ?? cluster.slug)}${optionalLine('primaryKeyword', post.primaryKeyword)}${optionalLine('searchIntent', post.searchIntent)}${optionalLine('audience', post.audience)}${optionalLine('region', post.region ?? 'global')}${optionalLine('author', post.author ?? 'Shubham Singla')}${optionalLine('reviewer', post.reviewer ?? 'Shubham Singla')}${optionalLine('lastReviewed', today)}${optionalLine('questionId', questionId)}${claimSupportYaml}---

${DISCLAIMER}

${body}
`;

    validateContent(content);

    // ── Duplicate-topic gate ──────────────────────────────────────────────
    // Same scoring used previously — extracted here so we can return the
    // colliding existing slug/title for the ledger entry.
    const existingSignals = getExistingPostSignals();
    const newTitleLower = post.title.toLowerCase();
    const newSummaryLower = post.summary.toLowerCase();
    const newTagsLower = post.tags.map((t) => t.toLowerCase());
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'to', 'in', 'of', 'for', 'is', 'on', 'at', 'by', 'it', 'as', 'how', 'what', 'you', 'your', 'are', 'from', 'with', 'this', 'that', 'new', '–', '-', '—', 'scam', 'scams']);
    const meaningfulWords = (text: string) =>
        text.split(/[^a-z0-9]+/i).filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()));
    const newTitleWords = new Set(meaningfulWords(newTitleLower));
    const newSummaryWords = new Set(meaningfulWords(newSummaryLower));
    const newSignalHaystack = `${newTitleLower} ${newSummaryLower} ${newTagsLower.join(' ')} ${body}`;
    const newCluster = inferCluster(newSignalHaystack);
    const newEntities = new Set(extractEntities(newSignalHaystack));

    const duplicateOf = existingSignals.find((existing) => {
        const titleWords = new Set(meaningfulWords(existing.title));
        const summaryWords = new Set(meaningfulWords(existing.summary));
        const titleOverlap = [...newTitleWords].filter((w) => titleWords.has(w)).length;
        const titleScore = titleOverlap / Math.max(newTitleWords.size, 1);
        const summaryOverlap = [...newSummaryWords].filter((w) => summaryWords.has(w)).length;
        const summaryScore = summaryOverlap / Math.max(newSummaryWords.size, 1);
        const tagOverlap = newTagsLower.filter((t) => existing.tags.includes(t)).length;
        const tagScore = tagOverlap / Math.max(newTagsLower.length, 1);
        if (
            existing.slug.includes(
                post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30),
            )
        ) {
            return true;
        }
        if (titleScore > 0.5) return true;
        if (titleScore > 0.3 && (summaryScore > 0.4 || tagScore > 0.6)) return true;
        if (newCluster && newCluster === existing.cluster) {
            const sharedEntities = existing.entities.filter((e) => newEntities.has(e)).length;
            if (sharedEntities >= 2 && titleScore > 0.2) return true;
        }
        return false;
    });

    if (duplicateOf) {
        console.log(
            `⚠️  Generated topic too similar to existing post "${duplicateOf.title}" (slug: ${duplicateOf.slug}).`,
        );
        return {
            type: 'duplicate-topic',
            questionId,
            matched: { slug: duplicateOf.slug, title: duplicateOf.title },
        };
    }

    // ── Deterministic quality gate ────────────────────────────────────────
    const qualityReasons = validateGeneratedPostQuality(post, body, {
        clusterRoutes: cluster.relatedInternalRoutes,
    });
    if (qualityReasons.length > 0) {
        console.log('⚠️  Generated post failed quality gate:');
        for (const r of qualityReasons) console.log(`     - ${r}`);
        return { type: 'quality-fail', reasons: qualityReasons, questionId };
    }

    // ── Dry run: stop before writing ──────────────────────────────────────
    // The draft already passed the full quality gate above. In dry-run mode we
    // report what WOULD publish but write no file and leave the ledger
    // untouched — so the workflow finds nothing to commit.
    if (IS_DRY_RUN) {
        console.log('🧪 DRY RUN — draft passed the quality gate; nothing will be written.');
        console.log(`   Title: ${post.title}`);
        console.log(`   Would-be slug: ${buildCleanBlogSlug(today, post.title, [])}`);
        console.log(`   Tags: ${post.tags.join(', ')}`);
        console.log(`   Sources referenced: ${post.sources.length}`);
        return { type: 'dry-run', questionId, title: post.title };
    }

    // ── Write to disk + record ledger ─────────────────────────────────────
    // Clean, readable slug: `${date}-${title-slug}` with a numeric suffix only
    // on collision — NO opaque random hash (URL policy: see docs/url-policy.md).
    // The date prefix stays because these are time-sensitive scam alerts.
    const date = today;
    const existingSlugs = fs
        .readdirSync(blogDir)
        .filter((f) => f.endsWith('.mdx'))
        .map((f) => f.replace(/\.mdx$/, ''));
    const fileSlug = buildCleanBlogSlug(date, post.title, existingSlugs);
    const filename = `${fileSlug}.mdx`;
    const filepath = path.join(blogDir, filename);

    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`✅ Post published: ${filepath}`);
    console.log(`   Title: ${post.title}`);
    console.log(`   Tags: ${post.tags.join(', ')}`);
    console.log(`   Sources: ${post.sources.length} referenced`);
    console.log(`   AI patterns found & stripped: ${remaining.length}`);

    if (questionId) {
        recordUsedQuestion(questionId, fileSlug, date);
        console.log(
            `   Question ${questionId} marked as used in data/used-blog-questions.json`,
        );
    }

    return { type: 'success', slug: fileSlug, questionId };
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
    }

    console.log('🔍 Generating blog post via AI (Gemini → Groq fallback)...');

    const bank = loadQuestionBank();
    const remainingAtStart = listRemainingQuestions();
    console.log(
        `🧮 Question bank state: ${remainingAtStart.length} unused/unskipped of ${bank?.questions.length ?? 0} total.`,
    );

    // Per-run safety cap. Equals the count of unprocessed questions plus a
    // single legacy-fallback attempt so the loop is bounded but can still
    // exhaust the bank if every question collides. Clamped to a small
    // upper bound so a runaway loop can't burn the GitHub Action quota.
    const MAX_ATTEMPTS = Math.max(1, Math.min(remainingAtStart.length + 1, 12));
    console.log(`🔁 Up to ${MAX_ATTEMPTS} attempt(s) this run.`);

    let success = false;
    let attempts = 0;
    let skippedCount = 0;
    let qualityFailures = 0;
    let lastFailure: string | null = null;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        attempts = i + 1;
        const picked = pickUnusedQuestion();
        // listRemainingQuestions includes both used and skipped — re-derive
        // each iteration so newly-recorded skips are visible.
        const remainingNow = listRemainingQuestions();

        if (!picked && bank) {
            console.warn(
                `⚠️  All ${bank.questions.length} questions in data/findquestions-bank.json are either used or skipped. ` +
                    'Falling back to the legacy random-cluster prompt for this attempt only.',
            );
        }
        const questionEntry = picked?.question ?? null;

        console.log(
            `\n🔄 Attempt ${attempts}/${MAX_ATTEMPTS}. ${remainingNow.length} unused/unskipped question(s) remaining before this attempt.`,
        );

        let outcome: AttemptOutcome;
        try {
            outcome = await attemptOneQuestion(blogDir, questionEntry);
        } catch (err: unknown) {
            // Provider/network errors bubble up — they're transient and
            // don't tell us anything about the chosen question. Stop the
            // loop and let the GitHub Action surface the error in logs.
            const msg = err instanceof Error ? err.message : String(err);
            lastFailure = msg;
            console.error(`❌ Attempt ${attempts} aborted: ${msg}`);
            break;
        }

        if (outcome.type === 'success') {
            console.log(
                `🏁 Final result: 1 post published after ${attempts} attempt(s).` +
                    ` Selected question: ${outcome.questionId ?? '(legacy fallback)'}.` +
                    ` ${skippedCount} question(s) skipped during this run.`,
            );
            success = true;
            break;
        }

        if (outcome.type === 'dry-run') {
            // A publishable draft was produced and validated, but nothing was
            // written (dry run). Stop the loop cleanly — the workflow will find
            // no staged post and report "nothing to commit".
            console.log(
                `🏁 Dry run complete: a publishable draft passed every gate but was NOT written. Title: "${outcome.title}".`,
            );
            success = true;
            break;
        }

        if (outcome.type === 'duplicate-topic') {
            if (outcome.questionId) {
                recordSkippedQuestion(
                    outcome.questionId,
                    'duplicate-topic',
                    new Date().toISOString().split('T')[0],
                    outcome.matched,
                );
                console.log(
                    `📌 Skipped ${outcome.questionId} (reason: duplicate-topic` +
                        (outcome.matched?.slug
                            ? `, collided with ${outcome.matched.slug}`
                            : '') +
                        `). Trying next question.`,
                );
                skippedCount += 1;
                lastFailure = 'duplicate-topic';
                continue;
            }
            // Legacy-fallback collisions don't have a question ID — there's
            // nothing to skip, so stop the loop instead of looping forever.
            console.log(
                '📌 Legacy-fallback prompt produced a duplicate topic and no question ID to skip. Stopping.',
            );
            lastFailure = 'duplicate-topic (legacy fallback)';
            break;
        }

        if (outcome.type === 'quality-fail') {
            qualityFailures += 1;
            lastFailure = `quality-gate: ${outcome.reasons[0] ?? 'unknown'}`;
            // Quality failures intentionally do NOT skip the question — the
            // next run may produce a better draft. But we still try the next
            // question in this run so a bad day doesn't break publishing.
            console.log(
                `📌 Quality-gate failure on ${outcome.questionId ?? '(legacy fallback)'} — question NOT marked as skipped. Trying next question.`,
            );
            continue;
        }
    }

    if (!success) {
        if (skippedCount > 0) {
            console.log(
                `🏁 Final result: no post generated, but ${skippedCount} question(s) skipped this run. ` +
                    'data/used-blog-questions.json has been updated and should be committed.',
            );
        } else if (qualityFailures > 0) {
            console.log(
                `🏁 Final result: no post generated after ${attempts} attempt(s). ` +
                    `${qualityFailures} quality-gate failure(s); no ledger changes. Last failure: ${lastFailure}.`,
            );
        } else {
            console.log(
                `🏁 Final result: no post generated. Last failure: ${lastFailure ?? 'no candidates'}.`,
            );
        }
    }
}

main().catch((err) => {
    console.error('❌ Blog generation failed:', err.message);
    process.exit(1);
});
