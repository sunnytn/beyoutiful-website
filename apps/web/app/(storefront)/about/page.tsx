import Link from 'next/link';
import { buildMetadata } from '@/lib/seo';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';

export const metadata = buildMetadata({
  title: 'About Us — Your One-Stop Shop for All Things Organic',
  description:
    'BeYoutiful Organics was founded on a simple belief: the journey towards wellness and beauty should be organic — free from harmful toxins and harsh chemicals.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">About BeYoutiful Organics</p>
        <h1 className="heading-xl mt-4">
          Welcome to your one-stop shop for all things organic
        </h1>
        <p className="prose-organic mt-8 text-lg">
          We believe that the journey towards wellness and beauty should be an organic one — free from harmful toxins
          and harsh chemicals. From our formulas to our packaging, BeYoutiful was built to make beauty accessible and
          uncomplicated.
        </p>
      </Reveal>

      <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-2">
        <Reveal>
          <Link href="/about/story" className="group block h-full rounded-organic bg-forest-800 p-10 shadow-soft transition-shadow hover:shadow-lift">
            <p className="eyebrow !text-clay-300">Chapter one</p>
            <h2 className="heading-md mt-3 text-cream-100">Our Story</h2>
            <p className="mt-4 text-sm leading-relaxed text-cream-200/75">
              How one founder's search for products she could trust became a community devoted to real information
              about really amazing organics.
            </p>
            <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-luxe text-clay-300 transition-transform group-hover:translate-x-1">
              Read the story →
            </span>
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <Link href="/about/philosophy" className="group block h-full rounded-organic bg-white p-10 shadow-soft transition-shadow hover:shadow-lift">
            <p className="eyebrow">Chapter two</p>
            <h2 className="heading-md mt-3">Our Philosophy</h2>
            <p className="prose-organic mt-4 text-sm">
              Beauty shouldn't be built in a boardroom — it should be built by YOU and about YOU. The principles behind
              everything we make.
            </p>
            <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-luxe text-clay-600 transition-transform group-hover:translate-x-1">
              Read the philosophy →
            </span>
          </Link>
        </Reveal>
      </div>

      <Reveal className="mt-20 text-center">
        <Button href="/shop" size="lg">
          Explore Our Products
        </Button>
      </Reveal>
    </div>
  );
}
