'use client';

import { useEffect, useState } from 'react';
import { api, ProductCard as ProductCardType } from '@/lib/api';
import { useWishlist } from '@/lib/stores';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';

export function WishlistClient() {
  const slugs = useWishlist((s) => s.slugs);
  const [products, setProducts] = useState<ProductCardType[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!slugs.length) {
      setProducts([]);
      setLoaded(true);
      return;
    }
    Promise.all(slugs.map((slug) => api<ProductCardType>(`/products/${slug}`).catch(() => null)))
      .then((res) => setProducts(res.filter((p): p is ProductCardType => p !== null)))
      .finally(() => setLoaded(true));
  }, [slugs]);

  return (
    <div>
      <header className="mb-12 text-center">
        <p className="eyebrow">Saved for later</p>
        <h1 className="heading-lg mt-3">Your Wishlist</h1>
      </header>

      {!loaded ? (
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton aspect-[4/6]" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mx-auto max-w-md rounded-organic bg-white p-14 text-center shadow-soft">
          <span className="text-4xl" aria-hidden>🤍</span>
          <p className="mt-4 font-display text-2xl">Nothing saved yet</p>
          <p className="prose-organic mt-2 text-sm">
            Tap the heart on any product to keep it here for later.
          </p>
          <Button href="/shop" className="mt-8">
            Discover Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
