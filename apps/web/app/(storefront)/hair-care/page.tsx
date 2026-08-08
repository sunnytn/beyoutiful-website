import { buildMetadata } from '@/lib/seo';
import { CategoryLanding } from '@/components/shop/CategoryLanding';

export const metadata = buildMetadata({
  title: 'Organic Hair Care — Oils, Herbal Cleansers & Growth Rituals',
  description:
    'Cold-pressed rosemary, castor, coconut and almond oils, herbal shampoo and traditional cleansers for stronger, shinier hair. Made in Pakistan, COD nationwide.',
  path: '/hair-care',
});

export default function HairCarePage() {
  return (
    <CategoryLanding
      slug="hair-care"
      eyebrow="Revitalizing rituals"
      intro="Cold-pressed oils and herbal cleansers that restore strength, shine and scalp health — the way nature intended."
    />
  );
}
