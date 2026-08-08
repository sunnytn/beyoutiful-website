import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

interface SitemapData {
  products: Array<{ slug: string; updatedAt: string }>;
  categories: Array<{ slug: string; updatedAt: string }>;
  collections: Array<{ slug: string; updatedAt: string }>;
  posts: Array<{ slug: string; updatedAt: string }>;
  ingredients: Array<{ slug: string; updatedAt: string }>;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, priority: 1, changeFrequency: 'daily' },
    { url: `${SITE_URL}/shop`, priority: 0.9, changeFrequency: 'daily' },
    { url: `${SITE_URL}/hair-care`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/skin-care`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/collections`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/advisor`, priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/ingredients`, priority: 0.7, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/before-after`, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/testimonials`, priority: 0.6, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/blog`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${SITE_URL}/faqs`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about`, priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about/story`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about/philosophy`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/contact`, priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/privacy-policy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${SITE_URL}/shipping-policy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${SITE_URL}/refund-policy`, priority: 0.3, changeFrequency: 'yearly' },
    { url: `${SITE_URL}/terms`, priority: 0.3, changeFrequency: 'yearly' },
  ];

  try {
    const data = await api<SitemapData>('/seo/sitemap-data', { revalidate: 3600 });
    return [
      ...staticPages,
      ...data.products.map((p) => ({
        url: `${SITE_URL}/shop/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        priority: 0.8,
        changeFrequency: 'weekly' as const,
      })),
      ...data.collections.map((c) => ({
        url: `${SITE_URL}/collections/${c.slug}`,
        lastModified: new Date(c.updatedAt),
        priority: 0.7,
        changeFrequency: 'weekly' as const,
      })),
      ...data.posts.map((b) => ({
        url: `${SITE_URL}/blog/${b.slug}`,
        lastModified: new Date(b.updatedAt),
        priority: 0.6,
        changeFrequency: 'monthly' as const,
      })),
      ...data.ingredients.map((i) => ({
        url: `${SITE_URL}/ingredients/${i.slug}`,
        lastModified: new Date(i.updatedAt),
        priority: 0.5,
        changeFrequency: 'monthly' as const,
      })),
    ];
  } catch {
    return staticPages;
  }
}
