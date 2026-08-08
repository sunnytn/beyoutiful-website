import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const SITE_NAME = 'BeYoutiful Organics';
const DEFAULT_DESCRIPTION =
  'Small-batch organic skincare, haircare and wellness products made in Pakistan. Cold-pressed oils, handmade soaps, pure rose water and more. Cash on delivery nationwide.';

export function buildMetadata(opts: {
  title: string;
  description?: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  noIndex?: boolean;
}): Metadata {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${opts.path}`;
  const images = opts.image ? [{ url: opts.image }] : undefined;
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    ...(opts.noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: opts.title,
      description,
      url,
      siteName: SITE_NAME,
      type: opts.type ?? 'website',
      locale: 'en_PK',
      ...(images ? { images } : {}),
    },
    twitter: {
      card: opts.image ? 'summary_large_image' : 'summary',
      title: opts.title,
      description,
      ...(images ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

// ── JSON-LD builders ──
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: 'beyoutiful.organics@gmail.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Karachi', addressCountry: 'PK' },
    sameAs: ['https://m.facebook.com/beyoutifulorganics1', 'https://instagram.com/beyoutifulorganics'],
  };
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/og-image.jpg`,
    telephone: '+923000527443',
    email: 'beyoutiful.organics@gmail.com',
    priceRange: 'PKR 500 - PKR 5000',
    paymentAccepted: 'Cash on Delivery, Bank Transfer',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Karachi',
      addressRegion: 'Sindh',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '24.8607',
      longitude: '67.0011',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '21:00',
    },
    sameAs: ['https://m.facebook.com/beyoutifulorganics1', 'https://instagram.com/beyoutifulorganics'],
  };
}

export function productJsonLd(p: {
  name: string;
  slug: string;
  description: string;
  price: number;
  avgRating: number;
  reviewCount: number;
  images: Array<{ url: string }>;
  reviews?: Array<{ name: string; rating: number; body: string; createdAt?: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: p.images.map((i) => i.url),
    url: `${SITE_URL}/shop/${p.slug}`,
    sku: p.slug,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: p.price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/shop/${p.slug}`,
      seller: { '@type': 'Organization', name: SITE_NAME },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'PK',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '200',
          currency: 'PKR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'PK',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
        },
      },
    },
    ...(p.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: p.avgRating.toFixed(1),
            reviewCount: p.reviewCount,
          },
        }
      : {}),
    ...(p.reviews && p.reviews.length > 0
      ? {
          review: p.reviews.map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.name },
            reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.body,
          })),
        }
      : {}),
  };
}

export function articleJsonLd(a: { title: string; slug: string; excerpt: string; coverImageUrl: string | null; publishedAt?: string; author?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt,
    ...(a.coverImageUrl ? { image: [a.coverImageUrl] } : {}),
    datePublished: a.publishedAt,
    author: { '@type': 'Organization', name: a.author ?? SITE_NAME },
    mainEntityOfPage: `${SITE_URL}/blog/${a.slug}`,
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

import { createElement } from 'react';

export function JsonLd({ data }: { data: object | object[] }) {
  return createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}

