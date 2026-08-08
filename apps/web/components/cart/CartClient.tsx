'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCart, cartSubtotal } from '@/lib/stores';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { FREE_SHIPPING_ABOVE as FREE_ABOVE, shippingFor } from '@/lib/shipping';

export function CartClient() {
  const { items, setQuantity, remove } = useCart();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="skeleton mx-auto h-64 max-w-3xl" />;

  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-organic bg-white p-14 text-center shadow-soft">
        <span className="text-4xl" aria-hidden>🌿</span>
        <h1 className="mt-4 font-display text-2xl">Your cart is empty</h1>
        <p className="prose-organic mt-2 text-sm">Let's find something your skin will love.</p>
        <Button href="/shop" className="mt-8">Browse Products</Button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-12 text-center">
        <p className="eyebrow">Almost there</p>
        <h1 className="heading-lg mt-3">Your Cart</h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          {items.map((item) => (
            <li key={`${item.productId}-${item.variantId}`} className="flex gap-5 rounded-organic bg-white p-5 shadow-soft">
              <Link href={`/shop/${item.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                {item.image && <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/shop/${item.slug}`} className="font-display text-lg hover:text-forest-700">{item.name}</Link>
                    {item.variantName && <p className="text-xs text-ink-faint">{item.variantName}</p>}
                    <p className="mt-1 text-xs text-ink-soft">{formatPrice(item.unitPrice)} each</p>
                  </div>
                  <button onClick={() => remove(item.productId, item.variantId)} aria-label={`Remove ${item.name}`} className="text-ink-faint hover:text-clay-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-cream-400">
                    <button className="px-3.5 py-2 text-ink-soft hover:text-forest-700" aria-label="Decrease quantity" onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}>−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button className="px-3.5 py-2 text-ink-soft hover:text-forest-700" aria-label="Increase quantity" onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}>+</button>
                  </div>
                  <span className="font-display text-lg text-forest-800">{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-organic bg-white p-8 shadow-soft" aria-label="Order summary">
          <h2 className="font-display text-xl">Order Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd className="font-semibold">{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-soft">Delivery</dt><dd className="font-semibold">{shipping === 0 ? <span className="text-forest-700">FREE</span> : formatPrice(shipping)}</dd></div>
            {shipping > 0 && (
              <p className="rounded-lg bg-cream-200 px-3 py-2 text-xs text-ink-soft">
                Add {formatPrice(FREE_ABOVE - subtotal)} more for free delivery
              </p>
            )}
            <div className="flex justify-between border-t border-cream-300 pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-display text-2xl text-forest-800">{formatPrice(subtotal + shipping)}</dd>
            </div>
          </dl>
          <Button href="/checkout" size="lg" className="mt-7 w-full">Proceed to Checkout</Button>
          <p className="mt-4 text-center text-xs text-ink-faint">Cash on Delivery · Confirmed on WhatsApp</p>
        </aside>
      </div>
    </div>
  );
}
