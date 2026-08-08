'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── Cart ──
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  variantId: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  remove: (productId: string, variantId: string | null) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

const keyOf = (productId: string, variantId: string | null) => `${productId}::${variantId ?? ''}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, quantity = 1) =>
        set((s) => {
          const k = keyOf(item.productId, item.variantId);
          const existing = s.items.find((i) => keyOf(i.productId, i.variantId) === k);
          const items = existing
            ? s.items.map((i) =>
                keyOf(i.productId, i.variantId) === k ? { ...i, quantity: Math.min(50, i.quantity + quantity) } : i,
              )
            : [...s.items, { ...item, quantity }];
          return { items, isOpen: true };
        }),
      remove: (productId, variantId) =>
        set((s) => ({ items: s.items.filter((i) => keyOf(i.productId, i.variantId) !== keyOf(productId, variantId)) })),
      setQuantity: (productId, variantId, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => keyOf(i.productId, i.variantId) !== keyOf(productId, variantId))
              : s.items.map((i) =>
                  keyOf(i.productId, i.variantId) === keyOf(productId, variantId)
                    ? { ...i, quantity: Math.min(50, quantity) }
                    : i,
                ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: 'byo-cart' },
  ),
);

export const cartSubtotal = (items: CartItem[]) => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.quantity, 0);

// ── Wishlist ──
interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
}
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => ({ slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [...s.slugs, slug] })),
      has: (slug) => get().slugs.includes(slug),
    }),
    { name: 'byo-wishlist' },
  ),
);

// ── Recently viewed ──
interface RecentState {
  slugs: string[];
  push: (slug: string) => void;
}
export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      slugs: [],
      push: (slug) =>
        set((s) => ({ slugs: [slug, ...s.slugs.filter((x) => x !== slug)].slice(0, 12) })),
    }),
    { name: 'byo-recent' },
  ),
);

// ── Compare ──
interface CompareState {
  slugs: string[];
  toggle: (slug: string) => void;
  clear: () => void;
}
export const useCompare = create<CompareState>()(
  persist(
    (set) => ({
      slugs: [],
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [...s.slugs, slug].slice(-4),
        })),
      clear: () => set({ slugs: [] }),
    }),
    { name: 'byo-compare' },
  ),
);

// ── Admin auth ──
interface AdminAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string; fullName: string; role: string } | null;
  setAuth: (a: { accessToken: string; refreshToken: string; user: AdminAuthState['user'] }) => void;
  logout: () => void;
}
export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (a) => set(a),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'byo-admin-auth' },
  ),
);

// ── Customer auth ──
export interface CustomerUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: string;
}

interface CustomerAuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: CustomerUser | null;
  setAuth: (a: { accessToken: string; refreshToken: string; user: CustomerUser }) => void;
  logout: () => void;
}

export const useCustomerAuth = create<CustomerAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setAuth: (a) => set(a),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'byo-customer-auth' },
  ),
);
