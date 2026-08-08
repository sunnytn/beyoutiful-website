import Image from 'next/image';
import Link from 'next/link';
import { api, BlogCard, PageMeta } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/format';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';

export const metadata = buildMetadata({
  title: 'The Organic Edit — Blog',
  description:
    'Guides, rituals and honest ingredient talk from BeYoutiful Organics — DIY hair oils, skincare routines, natural soap education and more.',
  path: '/blog',
});

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  let posts: BlogCard[] = [];
  let meta: PageMeta = { total: 0, page: 1, limit: 9, totalPages: 1 };
  try {
    const res = await api<{ rows: BlogCard[]; meta: PageMeta }>(
      `/blog?page=${searchParams.page ?? '1'}&limit=9`,
      { revalidate: 300 },
    );
    posts = res.rows;
    meta = res.meta;
  } catch {
    /* empty */
  }
  const [featured, ...rest] = posts;

  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mb-14 text-center">
        <p className="eyebrow">The Organic Edit</p>
        <h1 className="heading-lg mt-3">Guides, Rituals & Honest Ingredient Talk</h1>
      </Reveal>

      {featured && (
        <Reveal>
          <Link
            href={`/blog/${featured.slug}`}
            className="group mb-12 grid overflow-hidden rounded-organic bg-white shadow-soft transition-shadow hover:shadow-lift md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-cream-200 md:aspect-auto">
              {featured.coverImageUrl && (
                <Image
                  src={featured.coverImageUrl}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <p className="text-xs uppercase tracking-luxe text-clay-600">Latest article</p>
              <h2 className="heading-md mt-3 transition-colors group-hover:text-forest-700">{featured.title}</h2>
              <p className="prose-organic mt-4">{featured.excerpt}</p>
              {featured.publishedAt && <p className="mt-6 text-xs text-ink-faint">{formatDate(featured.publishedAt)}</p>}
            </div>
          </Link>
        </Reveal>
      )}

      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <StaggerItem key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-organic bg-white shadow-soft transition-shadow hover:shadow-lift">
              <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
                {post.coverImageUrl && (
                  <Image
                    src={post.coverImageUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                {post.publishedAt && <p className="text-xs text-ink-faint">{formatDate(post.publishedAt)}</p>}
                <h2 className="mt-2 font-display text-xl leading-snug transition-colors group-hover:text-forest-700">{post.title}</h2>
                <p className="prose-organic mt-2 line-clamp-3 text-sm">{post.excerpt}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {meta.totalPages > 1 && (
        <nav className="mt-12 flex justify-center gap-2" aria-label="Blog pagination">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={`/blog?page=${n}`}
              aria-current={n === meta.page ? 'page' : undefined}
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                n === meta.page ? 'bg-forest-700 text-cream-100' : 'bg-white text-ink-soft shadow-soft hover:bg-cream-200'
              }`}
            >
              {n}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
