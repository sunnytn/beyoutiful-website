import { buildMetadata } from '@/lib/seo';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';

export const metadata = buildMetadata({
  title: 'Our Philosophy — Pure, Honest, Uncomplicated',
  description:
    'The principles behind BeYoutiful Organics: purity without compromise, education over marketing, community over customers, and sustainability by default.',
  path: '/about/philosophy',
});

const principles = [
  {
    icon: '🌿',
    title: 'Purity without compromise',
    text: 'No sulphates, parabens, mineral oils or synthetic fragrance — ever. If an ingredient wouldn\'t belong in nature, it doesn\'t belong in our jars.',
  },
  {
    icon: '📖',
    title: 'Education over marketing',
    text: 'We explain what each ingredient does and why it matters, so you can make informed choices about your skincare and haircare routine.',
  },
  {
    icon: '🤝',
    title: 'Community over customers',
    text: 'We work with small businesses and local artisans, and we build with our community — real information, shared with real people.',
  },
  {
    icon: '🌍',
    title: 'Kind to the environment',
    text: 'Going organic is better for our planet too. Sustainable sourcing and mindful packaging are defaults, not marketing extras.',
  },
  {
    icon: '✨',
    title: 'Beauty made uncomplicated',
    text: 'From our formulas to our packaging, everything is designed to make organic beauty accessible and simple — no jargon, no 15-step routines.',
  },
  {
    icon: '💛',
    title: 'You, celebrated',
    text: 'Our name is our promise: be YOU-tiful. Products that enhance what you already have, never ones that tell you you\'re not enough.',
  },
];

export default function PhilosophyPage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Our philosophy</p>
        <h1 className="heading-xl mt-4">Six principles we never bend</h1>
      </Reveal>

      <Stagger className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((p) => (
          <StaggerItem key={p.title}>
            <div className="h-full rounded-organic bg-white p-8 shadow-soft">
              <span className="text-3xl" aria-hidden>{p.icon}</span>
              <h2 className="mt-4 font-display text-xl">{p.title}</h2>
              <p className="prose-organic mt-3 text-sm">{p.text}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-16 text-center">
        <Button href="/ingredients" variant="outline">
          Explore Our Ingredients
        </Button>
      </Reveal>
    </div>
  );
}
