import Link from 'next/link';
import { api, Testimonial } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Rating } from '@/components/ui/Rating';

export const metadata = buildMetadata({
  title: 'Testimonials — Loved Across Pakistan',
  description: 'What the BeYoutiful Organics community says about our rosemary oil, moisturizers, soaps and more.',
  path: '/testimonials',
});

export default async function TestimonialsPage() {
  let testimonials: Testimonial[] = [];
  try {
    testimonials = await api<Testimonial[]>('/testimonials', { revalidate: 300 });
  } catch {
    /* empty */
  }

  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mb-14 text-center">
        <p className="eyebrow">Community love</p>
        <h1 className="heading-lg mt-3">Real People, Real Glow</h1>
      </Reveal>
      <Stagger className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6">
        {testimonials.map((t) => (
          <StaggerItem key={t.id} className="break-inside-avoid">
            <figure className="rounded-organic bg-white p-8 shadow-soft">
              <Rating value={t.rating} />
              <blockquote className="mt-4 font-display text-lg leading-relaxed">“{t.text}”</blockquote>
              <figcaption className="mt-5 text-sm text-ink-soft">
                <span className="font-semibold text-forest-800">{t.name}</span>
                {t.location && <span> · {t.location}</span>}
                {t.productSlug && (
                  <Link href={`/shop/${t.productSlug}`} className="mt-1 block text-xs text-clay-600 hover:underline">
                    Shop what {t.name.split(' ')[0]} used →
                  </Link>
                )}
              </figcaption>
            </figure>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
