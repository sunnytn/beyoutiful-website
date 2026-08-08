import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api, PageMeta, ProductCard as ProductCardType } from '@/lib/api';
import { buildMetadata, breadcrumbJsonLd, JsonLd } from '@/lib/seo';
import { ProductCard } from '@/components/product/ProductCard';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';

interface Collection {
  name: string;
  slug: string;
  description: string | null;
}

interface Props {
  params: { slug: string };
}

async function getData(slug: string) {
  try {
    const [collection, products] = await Promise.all([
      api<Collection>(`/collections/${slug}`, { revalidate: 600 }),
      api<{ rows: ProductCardType[]; meta: PageMeta }>(`/products?collection=${slug}&limit=24`, { revalidate: 120 }),
    ]);
    return { collection, products: products.rows };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getData(params.slug);
  if (!data) return { title: 'Collection not found' };
  return buildMetadata({
    title: `${data.collection.name} — Collection`,
    description: data.collection.description ?? undefined,
    path: `/collections/${params.slug}`,
  });
}

export default async function CollectionPage({ params }: Props) {
  const data = await getData(params.slug);
  if (!data) notFound();

  return (
    <div className="container-luxe py-16 lg:py-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Collections', path: '/collections' },
          { name: data.collection.name, path: `/collections/${params.slug}` },
        ])}
      />
      <Reveal className="mb-14 text-center">
        <p className="eyebrow">Collection</p>
        <h1 className="heading-lg mt-3">{data.collection.name}</h1>
        {data.collection.description && (
          <p className="prose-organic mx-auto mt-4 max-w-xl">{data.collection.description}</p>
        )}
      </Reveal>
      <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {data.products.map((p, i) => (
          <StaggerItem key={p.slug}>
            <ProductCard product={p} priority={i < 4} />
          </StaggerItem>
        ))}
      </Stagger>
      {data.products.length === 0 && (
        <p className="py-20 text-center text-ink-soft">This collection is being restocked — check back soon.</p>
      )}
    </div>
  );
}
