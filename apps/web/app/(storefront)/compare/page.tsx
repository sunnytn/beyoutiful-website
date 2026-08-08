import { buildMetadata } from '@/lib/seo';
import { CompareClient } from '@/components/shop/CompareClient';

export const metadata = buildMetadata({
  title: 'Compare Products',
  description: 'Compare BeYoutiful Organics products side by side — prices, benefits, ingredients and ratings.',
  path: '/compare',
  noIndex: true,
});

export default function ComparePage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <CompareClient />
    </div>
  );
}
