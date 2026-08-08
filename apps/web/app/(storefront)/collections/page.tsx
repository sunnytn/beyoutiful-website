import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';

export const metadata = buildMetadata({
  title: 'Collections — Curated Organic Rituals',
  description:
    'Best sellers, new arrivals, hair growth rituals, glow essentials and gift bundles — curated collections from BeYoutiful Organics.',
  path: '/collections',
});

interface Collection {
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count?: { products: number };
}

export default async function CollectionsPage() {
  let collections: Collection[] = [];
  try {
    collections = await api<Collection[]>('/collections', { revalidate: 600 });
  } catch {
    /* empty */
  }

  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mb-14 text-center">
        <p className="eyebrow">Curated for you</p>
        <h1 className="heading-lg mt-3">Collections</h1>
        <p className="prose-organic mx-auto mt-4 max-w-xl">
          Thoughtfully grouped rituals — whether you're chasing growth, glow or the perfect gift.
        </p>
      </Reveal>
      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => (
          <StaggerItem key={c.slug}>
            <Link
              href={`/collections/${c.slug}`}
              className="group relative block overflow-hidden rounded-organic bg-forest-800 p-10 shadow-soft transition-shadow hover:shadow-lift"
            >
              {c.imageUrl && (
                <Image src={c.imageUrl} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover opacity-40 transition-transform duration-700 group-hover:scale-105" />
              )}
              <div className="relative">
                <h2 className="font-display text-2xl text-cream-100">{c.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-cream-200/75">{c.description}</p>
                <p className="mt-6 text-xs font-sans font-semibold uppercase tracking-luxe text-clay-300">
                  {c._count?.products ?? 0} products →
                </p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
