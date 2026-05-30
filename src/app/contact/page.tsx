import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = pageMetadata({
    title: "Contact the Scam Checker Team | Feedback & Support",
    description: "Get in touch with the Scam Checker team. Report issues, suggest improvements, or ask questions about our scam detection tool.",
    canonical: "https://scamchecker.app/contact",
});

export default function ContactPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 text-slate-900 text-center">Contact the Scam Checker Team</h1>
            <p className="text-xl text-slate-600 text-center mb-8">
                Have feedback, found a bug, or want to suggest an improvement? We&apos;d love to hear from you.
            </p>

            <section className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">Send us a Message</h2>
                <Card>
                    <CardContent className="pt-6">
                        <form className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Name</label>
                                <Input id="name" placeholder="Your name" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">Email</label>
                                <Input id="email" type="email" placeholder="your@email.com" />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium">Message</label>
                                <Textarea id="message" placeholder="How can we help?" className="min-h-[120px]" />
                            </div>
                            <Button className="w-full">Send Message</Button>
                            <p className="text-xs text-muted-foreground text-center pt-2">
                                (This form is a demo in this version)
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </section>

            <section className="text-center">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Other Ways to Connect</h2>
                <p className="text-slate-600">
                    You can also reach me directly via <a href="https://shubhamsingla.tech" className="text-primary hover:underline">my website</a>.
                </p>
            </section>
        </div>
    );
}
