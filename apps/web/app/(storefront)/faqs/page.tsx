import { api, Faq } from '@/lib/api';
import { buildMetadata, faqJsonLd, JsonLd } from '@/lib/seo';
import { Reveal } from '@/components/ui/Reveal';
import { Accordion } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';

export const metadata = buildMetadata({
  title: 'FAQs — Orders, Shipping, Products & Rituals',
  description:
    'Answers about ordering via WhatsApp, cash on delivery, shipping times, product purity, hair oiling routines and more.',
  path: '/faqs',
});

export default async function FaqsPage() {
  let faqs: Faq[] = [];
  try {
    faqs = await api<Faq[]>('/faqs', { revalidate: 300 });
  } catch {
    /* empty */
  }
  const categories = [...new Set(faqs.map((f) => f.category))];

  return (
    <div className="container-luxe py-16 lg:py-24">
      {faqs.length > 0 && <JsonLd data={faqJsonLd(faqs)} />}
      <Reveal className="mb-14 text-center">
        <p className="eyebrow">We're here to help</p>
        <h1 className="heading-lg mt-3">Frequently Asked Questions</h1>
      </Reveal>

      <div className="mx-auto max-w-3xl space-y-12">
        {categories.map((cat) => (
          <Reveal key={cat}>
            <h2 className="mb-4 text-xs font-sans font-semibold uppercase tracking-luxe text-clay-600">{cat}</h2>
            <Accordion
              items={faqs
                .filter((f) => f.category === cat)
                .map((f) => ({ id: f.id, title: f.question, content: <p>{f.answer}</p> }))}
            />
          </Reveal>
        ))}

        <Reveal className="rounded-organic bg-forest-900 p-10 text-center">
          <h2 className="font-display text-2xl text-cream-100">Still have a question?</h2>
          <p className="mt-2 text-sm text-cream-200/75">We're real people and we answer quickly.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/contact" variant="clay" size="sm">
              Contact Us
            </Button>
            <a
              href="https://wa.me/923000527443"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-cream-200/30 px-6 py-3 text-xs font-semibold uppercase tracking-luxe text-cream-100 transition-colors hover:bg-forest-800"
            >
              WhatsApp Us
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
