import { Suspense } from 'react';
import { api, Category, PageMeta, ProductCard as ProductCardType } from '@/lib/api';
import { buildMetadata, breadcrumbJsonLd, JsonLd } from '@/lib/seo';
import { ShopClient } from '@/components/shop/ShopClient';

export const metadata = buildMetadata({
  title: 'Shop All Organic Products',
  description:
    'Browse the full BeYoutiful Organics range — cold-pressed oils, handmade soaps, pure rose water, ubtans and wholesome organics. Cash on delivery across Pakistan.',
  path: '/shop',
});

interface SearchParams {
  category?: string;
  collection?: string;
  concern?: string;
  sort?: string;
  page?: string;
  minPrice?: string;
  maxPrice?: string;
  q?: string;
}

async function getData(sp: SearchParams) {
  const params = new URLSearchParams();
  if (sp.category) params.set('category', sp.category);
  if (sp.collection) params.set('collection', sp.collection);
  if (sp.concern) params.set('concern', sp.concern);
  if (sp.sort) params.set('sort', sp.sort);
  if (sp.page) params.set('page', sp.page);
  if (sp.minPrice) params.set('minPrice', sp.minPrice);
  if (sp.maxPrice) params.set('maxPrice', sp.maxPrice);
  if (sp.q) params.set('q', sp.q);
  params.set('limit', '12');
  try {
    const [products, categories] = await Promise.all([
      api<{ rows: ProductCardType[]; meta: PageMeta }>(`/products?${params.toString()}`, { revalidate: 120 }),
      api<Category[]>('/categories', { revalidate: 600 }),
    ]);
    return { products, categories };
  } catch {
    return {
      products: { rows: [], meta: { total: 0, page: 1, limit: 12, totalPages: 1 } },
      categories: [] as Category[],
    };
  }
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const { products, categories } = await getData(searchParams);
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }])} />
      <div className="container-luxe py-12 lg:py-16">
        <header className="mb-10 text-center">
          <p className="eyebrow">The full collection</p>
          <h1 className="heading-lg mt-3">Shop All Products</h1>
        </header>
        <Suspense>
          <ShopClient
            initialProducts={products.rows}
            meta={products.meta}
            categories={categories}
            searchParams={searchParams as Record<string, string | undefined>}
          />
        </Suspense>
      </div>
    </>
  );
}
