'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ProductCard as ProductCardType } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useCart, useWishlist, useCompare } from '@/lib/stores';
import { Rating } from '@/components/ui/Rating';
import { Badge } from '@/components/ui/Badge';

export function ProductCard({ product, priority = false }: { product: ProductCardType; priority?: boolean }) {
  const add = useCart((s) => s.add);
  const wishlist = useWishlist();
  const compare = useCompare();
  const img = product.images[0];
  const hover = product.images[1];
  const hasVariants = (product.variants?.length ?? 0) > 0;
  const wished = wishlist.slugs.includes(product.slug);
  const compared = compare.slugs.includes(product.slug);

  const quickAdd = () => {
    add({
      productId: product.id ?? product.slug,
      slug: product.slug,
      name: product.name,
      image: img?.url ?? null,
      variantId: hasVariants ? product.variants![0].id : null,
      variantName: hasVariants ? product.variants![0].name : null,
      unitPrice: hasVariants ? product.variants![0].price : product.price,
    });
  };

  return (
    <motion.article
      whileHover="hover"
      className="group relative flex flex-col overflow-hidden rounded-organic glass-card"
    >
      <Link href={`/shop/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-cream-200/60">
        {img ? (
          <>
            <Image
              src={img.url}
              alt={img.alt || `${product.name} - Pure Organic Skincare in Pakistan`}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-700 ${hover ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
            />
            {hover && (
              <Image
                src={hover.url}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <span className="flex h-full items-center justify-center font-display text-3xl text-forest-300">🌿</span>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {product.compareAtPrice && product.compareAtPrice > product.price && <Badge tone="clay">Sale</Badge>}
          {product.isBestSeller && <Badge tone="forest">Best Seller</Badge>}
          {product.isNewArrival && <Badge tone="cream">New</Badge>}
        </div>
      </Link>

      {/* hover actions */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-100 transition-all duration-300 lg:translate-x-2 lg:opacity-0 lg:group-hover:translate-x-0 lg:group-hover:opacity-100">
        <IconButton
          label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          active={wished}
          onClick={() => wishlist.toggle(product.slug)}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
          </svg>
        </IconButton>
        <IconButton label={compared ? 'Remove from compare' : 'Add to compare'} active={compared} onClick={() => compare.toggle(product.slug)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v18M16 3v18M3 8h18M3 16h18" opacity=".9" />
          </svg>
        </IconButton>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        {product.categories?.[0] && (
          <span className="text-[10px] font-sans font-semibold uppercase tracking-luxe text-clay-600">
            {product.categories[0].category.name}
          </span>
        )}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="font-display text-lg leading-snug text-forest-800 transition-colors group-hover:text-clay-600">
            {product.name}
          </h3>
        </Link>
        {product.reviewCount > 0 && <Rating value={product.avgRating} count={product.reviewCount} />}
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-semibold text-forest-800">{formatPrice(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-ink-faint line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
          <button
            onClick={quickAdd}
            aria-label={`Add ${product.name} to cart`}
            className="rounded-full bg-forest-700 p-2.5 text-cream-100 shadow-soft transition-all duration-300 hover:bg-forest-800 hover:shadow-lift active:scale-95"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z" />
              <path d="M6 6L5 3H2" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function IconButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded-full p-2.5 shadow-soft backdrop-blur transition-all duration-300 active:scale-95 ${
        active ? 'bg-clay-500 text-white' : 'bg-white/85 text-ink hover:bg-white'
      }`}
    >
      {children}
    </button>
  );
}
