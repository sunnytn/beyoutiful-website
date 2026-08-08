import Image from 'next/image';
import Link from 'next/link';
import { api, Category, ProductCard as ProductCardType, Testimonial, BlogCard } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { Button } from '@/components/ui/Button';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { ProductCard } from '@/components/product/ProductCard';
import { HeroSection } from '@/components/sections/HeroSection';
import { TestimonialCarousel } from '@/components/sections/TestimonialCarousel';
import { formatDate } from '@/lib/format';

export const metadata = buildMetadata({
  title: 'BeYoutiful Organics — Pure Organic Skincare & Haircare in Pakistan',
  path: '/',
});

interface HomePayload {
  sections: Array<{ key: string; title: string | null; subtitle: string | null; content: unknown }>;
  categories: Category[];
  featured: ProductCardType[];
  bestSellers: ProductCardType[];
  newArrivals: ProductCardType[];
  ingredients: Array<{ name: string; slug: string; description: string; imageUrl: string | null }>;
  testimonials: Testimonial[];
  posts: BlogCard[];
}

async function getData(): Promise<HomePayload | null> {
  try {
    return await api<HomePayload>('/homepage', { revalidate: 300 });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getData();
  const s = (key: string) => data?.sections.find((x) => x.key === key);

  return (
    <>
      <HeroSection
        title={s('hero')?.title ?? 'Pure. Organic. BeYoutiful.'}
        subtitle={
          s('hero')?.subtitle ??
          'Small-batch skincare & haircare from Mother Nature herself — made in Pakistan, made for you.'
        }
      />

      {/* Categories */}
      <section className="container-luxe py-20 lg:py-28" aria-labelledby="categories-heading">
        <Reveal className="mb-12 text-center">
          <p className="eyebrow">{s('categories')?.subtitle ?? 'Everything your hair, skin and home deserve'}</p>
          <h2 id="categories-heading" className="heading-lg mt-3">
            {s('categories')?.title ?? 'Shop by Ritual'}
          </h2>
        </Reveal>
        <Stagger className="grid gap-6 md:grid-cols-3">
          {(data?.categories ?? []).map((cat) => (
            <StaggerItem key={cat.slug}>
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block aspect-[5/6] overflow-hidden rounded-organic shadow-soft"
              >
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-forest-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-8">
                  <h3 className="font-display text-2xl text-cream-100">{cat.name}</h3>
                  <p className="mt-1 text-sm text-cream-200/80">{cat._count?.products ?? 0} products</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-luxe text-clay-300 transition-transform duration-300 group-hover:translate-x-1">
                    Explore <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Best sellers */}
      <section className="bg-cream-200/60 py-20 lg:py-28" aria-labelledby="bestsellers-heading">
        <div className="container-luxe">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{s('featured')?.subtitle ?? 'Our most-reordered organics'}</p>
              <h2 id="bestsellers-heading" className="heading-lg mt-3">
                {s('featured')?.title ?? 'Loved by You'}
              </h2>
            </div>
            <Button href="/shop" variant="outline" size="sm">
              View All
            </Button>
          </Reveal>
          <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {(data?.bestSellers ?? []).slice(0, 8).map((p, i) => (
              <StaggerItem key={p.slug}>
                <ProductCard product={p} priority={i < 4} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Ingredients strip */}
      <section className="container-luxe py-20 lg:py-28" aria-labelledby="ingredients-heading">
        <Reveal className="mb-12 text-center">
          <p className="eyebrow">{s('ingredients')?.subtitle ?? 'Single-origin ingredients, zero shortcuts'}</p>
          <h2 id="ingredients-heading" className="heading-lg mt-3">
            {s('ingredients')?.title ?? 'Straight from Nature'}
          </h2>
        </Reveal>
        <Stagger className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          {(data?.ingredients ?? []).slice(0, 6).map((ing) => (
            <StaggerItem key={ing.slug}>
              <Link href={`/ingredients/${ing.slug}`} className="group block text-center">
                <div className="relative mx-auto aspect-square overflow-hidden rounded-full shadow-soft">
                  {ing.imageUrl ? (
                    <Image
                      src={ing.imageUrl}
                      alt={ing.name}
                      fill
                      sizes="200px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center bg-forest-100 text-3xl">🌿</span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-lg transition-colors group-hover:text-forest-700">{ing.name}</h3>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-10 text-center">
          <Button href="/ingredients" variant="ghost" size="sm">
            Explore the Ingredient Library →
          </Button>
        </Reveal>
      </section>

      {/* Story band */}
      <section className="relative overflow-hidden bg-forest-900 py-24 lg:py-32" aria-labelledby="story-heading">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-forest-700/40 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-clay-500/20 blur-3xl" aria-hidden />
        <div className="container-luxe relative text-center">
          <Reveal>
            <p className="eyebrow !text-clay-300">Our Story</p>
            <h2 id="story-heading" className="heading-lg mx-auto mt-4 max-w-3xl text-cream-100">
              {s('story')?.title ?? "Beauty shouldn't be built in a boardroom"}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-cream-200/80">
              {s('story')?.subtitle ?? 'It should be built by YOU and about YOU.'} We work with small businesses and
              local artisans to bring you the purest ingredients — each with its own unique gift for your skin and
              hair.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button href="/about/story" variant="clay">
                Read Our Story
              </Button>
              <Button href="/about/philosophy" variant="outline" className="!border-cream-200/30 !text-cream-100 hover:!bg-forest-800">
                Our Philosophy
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Advisor CTA */}
      <section className="container-luxe py-20 lg:py-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-organic bg-gradient-to-br from-cream-200 to-cream-300 p-10 shadow-soft sm:p-16">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-clay-500/10 blur-2xl" aria-hidden />
            <div className="relative max-w-xl">
              <p className="eyebrow">{s('advisor')?.subtitle ?? 'Answer a few questions, get your personal routine'}</p>
              <h2 className="heading-lg mt-3">{s('advisor')?.title ?? 'Not sure where to start?'}</h2>
              <p className="prose-organic mt-4">
                Our AI Hair & Skin Advisor matches your concerns with the exact products, routines and guides that fit
                you — in under a minute.
              </p>
              <Button href="/advisor" variant="clay" size="lg" className="mt-8">
                Find My Perfect Products
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Testimonials */}
      {data?.testimonials?.length ? (
        <section className="bg-cream-200/60 py-20 lg:py-28" aria-labelledby="testimonials-heading">
          <div className="container-luxe">
            <Reveal className="mb-12 text-center">
              <p className="eyebrow">{s('testimonials')?.subtitle ?? 'Stories from our community across Pakistan'}</p>
              <h2 id="testimonials-heading" className="heading-lg mt-3">
                {s('testimonials')?.title ?? 'Real People, Real Glow'}
              </h2>
            </Reveal>
            <TestimonialCarousel testimonials={data.testimonials} />
          </div>
        </section>
      ) : null}

      {/* Blog */}
      {data?.posts?.length ? (
        <section className="container-luxe py-20 lg:py-28" aria-labelledby="blog-heading">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{s('blog')?.subtitle ?? 'Guides, rituals and honest ingredient talk'}</p>
              <h2 id="blog-heading" className="heading-lg mt-3">
                {s('blog')?.title ?? 'The Organic Edit'}
              </h2>
            </div>
            <Button href="/blog" variant="outline" size="sm">
              All Articles
            </Button>
          </Reveal>
          <Stagger className="grid gap-6 md:grid-cols-3">
            {data.posts.map((post) => (
              <StaggerItem key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block overflow-hidden rounded-organic bg-white shadow-soft transition-shadow hover:shadow-lift">
                  <div className="relative aspect-[16/10] overflow-hidden bg-cream-200">
                    {post.coverImageUrl && (
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    {post.publishedAt && <p className="text-xs text-ink-faint">{formatDate(post.publishedAt)}</p>}
                    <h3 className="mt-2 font-display text-xl leading-snug transition-colors group-hover:text-forest-700">
                      {post.title}
                    </h3>
                    <p className="prose-organic mt-2 line-clamp-2 text-sm">{post.excerpt}</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      ) : null}
    </>
  );
}
