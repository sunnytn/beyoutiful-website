import Image from 'next/image';
import { api, Category, PageMeta, ProductCard as ProductCardType } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { breadcrumbJsonLd, JsonLd } from '@/lib/seo';

export async function CategoryLanding({ slug, eyebrow, intro }: { slug: string; eyebrow: string; intro: string }) {
  let category: Category | null = null;
  let products: ProductCardType[] = [];
  try {
    const [cat, prods] = await Promise.all([
      api<Category>(`/categories/${slug}`, { revalidate: 600 }),
      api<{ rows: ProductCardType[]; meta: PageMeta }>(`/products?category=${slug}&limit=24`, { revalidate: 120 }),
    ]);
    category = cat;
    products = prods.rows;
  } catch {
    /* graceful empty state */
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: category?.name ?? slug, path: `/${slug}` },
        ])}
      />
      {/* editorial hero */}
      <section className="relative overflow-hidden bg-forest-900">
        <div className="container-luxe grid min-h-[50vh] items-center gap-10 py-20 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow !text-clay-300">{eyebrow}</p>
            <h1 className="heading-xl mt-4 text-cream-100">{category?.name ?? 'Collection'}</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream-200/80">{category?.description ?? intro}</p>
            <Button href="/advisor" variant="clay" className="mt-8">
              Find My Perfect Products
            </Button>
          </Reveal>
          {category?.imageUrl && (
            <Reveal delay={0.15} className="relative hidden aspect-[5/4] overflow-hidden rounded-organic lg:block">
              <Image src={category.imageUrl} alt={category.name} fill sizes="50vw" className="object-cover" priority />
            </Reveal>
          )}
        </div>
      </section>

      <section className="container-luxe py-16 lg:py-24" aria-label={`${category?.name ?? 'Category'} products`}>
        <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <StaggerItem key={p.slug}>
              <ProductCard product={p} priority={i < 4} />
            </StaggerItem>
          ))}
        </Stagger>
        {products.length === 0 && (
          <p className="py-20 text-center text-ink-soft">Products coming soon — check back shortly.</p>
        )}
      </section>
    </>
  );
}
