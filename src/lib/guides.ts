
export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  content: string;
  date: string;
  relatedSlugs: string[];
}

export const guides: Guide[] = [
  {
    slug: 'is-this-website-legit',
    title: 'Is This Website Legit? How to Check Before You Buy',
    excerpt: 'Quick checks before entering card details on unfamiliar websites.',
    metaDescription: 'Learn how to check if a website is legitimate before entering payment details. Spot fake online stores and avoid getting scammed.',
    date: '2026-01-26',
    relatedSlugs: ['how-to-spot-a-fake-link', 'facebook-marketplace-scams', 'email-phishing-examples'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Want a quick answer?</p>
  <p class="text-slate-600 mb-4">Paste the website URL into our free checker and get an instant risk assessment.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Use the Free Checker →</a>
</div>

<p>Found a website selling exactly what you want at a price that seems almost too good? Before you hand over your card details, take two minutes to run through these checks. It could save you hundreds.</p>

<p>Dodgy websites are everywhere — they copy real brand logos, use professional photos, and look completely legitimate. The difference is in the details.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Fake online stores that take your money and never send anything, or harvest your card details for fraud.</p>
  <p><strong>Who gets targeted:</strong> Anyone shopping online, especially during sales events or when searching for hard-to-find items.</p>
</div>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>Prices 70-90% off</strong> — If it looks too good to be true, it is. Real retailers don't slash prices that dramatically.</li>
  <li><strong>No physical address or phone number</strong> — Legitimate businesses list contact details. A contact form only is suspicious.</li>
  <li><strong>Generic email addresses</strong> — support@gmail.com instead of support@businessname.com.au</li>
  <li><strong>Payment only via bank transfer or crypto</strong> — Legit stores accept cards and PayPal because they offer buyer protection.</li>
  <li><strong>Newly registered domain</strong> — Check via whois.domaintools.com. If the site claims "established 2010" but domain registered last month, run.</li>
  <li><strong>Missing or copied policies</strong> — Fake sites either have no returns policy or copy-paste generic text with wrong company names.</li>
  <li><strong>No social media presence</strong> — Or accounts with zero engagement and stock photos.</li>
  <li><strong>Poor grammar and odd phrasing</strong> — Professional retailers proofread their content.</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-slate-50 p-4 rounded-lg border">
    <p class="font-medium mb-2">Example 1: The "Closing Down Sale"</p>
    <p class="text-sm text-slate-600">A Facebook ad for "Brand X Australia" claims they're closing down with 80% off everything. The website looks professional but the domain is brandx-au-sale.com instead of the real brandx.com.au.</p>
  </div>
  <div class="bg-slate-50 p-4 rounded-lg border">
    <p class="font-medium mb-2">Example 2: The Cloned Store</p>
    <p class="text-sm text-slate-600">You search for a specific shoe and find a site with the exact same layout as a major retailer. The URL is just slightly different: footlocker-au.com instead of footlocker.com.au.</p>
  </div>
  <div class="bg-slate-50 p-4 rounded-lg border">
    <p class="font-medium mb-2">Example 3: The Social Media Shop</p>
    <p class="text-sm text-slate-600">An Instagram ad leads to a beautifully designed site. All reviews are 5 stars and dated within the past week. The About Us page mentions being "based in Melbourne" but the contact email ends in .ru.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Google the site name + "scam" or "review"</strong> — Other victims often post warnings.</li>
  <li><strong>Check the domain age</strong> — Use whois.domaintools.com to see when it was registered.</li>
  <li><strong>Look for the padlock</strong> — HTTPS is good, but it doesn't guarantee legitimacy. Scammers use SSL too.</li>
  <li><strong>Search for the company on ABN Lookup</strong> — abr.business.gov.au shows registered Australian businesses.</li>
  <li><strong>Use our checker</strong> — Paste the URL and we'll flag known red flags instantly.</li>
</ol>

<h2>If You Already Paid</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Credit card:</strong> Contact your bank immediately to dispute the charge. You have chargeback rights.</li>
    <li><strong>Debit card:</strong> Call your bank. Harder to recover but still possible if you act fast.</li>
    <li><strong>Bank transfer:</strong> Contact your bank but be aware recovery is unlikely. Report to ReportCyber.</li>
    <li><strong>PayPal:</strong> Open a dispute within 180 days. PayPal buyer protection may cover you.</li>
  </ul>
  <p class="mt-4">Report the scam to <a href="https://www.scamwatch.gov.au" class="text-primary underline">Scamwatch</a> to help warn others.</p>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Does HTTPS mean a website is safe?</summary>
    <p class="mt-2 text-slate-600">No. HTTPS means data is encrypted in transit, but scammers get SSL certificates too. It's a baseline, not proof of legitimacy.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Can I trust reviews on the website itself?</summary>
    <p class="mt-2 text-slate-600">Be skeptical. Fake sites often display fabricated 5-star reviews. Look for reviews on independent sites like Trustpilot or ProductReview.com.au.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">What if the prices are just really good?</summary>
    <p class="mt-2 text-slate-600">Compare with the official brand website. If the "sale" price is lower than wholesale cost would be, something's wrong.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">How do scammers get my details to a fake site?</summary>
    <p class="mt-2 text-slate-600">Usually through social media ads, search engine ads, or phishing emails. Google doesn't always catch fake advertiser sites immediately.</p>
  </details>
</div>
    `
  },
  {
    slug: 'how-to-spot-a-fake-link',
    title: 'How to Spot a Fake Link Before You Click',
    excerpt: 'Subdomain tricks, lookalike domains, and URL red flags explained.',
    metaDescription: 'Learn to identify fake and malicious links. Understand subdomain tricks, lookalike domains, and how scammers disguise dangerous URLs.',
    date: '2026-01-26',
    relatedSlugs: ['is-this-website-legit', 'email-phishing-examples', 'scam-text-message-examples'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Got a suspicious link?</p>
  <p class="text-slate-600 mb-4">Paste it into our checker — we'll analyse it without you having to click.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check a Link →</a>
</div>

<p>Scammers are experts at making dangerous links look legitimate. A single click on the wrong link can lead to stolen passwords, drained bank accounts, or malware on your device.</p>

<p>The good news? Once you know the tricks, they're easy to spot. Takes 10 seconds.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Phishing pages designed to steal your login credentials or payment details.</p>
  <p><strong>Who gets targeted:</strong> Everyone. These links arrive via SMS, email, WhatsApp, and social media.</p>
</div>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>Subdomain tricks</strong> — The real domain is what comes right before the .com/.com.au. In "commbank.secure-login.com", the real domain is secure-login.com, NOT commbank.</li>
  <li><strong>Letter substitutions</strong> — "rn" looks like "m", "1" looks like "l", "0" looks like "O". Watch for amaz0n.com or paypa1.com.</li>
  <li><strong>Extra words added</strong> — commbank-verify.com, ato-refund-portal.com, auspost-delivery.net</li>
  <li><strong>Wrong domain extension</strong> — Real Australian sites use .com.au or .gov.au. Scams often use .com, .net, .xyz, .top.</li>
  <li><strong>URL shorteners</strong> — bit.ly, tinyurl.com hide the real destination. Legitimate businesses rarely use these.</li>
  <li><strong>Random characters</strong> — Long strings of letters and numbers are suspicious: track-pkg-au.com/delivery/8f7a2c...</li>
  <li><strong>Punycode attacks</strong> — International characters that look like English letters. applе.com (using Cyrillic е) looks identical to apple.com.</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-slate-50 p-4 rounded-lg border">
    <p class="font-medium mb-2">Looks legit: https://commbank.com.au.secure-login.net/verify</p>
    <p class="text-sm text-slate-600"><strong>Reality:</strong> The real domain is secure-login.net. Everything before that is decoration to fool you.</p>
    <p class="text-sm text-green-700 mt-2"><strong>What to do:</strong> Go directly to commbank.com.au by typing it yourself.</p>
  </div>
  <div class="bg-slate-50 p-4 rounded-lg border">
    <p class="font-medium mb-2">Looks legit: https://auspost.com.au-tracking.info/parcel</p>
    <p class="text-sm text-slate-600"><strong>Reality:</strong> The domain is au-tracking.info. "auspost.com" is just a subdomain.</p>
    <p class="text-sm text-green-700 mt-2"><strong>What to do:</strong> Track parcels only at auspost.com.au directly.</p>
  </div>
  <div class="bg-slate-50 p-4 rounded-lg border">
    <p class="font-medium mb-2">Looks legit: https://myg0v.com.au/ato-refund</p>
    <p class="text-sm text-slate-600"><strong>Reality:</strong> Notice the zero instead of 'o'. The real site is my.gov.au (two words, .gov.au domain).</p>
    <p class="text-sm text-green-700 mt-2"><strong>What to do:</strong> Always access myGov through my.gov.au directly.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Don't click</strong> — If you're suspicious, don't risk it.</li>
  <li><strong>Check the domain</strong> — Look at what's immediately before the .com/.com.au. That's the real website.</li>
  <li><strong>Go direct</strong> — Type the official URL yourself or use a saved bookmark.</li>
  <li><strong>Hover before clicking</strong> — On desktop, hover over links to preview the URL in your browser's status bar.</li>
  <li><strong>Use our checker</strong> — Paste the link and we'll tell you if it's dodgy.</li>
</ol>

<h2>If You Already Clicked</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Close the page immediately</strong> — Don't enter any information.</li>
    <li><strong>If you entered login details:</strong> Change that password immediately, on the REAL site. Enable 2FA if available.</li>
    <li><strong>If you entered card details:</strong> Call your bank and report the card compromised.</li>
    <li><strong>Run a virus scan</strong> — Some links download malware automatically.</li>
  </ul>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Can just clicking a link infect my device?</summary>
    <p class="mt-2 text-slate-600">Usually no, but sometimes yes. Exploit kits can attack unpatched browsers. Keep your device and browser updated to minimise risk.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">What's the difference between HTTP and HTTPS?</summary>
    <p class="mt-2 text-slate-600">HTTPS encrypts data between you and the site. But scammers can get HTTPS too — it doesn't mean a site is legitimate, just that the connection is encrypted.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">How do I check a link on my phone?</summary>
    <p class="mt-2 text-slate-600">Long-press the link to preview the URL. On iPhone, a popup shows the destination. On Android, hold until options appear. Or just paste it into our checker.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Why do scammers use URL shorteners?</summary>
    <p class="mt-2 text-slate-600">To hide the real destination. A bit.ly link could go anywhere. Some URL expander tools can reveal the destination safely.</p>
  </details>
</div>
    `
  },
  {
    slug: 'scam-text-message-examples',
    title: 'Scam Text Message Examples: SMS Fraud Patterns Explained',
    excerpt: 'Real SMS scam templates: parcel delivery, bank alerts, and urgency tactics used worldwide.',
    metaDescription: 'See real examples of scam text messages. Learn to recognise parcel delivery scams, fake bank alerts, and urgent SMS fraud attempts.',
    date: '2026-01-26',
    relatedSlugs: ['parcel-delivery-scams-australia', 'bank-impersonation-scams', 'how-to-spot-a-fake-link'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Received a dodgy text?</p>
  <p class="text-slate-600 mb-4">Paste it here and find out if it's a scam in seconds.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check Now →</a>
</div>

<p>Australians lose millions to SMS scams every year. These texts look official, create urgency, and lead to fake websites designed to steal your money or identity.</p>

<p>Here's what the most common scam texts look like — and why they work.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Phishing attempts designed to steal bank logins, card details, or personal information.</p>
  <p><strong>Who gets targeted:</strong> Everyone with a mobile phone. Scammers send millions of these daily.</p>
</div>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>Urgency language</strong> — "Immediate action required", "within 24 hours", "account will be suspended"</li>
  <li><strong>Generic sender</strong> — A mobile number (+61 4xx) claiming to be from a bank or government agency</li>
  <li><strong>Links to click</strong> — Real banks and government agencies don't send login links via SMS</li>
  <li><strong>Requests for codes</strong> — No legitimate organisation asks you to share verification codes</li>
  <li><strong>Spelling and grammar errors</strong> — "Your AuPost parcel" or "Confirm you're identity"</li>
  <li><strong>Unusual domain in link</strong> — Look for .xyz, .top, .info, or misspelled brand names</li>
  <li><strong>Out of the blue</strong> — You weren't expecting a parcel or haven't done anything with that service</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-mono text-sm mb-2">"AusPost: We attempted delivery but no one was home. Reschedule: auspost-redelivery.com/pkg38291"</p>
    <p class="text-sm text-red-700"><strong>Red flags:</strong> Wrong domain (not auspost.com.au), random tracking format, you weren't expecting a parcel.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-mono text-sm mb-2">"CommBank: Unusual activity detected on your account. Verify immediately: commbank.secure-alert.net"</p>
    <p class="text-sm text-red-700"><strong>Red flags:</strong> Banks don't send verification links via SMS. Real domain is commbank.com.au.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-mono text-sm mb-2">"ATO: You are entitled to a tax refund of $847.50. Claim within 48hrs: my-gov-refund.com.au"</p>
    <p class="text-sm text-red-700"><strong>Red flags:</strong> ATO doesn't SMS refund links. Real myGov is my.gov.au (separate words, .gov.au domain).</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-mono text-sm mb-2">"Linkt: You have an unpaid toll of $4.50. Pay now to avoid $87 late fee: linkt-pay.net.au"</p>
    <p class="text-sm text-red-700"><strong>Red flags:</strong> Wrong domain. Real Linkt website is linkt.com.au. Disproportionate "late fee".</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-mono text-sm mb-2">"Your Netflix payment failed. Update billing to avoid suspension: netflix-billing.com"</p>
    <p class="text-sm text-red-700"><strong>Red flags:</strong> Netflix doesn't send SMS. Real domain is netflix.com. Check your account directly.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Don't click the link</strong> — Ever. No exceptions.</li>
  <li><strong>Go direct</strong> — Open the official app or type the real website yourself.</li>
  <li><strong>Check your account legitimately</strong> — Log in normally to see if there's actually an issue.</li>
  <li><strong>Report it</strong> — Forward scam SMS to 0429 999 888 (Scamwatch).</li>
  <li><strong>Block and delete</strong> — Don't engage with the sender.</li>
</ol>

<h2>If You Already Clicked</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Didn't enter anything:</strong> You're probably fine. Close the page and clear your browser history.</li>
    <li><strong>Entered login details:</strong> Change your password immediately on the real site. Enable 2FA.</li>
    <li><strong>Entered card details:</strong> Call your bank NOW. Cancel the card. Monitor your statements.</li>
    <li><strong>Entered personal info:</strong> Consider a credit ban through Equifax. Watch for identity fraud signs.</li>
  </ul>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Why does the text appear in my real bank's message thread?</summary>
    <p class="mt-2 text-slate-600">Scammers can spoof sender IDs. A text labelled "CommBank" might not actually be from CommBank. This is called sender ID spoofing and it's disturbingly easy to do.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">How did scammers get my phone number?</summary>
    <p class="mt-2 text-slate-600">Data breaches, social media, or just random generation. Australian mobile numbers follow a predictable pattern (+61 4xx xxx xxx), so scammers send millions of messages hoping some land.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Should I reply to tell them to stop?</summary>
    <p class="mt-2 text-slate-600">No. Replying confirms your number is active and may result in MORE scam attempts. Just block and delete.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Do banks ever send legitimate SMS?</summary>
    <p class="mt-2 text-slate-600">Yes, for transaction alerts or 2FA codes. But they will NEVER include a link to log in or ask you to call a number in the SMS. Always use the number on your card.</p>
  </details>
</div>
    `
  },
  {
    slug: 'whatsapp-scams-examples',
    title: 'WhatsApp Scams: Real Messages, Job Offers, Investment Groups & OTP Tricks',
    excerpt: 'Real examples of WhatsApp scam messages — fake job offers, investment groups, OTP requests, romance and family-impersonation chats — plus what to do next.',
    metaDescription: 'Real WhatsApp scam messages: fake job offers, investment groups, OTP requests, family-impersonation and romance scam chats. See red flags and what to do next.',
    date: '2026-05-18',
    relatedSlugs: ['scam-text-message-examples', 'bank-impersonation-scams', 'facebook-marketplace-scams'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Got a suspicious WhatsApp message right now?</p>
  <p class="text-slate-600 mb-4">Copy the message text and paste it into our free scam checker — it flags the patterns scammers actually use (urgency, OTP harvesting, fake brand impersonation, lookalike links).</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check the WhatsApp message now →</a>
</div>

<p>WhatsApp scams have exploded worldwide. The "Hi Mum" family-impersonation scam alone cost victims in the UK, Australia, and Ireland tens of millions of pounds. In Nigeria, India, and Ghana, WhatsApp is now the primary channel for fake job offers and "investment group" frauds. The pattern is the same everywhere: an unsolicited DM, a story designed to bypass your suspicion, and a request that turns into money or credentials leaving your account.</p>

<h2>The 6 most common WhatsApp scams in 2026</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What they usually want:</strong> a money transfer, your one-time password (OTP), your card details, or to add you to a paid "investment" group that steals your deposit.</p>
  <p><strong>Who gets targeted:</strong> everyone — but parents and grandparents are hit hardest by family-impersonation scams, and job seekers / students by fake recruitment offers.</p>
</div>

<h3>1. Fake job offers on WhatsApp</h3>
<p>You receive an unsolicited "HR" message claiming to have seen your CV on LinkedIn, Indeed, or Naukri. They offer remote work with high pay for simple tasks ("rate products", "watch videos", "like posts"). Once you bite, you are added to a Telegram or WhatsApp group, asked to complete tasks in exchange for small "commissions", and then prompted to "top up" your account to unlock bigger tasks. The top-up money is gone. This is the "task scam" or "swiping scam".</p>

<div class="bg-red-50 p-4 rounded-lg border border-red-200 my-4">
  <p class="font-medium mb-2">Example message</p>
  <p class="font-mono text-sm mb-2">"Hi! I'm from Amazon HR. We saw your resume on Indeed. Work-from-home position, $45/hr, no experience required. Just complete simple training tasks. Add me on WhatsApp to start: +1 ###-###-####"</p>
  <p class="text-sm text-red-700"><strong>Reality:</strong> there is no job. You will be asked to send "training fees" or "platform deposits" you will never get back. No real employer asks for money up front.</p>
</div>

<h3>2. Crypto "investment group" scams</h3>
<p>You are added to a group called "Binance VIP Signals", "FX Profit Club", or similar. Members post screenshots of huge daily gains. A friendly "analyst" or "mentor" DMs you to help you get started. They direct you to a slick-looking trading site (which is fake) and walk you through depositing money. The dashboard shows your balance growing. When you try to withdraw, you are told to "pay tax" or "verify identity" with more money — and then they disappear.</p>

<h3>3. OTP requests over WhatsApp</h3>
<p>Someone you don't know — or someone pretending to be a friend whose account was compromised — asks you to "share a code I sent you by mistake" or "read back the 6-digit number". That code is your WhatsApp registration OTP, your bank's transaction OTP, or a social-media password reset. Anyone asking you to share a one-time code, ever, is trying to steal something.</p>

<div class="bg-red-50 p-4 rounded-lg border border-red-200 my-4">
  <p class="font-medium mb-2">Example message</p>
  <p class="font-mono text-sm mb-2">"Hey, sorry — I sent a verification code to your number by mistake. Can you send it back? My account is locked otherwise."</p>
  <p class="text-sm text-red-700"><strong>Reality:</strong> they are trying to take over your WhatsApp, your bank account, or your social media. Never share a code. <a href="/check-scam-text" class="text-blue-700 underline">Run the message through our SMS / WhatsApp scam checker</a> if you are unsure.</p>
</div>

<h3>4. The "Hi Mum / Hi Dad" family-impersonation scam</h3>
<p>A message arrives from an unknown number: "Hi Mum, I've lost my phone, this is my new number. My banking app isn't working — can you pay this bill for me?" Real children, parents, and partners do not lead with a money request before saying hello. The scammer uses urgency and emotional pressure to skip the verification step.</p>

<div class="bg-red-50 p-4 rounded-lg border border-red-200 my-4">
  <p class="font-medium mb-2">Example message</p>
  <p class="font-mono text-sm mb-2">"Hi mum, I dropped my phone in the toilet and this is my new number. Save it. My banking app won't work until the new SIM arrives. Can you pay my electricity bill? I'll pay you back Thursday."</p>
  <p class="text-sm text-red-700"><strong>Reality:</strong> it is not your child. The "bill" is the scammer's bank account. Call your actual family member on their old number to verify — always.</p>
</div>

<h3>5. Romance scam chats that move to WhatsApp</h3>
<p>You match on a dating app, the conversation moves to WhatsApp within hours, and "they" are warm, attentive, and quickly emotionally invested. After days or weeks, a crisis appears: a hospital bill, a stranded family member, a frozen investment account. The ask is always money, and the deadline is always urgent. This is the "pig butchering" template — sometimes the same scammer who runs the investment-group scam pivots into romance after rapport is built.</p>

<h3>6. Brand-impersonation messages (banks, couriers, tax)</h3>
<p>A WhatsApp message arrives "from" your bank, a courier, or the tax authority (HMRC, IRS, ATO, FIRS, GRA), with a link that looks almost right. The link goes to a phishing page that mirrors the real one. If you are unsure of the link, paste it into our <a href="/check-scam-link" class="text-blue-700 underline">link scam checker</a> before tapping anything.</p>

<h2>Red flags to look for in any WhatsApp message</h2>
<ul>
  <li><strong>Unsolicited contact</strong> — you didn't apply, sign up, or share your number with this person.</li>
  <li><strong>"Hi Mum/Dad, I've got a new number"</strong> followed by a money request.</li>
  <li><strong>Urgency + money</strong> — "I need it by tonight or I'll be evicted / arrested / fired."</li>
  <li><strong>"Can't talk on the phone right now"</strong> — scammers can't fake a voice convincingly, so they invent a reason not to call.</li>
  <li><strong>OTP / verification code requests</strong> — even from people you know. Their account may be hacked.</li>
  <li><strong>Random group invites</strong> — "VIP Signals", "Earn Daily", "FX Mentors". Leave them immediately.</li>
  <li><strong>Romance that moves fast</strong> — matched on a dating app, on WhatsApp within hours, soulmate-level chemistry within days.</li>
  <li><strong>Profile photo doesn't match</strong> — reverse-image search any photo that feels too polished.</li>
  <li><strong>Job offers asking for upfront money</strong> — "training fee", "equipment deposit", "platform top-up". No legitimate employer does this.</li>
</ul>

<h2>What to do next</h2>
<ol>
  <li><strong>Verify out-of-band.</strong> If someone claims to be family, call their known number directly. If they claim to be a recruiter, look up the company website (don't click their link) and call them. If they claim to be your bank, hang up and call the number on the back of your card.</li>
  <li><strong>Ask a question only the real person could answer.</strong> "What did we have for dinner last Sunday?" works on impersonators every time.</li>
  <li><strong>Never share an OTP, password, PIN, or card CVV.</strong> Not with anyone, ever, on WhatsApp.</li>
  <li><strong>Never send money to new account details</strong> without verifying through another channel.</li>
  <li><strong>Leave any random group</strong> the moment you notice you've been added without asking.</li>
  <li><strong>Block and report.</strong> In WhatsApp: tap the contact &rarr; <em>Report</em> &rarr; <em>Block</em>. That signal helps WhatsApp shut the account down faster.</li>
</ol>

<h2>If you already sent money or shared a code</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <p class="mb-3">Speed matters more than anything else. The first hour is the most recoverable window.</p>
  <ul>
    <li><strong>Open the <a href="/have-i-been-scammed" class="text-red-700 underline font-semibold">have-I-been-scammed damage-control checklist</a></strong> — it walks through the exact steps for your situation.</li>
    <li><strong>Contact your bank immediately.</strong> Most banks have a 24/7 fraud line — they may be able to stop or reverse the transfer.</li>
    <li><strong>Don't send more.</strong> Scammers often claim the first payment "didn't go through" to extract more money. Stop responding.</li>
    <li><strong>Report.</strong> In the UK, Action Fraud. In the US, FTC ReportFraud. In Australia, Scamwatch. In Nigeria, the EFCC. In India, the national Cyber Crime Reporting Portal.</li>
  </ul>
</div>

<h2>Frequently asked questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">How did scammers get my WhatsApp number?</summary>
    <p class="mt-2 text-slate-600">Data breaches, scraping from public social-media profiles, or random number generation. Your WhatsApp number is just your phone number — anyone with it can message you on WhatsApp.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Can I get my money back if I sent it?</summary>
    <p class="mt-2 text-slate-600">Sometimes, if you act within minutes. Credit-card payments are the easiest to reverse (chargebacks). Bank transfers are harder but possible. Crypto and gift-card payments are almost impossible to recover. Contact your bank immediately.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Should I waste a scammer's time by engaging with them?</summary>
    <p class="mt-2 text-slate-600">No. It keeps your number flagged as "active" in their database and increases the number of follow-up attempts you'll get. Block, report, and move on.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Is the message I just got definitely a scam?</summary>
    <p class="mt-2 text-slate-600">Paste it into the <a href="/check" class="text-blue-700 underline">free scam checker</a> and the tool will flag the specific red flags it detects. The checker is private — nothing you paste is uploaded.</p>
  </details>
</div>
    `
  },
  {
    slug: 'email-phishing-examples',
    title: 'Email Phishing Examples: Spot the Fakes',
    excerpt: 'Invoice scams, login alerts, and attachment traps targeting Australians.',
    metaDescription: 'See real phishing email examples and learn how to identify fake invoices, suspicious login alerts, and dangerous attachments before you click.',
    date: '2026-01-26',
    relatedSlugs: ['how-to-spot-a-fake-link', 'is-this-website-legit', 'ato-scam-text-email'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Got a suspicious email?</p>
  <p class="text-slate-600 mb-4">Copy the email text and check it with our free scam detector.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check Email Text →</a>
</div>

<p>Phishing emails are getting scary good. AI helps scammers write perfect English, copy brand styles pixel-perfectly, and target victims with personalised attacks. Even tech-savvy people get caught.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Fake login pages to steal credentials, malware disguised as invoices, or payment redirection scams.</p>
  <p><strong>Who gets targeted:</strong> Everyone. Business email compromise (BEC) targets companies; credential phishing targets individuals.</p>
</div>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>Sender address doesn't match</strong> — "Netflix" but from netflix-billing@mail-service.com</li>
  <li><strong>Generic greetings</strong> — "Dear Customer" instead of your actual name</li>
  <li><strong>Urgency and threats</strong> — "Your account will be suspended in 24 hours"</li>
  <li><strong>Unexpected attachments</strong> — Invoice.pdf.exe, Document.docm, or ZIP files</li>
  <li><strong>Links to wrong domains</strong> — Hover (don't click) to see the real URL</li>
  <li><strong>Requests for sensitive info</strong> — Passwords, 2FA codes, card numbers</li>
  <li><strong>Too good to be true</strong> — "You've won!" or "Unclaimed refund awaiting"</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Fake Invoice</p>
    <p class="text-sm mb-2">Subject: "Invoice #INV-29471 - Payment Overdue"<br>From: accounts@supplier-invoices.net<br>Body: "Please find attached your overdue invoice. Pay within 48 hours to avoid legal action."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> The attachment contains malware. If you weren't expecting an invoice, delete it. If unsure, contact the supposed sender through official channels.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The "Unusual Sign-In" Alert</p>
    <p class="text-sm mb-2">Subject: "Security Alert: New sign-in from Windows device"<br>From: security@microsoft-account-team.com<br>Body: "We detected a sign-in from an unusual location. If this wasn't you, click here to secure your account."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> The link goes to a fake Microsoft login page. Real Microsoft alerts come from @microsoft.com. Check by logging in directly at account.microsoft.com.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Subscription Renewal</p>
    <p class="text-sm mb-2">Subject: "Your Norton subscription renewed - $449.99 charged"<br>From: norton-support@renewal-notice.com<br>Body: "Your annual subscription has been auto-renewed. If you didn't authorise this, call 1800-XXX-XXX immediately."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> They want you to call. The "support" agent will ask for remote access or payment to "cancel". Don't engage — delete and check your bank statement directly.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Check the sender's actual email address</strong> — Click to expand it. Does it match the company?</li>
  <li><strong>Hover over links</strong> — See where they really go before clicking.</li>
  <li><strong>Go direct</strong> — Don't click email links. Open your browser and type the official website.</li>
  <li><strong>Never open unexpected attachments</strong> — Especially ZIP, EXE, or Office files with macros.</li>
  <li><strong>Forward phishing to the real company</strong> — Most have a phishing@company.com address.</li>
</ol>

<h2>If You Clicked a Link or Opened an Attachment</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Entered credentials:</strong> Change the password immediately on the real site. Enable 2FA. Check for password reuse on other sites.</li>
    <li><strong>Opened an attachment:</strong> Disconnect from the internet. Run a full antivirus scan. Consider professional help if you suspect ransomware.</li>
    <li><strong>At work:</strong> Report to IT immediately. Time is critical for limiting damage.</li>
  </ul>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Why does the email look exactly like the real brand?</summary>
    <p class="mt-2 text-slate-600">Scammers copy legitimate emails. Logos, formatting, footers — all cloned. The giveaway is usually the sender address or the link destination.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Can scammers access my email just by me opening their message?</summary>
    <p class="mt-2 text-slate-600">Usually no. Opening an email is relatively safe. The danger is clicking links or opening attachments.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">How do they know my name and email?</summary>
    <p class="mt-2 text-slate-600">Data breaches. Your info has probably leaked from at least one service you've used. Check haveibeenpwned.com to see.</p>
  </details>
</div>
    `
  },
  {
    slug: 'payid-scams-australia',
    title: 'Payment Platform Scams: Overpayment Fraud on PayID, Zelle and Similar Services',
    excerpt: 'How scammers exploit instant payment platforms with fake overpayments and upgrade tricks.',
    metaDescription: 'Learn how payment platform scams work. Understand overpayment tricks, fake business account upgrades, and how to protect yourself when selling online.',
    date: '2026-01-26',
    relatedSlugs: ['facebook-marketplace-scams', 'bank-impersonation-scams', 'scam-text-message-examples'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Got a suspicious PayID message?</p>
  <p class="text-slate-600 mb-4">Paste it into our checker to see if it matches known scam patterns.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check It Now →</a>
</div>

<p>PayID scams have become the go-to method for ripping off people selling items online. The scam sounds convincing and many sellers fall for it, losing hundreds or thousands of dollars.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Fake "overpayment" claims or fake "business account upgrade" fees designed to get you to send money to scammers.</p>
  <p><strong>Who gets targeted:</strong> Anyone selling items on Facebook Marketplace, Gumtree, or similar platforms.</p>
</div>

<h2>How the Scam Works</h2>
<p>You're selling something online. A buyer contacts you and seems keen. Then one of these scenarios unfolds:</p>

<h3>Scenario 1: The Overpayment</h3>
<p>"I accidentally paid you $2,500 instead of $250 for your item. Can you refund the extra $2,250 to this account?"</p>
<p><strong>Reality:</strong> You never received any payment. The fake "payment confirmation" email is spoofed. If you "refund" the overpayment, you're sending your own money to a scammer.</p>

<h3>Scenario 2: The Business Account Upgrade</h3>
<p>"I tried to pay but your account can't receive business payments. You need to upgrade to a PayID Business Account. Pay the $99 upgrade fee and I'll add it to my payment for the item."</p>
<p><strong>Reality:</strong> There's no such thing as a "PayID Business Account upgrade fee". PayID is a free service from your bank.</p>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>"I accidentally paid too much"</strong> — This almost never happens legitimately.</li>
  <li><strong>Payment confirmations via email</strong> — Real payments show in your banking app, not just emails.</li>
  <li><strong>"Upgrade your account"</strong> — PayID doesn't have paid tiers or upgrades.</li>
  <li><strong>Wants you to pay fees</strong> — Legitimate buyers don't ask sellers to pay anything.</li>
  <li><strong>Unusually eager buyer</strong> — Agrees to your price immediately, no negotiation.</li>
  <li><strong>Can't meet in person</strong> — Always has an excuse to avoid face-to-face.</li>
  <li><strong>Pressure and urgency</strong> — "I need it shipped today" or "Refund now or I'll report you".</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">Fake Email Confirmation</p>
    <p class="text-sm mb-2">You receive an email: "PayID Payment Confirmation - You have received $2,500.00 from John Smith. This payment is pending due to your account limits. Contact the sender for further action."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> This email is fake. Real PayID payments appear instantly in your banking app. No email confirmations, no pending status for standard amounts.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Upgrade Fee Script</p>
    <p class="text-sm mb-2">"Your PayID is registered as a personal account. To receive my business payment, you'll need to upgrade. Transfer $99 to this BSB/Account and send me the receipt. I'll add it to my payment."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> Complete fiction. PayID works the same for personal and business payments. There's no upgrade. You'd be sending $99 to a scammer.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Only check your actual banking app</strong> — Not emails, not screenshots. Log into your real bank.</li>
  <li><strong>There's no such thing as a PayID upgrade fee</strong> — Anyone asking for one is a scammer.</li>
  <li><strong>Never refund "overpayments"</strong> — If you didn't see cash in your bank account, it didn't happen.</li>
  <li><strong>Meet in person when possible</strong> — Cash deals at police stations are safest.</li>
  <li><strong>Report the scammer</strong> — To the platform and to Scamwatch.</li>
</ol>

<h2>If You've Sent Money</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Contact your bank immediately</strong> — Some transfers can be stopped or recalled if fast enough.</li>
    <li><strong>Report to police</strong> — Via ReportCyber (cyber.gov.au)</li>
    <li><strong>Report to the platform</strong> — Facebook, Gumtree, etc. will ban the account.</li>
    <li><strong>Keep all evidence</strong> — Screenshots of conversations, emails, any details.</li>
  </ul>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Is PayID itself safe?</summary>
    <p class="mt-2 text-slate-600">Yes, PayID is a legitimate, secure service from Australian banks. The scam exploits social engineering, not PayID's technology.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Can someone steal money knowing my PayID?</summary>
    <p class="mt-2 text-slate-600">No. PayID only allows people to send you money. They can't withdraw or access your account. It's like giving someone your email — they can send to you, not access you.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">What if I got a real overpayment?</summary>
    <p class="mt-2 text-slate-600">Genuinely rare, but if it happens: wait several days for the payment to fully clear, then contact your bank directly. Never refund to a different account than the payment came from.</p>
  </details>
</div>
    `
  },
  {
    slug: 'ato-scam-text-email',
    title: 'Tax Authority Impersonation Scams: Fake Refunds and Debt Threats',
    excerpt: 'Tax refund scams, fake debt notices, and government portal impersonation tactics.',
    metaDescription: 'Recognise tax authority impersonation scams worldwide. Learn the warning signs of fake tax refund emails, debt threat calls, and how to verify legitimate contact.',
    date: '2026-01-26',
    relatedSlugs: ['scam-text-message-examples', 'email-phishing-examples', 'bank-impersonation-scams'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Think you've received an ATO scam?</p>
  <p class="text-slate-600 mb-4">Paste the message into our checker for instant analysis.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check Message →</a>
</div>

<p>Tax time brings out the scammers. They impersonate the ATO, threatening arrest or promising refunds. These scams cost Australians millions every year — and they're alarmingly convincing.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Phishing for your myGov login, identity theft via personal information collection, or direct theft via fake "tax debt" payments.</p>
  <p><strong>Who gets targeted:</strong> Everyone, but especially around tax time (July-October) and just after tax returns are lodged.</p>
</div>

<h2>What the ATO Will NEVER Do</h2>
<ul>
  <li><strong>Threaten arrest over the phone</strong> — The ATO doesn't send police to your door over tax debt.</li>
  <li><strong>Ask for payment via gift cards, crypto, or wire transfers</strong> — Scam payment methods, always.</li>
  <li><strong>Send you a link via SMS to claim a refund</strong> — Refunds are processed through your tax return and myGov.</li>
  <li><strong>Ask for your TFN, password, or credit card over phone/SMS</strong> — They already have your TFN, and never need your password.</li>
  <li><strong>Request remote access to your computer</strong> — No legitimate agency does this.</li>
</ul>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>Links in SMS</strong> — Real ATO messages don't include clickable links.</li>
  <li><strong>Threats of immediate arrest</strong> — "Police warrant has been issued" is a scam line.</li>
  <li><strong>"Confirm your identity" links</strong> — Always go directly to my.gov.au.</li>
  <li><strong>Fake myGov domains</strong> — mygov-refund.com, my-gov.com.au, mygov-au.net are all fake. Real is my.gov.au only.</li>
  <li><strong>Unexpected refund announcements</strong> — If you haven't lodged, you're not getting a refund.</li>
  <li><strong>Robocalls</strong> — Recorded messages saying to "press 1" are scams.</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Tax Refund SMS</p>
    <p class="font-mono text-sm mb-2">"ATO: You are eligible for a tax refund of $1,847.00. Confirm your details to receive payment: mygov-tax-refund.com.au"</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> The ATO doesn't SMS refund links. That domain is fake. Real refunds go to your linked bank account automatically.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Threatening Phone Call</p>
    <p class="text-sm mb-2">"This is the Australian Taxation Office. There is a legal case against you for tax fraud. An arrest warrant will be issued in 24 hours unless you pay $3,200 immediately. Press 1 to speak to an officer."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> Complete fiction. The ATO doesn't threaten arrest, doesn't use robocalls, and doesn't demand immediate payment. Hang up.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The myGov Email</p>
    <p class="text-sm mb-2">Subject: "Important: Your myGov account requires verification"<br>From: noreply@mygov-services.com.au<br>Body: "Your account access will be suspended. Click here to verify your identity."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> Fake domain. Real myGov emails come from @my.gov.au. Go directly to my.gov.au and log in — don't click the link.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Don't click links</strong> — Go directly to my.gov.au by typing it.</li>
  <li><strong>Hang up on threatening calls</strong> — Real ATO officers don't threaten.</li>
  <li><strong>Check your myGov inbox</strong> — Real ATO messages appear there.</li>
  <li><strong>Call the ATO directly</strong> — 13 28 61 to verify any concerns.</li>
  <li><strong>Report scams</strong> — Forward emails to ReportScam@ato.gov.au.</li>
</ol>

<h2>If You've Been Scammed</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Gave login details:</strong> Change your myGov password immediately. Check linked services (Medicare, Centrelink, ATO) for changes.</li>
    <li><strong>Gave personal info (TFN, DOB, address):</strong> Contact IDCARE (1800 595 160) — free identity protection support.</li>
    <li><strong>Sent money:</strong> Contact your bank immediately. Report to police via ReportCyber.</li>
    <li><strong>Report to ATO:</strong> Email ReportScam@ato.gov.au with details.</li>
  </ul>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">How do scammers know I'm expecting a refund?</summary>
    <p class="mt-2 text-slate-600">They don't. They send millions of messages around tax time, knowing many people are expecting refunds. It's a numbers game.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Does the ATO ever call people?</summary>
    <p class="mt-2 text-slate-600">Yes, sometimes. But they'll never threaten arrest, demand immediate payment, or ask for unusual payment methods. They'll give you time and options.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Can scammers lodge a fake tax return in my name?</summary>
    <p class="mt-2 text-slate-600">Yes, identity theft for tax fraud is real. Protect your myGov with a strong password and 2FA. Check your ATO account regularly.</p>
  </details>
</div>
    `
  },
  {
    slug: 'bank-impersonation-scams',
    title: 'Bank Impersonation Scams: How Fraudsters Pose as Financial Institutions',
    excerpt: 'Fake bank calls, texts, and spoofed caller IDs explained.',
    metaDescription: 'Protect yourself from bank impersonation scams. Learn how scammers spoof bank caller IDs and trick you into moving your money.',
    date: '2026-01-26',
    relatedSlugs: ['scam-text-message-examples', 'ato-scam-text-email', 'how-to-spot-a-fake-link'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Got a suspicious call or text from your "bank"?</p>
  <p class="text-slate-600 mb-4">Paste the message into our checker for instant analysis.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check Now →</a>
</div>

<p>Bank impersonation scams are terrifyingly effective. Scammers can make their caller ID show your bank's actual phone number. They know your name. They sound professional. And they create just enough panic to make you act before you think.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Social engineering to get you to transfer money to a "safe account" (the scammer's account) or share 2FA codes.</p>
  <p><strong>Who gets targeted:</strong> Everyone with a bank account. Scammers often target older Australians but anyone can get caught.</p>
</div>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>"We've detected fraud on your account"</strong> — The classic opener designed to create panic.</li>
  <li><strong>"Did you authorise this transaction?"</strong> — Creates urgency when you say no.</li>
  <li><strong>"Move your money to a safe account"</strong> — Banks NEVER ask you to do this. Ever.</li>
  <li><strong>"Read me the code we just sent"</strong> — 2FA codes are for YOU to use, not to share.</li>
  <li><strong>"Don't tell anyone about this call"</strong> — Isolation tactic so you can't get a second opinion.</li>
  <li><strong>They call you</strong> — If you didn't initiate the call, be suspicious.</li>
  <li><strong>Pressure to act immediately</strong> — "The transaction is going through now, we only have minutes."</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Fraud Team Call</p>
    <p class="text-sm mb-2">Your phone rings showing "CommBank" or the actual bank number. "Hi, this is Sarah from CommBank's fraud prevention team. We've detected suspicious activity — did you just authorise a $3,500 transfer to a Bitcoin exchange?"</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> Caller ID can be spoofed. This "Sarah" is a scammer. The real CommBank fraud team will NOT ask you to move money or share codes.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The "Reply N" Text</p>
    <p class="font-mono text-sm mb-2">"NAB: A payment of $1,200 has been requested from your account. If you did NOT authorise this payment, reply N immediately."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> Replying confirms your number is active. They'll call immediately pretending to be NAB, then try to get your details or have you transfer money.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Remote Access Request</p>
    <p class="text-sm mb-2">"We can see the hackers are in your account right now. I need you to download a security app so we can remove them. Go to anydesk.com..."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> Remote access software gives them full control. They'll drain your accounts while you watch. Banks NEVER ask you to install software.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Hang up</strong> — Even if it seems rude. You can always call back.</li>
  <li><strong>Call your bank yourself</strong> — Use the number on the back of your card, not any number they gave you.</li>
  <li><strong>Never share 2FA codes</strong> — These are for you only. No bank employee needs them.</li>
  <li><strong>Never transfer to a "safe account"</strong> — There's no such thing.</li>
  <li><strong>Take your time</strong> — Pressure to act fast is always a red flag.</li>
</ol>

<h2>If You've Already Shared Details or Transferred Money</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Call your real bank immediately</strong> — Use the number on your card. Explain what happened.</li>
    <li><strong>Lock your accounts</strong> — Your bank can freeze outgoing transfers.</li>
    <li><strong>Change your passwords</strong> — Especially internet banking. Do this from a different device if you installed remote access software.</li>
    <li><strong>Report to police</strong> — Via ReportCyber (cyber.gov.au)</li>
  </ul>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">How do they know my real name?</summary>
    <p class="mt-2 text-slate-600">Data breaches. Your name, phone, email and sometimes more are for sale on dark web databases. This doesn't mean your bank was hacked — any old service you used might have been.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Can they really make my bank's number appear on caller ID?</summary>
    <p class="mt-2 text-slate-600">Yes, it's called caller ID spoofing and it's disturbingly easy. Never trust caller ID alone. Always call back on a known number.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Would my bank ever call me about fraud?</summary>
    <p class="mt-2 text-slate-600">Yes, sometimes. But they'll never pressure you, ask for 2FA codes, or request fund transfers. If unsure, hang up and call them back.</p>
  </details>
</div>
    `
  },
  {
    slug: 'facebook-marketplace-scams',
    title: 'Marketplace Scams: Fraud on Facebook, eBay and Classified Sites',
    excerpt: 'Fake payment emails, courier pickup scams, and payment platform pending tricks.',
    metaDescription: 'Avoid online marketplace scams. Learn about fake payment confirmations, courier pickup scams, and how to sell safely online.',
    date: '2026-01-26',
    relatedSlugs: ['payid-scams-australia', 'email-phishing-examples', 'is-this-website-legit'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Got a dodgy message from a buyer?</p>
  <p class="text-slate-600 mb-4">Paste it here to check if it matches known scam patterns.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check Message →</a>
</div>

<p>Facebook Marketplace is a goldmine for scammers. They target sellers with fake payment confirmations, buyers with items that don't exist, and everyone with increasingly creative tricks. Here's how to protect yourself.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Fake payment confirmations, overpayment scams, or non-existent items. Scammers target both buyers and sellers.</p>
  <p><strong>Who gets targeted:</strong> Anyone buying or selling on Marketplace, especially high-value items.</p>
</div>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>Can't meet in person</strong> — "I'm interstate but my courier will collect it"</li>
  <li><strong>Overpays then asks for refund</strong> — "Oops I sent $500 too much, please refund"</li>
  <li><strong>Payment confirmation via email only</strong> — Real payments show in your bank app or PayPal</li>
  <li><strong>Eager buyer, no negotiation</strong> — "I'll take it, full price, right now"</li>
  <li><strong>Asks you to click a link</strong> — For "secure payment" or "shipping label"</li>
  <li><strong>Requests gift cards as payment</strong> — Never legitimate</li>
  <li><strong>Pressure to ship before payment clears</strong> — "My courier is coming today"</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Courier Collection Scam</p>
    <p class="text-sm mb-2">"Hi! I'm interested in your item. I'm in Perth for work but I'll send my courier to collect. I'll pay via PayPal — please send your email so I can process payment. Once paid, just give the item to the courier driver."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> You'll receive a fake PayPal email. If you hand over the item, you'll never see payment. Real PayPal payments show in your actual PayPal account (log in directly, don't click email links).</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Overpayment Trick</p>
    <p class="text-sm mb-2">"Payment sent! Oh no, I accidentally paid $800 instead of $300. The extra $500 was meant for the courier. Can you please transfer $500 to this account so he can pick it up today?"</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> No payment was ever sent. If you "refund" the overpayment, you're sending your own money to a scammer.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Too-Good Deal (Buyer Scam)</p>
    <p class="text-sm mb-2">iPhone 15 Pro Max, brand new sealed, $500. "Selling cheap because I won it in a raffle and already have one. Pickup only in [remote suburb] or I can post after payment."</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> The item doesn't exist or is counterfeit. They'll take payment and disappear. If the price seems too good, it is.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Meet in person, in public</strong> — Police stations have designated safe-exchange zones.</li>
  <li><strong>Cash for local sales</strong> — No fake PayPal emails, no chargebacks, no drama.</li>
  <li><strong>Verify payments independently</strong> — Log into your actual bank/PayPal. Don't trust email confirmations.</li>
  <li><strong>Never ship before payment clears</strong> — Wait for the money to actually appear in your account.</li>
  <li><strong>Use Marketplace's own payment system</strong> — Offers some buyer/seller protection.</li>
</ol>

<h2>If You've Been Scammed</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Report to Facebook</strong> — Tap the listing or conversation > Report > Scam.</li>
    <li><strong>Report to Scamwatch</strong> — scamwatch.gov.au</li>
    <li><strong>Contact your bank</strong> — If you sent money, they may be able to recall it.</li>
    <li><strong>PayPal dispute</strong> — If you paid goods & services, you have buyer protection.</li>
  </ul>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Is it safe to give my PayPal email to a buyer?</summary>
    <p class="mt-2 text-slate-600">Only if you verify payment by logging into PayPal directly (not via email links). Scammers send fake payment confirmation emails. Always check your real PayPal balance.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">What if they want to pay with PayPal Friends & Family?</summary>
    <p class="mt-2 text-slate-600">Don't accept it. Friends & Family has no buyer/seller protection. There's no reason a stranger would use this legitimately.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">How do I spot a fake profile?</summary>
    <p class="mt-2 text-slate-600">Check: new account, few friends, no posts/photos, generic profile picture, name doesn't match claimed location. Though scammers also use hacked real accounts.</p>
  </details>
</div>
    `
  },
  {
    slug: 'parcel-delivery-scams-australia',
    title: 'Parcel Delivery Scams: Fake Tracking Links and Fee Traps',
    excerpt: 'DHL, FedEx, UPS and postal service SMS scams with fake tracking links and card fee traps.',
    metaDescription: 'Spot fake parcel delivery scams. Learn to identify scam texts from carriers with fake tracking links and redelivery fee traps.',
    date: '2026-01-26',
    relatedSlugs: ['scam-text-message-examples', 'how-to-spot-a-fake-link', 'email-phishing-examples'],
    content: `
<div class="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8">
  <p class="font-semibold text-lg mb-2">Got a suspicious parcel SMS?</p>
  <p class="text-slate-600 mb-4">Paste the message here for instant analysis.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90">Check Message →</a>
</div>

<p>Parcel delivery scams are Australia's most common text scam. Everyone shops online, everyone expects parcels, so these messages catch lots of people off guard. The scam links lead to fake sites that steal your card details.</p>

<h2>Quick Verdict</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-4">
  <p><strong>What it usually is:</strong> Phishing pages disguised as delivery company websites, designed to steal your card details via fake "redelivery fees" or "customs charges".</p>
  <p><strong>Who gets targeted:</strong> Everyone. These are mass-sent texts hoping to catch someone actually waiting for a parcel.</p>
</div>

<h2>Real vs Fake: How to Tell</h2>
<p><strong>Real AusPost never:</strong></p>
<ul>
  <li>Sends SMS with clickable links for redelivery</li>
  <li>Asks for payment via text message</li>
  <li>Uses domains other than auspost.com.au</li>
</ul>
<p><strong>How real notifications work:</strong></p>
<ul>
  <li>Card left at your door or in letterbox</li>
  <li>Notification in the AusPost app</li>
  <li>Collection from post office with tracking number and ID</li>
</ul>

<h2>Red Flags to Look For</h2>
<ul>
  <li><strong>Random mobile number as sender</strong> — Real AusPost messages come from "AusPost", not +61 4xx xxx xxx</li>
  <li><strong>Strange domains</strong> — auspost-delivery.net, auspost-au.com, tracking-parcel.info — all fake</li>
  <li><strong>"Pay a small fee"</strong> — $2.50 redelivery, $1.95 customs fee — designed to seem too small to question</li>
  <li><strong>Urgency</strong> — "Parcel will be returned in 24 hours" or "final delivery attempt"</li>
  <li><strong>No tracking number</strong> — Or a tracking number that doesn't match anything you ordered</li>
  <li><strong>Weren't expecting a parcel</strong> — If you haven't ordered anything, it's definitely a scam</li>
</ul>

<h2>Realistic Examples</h2>
<div class="space-y-4 my-6">
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Redelivery Fee Scam</p>
    <p class="font-mono text-sm mb-2">"AustPost: We attempted delivery but no one was home. Pay $2.99 redelivery fee to reschedule: auspost-au-track.com/redeliver"</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> AusPost doesn't charge redelivery fees via SMS. That domain is fake. The site will look real and steal your card details.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Customs Charge</p>
    <p class="font-mono text-sm mb-2">"DHL: Your international parcel is held at customs. Pay $3.50 processing fee to release: dhl-customs-au.com/pay"</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> Real customs charges come with official documentation and are paid to ABF, not via random text links. DHL would contact you through official channels.</p>
  </div>
  <div class="bg-red-50 p-4 rounded-lg border border-red-200">
    <p class="font-medium mb-2">The Address Confirmation</p>
    <p class="font-mono text-sm mb-2">"FedEx: We couldn't deliver your package due to incomplete address. Confirm details here: fedex-au-delivery.info"</p>
    <p class="text-sm text-red-700"><strong>Reality:</strong> They want you to enter your address, name, and card "for verification". It's all harvested for fraud.</p>
  </div>
</div>

<h2>What to Do Next</h2>
<ol>
  <li><strong>Don't click the link</strong> — Delete the message immediately.</li>
  <li><strong>Check directly</strong> — Go to auspost.com.au or the official carrier site and enter your tracking number.</li>
  <li><strong>Use official apps</strong> — AusPost, DHL, FedEx apps show real delivery status.</li>
  <li><strong>Report it</strong> — Forward scam SMS to 0429 999 888 (Scamwatch SMS reporting).</li>
  <li><strong>Block the number</strong> — Though scammers use different numbers constantly.</li>
</ol>

<h2>If You Entered Your Card Details</h2>
<div class="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
  <ul>
    <li><strong>Call your bank immediately</strong> — Report the card compromised and get it cancelled.</li>
    <li><strong>Monitor statements</strong> — Watch for unauthorized charges over the coming weeks.</li>
    <li><strong>Report to Scamwatch</strong> — scamwatch.gov.au</li>
    <li><strong>Consider a credit check</strong> — If you entered personal details too, watch for identity theft.</li>
  </ul>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Why do I keep getting these even though I never click?</summary>
    <p class="mt-2 text-slate-600">Scammers send millions of messages randomly. Your number was probably generated or is on a leaked list. Getting the texts doesn't mean you're being specifically targeted.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Does AusPost ever send legitimate SMS?</summary>
    <p class="mt-2 text-slate-600">Yes, for tracking updates — but never with payment links. Real AusPost SMS tells you your parcel status and where to collect it, no links to pay fees.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">What if I'm actually waiting for a parcel?</summary>
    <p class="mt-2 text-slate-600">Check your order confirmation for the tracking number, then track directly on the official carrier website. Don't use any links from SMS.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Can they steal money if I just clicked but didn't enter details?</summary>
    <p class="mt-2 text-slate-600">Usually no. Just visiting the page doesn't give them access. The danger is entering information. If you just clicked and closed, you're probably fine.</p>
  </details>
</div>
    `
  },
  {
    slug: 'what-to-do-if-youve-been-scammed',
    title: "I Think I've Been Scammed — Now What? Immediate Recovery Steps",
    excerpt: 'Step-by-step recovery guide if you clicked a link, sent money, or shared personal details.',
    metaDescription: 'Panic-free guide on what to do if you have been scammed. Steps to recover money, secure accounts, and report fraud immediately.',
    date: '2026-01-27',
    relatedSlugs: ['bank-impersonation-scams', 'scam-text-message-examples', 'how-to-spot-a-fake-link'],
    content: `
<div class="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
  <p class="font-bold text-lg text-red-900 mb-2">Use Our Recovery Tool</p>
  <p class="text-red-800 mb-4">If you are panicking, use our interactive assessment to get a personalised action plan in 30 seconds.</p>
  <a href="/have-i-been-scammed" class="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">Start Assessment →</a>
</div>

<p>Realising you may have been scammed is a horrible feeling. Your heart races, you feel sick, and you just want to fix it. First: <strong>breathe</strong>. You are not stupid, and you are not alone. Scams are designed to trick human brains, and they work on doctors, lawyers, and tech experts every single day.</p>

<p>The most important thing right now is speed. What you do in the next hour matters more than what you do next week.</p>

<h2>Step 1: Identify What Was Compromised</h2>
<p>Different scams require different fixes. Determine which bucket you fall into:</p>
<ul>
  <li><strong>I clicked a link</strong> but didn't enter details.</li>
  <li><strong>I shared personal info</strong> (name, address, date of birth, phone).</li>
  <li><strong>I shared credentials</strong> (passwords, usernames, OTP codes).</li>
  <li><strong>I sent money</strong> (bank transfer, credit card, crypto, gift cards).</li>
  <li><strong>I gave remote access</strong> (downloaded AnyDesk, TeamViewer at someone's request).</li>
</ul>

<h2>Step 2: Immediate Damage Control</h2>

<h3>If you sent money via Bank/Card</h3>
<p><strong>Call your bank immediately.</strong> Do not email. Do not use chat bots. Call the fraud number on the back of your card. Tell them: "I have been scammed and I authorised a payment to a fraudster." Ask them to attempt a recall and freeze your account.</p>

<h3>If you shared passwords or codes</h3>
<p><strong>Change your passwords now.</strong> Start with your email account, then your bank, then social media. If you use the same password everywhere, change it everywhere. Enable Two-Factor Authentication (2FA) immediately.</p>

<h3>If you gave remote access</h3>
<p><strong>Disconnect your device from the internet.</strong> Turn off Wi-Fi or pull the ethernet cable. The scammer may still have access. Uninstall the software they asked you to download. Run a full antivirus scan. Ideally, have a professional check your device before reconnecting.</p>

<h2>Step 3: Secure Your Identity</h2>
<p>If you shared your driver's licence, passport, or tax ID:</p>
<ul>
  <li><strong>Contact the issuer:</strong> Report the document as stolen/compromised.</li>
  <li><strong>Check your credit report:</strong> Look for any loans or credit cards you didn't apply for.</li>
  <li><strong>Contact IDCARE (Australia/NZ) or IdentityTheft.gov (US):</strong> They provide free, specialised support for identity theft.</li>
</ul>

<h2>Common "After-Scam" Scams (Recovery Scams)</h2>
<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
  <p class="font-semibold text-amber-900 mb-2">⚠️ WARNING: Do not trust "Recovery Agents"</p>
  <p class="text-amber-800">
    After you get scammed, you are a target for "Recovery Scams". Strangers on social media or search engines will claim they can "hack the scammer" and get your money back for a fee. <strong>These are also scammers.</strong> Only your bank or the police can help. Never pay someone to get money back.
  </p>
</div>

<h2>Frequently Asked Questions</h2>
<div class="space-y-4 my-6">
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Will I get my money back?</summary>
    <p class="mt-2 text-slate-600">It depends. If you paid by credit card, you have a good chance via a chargeback. If you sent a bank transfer, it is harder but possible if acted on quickly. Crypto and gift card payments are almost impossible to recover.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">Should I report it to the police?</summary>
    <p class="mt-2 text-slate-600">Yes. File a report with your local police or cybercrime reporting body (e.g., ReportCyber in Australia, Action Fraud in UK, IC3 in US). You will need the report number for insurance or banking claims.</p>
  </details>
  <details class="bg-white border rounded-lg p-4">
    <summary class="font-semibold cursor-pointer">I just clicked a link, am I safe?</summary>
    <p class="mt-2 text-slate-600">Likely yes, if you didn't enter info or download a file. However, disconnect from the internet and run a virus scan just in case. Watch out for more spam messages, as they now know your number is active.</p>
  </details>
</div>

<p>You will get through this. It is expensive and stressful, but it is fixable. Take it one step at a time.</p>

<div class="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8">
  <p class="font-bold text-lg text-blue-900 mb-2">Not sure whether the message you received was a scam?</p>
  <p class="text-blue-800 mb-4">If you're still holding the original text, email, or link, paste it into our free scam checker before doing anything else. It analyses for phishing patterns, lookalike domains, and other fraud signals so you know exactly what you're dealing with.</p>
  <a href="/check" class="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">Check a suspicious message, email, or link →</a>
</div>
    `
  }
];

export function getGuideBySlug(slug: string) {
  return guides.find(g => g.slug === slug);
}

export function getRelatedGuides(currentSlug: string): Guide[] {
  const current = getGuideBySlug(currentSlug);
  if (!current) return [];
  return current.relatedSlugs
    .map(slug => getGuideBySlug(slug))
    .filter((g): g is Guide => g !== undefined);
}

