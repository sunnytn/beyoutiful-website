import { buildMetadata } from '@/lib/seo';
import { CategoryLanding } from '@/components/shop/CategoryLanding';

export const metadata = buildMetadata({
  title: 'Organic Skin Care — Handmade Soaps, Rose Water & Botanical Moisture',
  description:
    'Pure rose water, whipped moisturizers, neem and rice soaps, sandal ubtan and botanical oils for naturally radiant skin. Made in Pakistan, COD nationwide.',
  path: '/skin-care',
});

export default function SkinCarePage() {
  return (
    <CategoryLanding
      slug="skin-care"
      eyebrow="Discover a beautiful you"
      intro="Pure botanical moisturizers, soaps and toners for naturally radiant skin, free from harsh chemicals."
    />
  );
}
