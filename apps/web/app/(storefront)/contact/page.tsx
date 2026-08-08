import { buildMetadata } from '@/lib/seo';
import { Reveal } from '@/components/ui/Reveal';
import { ContactForm } from '@/components/marketing/ContactForm';

export const metadata = buildMetadata({
  title: 'Contact Us — We Answer Quickly',
  description:
    'Reach BeYoutiful Organics on WhatsApp (0300-0527443), email (beyoutiful.organics@gmail.com) or the contact form. Karachi, Pakistan.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <div className="grid gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Contact us</p>
          <h1 className="heading-lg mt-3">We'd love to hear from you</h1>
          <p className="prose-organic mt-5 max-w-md">
            Questions about a product, your order, or which ritual fits you best? We're real people and we answer
            quickly — usually within a few hours.
          </p>

          <dl className="mt-10 space-y-6">
            <div className="flex gap-4">
              <span className="text-2xl" aria-hidden>💬</span>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">WhatsApp</dt>
                <dd className="mt-1">
                  <a href="https://wa.me/923000527443" target="_blank" rel="noopener noreferrer" className="font-display text-lg text-forest-800 hover:underline">
                    0300-0527443
                  </a>
                  <p className="text-xs text-ink-faint">Fastest — orders & advice</p>
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl" aria-hidden>✉️</span>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Email</dt>
                <dd className="mt-1">
                  <a href="mailto:beyoutiful.organics@gmail.com" className="font-display text-lg text-forest-800 hover:underline">
                    beyoutiful.organics@gmail.com
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl" aria-hidden>📍</span>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Based in</dt>
                <dd className="mt-1 font-display text-lg text-forest-800">Karachi, Pakistan</dd>
                <p className="text-xs text-ink-faint">Delivering nationwide</p>
              </div>
            </div>
          </dl>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-organic bg-white p-8 shadow-soft sm:p-10">
            <h2 className="font-display text-2xl">Send us a message</h2>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
