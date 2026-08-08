'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Category, PageMeta, ProductCard as ProductCardType } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { Select } from '@/components/ui/Input';

const sortOptions = [
  { value: '', label: 'Recommended' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

const priceBands = [
  { label: 'Any price', min: '', max: '' },
  { label: 'Under Rs. 300', min: '', max: '300' },
  { label: 'Rs. 300 – 600', min: '300', max: '600' },
  { label: 'Rs. 600 – 1,000', min: '600', max: '1000' },
  { label: 'Above Rs. 1,000', min: '1000', max: '' },
];

export function ShopClient({
  initialProducts,
  meta,
  categories,
  searchParams,
}: {
  initialProducts: ProductCardType[];
  meta: PageMeta;
  categories: Category[];
  searchParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const setParam = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...updates, page: updates.page ?? undefined };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const activeBand = priceBands.findIndex(
    (b) => (searchParams.minPrice ?? '') === b.min && (searchParams.maxPrice ?? '') === b.max,
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
      {/* Filters */}
      <aside className="space-y-8" aria-label="Product filters">
        <div>
          <h2 className="text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">Category</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <FilterLink active={!searchParams.category} onClick={() => setParam({ category: undefined })}>
                All products
              </FilterLink>
            </li>
            {categories.map((c) => (
              <li key={c.slug}>
                <FilterLink active={searchParams.category === c.slug} onClick={() => setParam({ category: c.slug })}>
                  {c.name} <span className="text-ink-faint">({c._count?.products ?? 0})</span>
                </FilterLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">Price</h2>
          <ul className="mt-4 space-y-2.5">
            {priceBands.map((band, i) => (
              <li key={band.label}>
                <FilterLink
                  active={i === (activeBand === -1 ? 0 : activeBand)}
                  onClick={() => setParam({ minPrice: band.min || undefined, maxPrice: band.max || undefined })}
                >
                  {band.label}
                </FilterLink>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Grid */}
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-soft">
            {meta.total} product{meta.total === 1 ? '' : 's'}
          </p>
          <div className="w-52">
            <Select
              aria-label="Sort products"
              value={searchParams.sort ?? ''}
              onChange={(e) => setParam({ sort: e.target.value || undefined })}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {initialProducts.length === 0 ? (
          <div className="rounded-organic bg-white p-16 text-center shadow-soft">
            <p className="font-display text-2xl">No products found</p>
            <p className="prose-organic mt-2 text-sm">Try removing a filter, or explore the full range.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
            {initialProducts.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setParam({ page: String(n) })}
                aria-current={n === meta.page ? 'page' : undefined}
                className={`h-10 w-10 rounded-full text-sm font-semibold transition-colors ${
                  n === meta.page ? 'bg-forest-700 text-cream-100' : 'bg-white text-ink-soft shadow-soft hover:bg-cream-200'
                }`}
              >
                {n}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

function FilterLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-left text-sm transition-colors ${active ? 'font-semibold text-forest-700' : 'text-ink-soft hover:text-ink'}`}
    >
      {children}
    </button>
  );
}
