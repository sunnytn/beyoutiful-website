'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api, BlogCard, Faq, ProductCard as ProductCardType } from '@/lib/api';
import { ProductCard } from '@/components/product/ProductCard';
import { Accordion } from '@/components/ui/Accordion';

interface SearchResults {
  query: string;
  products: ProductCardType[];
  ingredients: Array<{ name: string; slug: string; description: string; imageUrl: string | null }>;
  concerns: Array<{ name: string; slug: string; goal: 'HAIR' | 'SKIN' }>;
  blogs: BlogCard[];
  faqs: Faq[];
}

const suggestions = ['rosemary oil', 'hair fall', 'glow', 'dandruff', 'dry skin', 'ubtan', 'acne'];

export function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get('q') ?? '';
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      try {
        const res = await api<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
        setResults(res);
        router.replace(`/search?q=${encodeURIComponent(query)}`, { scroll: false });
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const total = results
    ? results.products.length + results.ingredients.length + results.concerns.length + results.blogs.length + results.faqs.length
    : 0;

  return (
    <div>
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Search</p>
        <h1 className="heading-lg mt-3">What are you looking for?</h1>
        <div className="relative mt-8">
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “hair fall”, “glow”, “rosemary”…"
            aria-label="Search"
            className="w-full rounded-full border border-cream-400 bg-white px-7 py-4 text-lg shadow-soft placeholder:text-ink-faint focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600/15"
          />
          {loading && (
            <span className="absolute right-6 top-1/2 -translate-y-1/2 animate-pulse text-sm text-ink-faint">…</span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="rounded-full bg-cream-200 px-4 py-1.5 text-xs text-forest-800 transition-colors hover:bg-cream-300"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {results && (
        <div className="mt-14 space-y-14">
          {total === 0 && !loading && (
            <p className="text-center text-ink-soft">
              Nothing found for “{results.query}”. Try a different word — or ask us on WhatsApp.
            </p>
          )}

          {results.concerns.length > 0 && (
            <section aria-label="Matching concerns">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-luxe text-clay-600">Concerns</h2>
              <div className="flex flex-wrap gap-3">
                {results.concerns.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/advisor?goal=${c.goal}&concern=${c.slug}`}
                    className="rounded-full bg-forest-700 px-5 py-2.5 text-sm text-cream-100 transition-colors hover:bg-forest-800"
                  >
                    {c.name} — get a routine →
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.products.length > 0 && (
            <section aria-label="Matching products">
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-luxe text-clay-600">Products</h2>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {results.products.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </section>
          )}

          {results.ingredients.length > 0 && (
            <section aria-label="Matching ingredients">
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-luxe text-clay-600">Ingredients</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.ingredients.map((ing) => (
                  <Link key={ing.slug} href={`/ingredients/${ing.slug}`} className="flex gap-4 rounded-organic bg-white p-4 shadow-soft transition-shadow hover:shadow-lift">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-forest-100">
                      {ing.imageUrl && <Image src={ing.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                    </div>
                    <div>
                      <h3 className="font-display text-lg">{ing.name}</h3>
                      <p className="line-clamp-2 text-xs text-ink-soft">{ing.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.blogs.length > 0 && (
            <section aria-label="Matching articles">
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-luxe text-clay-600">Articles</h2>
              <ul className="space-y-3">
                {results.blogs.map((b) => (
                  <li key={b.slug}>
                    <Link href={`/blog/${b.slug}`} className="group block rounded-organic bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
                      <h3 className="font-display text-lg group-hover:text-forest-700">{b.title}</h3>
                      <p className="line-clamp-1 text-sm text-ink-soft">{b.excerpt}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results.faqs.length > 0 && (
            <section aria-label="Matching FAQs">
              <h2 className="mb-6 text-xs font-semibold uppercase tracking-luxe text-clay-600">FAQs</h2>
              <Accordion items={results.faqs.map((f) => ({ id: f.id, title: f.question, content: <p>{f.answer}</p> }))} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
