import { buildFaqPageJsonLd, type FaqEntry } from '@/lib/faqs';

/**
 * Server-rendered FAQ section for high-intent pages.
 *
 * Uses native <details>/<summary> instead of client-side state so the
 * content is in server HTML, indexable, and JS-free. The accompanying
 * FAQPage JSON-LD is generated from the same `faqs` array so visible
 * content and schema always match — a hard requirement for Google's
 * structured-data guidelines.
 */
export function PageFAQ({
    faqs,
    title = 'Frequently Asked Questions',
    id = 'faq',
}: {
    faqs: FaqEntry[];
    title?: string;
    id?: string;
}) {
    if (!faqs || faqs.length === 0) return null;

    return (
        <section
            id={id}
            aria-label={title}
            className="py-12 bg-slate-50 border-t border-slate-100"
        >
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
                    {title}
                </h2>
                <div className="space-y-3">
                    {faqs.map((faq) => (
                        <details
                            key={faq.question}
                            className="group rounded-lg border border-slate-200 bg-white p-4 open:shadow-sm"
                        >
                            <summary className="cursor-pointer list-none flex justify-between items-center font-semibold text-slate-900">
                                <span>{faq.question}</span>
                                <span
                                    aria-hidden="true"
                                    className="ml-4 text-slate-400 group-open:rotate-180 transition-transform"
                                >
                                    ▾
                                </span>
                            </summary>
                            <p className="mt-3 text-slate-700 leading-relaxed">
                                {faq.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(buildFaqPageJsonLd(faqs)),
                }}
            />
        </section>
    );
}
