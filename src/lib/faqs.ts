/**
 * Shared FAQ data + FAQPage JSON-LD builders.
 *
 * The visible FAQ accordion (src/components/FAQ.tsx) and the FAQPage
 * structured data must reference the same set of questions so search engines
 * (and AI search systems) see schema that matches what the user sees on the
 * page. To avoid drift, both come from this module.
 *
 * Answers are stored as plain text — JSON-LD requires text, not JSX. The
 * FAQ component renders the same questions but is free to layer in inline
 * links inside the same answer when shown to humans, as long as the human-
 * facing answer carries the same meaning as the schema-facing one.
 */

export interface FaqEntry {
    question: string;
    /** Plain-text answer used for FAQPage JSON-LD. */
    answer: string;
}

/**
 * Site-wide general FAQs shown on both / and /check.
 *
 * Keep this list aligned with the visible accordion in
 * src/components/FAQ.tsx. The component links to other pages from inside
 * each answer; the schema-facing string here captures the same advice
 * without the inline links.
 */
export const GENERAL_FAQS: FaqEntry[] = [
    {
        question: 'How can I tell if a message is a scam?',
        answer:
            'Look for urgency phrases (like "act now"), unknown senders, generic greetings, requests for personal information, and suspicious links. For an automated check, paste the message into our free scam checker tool. If you have already replied or clicked anything, follow the Have I been scammed damage-control checklist.',
    },
    {
        question: 'Can a suspicious link steal my information?',
        answer:
            'Yes. Malicious links can lead to phishing pages designed to capture passwords, banking details, and one-time codes, or trigger malware downloads. Before clicking, run the URL through our suspicious link checker or read how to spot a fake or malicious link.',
    },
    {
        question: 'I accidentally clicked a scam link, what should I do?',
        answer:
            'Don\'t panic. If you didn\'t enter any information, you are likely safe. Disconnect from the internet, run a virus scan, and watch for follow-up scam messages. If you entered passwords or card details, follow the full recovery guide for scam victims immediately.',
    },
    {
        question: 'I sent money to a scammer — can I get it back?',
        answer:
            'Contact your bank immediately. If you paid by credit card, you may be able to chargeback. Bank transfers are harder but sometimes recallable if reported within minutes. Never pay "recovery agents" who claim they can hack the money back. The global scam reporting directory lists official channels for your country.',
    },
    {
        question: 'I replied to a scam message, am I in danger?',
        answer:
            'Replying confirms your number is active, so you will likely receive more spam. Block the number and don\'t engage further. If you shared personal information, follow the "I got a scam message — what to do next" page for next steps.',
    },
    {
        question: 'How does this scam checker actually work?',
        answer:
            'The tool scans pasted text for known scam patterns — urgency language, unusual payment requests, lookalike domains, and impersonation phrasing — and returns a Low, Medium, or High risk score with explanations. See the "how our scam detection works" page for the full breakdown.',
    },
    {
        question: 'Is Scam Checker free to use?',
        answer:
            'Yes. Scam Checker is 100% free, requires no sign-up, and never stores your message content. Analysis runs in your browser.',
    },
];

/**
 * FAQs specific to the dedicated SMS / text scam checker. Each set of page-
 * specific FAQs is unique to keep FAQPage schema from being repeated across
 * the site (which Google treats as a low-quality signal).
 */
export const SMS_FAQS: FaqEntry[] = [
    {
        question: 'How do I check if a text message is a scam?',
        answer:
            'Paste the suspicious SMS into the checker on this page. Our tool flags lookalike short links, fake delivery notices, urgency phrasing, fake bank security alerts, and OTP-harvesting patterns commonly used in smishing campaigns.',
    },
    {
        question: 'Is this delivery text from Australia Post or Royal Mail real?',
        answer:
            'Legitimate couriers do not ask you to pay a small "redelivery fee" via SMS. If the link is on an unfamiliar domain or the message creates urgency, treat it as smishing. Verify directly on the courier\'s official website by typing the URL yourself.',
    },
    {
        question: 'Can scammers reach my phone if I just open the text?',
        answer:
            'Reading the SMS itself does not compromise your phone. Risk comes from tapping links, calling numbers in the message, replying, or installing apps the message points to. Block the sender and report the message to your carrier.',
    },
    {
        question: 'What happens if I clicked the link in a scam text?',
        answer:
            'If you only loaded the page, change passwords for any account whose details you may have typed in. If you entered card details or banking credentials, contact your bank immediately. Then follow the Have I been scammed damage-control checklist.',
    },
];

export const EMAIL_FAQS: FaqEntry[] = [
    {
        question: 'How do I tell if an email is a phishing scam?',
        answer:
            'Check the sender\'s full address (not just the display name), look for spelling mistakes, generic greetings, urgent threats, and links whose visible text differs from the actual URL. Paste suspicious emails into this checker for an automated risk read.',
    },
    {
        question: 'Is this email from my bank real or fake?',
        answer:
            'Banks never email you to ask for your password, full card number, or OTP. If an email demands you "verify" your account by clicking a link, treat it as phishing. Log in directly from your bank\'s official app or website to confirm.',
    },
    {
        question: 'Should I open suspicious email attachments to see what they say?',
        answer:
            'No. Office documents, PDFs and ZIP files are the most common malware delivery vehicles in phishing campaigns. Run the email through this checker first, and if you must inspect an attachment, use a sandbox or our PDF/image upload check on the main scam checker page.',
    },
    {
        question: 'I clicked a link in a phishing email — what should I do now?',
        answer:
            'If you entered credentials, change that password and any reused passwords immediately, enable multi-factor authentication, and check your account login history. Then follow the Have I been scammed damage-control checklist for further steps.',
    },
];

export const LINK_FAQS: FaqEntry[] = [
    {
        question: 'How do I check if a link is safe before clicking?',
        answer:
            'Paste the URL into the link checker on this page. Our tool inspects the domain age, lookalike-character tricks (homoglyphs), suspicious subdomains, URL shorteners, and known scam patterns to flag risky links without opening them.',
    },
    {
        question: 'Can a URL shortener like bit.ly hide a scam?',
        answer:
            'Yes. Short URLs hide the real destination, which makes them a favourite among scammers. Expand short links with our checker before clicking, or hover over the link on desktop to preview where it actually goes.',
    },
    {
        question: 'What is a lookalike domain and how does it trick people?',
        answer:
            'Lookalike domains swap a letter or use a similar-looking character (for example "rn" for "m") so the URL appears legitimate at a glance. Our checker highlights known impersonation patterns against major brands.',
    },
    {
        question: 'I clicked the suspicious link — am I infected?',
        answer:
            'Loading a page rarely infects a modern phone or browser, but if you typed credentials, change those passwords immediately. If you installed anything the page suggested, run an antivirus scan and follow the Have I been scammed checklist.',
    },
];

export const HIBS_FAQS: FaqEntry[] = [
    {
        question: 'How do I know if I have actually been scammed?',
        answer:
            'You may have been scammed if you sent money, shared banking or login details, installed a remote-access app, or clicked a link and entered information. Run the checker on the original message to confirm the pattern, then follow the damage-control steps on this page.',
    },
    {
        question: 'What is the first thing to do after being scammed?',
        answer:
            'Stop talking to the scammer. Contact your bank or card issuer to freeze the transaction if possible. Change passwords on accounts whose details you shared. Then file an official report with the agency in your country listed in the global scam reporting directory.',
    },
    {
        question: 'Can I get my money back after being scammed?',
        answer:
            'Sometimes. Credit-card payments can usually be charged back. Bank transfers can occasionally be recalled if reported within minutes. Crypto payments are almost never recoverable. Never pay "recovery agents" — they are a follow-up scam.',
    },
    {
        question: 'How long do I have to report a scam?',
        answer:
            'Report as soon as possible. Banks typically have a short window for transaction recall (often hours, not days). Government scam reporting bodies accept reports any time, but earlier reports help authorities disrupt active campaigns.',
    },
];

export const REPORTS_FAQS: FaqEntry[] = [
    {
        question: 'Where do the scam reports on Scam Checker come from?',
        answer:
            'Reports are submitted by readers through the report-a-scam form. We publish them so other people searching for the same suspicious number, email or website can see what others encountered.',
    },
    {
        question: 'How do I submit a scam report?',
        answer:
            'Use the "Report a scam in 60 seconds" form. You can submit a website, phone number, email sender, or crypto wallet address along with a short description of the scam.',
    },
    {
        question: 'Are these reports verified by Scam Checker?',
        answer:
            'Reports are user-submitted and not individually verified by us. Treat them as community signal: multiple unrelated reports about the same number or website is a strong red flag, but a single report is not proof.',
    },
    {
        question: 'Can I get a number, website, or wallet removed from the list?',
        answer:
            'If you believe a report is mistaken or defamatory, contact us through the contact page with details. We review removal requests on a case-by-case basis.',
    },
];

/**
 * Build a FAQPage JSON-LD payload from a list of FAQ entries. The output
 * is ready to JSON.stringify into a <script type="application/ld+json">.
 */
export function buildFaqPageJsonLd(faqs: FaqEntry[]): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer,
            },
        })),
    };
}
