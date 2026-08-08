'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart, cartCount, useWishlist, useCustomerAuth } from '@/lib/stores';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { FREE_SHIPPING_ABOVE } from '@/lib/shipping';

const nav = [
  { label: 'Shop', href: '/shop' },
  { label: 'Hair Care', href: '/hair-care' },
  { label: 'Skin Care', href: '/skin-care' },
  { label: 'Collections', href: '/collections' },
  { label: 'Ingredients', href: '/ingredients' },
  { label: 'Advisor', href: '/advisor', highlight: true },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const wishlistCount = useWishlist((s) => s.slugs.length);
  const user = useCustomerAuth((s) => s.user);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setMobileOpen(false), [pathname]);

  const count = mounted ? cartCount(items) : 0;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled ? 'bg-cream-100/85 shadow-soft backdrop-blur-md border-b border-cream-300/60' : 'bg-transparent'
        }`}
      >
        {/* announcement bar */}
        <div className="bg-forest-800 py-1.5 text-center text-[11px] font-sans font-medium uppercase tracking-luxe text-cream-200 flex items-center justify-center gap-2">
          <span>🌿 Free delivery on orders above Rs. {FREE_SHIPPING_ABOVE.toLocaleString('en-PK')} · Cash on Delivery nationwide</span>
        </div>

        <div className="container-luxe flex items-center justify-between py-4">
          {/* mobile menu button */}
          <button
            className="rounded-full p-2 lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 6h18M3 12h18M3 18h12" />
            </svg>
          </button>

          <Link href="/" className="group flex flex-col items-center leading-none" aria-label="BeYoutiful Organics home">
            <span className="font-display text-xl tracking-[0.28em] text-forest-800 sm:text-2xl">BEYOUTIFUL</span>
            <span className="mt-1 text-[9px] font-sans font-semibold uppercase tracking-[0.5em] text-clay-600">
              Organics
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-xs font-sans font-semibold uppercase tracking-luxe transition-colors ${
                  item.highlight
                    ? 'text-clay-600 hover:text-clay-700'
                    : pathname.startsWith(item.href)
                      ? 'text-forest-700'
                      : 'text-ink-soft hover:text-forest-700'
                }`}
              >
                {item.label}
                {item.highlight && (
                  <span className="absolute -right-2.5 -top-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-clay-500" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href="/search" aria-label="Search" className="rounded-full p-2 transition-colors hover:bg-cream-200">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </Link>
            <Link
              href={mounted && user ? '/account' : '/account/login'}
              aria-label={mounted && user ? `Account (${user.fullName})` : 'Sign in'}
              className="rounded-full p-2 transition-colors hover:bg-cream-200"
              title={mounted && user ? user.fullName : 'Account Sign In'}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-full p-2 transition-colors hover:bg-cream-200">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
              </svg>
              {mounted && wishlistCount > 0 && <CountDot n={wishlistCount} />}
            </Link>
            <button onClick={openCart} aria-label="Open cart" className="relative rounded-full p-2 transition-colors hover:bg-cream-200">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6h15l-1.5 9h-12z" />
                <path d="M6 6L5 3H2" />
                <circle cx="9" cy="20" r="1.4" />
                <circle cx="17" cy="20" r="1.4" />
              </svg>
              {count > 0 && <CountDot n={count} />}
            </button>
          </div>
        </div>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[85vw] flex-col bg-cream-100 p-8"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              aria-label="Mobile menu"
            >
              <div className="mb-8 flex items-center justify-between">
                <span className="font-display text-lg tracking-[0.25em] text-forest-800">BEYOUTIFUL</span>
                <button aria-label="Close menu" onClick={() => setMobileOpen(false)} className="p-2 text-2xl leading-none">
                  ×
                </button>
              </div>
              <nav className="flex flex-col gap-5" aria-label="Mobile">
                {nav.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                  >
                    <Link
                      href={item.href}
                      className={`font-display text-2xl ${item.highlight ? 'text-clay-600' : 'text-ink'}`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto space-y-2 text-sm text-ink-soft">
                <p>WhatsApp: 0300-0527443</p>
                <p>beyoutiful.organics@gmail.com</p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}

function CountDot({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-clay-500 px-1 text-[10px] font-bold text-white">
      {n > 99 ? '99+' : n}
    </span>
  );
}
