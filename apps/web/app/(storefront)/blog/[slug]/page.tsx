import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { api, BlogCard } from '@/lib/api';
import { buildMetadata, articleJsonLd, breadcrumbJsonLd, JsonLd } from '@/lib/seo';
import { formatDate, renderMarkdown } from '@/lib/format';
import { Reveal } from '@/components/ui/Reveal';

interface BlogDetail extends BlogCard {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  related: BlogCard[];
}

interface Props {
  params: { slug: string };
}

async function getPost(slug: string): Promise<BlogDetail | null> {
  try {
    return await api<BlogDetail>(`/blog/${slug}`, { revalidate: 300 });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Article not found' };
  return buildMetadata({
    title: post.metaTitle ?? post.title,
    description: post.metaDescription ?? post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImageUrl,
    type: 'article',
  });
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <article className="container-luxe py-16 lg:py-24">
      <JsonLd
        data={[
          articleJsonLd(post),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">{post.category?.name ?? 'The Organic Edit'}</p>
        <h1 className="heading-lg mt-4">{post.title}</h1>
        <p className="mt-4 text-sm text-ink-faint">
          {post.publishedAt && formatDate(post.publishedAt)} · {post.author ?? 'BeYoutiful Organics'}
        </p>
      </Reveal>

      {post.coverImageUrl && (
        <Reveal className="relative mx-auto mt-10 aspect-[16/8] max-w-4xl overflow-hidden rounded-organic shadow-soft">
          <Image src={post.coverImageUrl} alt={post.title} fill priority sizes="(max-width:1024px) 100vw, 900px" className="object-cover" />
        </Reveal>
      )}

      <div
        className="md-content mx-auto mt-12 max-w-2xl"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
      />

      {post.related.length > 0 && (
        <aside className="mx-auto mt-20 max-w-4xl" aria-label="Related articles">
          <h2 className="heading-md mb-8 text-center">Keep Reading</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {post.related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} className="group block overflow-hidden rounded-organic bg-white shadow-soft transition-shadow hover:shadow-lift">
                <div className="relative aspect-[16/10] bg-cream-200">
                  {r.coverImageUrl && (
                    <Image src={r.coverImageUrl} alt={r.title} fill sizes="300px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg leading-snug transition-colors group-hover:text-forest-700">{r.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
