'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, ProductDetail } from '@/lib/api';
import { useCompare, useCart } from '@/lib/stores';
import { formatPrice } from '@/lib/format';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';

export function CompareClient() {
  const { slugs, toggle, clear } = useCompare();
  const add = useCart((s) => s.add);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!slugs.length) {
      setProducts([]);
      setLoaded(true);
      return;
    }
    Promise.all(slugs.map((slug) => api<ProductDetail>(`/products/${slug}`).catch(() => null)))
      .then((res) => setProducts(res.filter((p): p is ProductDetail => p !== null)))
      .finally(() => setLoaded(true));
  }, [slugs]);

  if (loaded && products.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-organic bg-white p-14 text-center shadow-soft">
        <span className="text-4xl" aria-hidden>⚖️</span>
        <p className="mt-4 font-display text-2xl">Nothing to compare yet</p>
        <p className="prose-organic mt-2 text-sm">Add up to 4 products using the compare icon on any product card.</p>
        <Button href="/shop" className="mt-8">Browse Products</Button>
      </div>
    );
  }

  const rows: Array<{ label: string; render: (p: ProductDetail) => React.ReactNode }> = [
    { label: 'Price', render: (p) => <span className="font-semibold text-forest-800">{formatPrice(p.price)}</span> },
    { label: 'Rating', render: (p) => (p.reviewCount > 0 ? <Rating value={p.avgRating} count={p.reviewCount} /> : <span className="text-ink-faint">—</span>) },
    { label: 'Benefits', render: (p) => (
      <ul className="space-y-1 text-left text-xs">{p.benefits.slice(0, 4).map((b) => <li key={b}>✓ {b}</li>)}</ul>
    ) },
    { label: 'Key ingredients', render: (p) => (
      <span className="text-xs">{p.ingredients.map((i) => i.ingredient.name).join(', ') || '—'}</span>
    ) },
    { label: 'Good for', render: (p) => <span className="text-xs capitalize">{(p.concerns ?? []).join(', ').replace(/-/g, ' ') || '—'}</span> },
    { label: 'Sizes', render: (p) => <span className="text-xs">{p.variants.map((v) => v.name).join(', ') || 'One size'}</span> },
  ];

  return (
    <div>
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Side by side</p>
          <h1 className="heading-lg mt-3">Compare Products</h1>
        </div>
        {products.length > 0 && (
          <button onClick={clear} className="text-xs uppercase tracking-luxe text-ink-faint hover:text-clay-600">
            Clear all
          </button>
        )}
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 rounded-organic bg-white shadow-soft">
          <thead>
            <tr>
              <th className="w-36 p-5" aria-label="Attribute" />
              {products.map((p) => (
                <th key={p.slug} className="border-l border-cream-200 p-5 text-center align-top">
                  <button onClick={() => toggle(p.slug)} className="mb-2 text-xs text-ink-faint hover:text-clay-600" aria-label={`Remove ${p.name}`}>
                    × remove
                  </button>
                  <Link href={`/shop/${p.slug}`} className="block">
                    <div className="relative mx-auto aspect-[4/5] w-32 overflow-hidden rounded-xl bg-cream-200">
                      {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="128px" className="object-cover" />}
                    </div>
                    <span className="mt-3 block font-display text-lg leading-tight hover:text-forest-700">{p.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={row.label}>
                <th scope="row" className={`p-5 text-left text-xs font-semibold uppercase tracking-luxe text-ink-soft ${ri % 2 ? '' : 'bg-cream-50'}`}>
                  {row.label}
                </th>
                {products.map((p) => (
                  <td key={p.slug} className={`border-l border-cream-200 p-5 text-center text-sm ${ri % 2 ? '' : 'bg-cream-50'}`}>
                    {row.render(p)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th className="p-5" aria-label="Actions" />
              {products.map((p) => (
                <td key={p.slug} className="border-l border-cream-200 p-5 text-center">
                  <Button
                    size="sm"
                    onClick={() =>
                      add({
                        productId: p.id,
                        slug: p.slug,
                        name: p.name,
                        image: p.images[0]?.url ?? null,
                        variantId: p.variants[0]?.id ?? null,
                        variantName: p.variants[0]?.name ?? null,
                        unitPrice: p.variants[0]?.price ?? p.price,
                      })
                    }
                  >
                    Add to Cart
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
