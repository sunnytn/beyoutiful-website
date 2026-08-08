'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductDetail } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useCart, useWishlist, useRecentlyViewed } from '@/lib/stores';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Rating } from '@/components/ui/Rating';
import { Accordion } from '@/components/ui/Accordion';
import { ProductCard } from '@/components/product/ProductCard';
import { ImageGallery } from '@/components/product/ImageGallery';
import { ReviewSection } from '@/components/product/ReviewSection';
import { RecentlyViewed } from '@/components/product/RecentlyViewed';

export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const add = useCart((s) => s.add);
  const wishlist = useWishlist();
  const pushRecent = useRecentlyViewed((s) => s.push);
  const [variantId, setVariantId] = useState<string | null>(product.variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    pushRecent(product.slug);
  }, [product.slug, pushRecent]);

  const variant = useMemo(() => product.variants.find((v) => v.id === variantId) ?? null, [product.variants, variantId]);
  const price = variant?.price ?? product.price;
  const wished = wishlist.slugs.includes(product.slug);
  const related = product.relatedFrom.map((r) => r.related);

  const addToCart = () => {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0]?.url ?? null,
        variantId: variant?.id ?? null,
        variantName: variant?.name ?? null,
        unitPrice: price,
      },
      quantity,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="container-luxe py-10 lg:py-16">
      {/* breadcrumb */}
      <nav className="mb-8 text-xs text-ink-faint" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-forest-700">Home</Link>
        <span className="mx-2" aria-hidden>/</span>
        <Link href="/shop" className="hover:text-forest-700">Shop</Link>
        <span className="mx-2" aria-hidden>/</span>
        <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ImageGallery images={product.images} videoUrl={product.videoUrl} name={product.name} />

        <div>
          <div className="flex flex-wrap gap-2">
            {product.isBestSeller && <Badge>Best Seller</Badge>}
            {product.isNewArrival && <Badge tone="cream">New</Badge>}
            {product.categories?.map((c) => (
              <Link key={c.category.slug} href={`/shop?category=${c.category.slug}`}>
                <Badge tone="outline">{c.category.name}</Badge>
              </Link>
            ))}
          </div>

          <h1 className="heading-lg mt-4">{product.name}</h1>
          {product.reviewCount > 0 && (
            <div className="mt-3">
              <Rating value={product.avgRating} count={product.reviewCount} size={16} />
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl text-forest-800">{formatPrice(price)}</span>
            {product.compareAtPrice && product.compareAtPrice > price && (
              <span className="text-lg text-ink-faint line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="prose-organic mt-5 text-base">{product.shortDescription}</p>

          {/* variants */}
          {product.variants.length > 0 && (
            <fieldset className="mt-7">
              <legend className="text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">Size</legend>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    aria-pressed={v.id === variantId}
                    className={`rounded-full border px-5 py-2.5 text-sm transition-all ${
                      v.id === variantId
                        ? 'border-forest-700 bg-forest-700 text-cream-100'
                        : 'border-cream-400 bg-white text-ink hover:border-forest-600'
                    }`}
                  >
                    {v.name} · {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* qty + actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-cream-400 bg-white">
              <button className="px-4 py-3 text-ink-soft hover:text-forest-700" aria-label="Decrease quantity" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button className="px-4 py-3 text-ink-soft hover:text-forest-700" aria-label="Increase quantity" onClick={() => setQuantity((q) => Math.min(50, q + 1))}>+</button>
            </div>
            <Button onClick={addToCart} size="lg" className="flex-1 sm:flex-none sm:min-w-52">
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </Button>
            <button
              onClick={() => wishlist.toggle(product.slug)}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`rounded-full border p-3.5 transition-all ${
                wished ? 'border-clay-500 bg-clay-500 text-white' : 'border-cream-400 bg-white text-ink hover:border-clay-500'
              }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
            </button>
          </div>

          {/* trust strip */}
          <ul className="mt-8 grid grid-cols-3 gap-3 rounded-organic bg-cream-200/70 p-5 text-center text-xs text-ink-soft">
            <li>🌿 100% Organic</li>
            <li>🚚 COD Nationwide</li>
            <li>💬 WhatsApp Support</li>
          </ul>

          {/* benefits */}
          {product.benefits.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">Benefits</h2>
              <ul className="mt-4 space-y-2.5">
                {product.benefits.map((b) => (
                  <motion.li
                    key={b}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 text-sm text-ink"
                  >
                    <span className="mt-0.5 text-forest-600" aria-hidden>✓</span>
                    {b}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}

          {/* accordions: description / ingredients / directions / faqs */}
          <div className="mt-10">
            <Accordion
              items={[
                { id: 'description', title: 'Full Description', content: <p>{product.description}</p> },
                ...(product.ingredients.length
                  ? [{
                      id: 'ingredients',
                      title: 'Key Ingredients',
                      content: (
                        <ul className="space-y-3">
                          {product.ingredients.map(({ ingredient }) => (
                            <li key={ingredient.slug}>
                              <Link href={`/ingredients/${ingredient.slug}`} className="font-semibold text-forest-700 hover:underline">
                                {ingredient.name}
                              </Link>
                              <p className="mt-0.5">{ingredient.description}</p>
                            </li>
                          ))}
                        </ul>
                      ),
                    }]
                  : []),
                ...(product.directions
                  ? [{ id: 'directions', title: 'How to Use', content: <p>{product.directions}</p> }]
                  : []),
                ...(product.faqs.length
                  ? [{
                      id: 'faqs',
                      title: 'Product FAQs',
                      content: (
                        <dl className="space-y-4">
                          {product.faqs.map((f) => (
                            <div key={f.id}>
                              <dt className="font-semibold text-ink">{f.question}</dt>
                              <dd className="mt-1">{f.answer}</dd>
                            </div>
                          ))}
                        </dl>
                      ),
                    }]
                  : []),
              ]}
            />
          </div>
        </div>
      </div>

      <ReviewSection productSlug={product.slug} reviews={product.reviews} avgRating={product.avgRating} reviewCount={product.reviewCount} />

      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related-heading">
          <h2 id="related-heading" className="heading-md mb-8 text-center">You May Also Love</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed excludeSlug={product.slug} />
    </div>
  );
}
