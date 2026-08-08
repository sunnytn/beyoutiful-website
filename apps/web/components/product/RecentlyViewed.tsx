'use client';

import { useEffect, useState } from 'react';
import { api, ProductCard as ProductCardType } from '@/lib/api';
import { useRecentlyViewed } from '@/lib/stores';
import { ProductCard } from '@/components/product/ProductCard';

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const slugs = useRecentlyViewed((s) => s.slugs);
  const [products, setProducts] = useState<ProductCardType[]>([]);

  useEffect(() => {
    const wanted = slugs.filter((s) => s !== excludeSlug).slice(0, 4);
    if (!wanted.length) return;
    Promise.all(wanted.map((slug) => api<ProductCardType>(`/products/${slug}`).catch(() => null)))
      .then((res) => setProducts(res.filter((p): p is ProductCardType => p !== null)))
      .catch(() => undefined);
  }, [slugs, excludeSlug]);

  if (!products.length) return null;

  return (
    <section className="mt-20" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="heading-md mb-8 text-center">
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
