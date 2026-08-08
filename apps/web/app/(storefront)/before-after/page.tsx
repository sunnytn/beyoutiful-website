import { api, BeforeAfter } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { BeforeAfterSlider } from '@/components/sections/BeforeAfterSlider';
import { Button } from '@/components/ui/Button';

export const metadata = buildMetadata({
  title: 'Before & After — Real Results, Real People',
  description:
    'See real transformations from the BeYoutiful Organics community — hair growth rituals, glow transformations and more.',
  path: '/before-after',
});

export default async function BeforeAfterPage() {
  let items: BeforeAfter[] = [];
  try {
    items = await api<BeforeAfter[]>('/gallery', { revalidate: 300 });
  } catch {
    /* empty */
  }

  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mb-14 text-center">
        <p className="eyebrow">Proof over promises</p>
        <h1 className="heading-lg mt-3">Before & After</h1>
        <p className="prose-organic mx-auto mt-4 max-w-xl">
          Real transformations from our community. Drag the slider to compare — no filters, no tricks, just
          consistency and good ingredients.
        </p>
      </Reveal>

      {items.length === 0 ? (
        <p className="py-20 text-center text-ink-soft">Transformations are being added — check back soon.</p>
      ) : (
        <Stagger className="grid gap-8 md:grid-cols-2">
          {items.map((item) => (
            <StaggerItem key={item.id}>
              <figure className="overflow-hidden rounded-organic bg-white shadow-soft">
                <BeforeAfterSlider beforeUrl={item.beforeUrl} afterUrl={item.afterUrl} title={item.title} />
                <figcaption className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-xl">{item.title}</h2>
                    {item.durationLabel && (
                      <span className="shrink-0 rounded-full bg-forest-700 px-3 py-1 text-[11px] font-semibold uppercase tracking-luxe text-cream-100">
                        {item.durationLabel}
                      </span>
                    )}
                  </div>
                  {item.description && <p className="prose-organic mt-2 text-sm">{item.description}</p>}
                  {item.productSlug && (
                    <Button href={`/shop/${item.productSlug}`} variant="ghost" size="sm" className="mt-4 !px-0">
                      Shop the product used →
                    </Button>
                  )}
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
