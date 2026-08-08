'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart, cartSubtotal } from '@/lib/stores';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { FREE_SHIPPING_ABOVE } from '@/lib/shipping';

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const subtotal = cartSubtotal(items);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_ABOVE);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-50 flex w-[26rem] max-w-[92vw] flex-col bg-cream-50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.36, ease: [0.32, 0.72, 0, 1] }}
            role="dialog"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-cream-300 px-6 py-5">
              <h2 className="font-display text-xl">Your Cart ({items.length})</h2>
              <button onClick={close} aria-label="Close cart" className="p-1 text-2xl leading-none text-ink-soft hover:text-ink">
                ×
              </button>
            </div>

            {/* free shipping progress */}
            <div className="border-b border-cream-300 px-6 py-4">
              <p className="mb-2 text-xs text-ink-soft">
                {subtotal >= FREE_SHIPPING_ABOVE ? (
                  <span className="font-semibold text-forest-700">🎉 You've unlocked FREE delivery!</span>
                ) : (
                  <>
                    Add <strong className="text-forest-700">{formatPrice(FREE_SHIPPING_ABOVE - subtotal)}</strong> more
                    for free delivery
                  </>
                )}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-cream-300">
                <motion.div
                  className="h-full rounded-full bg-forest-600"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="text-4xl">🌿</span>
                  <p className="font-display text-xl">Your cart is empty</p>
                  <p className="text-sm text-ink-soft">Let's find something your skin will love.</p>
                  <Button href="/shop" variant="outline" size="sm" onClick={close}>
                    Browse Products
                  </Button>
                </div>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <motion.li
                      key={`${item.productId}-${item.variantId}`}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24 }}
                      className="flex gap-4"
                    >
                      <Link href={`/shop/${item.slug}`} onClick={close} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                        {item.image && <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />}
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link href={`/shop/${item.slug}`} onClick={close} className="font-display text-base leading-tight hover:text-forest-700">
                              {item.name}
                            </Link>
                            {item.variantName && <p className="text-xs text-ink-faint">{item.variantName}</p>}
                          </div>
                          <button
                            onClick={() => remove(item.productId, item.variantId)}
                            aria-label={`Remove ${item.name}`}
                            className="text-ink-faint hover:text-clay-600"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center rounded-full border border-cream-400">
                            <QtyBtn onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)} label="Decrease quantity">−</QtyBtn>
                            <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                            <QtyBtn onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)} label="Increase quantity">+</QtyBtn>
                          </div>
                          <span className="text-sm font-semibold text-forest-800">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="space-y-3 border-t border-cream-300 px-6 py-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">Subtotal</span>
                  <span className="font-display text-xl text-forest-800">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-ink-faint">Delivery calculated at checkout · Cash on Delivery</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button href="/cart" variant="outline" size="md" onClick={close}>
                    View Cart
                  </Button>
                  <Button href="/checkout" size="md" onClick={close}>
                    Checkout
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} aria-label={label} className="px-2.5 py-1 text-ink-soft transition-colors hover:text-forest-700">
      {children}
    </button>
  );
}
