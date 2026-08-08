/** Typed API client — all storefront data flows through the NestJS API. */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  revalidate?: number | false;
  token?: string | null;
}

export async function api<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { body, revalidate, token, headers, ...rest } = opts;
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      message = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? message);
    } catch {
      /* keep default */
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

// ── Domain types (aligned with the API responses) ──
export interface ProductImage {
  url: string;
  alt: string | null;
}
export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  stock?: number;
}
export interface ProductCard {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  compareAtPrice: number | null;
  avgRating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  concerns?: string[];
  stock?: number;
  images: ProductImage[];
  variants?: ProductVariant[];
  categories?: Array<{ category: { name: string; slug: string } }>;
  reason?: string | null;
}
export interface ProductDetail extends ProductCard {
  id: string;
  description: string;
  benefits: string[];
  directions: string | null;
  videoUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  variants: ProductVariant[];
  ingredients: Array<{ ingredient: { name: string; slug: string; description: string; imageUrl: string | null } }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
  reviews: Array<{ id: string; name: string; rating: number; title: string | null; body: string; createdAt: string }>;
  relatedFrom: Array<{ related: ProductCard }>;
  collections: Array<{ collection: { name: string; slug: string } }>;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count?: { products: number };
}
export interface BlogCard {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt?: string;
  author?: string;
  tags?: string[];
  category?: { name: string; slug: string } | null;
}
export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
}
export interface Testimonial {
  id: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
  rating: number;
  text: string;
  productSlug: string | null;
}
export interface BeforeAfter {
  id: string;
  title: string;
  description: string | null;
  beforeUrl: string;
  afterUrl: string;
  durationLabel: string | null;
  concern: string | null;
  productSlug: string | null;
}
export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface SiteSettings {
  [key: string]: unknown;
}
