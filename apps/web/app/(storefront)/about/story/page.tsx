import { buildMetadata } from '@/lib/seo';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';

export const metadata = buildMetadata({
  title: 'Our Story — Born from a Search for Purity',
  description:
    'Our founder struggled to find reliable sources of truly organic products — so she built one. The story of BeYoutiful Organics.',
  path: '/about/story',
});

const chapters = [
  {
    title: 'It started with a search',
    text: 'Our founder has always been passionate about using organic products. But finding reliable sources — products that were genuinely pure, honestly labelled, and consistently good — was a struggle familiar to anyone who has tried. So she decided to stop searching and start making.',
  },
  {
    title: 'Straight from Mother Nature',
    text: 'Our carefully curated selection of skincare, haircare, bodycare and wholesome organics comes straight from nature herself. We work closely with small businesses and local artisans across Pakistan to bring you the highest quality ingredients — each with its own unique benefit for your skin and hair.',
  },
  {
    title: 'Education over marketing',
    text: "At BeYoutiful Organics, we don't just sell products — we explain them. Why going organic matters for your health and our environment, what each ingredient actually does, and how to build routines that work. Informed choices beat impulse buys, every time.",
  },
  {
    title: 'Built by you, about you',
    text: "Through our website and social media, we're building a community devoted to sharing real information with real people about really amazing organic products. Because beauty shouldn't be built in a boardroom — it should be built by YOU and about YOU.",
  },
];

export default function StoryPage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Our story</p>
        <h1 className="heading-xl mt-4">Born from a search for purity</h1>
      </Reveal>

      <div className="mx-auto mt-16 max-w-2xl">
        <ol className="relative space-y-14 border-l border-cream-400 pl-10">
          {chapters.map((ch, i) => (
            <li key={ch.title}>
              <Reveal delay={i * 0.05}>
                <span className="absolute -left-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-cream-100 bg-forest-600" aria-hidden />
                <h2 className="font-display text-2xl">{ch.title}</h2>
                <p className="prose-organic mt-3">{ch.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal className="mt-16 rounded-organic bg-forest-900 p-10 text-center">
          <p className="font-display text-2xl leading-relaxed text-cream-100">
            "No matter where you are in your beauty journey — you look BeYoutiful."
          </p>
          <p className="mt-4 text-xs uppercase tracking-luxe text-clay-300">Let's be BeYoutiful together</p>
          <Button href="/shop" variant="clay" className="mt-8">
            Shop the Range
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
