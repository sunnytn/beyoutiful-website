'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BeforeAfter, BlogCard, Faq, ProductVariant } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/lib/stores';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { Accordion } from '@/components/ui/Accordion';
import { BeforeAfterSlider } from '@/components/sections/BeforeAfterSlider';

export interface RecommendationPayload {
  answers: { goal: 'HAIR' | 'SKIN'; concern: string; profile?: Record<string, string> };
  products: Array<{
    id: string;
    name: string;
    slug: string;
    shortDescription: string | null;
    price: number;
    avgRating: number;
    reviewCount: number;
    benefits: string[];
    directions: string | null;
    reason: string | null;
    images: Array<{ url: string; alt: string | null }>;
    variants: ProductVariant[];
  }>;
  routine: Array<{ order: number; title: string; description: string; productSlug?: string; frequency?: string }>;
  blogs: BlogCard[];
  faqs: Faq[];
  beforeAfter: BeforeAfter[];
}

export function AdvisorResults({ results, onRestart }: { results: RecommendationPayload; onRestart: () => void }) {
  const add = useCart((s) => s.add);
  const concernLabel = results.answers.concern.replace(/-/g, ' ');

  const addAll = () => {
    results.products.slice(0, 3).forEach((p) => {
      add(
        {
          productId: p.id,
          slug: p.slug,
          name: p.name,
          image: p.images[0]?.url ?? null,
          variantId: p.variants[0]?.id ?? null,
          variantName: p.variants[0]?.name ?? null,
          unitPrice: p.variants[0]?.price ?? p.price,
        },
        1,
      );
    });
  };

  return (
    <div>
      <header className="text-center">
        <p className="eyebrow">Your personalised results</p>
        <h1 className="heading-lg mt-3 capitalize">
          Your {results.answers.goal === 'HAIR' ? 'Hair' : 'Skin'} Ritual for {concernLabel}
        </h1>
        <button onClick={onRestart} className="mt-4 text-xs uppercase tracking-luxe text-ink-faint hover:text-forest-700">
          ↺ Start over
        </button>
      </header>

      {/* Products */}
      <section className="mt-12" aria-labelledby="rec-products">
        <h2 id="rec-products" className="sr-only">Recommended products</h2>
        <div className="space-y-5">
          {results.products.map((p, i) => (
            <motion.article
              key={p.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col gap-5 rounded-organic bg-white p-6 shadow-soft sm:flex-row"
            >
              <Link href={`/shop/${p.slug}`} className="relative mx-auto h-44 w-36 shrink-0 overflow-hidden rounded-xl bg-cream-200 sm:mx-0">
                {p.images[0] && <Image src={p.images[0].url} alt={p.images[0].alt ?? p.name} fill sizes="144px" className="object-cover" />}
                {i === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-clay-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-luxe text-white">
                    Top pick
                  </span>
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link href={`/shop/${p.slug}`} className="font-display text-xl hover:text-forest-700">{p.name}</Link>
                    {p.reviewCount > 0 && <div className="mt-1"><Rating value={p.avgRating} count={p.reviewCount} /></div>}
                  </div>
                  <span className="font-display text-xl text-forest-800">{formatPrice(p.variants[0]?.price ?? p.price)}</span>
                </div>
                {p.reason && (
                  <p className="mt-2 rounded-lg bg-forest-50 px-3 py-2 text-xs text-forest-800">
                    <strong>Why for you:</strong> {p.reason}
                  </p>
                )}
                <p className="prose-organic mt-2 line-clamp-2 text-sm">{p.shortDescription}</p>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-4">
                  <Button
                    size="sm"
                    onClick={() =>
                      add({
                        productId: p.id,
                        slug: p.slug,
                        name: p.name,
                        image: p.images[0]?.url ?? null,
                        variantId: p.variants[0]?.id ?? null,
                        variantName: p.variants[0]?.name ?? null,
                        unitPrice: p.variants[0]?.price ?? p.price,
                      })
                    }
                  >
                    Add to Cart
                  </Button>
                  <Button href={`/shop/${p.slug}`} variant="ghost" size="sm">
                    Details →
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        {results.products.length >= 2 && (
          <div className="mt-6 text-center">
            <Button onClick={addAll} variant="clay" size="lg">
              Add Complete Ritual to Cart
            </Button>
          </div>
        )}
      </section>

      {/* Routine */}
      {results.routine.length > 0 && (
        <section className="mt-16" aria-labelledby="routine-heading">
          <h2 id="routine-heading" className="heading-md mb-8 text-center">Your Weekly Routine</h2>
          <ol className="relative space-y-8 border-l border-cream-400 pl-8">
            {results.routine.map((step) => (
              <li key={step.order} className="relative">
                <span className="absolute -left-[41px] flex h-7 w-7 items-center justify-center rounded-full bg-forest-700 text-xs font-bold text-cream-100">
                  {step.order}
                </span>
                <div className="rounded-organic bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg">{step.title}</h3>
                    {step.frequency && (
                      <span className="rounded-full bg-cream-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-luxe text-forest-800">
                        {step.frequency}
                      </span>
                    )}
                  </div>
                  <p className="prose-organic mt-2 text-sm">{step.description}</p>
                  {step.productSlug && (
                    <Link href={`/shop/${step.productSlug}`} className="mt-3 inline-block text-xs font-semibold uppercase tracking-luxe text-clay-600 hover:underline">
                      Shop this step →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Before / After */}
      {results.beforeAfter.length > 0 && (
        <section className="mt-16" aria-labelledby="ba-heading">
          <h2 id="ba-heading" className="heading-md mb-8 text-center">Real Results</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {results.beforeAfter.slice(0, 2).map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-organic bg-white shadow-soft">
                <BeforeAfterSlider beforeUrl={item.beforeUrl} afterUrl={item.afterUrl} title={item.title} />
                <figcaption className="p-5">
                  <h3 className="font-display text-lg">{item.title}</h3>
                  {item.durationLabel && <p className="text-xs text-ink-faint">{item.durationLabel}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Blogs */}
      {results.blogs.length > 0 && (
        <section className="mt-16" aria-labelledby="learn-heading">
          <h2 id="learn-heading" className="heading-md mb-8 text-center">Learn More</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {results.blogs.map((b) => (
              <Link key={b.slug} href={`/blog/${b.slug}`} className="group flex gap-4 rounded-organic bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                  {b.coverImageUrl && <Image src={b.coverImageUrl} alt="" fill sizes="96px" className="object-cover" />}
                </div>
                <div>
                  <h3 className="font-display text-base leading-snug group-hover:text-forest-700">{b.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-ink-soft">{b.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      {results.faqs.length > 0 && (
        <section className="mt-16" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="heading-md mb-8 text-center">Good to Know</h2>
          <Accordion items={results.faqs.map((f) => ({ id: f.id, title: f.question, content: <p>{f.answer}</p> }))} />
        </section>
      )}

      {/* Ask expert */}
      <section className="mt-16 rounded-organic bg-forest-900 p-10 text-center">
        <h2 className="font-display text-2xl text-cream-100">Want a human opinion?</h2>
        <p className="mt-2 text-sm text-cream-200/75">
          Send us your routine questions on WhatsApp — real advice from real people, free.
        </p>
        <a
          href={`https://wa.me/923000527443?text=${encodeURIComponent(
            `Hi! The advisor recommended a routine for my ${concernLabel} concern. I'd love some expert advice.`,
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-3.5 text-xs font-semibold uppercase tracking-luxe text-white transition-transform hover:scale-[1.02]"
        >
          Ask an Expert on WhatsApp
        </a>
      </section>
    </div>
  );
}
