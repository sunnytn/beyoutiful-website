import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api, ProductDetail } from '@/lib/api';
import { buildMetadata, breadcrumbJsonLd, faqJsonLd, productJsonLd, JsonLd } from '@/lib/seo';
import { ProductDetailClient } from '@/components/product/ProductDetailClient';

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string): Promise<ProductDetail | null> {
  try {
    return await api<ProductDetail>(`/products/${slug}`, { revalidate: 120 });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: 'Product not found' };
  return buildMetadata({
    title: product.metaTitle ?? product.name,
    description: product.metaDescription ?? product.shortDescription ?? undefined,
    path: `/shop/${product.slug}`,
    image: product.images[0]?.url ?? null,
  });
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  return (
    <>
      <JsonLd
        data={[
          productJsonLd(product),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: product.name, path: `/shop/${product.slug}` },
          ]),
          ...(product.faqs.length ? [faqJsonLd(product.faqs)] : []),
        ]}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
