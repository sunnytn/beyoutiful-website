import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';
import { Reveal, Stagger, StaggerItem } from '@/components/ui/Reveal';

export const metadata = buildMetadata({
  title: 'Ingredient Library — What Goes On Your Skin Matters',
  description:
    'Explore every ingredient we use — shea butter, aloe vera, rosemary, neem, sandalwood and more. Honest education about what goes on your skin and hair.',
  path: '/ingredients',
});

interface Ingredient {
  name: string;
  slug: string;
  description: string;
  benefits: string[];
  imageUrl: string | null;
  _count?: { products: number };
}

export default async function IngredientsPage() {
  let ingredients: Ingredient[] = [];
  try {
    ingredients = await api<Ingredient[]>('/ingredients', { revalidate: 600 });
  } catch {
    /* empty */
  }

  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mb-14 text-center">
        <p className="eyebrow">Educational center</p>
        <h1 className="heading-lg mt-3">The Ingredient Library</h1>
        <p className="prose-organic mx-auto mt-4 max-w-2xl">
          Going organic starts with knowing what's inside. Every ingredient we use, explained honestly — its origin,
          its benefits, and the products it stars in.
        </p>
      </Reveal>
      <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {ingredients.map((ing) => (
          <StaggerItem key={ing.slug}>
            <Link
              href={`/ingredients/${ing.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-organic bg-white shadow-soft transition-shadow hover:shadow-lift"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-forest-100">
                {ing.imageUrl ? (
                  <Image
                    src={ing.imageUrl}
                    alt={ing.name}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-4xl">🌿</span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="font-display text-xl transition-colors group-hover:text-forest-700">{ing.name}</h2>
                <p className="prose-organic mt-2 line-clamp-2 text-sm">{ing.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {ing.benefits.slice(0, 3).map((b) => (
                    <span key={b} className="rounded-full bg-cream-200 px-3 py-1 text-[11px] text-forest-800">
                      {b}
                    </span>
                  ))}
                </div>
                <p className="mt-auto pt-4 text-xs font-semibold uppercase tracking-luxe text-clay-600">
                  {ing._count?.products ?? 0} product{(ing._count?.products ?? 0) === 1 ? '' : 's'} →
                </p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
