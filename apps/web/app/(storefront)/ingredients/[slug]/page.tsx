import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api, ProductCard as ProductCardType } from '@/lib/api';
import { buildMetadata, breadcrumbJsonLd, JsonLd } from '@/lib/seo';
import { ProductCard } from '@/components/product/ProductCard';
import { Reveal } from '@/components/ui/Reveal';

interface IngredientDetail {
  name: string;
  slug: string;
  description: string;
  benefits: string[];
  imageUrl: string | null;
  products: Array<{ product: ProductCardType }>;
}

interface Props {
  params: { slug: string };
}

async function getIngredient(slug: string): Promise<IngredientDetail | null> {
  try {
    return await api<IngredientDetail>(`/ingredients/${slug}`, { revalidate: 600 });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ing = await getIngredient(params.slug);
  if (!ing) return { title: 'Ingredient not found' };
  return buildMetadata({
    title: `${ing.name} — Ingredient Spotlight`,
    description: ing.description,
    path: `/ingredients/${ing.slug}`,
    image: ing.imageUrl,
  });
}

export default async function IngredientPage({ params }: Props) {
  const ing = await getIngredient(params.slug);
  if (!ing) notFound();

  return (
    <div className="container-luxe py-16 lg:py-24">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Ingredients', path: '/ingredients' },
          { name: ing.name, path: `/ingredients/${ing.slug}` },
        ])}
      />
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow">Ingredient spotlight</p>
          <h1 className="heading-lg mt-3">{ing.name}</h1>
          <p className="prose-organic mt-5 text-lg">{ing.description}</p>
          <ul className="mt-7 space-y-2.5">
            {ing.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 text-forest-600" aria-hidden>✓</span>
                {b}
              </li>
            ))}
          </ul>
        </Reveal>
        {ing.imageUrl && (
          <Reveal delay={0.15} className="relative aspect-[5/4] overflow-hidden rounded-organic shadow-soft">
            <Image src={ing.imageUrl} alt={ing.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" priority />
          </Reveal>
        )}
      </div>

      {ing.products.length > 0 && (
        <section className="mt-20" aria-labelledby="featuring-heading">
          <h2 id="featuring-heading" className="heading-md mb-8 text-center">
            Products Featuring {ing.name}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {ing.products.map(({ product }) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
